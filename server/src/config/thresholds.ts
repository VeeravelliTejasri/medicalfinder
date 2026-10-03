import dotenv from 'dotenv';
dotenv.config();

export const THRESHOLDS = {
  IN_STOCK_MIN: parseInt(process.env.IN_STOCK_MIN || '10', 10),
  LOW_STOCK_MIN: parseInt(process.env.LOW_STOCK_MIN || '1', 10),
  MAX_RADIUS_KM: parseFloat(process.env.MAX_RADIUS_KM || '25'),
};

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export function calculateStockStatus(quantity: number, customThreshold?: number): StockStatus {
  const threshold = customThreshold ?? THRESHOLDS.IN_STOCK_MIN;
  if (quantity > threshold) {
    return 'IN_STOCK';
  }
  if (quantity >= THRESHOLDS.LOW_STOCK_MIN) {
    return 'LOW_STOCK';
  }
  return 'OUT_OF_STOCK';
}
