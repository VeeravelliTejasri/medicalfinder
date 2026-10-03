import { Request, Response } from 'express';
import { db } from '../config/database.js';

/**
 * Autocomplete / instant search for medicines
 * Searches name, generic_name, brand_name, category
 */
export function searchMedicines(req: Request, res: Response): void {
  try {
    const q = ((req.query.q as string) || '').trim();
    const category = (req.query.category as string) || '';
    const emergencyOnly = req.query.emergency === 'true';

    let sql = 'SELECT * FROM medicines WHERE 1=1';
    const params: any[] = [];

    if (q) {
      sql += ' AND (name LIKE ? OR generic_name LIKE ? OR brand_name LIKE ? OR category LIKE ?)';
      const term = `%${q}%`;
      params.push(term, term, term, term);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (emergencyOnly) {
      sql += ' AND is_emergency = 1';
    }

    sql += ' ORDER BY is_emergency DESC, name ASC LIMIT 30';

    const medicines = db.prepare(sql).all(...params);
    res.json({ count: medicines.length, medicines });
  } catch (error: any) {
    console.error('Search medicines error:', error);
    res.status(500).json({ error: 'Failed to search medicines' });
  }
}

/**
 * Get medicine details by ID including price range across pharmacies
 */
export function getMedicineById(req: Request, res: Response): void {
  try {
    const id = req.params.id as string;
    const medicine = (db.prepare('SELECT * FROM medicines WHERE id = ?').get(id) as any);

    if (!medicine) {
      res.status(404).json({ error: 'Medicine not found' });
      return;
    }

    // Get pricing summary and stock status across all pharmacies
    const stockStats = (db.prepare(`
      SELECT 
        COUNT(*) as pharmacy_count,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price,
        SUM(CASE WHEN availability_status = 'IN_STOCK' THEN 1 ELSE 0 END) as in_stock_count,
        SUM(CASE WHEN availability_status = 'LOW_STOCK' THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN availability_status = 'OUT_OF_STOCK' THEN 1 ELSE 0 END) as out_of_stock_count
      FROM inventory
      WHERE medicine_id = ?
    `).get(id) as any);

    res.json({
      medicine,
      stats: {
        pharmacyCount: stockStats.pharmacy_count || 0,
        minPrice: stockStats.min_price || medicine.average_price,
        maxPrice: stockStats.max_price || medicine.average_price,
        avgPrice: Math.round((stockStats.avg_price || medicine.average_price) * 100) / 100,
        inStockCount: stockStats.in_stock_count || 0,
        lowStockCount: stockStats.low_stock_count || 0,
        outOfStockCount: stockStats.out_of_stock_count || 0
      }
    });
  } catch (error: any) {
    console.error('Get medicine error:', error);
    res.status(500).json({ error: 'Failed to retrieve medicine details' });
  }
}

/**
 * Find lower-cost generic alternatives for a given medicine.
 * Matches on generic_name or therapeutic category with lower average price.
 * Explicitly includes a mandatory medical disclaimer.
 */
export function getMedicineAlternatives(req: Request, res: Response): void {
  try {
    const id = req.params.id as string;
    const original = (db.prepare('SELECT * FROM medicines WHERE id = ?').get(id) as any);

    if (!original) {
      res.status(404).json({ error: 'Medicine not found' });
      return;
    }

    // Find medicines with identical generic_name OR in same category with lower price
    const alternatives = db.prepare(`
      SELECT 
        m.*,
        COALESCE(
          (SELECT MIN(price) FROM inventory WHERE medicine_id = m.id AND availability_status != 'OUT_OF_STOCK'),
          m.average_price
        ) as lowest_available_price,
        (SELECT COUNT(*) FROM inventory WHERE medicine_id = m.id AND availability_status = 'IN_STOCK') as in_stock_pharmacies
      FROM medicines m
      WHERE m.id != ?
        AND (m.generic_name = ? OR (m.category = ? AND m.average_price < ?))
      ORDER BY (m.generic_name = ?) DESC, lowest_available_price ASC
      LIMIT 5
    `).all(original.id, original.generic_name, original.category, original.average_price, original.generic_name) as any[];

    // Calculate potential savings
    const enriched = alternatives.map(alt => {
      const originalPrice = original.average_price;
      const altPrice = alt.lowest_available_price || alt.average_price;
      const savings = Math.max(0, Math.round((originalPrice - altPrice) * 100) / 100);
      const savingsPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

      return {
        ...alt,
        is_exact_generic_match: alt.generic_name.toLowerCase() === original.generic_name.toLowerCase(),
        savings_amount: savings,
        savings_percent: savingsPercent
      };
    });

    res.json({
      original_medicine: original,
      disclaimer: 'IMPORTANT MEDICAL NOTICE: Medicines with similar ingredients or therapeutic categories are not automatically interchangeable. Please consult a licensed doctor or pharmacist before substituting any prescribed medication.',
      alternatives: enriched
    });
  } catch (error: any) {
    console.error('Get alternatives error:', error);
    res.status(500).json({ error: 'Failed to retrieve alternatives' });
  }
}

/**
 * Get distinct medicine categories with count
 */
export function getCategories(_req: Request, res: Response): void {
  try {
    const categories = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM medicines 
      GROUP BY category 
      ORDER BY count DESC
    `).all();
    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
