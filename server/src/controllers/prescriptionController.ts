import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { processPrescriptionOcr, SAMPLE_PRESCRIPTIONS } from '../services/ocrService.js';
import { calculateDistanceKm } from '../services/distanceService.js';

/**
 * Handle prescription upload and OCR processing
 */
export async function uploadAndProcessPrescription(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'anonymous';
    const file = req.file;
    const preset = req.body.preset as string;
    const rawTextInput = req.body.raw_text as string;

    let textToProcess = '';
    let fileName = 'prescription_upload.jpg';
    let fileType = 'image/jpeg';
    let filePath = '';

    if (preset && SAMPLE_PRESCRIPTIONS[preset]) {
      textToProcess = preset;
      fileName = `Sample_${preset}.pdf`;
      fileType = 'application/pdf';
    } else if (file) {
      fileName = file.originalname;
      fileType = file.mimetype;
      filePath = file.path;
      // In production, OCR engine (Tesseract) parses file; for mock/demo, if text not provided, use default
      textToProcess = rawTextInput || `Rx:\n1. Paracetamol 650 mg - 1 tab TDS\n2. Amoxicillin 500 mg - 1 cap BD\n3. Cetirizine 10 mg - 1 tab HS`;
    } else if (rawTextInput) {
      textToProcess = rawTextInput;
      fileName = 'manual_prescription_input.txt';
      fileType = 'text/plain';
    } else {
      // Default to standard fever prescription for seamless demo testing
      textToProcess = 'fever_infection';
      fileName = 'Demo_Fever_Prescription.png';
      fileType = 'image/png';
    }

    const ocrResult = await processPrescriptionOcr(textToProcess, filePath);
    const prescriptionId = uuidv4();

    if (userId !== 'anonymous') {
      db.prepare(`
        INSERT INTO prescriptions (id, user_id, file_name, file_path, file_type, extracted_text, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'PROCESSED', datetime('now'))
      `).run(prescriptionId, userId, fileName, filePath, fileType, ocrResult.raw_text);

      for (const med of ocrResult.medicines) {
        db.prepare(`
          INSERT INTO prescription_medicines (id, prescription_id, detected_name, matched_medicine_id, dosage, confidence, is_confirmed, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
        `).run(uuidv4(), prescriptionId, med.detected_name, med.matched_medicine_id || null, med.dosage || null, med.confidence);
      }
    }

    res.json({
      message: 'Prescription processed successfully',
      prescription_id: prescriptionId,
      file_name: fileName,
      raw_text: ocrResult.raw_text,
      detected_medicines: ocrResult.medicines,
      disclaimer: 'OCR results are assistive and must be confirmed by the patient or pharmacist before placing a reservation.'
    });
  } catch (error: any) {
    console.error('Prescription OCR error:', error);
    res.status(500).json({ error: 'Failed to process prescription' });
  }
}

/**
 * Multi-medicine availability search for verified prescription items
 */
export function searchPrescriptionMedicines(req: AuthRequest, res: Response): void {
  try {
    const { medicine_ids = [], lat = 12.9716, lng = 77.5946 } = req.body;

    if (!Array.isArray(medicine_ids) || medicine_ids.length === 0) {
      res.status(400).json({ error: 'At least one medicine_id is required' });
      return;
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const pharmacies = db.prepare('SELECT * FROM pharmacies WHERE is_verified = 1').all() as any[];

    // For each pharmacy, check inventory of all requested medicines
    const results = pharmacies.map(pharmacy => {
      const distance = calculateDistanceKm(userLat, userLng, pharmacy.latitude, pharmacy.longitude);

      const items = medicine_ids.map(medId => {
        const item = db.prepare(`
          SELECT 
            i.quantity, 
            i.price, 
            i.availability_status,
            m.id as medicine_id, 
            m.name as medicine_name, 
            m.strength,
            m.dosage_form
          FROM inventory i
          JOIN medicines m ON i.medicine_id = m.id
          WHERE i.pharmacy_id = ? AND i.medicine_id = ?
        `).get(pharmacy.id, medId) as any;

        if (item) {
          return item;
        }

        const medInfo = db.prepare('SELECT id as medicine_id, name as medicine_name, strength, dosage_form FROM medicines WHERE id = ?').get(medId) as any;
        return {
          medicine_id: medId,
          medicine_name: medInfo ? medInfo.medicine_name : 'Unknown Medicine',
          strength: medInfo?.strength || '',
          dosage_form: medInfo?.dosage_form || '',
          quantity: 0,
          price: 0,
          availability_status: 'OUT_OF_STOCK'
        };
      });

      const inStockCount = items.filter((i: any) => i.availability_status === 'IN_STOCK').length;
      const lowStockCount = items.filter((i: any) => i.availability_status === 'LOW_STOCK').length;
      const totalAvailable = inStockCount + lowStockCount;
      const allAvailable = totalAvailable === medicine_ids.length;

      return {
        pharmacy_id: pharmacy.id,
        pharmacy_name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        distance_km: distance,
        is_24_7: pharmacy.is_24_7 === 1,
        rating: pharmacy.rating,
        total_requested: medicine_ids.length,
        available_count: totalAvailable,
        all_available: allAvailable,
        items
      };
    });

    // Sort: pharmacies with ALL medicines in stock first, then by distance
    results.sort((a, b) => {
      if (a.all_available !== b.all_available) {
        return a.all_available ? -1 : 1;
      }
      if (a.available_count !== b.available_count) {
        return b.available_count - a.available_count;
      }
      return a.distance_km - b.distance_km;
    });

    res.json({
      requested_count: medicine_ids.length,
      pharmacies: results
    });
  } catch (error: any) {
    console.error('Prescription multi-search error:', error);
    res.status(500).json({ error: 'Failed to search prescription availability' });
  }
}
