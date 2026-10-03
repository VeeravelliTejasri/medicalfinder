import { db } from '../config/database.js';

export interface ExtractedMedicine {
  detected_name: string;
  matched_medicine_id?: string;
  matched_medicine_name?: string;
  dosage?: string;
  confidence: number;
}

export interface OcrResult {
  raw_text: string;
  medicines: ExtractedMedicine[];
}

// Sample prescription text presets for reliable hackathon demonstrations
export const SAMPLE_PRESCRIPTIONS: Record<string, { rawText: string; medicines: ExtractedMedicine[] }> = {
  'fever_infection': {
    rawText: `DR. RAJESH SHARMA, MD (INTERNAL MEDICINE)
CITY HEALTH CLINIC, 42 PARK AVENUE
REG NO: MCI-49821
DATE: 11/09/2026

PATIENT: John Doe (Age: 32 / M)
DIAGNOSIS: Acute Upper Respiratory Tract Infection with High Fever

Rx:
1. Tab. Paracetamol 650 mg - 1 tab TDS x 3 days
2. Cap. Amoxicillin 500 mg - 1 cap BD x 5 days
3. Tab. Cetirizine 10 mg - 1 tab HS x 5 days
4. Tab. Pantoprazole 40 mg - 1 tab OD before breakfast x 5 days

Dr. Rajesh Sharma (Signed)`,
    medicines: [
      { detected_name: 'Paracetamol 650 mg', dosage: '1 tab TDS x 3 days', confidence: 0.98 },
      { detected_name: 'Amoxicillin 500 mg', dosage: '1 cap BD x 5 days', confidence: 0.95 },
      { detected_name: 'Cetirizine 10 mg', dosage: '1 tab HS x 5 days', confidence: 0.94 },
      { detected_name: 'Pantoprazole 40 mg', dosage: '1 tab OD x 5 days', confidence: 0.91 }
    ]
  },
  'chronic_care': {
    rawText: `METRO SPECIALTY HOSPITAL
DR. PRIYA NAIR, DM (CARDIOLOGY / DIABETOLOGY)
DATE: 11/09/2026

PATIENT: Robert Smith (Age: 58 / M)
BP: 140/90 mmHg | Fasting Sugar: 165 mg/dL

Rx:
1. Tab. Metformin 500 mg - 1 tab BD with meals
2. Tab. Amlodipine 5 mg - 1 tab OD morning
3. Tab. Atorvastatin 20 mg - 1 tab HS
4. Tab. Aspirin 75 mg - 1 tab OD after lunch

Advised: Low sodium diet, 30 min daily walking.`,
    medicines: [
      { detected_name: 'Metformin 500 mg', dosage: '1 tab BD with meals', confidence: 0.97 },
      { detected_name: 'Amlodipine 5 mg', dosage: '1 tab OD morning', confidence: 0.96 },
      { detected_name: 'Atorvastatin 20 mg', dosage: '1 tab HS', confidence: 0.93 },
      { detected_name: 'Aspirin 75 mg', dosage: '1 tab OD after lunch', confidence: 0.92 }
    ]
  },
  'emergency_respiratory': {
    rawText: `APEX EMERGENCY CARE & PULMONOLOGY
DR. ARUN MEHTA, MD (PULMONOLOGY)
DATE: 11/09/2026

PATIENT: Emily Davis (Age: 24 / F)
DIAGNOSIS: Acute Bronchospasm / Asthma Exacerbation

Rx (URGENT):
1. Salbutamol Inhaler 100 mcg - 2 puffs SOS
2. Tab. Montelukast 10 mg - 1 tab HS x 14 days
3. Budesonide Inhaler 200 mcg - 1 puff BD x 1 month

Emergency SOS: In case of persistent wheezing, visit ER immediately.`,
    medicines: [
      { detected_name: 'Salbutamol Inhaler 100 mcg', dosage: '2 puffs SOS', confidence: 0.99 },
      { detected_name: 'Montelukast 10 mg', dosage: '1 tab HS x 14 days', confidence: 0.93 },
      { detected_name: 'Budesonide Inhaler 200 mcg', dosage: '1 puff BD x 1 month', confidence: 0.91 }
    ]
  }
};

/**
 * Parses raw prescription text or extracts from uploaded content.
 * Matches detected lines with database medicines using fuzzy keyword matching.
 */
export async function processPrescriptionOcr(
  textOrPreset: string,
  _filePath?: string
): Promise<OcrResult> {
  let rawText = textOrPreset;
  let detectedMeds: ExtractedMedicine[] = [];

  // Check if user selected one of our preset demos
  if (SAMPLE_PRESCRIPTIONS[textOrPreset]) {
    const preset = SAMPLE_PRESCRIPTIONS[textOrPreset];
    rawText = preset.rawText;
    detectedMeds = JSON.parse(JSON.stringify(preset.medicines));
  } else {
    // Medical regex parser for prescription lines
    // Looks for patterns like "1. Tab. Paracetamol 650 mg", "Amoxicillin 500mg", "Dolo 650"
    const lines = rawText.split('\n');
    const rxRegex = /(?:Tab\.?|Cap\.?|Syp\.?|Inj\.?|Oint\.?|Inhaler)?\s*([A-Za-z0-9\s\-]+?)\s*(\d+\s*(?:mg|mcg|ml|g|gm))(?:\s*-\s*(.+))?/i;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('DR.') || trimmed.startsWith('DATE:') || trimmed.startsWith('PATIENT:')) {
        continue;
      }

      const match = trimmed.match(rxRegex);
      if (match) {
        const medName = match[1].replace(/^\d+[\.\)]\s*/, '').trim();
        const strength = match[2].trim();
        const dosage = match[3] ? match[3].trim() : 'As directed';
        const fullName = `${medName} ${strength}`.trim();

        detectedMeds.push({
          detected_name: fullName,
          dosage,
          confidence: 0.92
        });
      }
    }

    // If regex found nothing, scan lines for known medicine names from database
    if (detectedMeds.length === 0) {
      const allMeds = db.prepare('SELECT id, name, generic_name, brand_name, strength FROM medicines').all() as any[];
      for (const med of allMeds) {
        const lowerRaw = rawText.toLowerCase();
        if (
          lowerRaw.includes(med.name.toLowerCase()) ||
          lowerRaw.includes(med.brand_name.toLowerCase()) ||
          lowerRaw.includes(med.generic_name.toLowerCase())
        ) {
          detectedMeds.push({
            detected_name: med.name,
            dosage: 'As prescribed',
            confidence: 0.88,
            matched_medicine_id: med.id,
            matched_medicine_name: med.name
          });
        }
      }
    }
  }

  // Correlate with database records to link matched_medicine_id
  const allDbMeds = db.prepare('SELECT id, name, generic_name, brand_name, strength FROM medicines').all() as any[];
  for (const item of detectedMeds) {
    if (!item.matched_medicine_id) {
      const detectedLower = item.detected_name.toLowerCase();
      const match = allDbMeds.find(m => {
        const mName = m.name.toLowerCase();
        const mBrand = m.brand_name.toLowerCase();
        const mGeneric = m.generic_name.toLowerCase();
        return detectedLower.includes(mName) ||
               mName.includes(detectedLower) ||
               detectedLower.includes(mBrand) ||
               detectedLower.includes(mGeneric);
      });

      if (match) {
        item.matched_medicine_id = match.id;
        item.matched_medicine_name = match.name;
      }
    }
  }

  return {
    raw_text: rawText,
    medicines: detectedMeds
  };
}
