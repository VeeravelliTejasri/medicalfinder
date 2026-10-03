import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, initDatabase } from '../config/database.js';
import { SEED_PHARMACIES, SEED_MEDICINES } from './seedData.js';
import { calculateStockStatus } from '../config/thresholds.js';

export async function runSeed(): Promise<void> {
  console.log('🌱 Starting MediFind database seeding...');
  initDatabase();

  const passwordHash = await bcrypt.hash('Demo123!', 10);

  // Clear existing demo data to ensure clean idempotency
  db.exec(`
    DELETE FROM prescription_medicines;
    DELETE FROM prescriptions;
    DELETE FROM notifications;
    DELETE FROM stock_alerts;
    DELETE FROM search_history;
    DELETE FROM reservations;
    DELETE FROM inventory;
    DELETE FROM pharmacies;
    DELETE FROM medicines;
    DELETE FROM users;
  `);

  console.log('🧹 Existing tables cleared.');

  // 1. Create Demo Users
  const userCitizenId = 'user-citizen-demo';
  const userPharmacyId = 'user-pharmacy-demo';
  const userAdminId = 'user-admin-demo';

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(userCitizenId, 'Rahul Verma (Patient)', 'user@demo.com', passwordHash, 'user', '+91 98765 43210');

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(userPharmacyId, 'Suresh Patel (Apollo Indiranagar)', 'pharmacy@demo.com', passwordHash, 'pharmacy', '+91 98450 12345');

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(userAdminId, 'Dr. Ananya Sen (System Admin)', 'admin@demo.com', passwordHash, 'admin', '+91 99000 11223');

  console.log('👥 Demo users created: user@demo.com, pharmacy@demo.com, admin@demo.com (Password: Demo123!)');

  // 2. Insert Pharmacies
  const insertPharmacy = db.prepare(`
    INSERT INTO pharmacies (
      id, user_id, name, license_number, address, city, latitude, longitude, phone, email, is_verified, is_24_7, open_time, close_time, rating, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (let i = 0; i < SEED_PHARMACIES.length; i++) {
    const p = SEED_PHARMACIES[i];
    // Link first pharmacy (Apollo) to pharmacy@demo.com
    const linkedUserId = i === 0 ? userPharmacyId : null;
    insertPharmacy.run(
      p.id,
      linkedUserId,
      p.name,
      p.license_number,
      p.address,
      p.city,
      p.latitude,
      p.longitude,
      p.phone,
      p.email,
      p.is_verified,
      p.is_24_7,
      p.open_time,
      p.close_time,
      p.rating
    );
  }
  console.log(`🏥 ${SEED_PHARMACIES.length} Pharmacies seeded.`);

  // 3. Insert Medicines
  const insertMedicine = db.prepare(`
    INSERT INTO medicines (
      id, name, generic_name, brand_name, category, strength, dosage_form, manufacturer, description, requires_prescription, is_emergency, average_price, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (const m of SEED_MEDICINES) {
    insertMedicine.run(
      m.id,
      m.name,
      m.generic_name,
      m.brand_name,
      m.category,
      m.strength,
      m.dosage_form,
      m.manufacturer,
      m.description,
      m.requires_prescription,
      m.is_emergency,
      m.average_price
    );
  }
  console.log(`💊 ${SEED_MEDICINES.length} Curated Medicines seeded.`);

  // 4. Seed Inventory across pharmacies
  // Specially configured demo scenario:
  // "Paracetamol 650 mg":
  // - Apollo (0.8km): IN_STOCK (qty 35, ₹32)
  // - MedPlus (1.4km): LOW_STOCK (qty 4, ₹35)
  // - Wellness Forever (2.1km): OUT_OF_STOCK (qty 0, ₹38)
  // - Guardian (3.5km): IN_STOCK (qty 50, ₹30)
  const insertInventory = db.prepare(`
    INSERT INTO inventory (
      id, pharmacy_id, medicine_id, quantity, price, availability_status, low_stock_threshold, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  let inventoryCount = 0;

  for (const pharmacy of SEED_PHARMACIES) {
    for (const med of SEED_MEDICINES) {
      let qty = 0;
      let priceModifier = 1 + (Math.sin(pharmacy.name.length + med.name.length) * 0.15);
      let price = Math.round(med.average_price * priceModifier * 10) / 10;
      let minutesAgo = `-${Math.floor(Math.random() * 120)} minutes`;

      // Deterministic scenario conditions
      if (med.id === 'med-1-paracetamol-650') {
        if (pharmacy.id === 'pharmacy-1-apollo') {
          qty = 38;
          price = 32.00;
          minutesAgo = '-8 minutes';
        } else if (pharmacy.id === 'pharmacy-2-medplus') {
          qty = 4; // LOW STOCK (<= 10)
          price = 35.00;
          minutesAgo = '-15 minutes';
        } else if (pharmacy.id === 'pharmacy-3-wellness') {
          qty = 0; // OUT OF STOCK
          price = 38.00;
          minutesAgo = '-45 minutes';
        } else if (pharmacy.id === 'pharmacy-4-guardian') {
          qty = 60;
          price = 30.50;
          minutesAgo = '-2 minutes';
        } else {
          qty = Math.random() > 0.3 ? Math.floor(15 + Math.random() * 40) : 0;
        }
      } else if (med.id === 'med-9-salbutamol-inhaler' || med.id === 'med-12-nitroglycerin-sublingual' || med.id === 'med-13-epinephrine-pen') {
        // Emergency items: mostly available at 24/7 pharmacies (Apollo, Wellness, Lifeline, Apex)
        if (pharmacy.is_24_7 === 1) {
          qty = Math.floor(12 + Math.random() * 25);
        } else {
          qty = Math.random() > 0.5 ? Math.floor(2 + Math.random() * 8) : 0;
        }
      } else {
        // Realistic distribution across catalog: 65% in stock, 20% low stock, 15% out of stock
        const rand = Math.random();
        if (rand < 0.65) {
          qty = Math.floor(15 + Math.random() * 50);
        } else if (rand < 0.85) {
          qty = Math.floor(1 + Math.random() * 8); // LOW STOCK
        } else {
          qty = 0; // OUT OF STOCK
        }
      }

      const status = calculateStockStatus(qty, 10);
      insertInventory.run(
        uuidv4(),
        pharmacy.id,
        med.id,
        qty,
        Math.max(5, price),
        status,
        10,
        minutesAgo
      );
      inventoryCount++;
    }
  }

  console.log(`📦 ${inventoryCount} Inventory records seeded with live stock statuses.`);

  // 5. Seed Sample Reservations
  const insertReservation = db.prepare(`
    INSERT INTO reservations (
      id, reservation_code, user_id, pharmacy_id, medicine_id, quantity, total_price, status, pickup_deadline, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))
  `);

  // Active pending reservation at Apollo (ready for hackathon demo to click Accept!)
  insertReservation.run(
    'res-demo-pending-1',
    'RES-88219',
    userCitizenId,
    'pharmacy-1-apollo',
    'med-5-amoxicillin-500',
    2,
    176.00,
    'PENDING',
    new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    'Prescribed for severe throat infection. Will pick up by 6 PM.',
    '-18 minutes',
    '-18 minutes'
  );

  // Ready for pickup reservation
  insertReservation.run(
    'res-demo-ready-2',
    'RES-74192',
    userCitizenId,
    'pharmacy-2-medplus',
    'med-2-paracetamol-500',
    1,
    24.00,
    'READY_FOR_PICKUP',
    new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    'Urgent fever medicine.',
    '-1 hour',
    '-15 minutes'
  );

  // Completed reservation
  insertReservation.run(
    'res-demo-completed-3',
    'RES-63014',
    userCitizenId,
    'pharmacy-1-apollo',
    'med-14-aspirin-75',
    1,
    9.80,
    'COMPLETED',
    new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    'Monthly routine prescription.',
    '-2 days',
    '-2 days'
  );

  console.log('📋 Sample Reservations seeded (Pending, Ready for Pickup, Completed).');

  // 6. Seed In-App Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, is_read, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  insertNotif.run(
    uuidv4(),
    userCitizenId,
    '🎉 Medicine Ready for Pickup!',
    'Your reservation #RES-74192 for Paracetamol 500 mg is packed and ready at MedPlus Pharmacy - Koramangala.',
    'RESERVATION_UPDATE',
    0,
    JSON.stringify({ reservationCode: 'RES-74192', pharmacyName: 'MedPlus Pharmacy' }),
    '-12 minutes'
  );

  insertNotif.run(
    uuidv4(),
    userCitizenId,
    '🔔 Stock Alert: Paracetamol 650 mg',
    'Paracetamol 650 mg (Dolo 650) is now in stock at Apollo Pharmacy - Indiranagar (0.8 km away).',
    'STOCK_ALERT',
    0,
    JSON.stringify({ medicineName: 'Paracetamol 650 mg', pharmacyName: 'Apollo Pharmacy' }),
    '-45 minutes'
  );

  insertNotif.run(
    uuidv4(),
    userCitizenId,
    '👋 Welcome to MediFind!',
    'Find essential medicines at nearby pharmacies in real-time. Use Emergency Mode for life-saving critical drugs.',
    'SYSTEM',
    1,
    null,
    '-1 day'
  );

  console.log('🔔 Notifications seeded.');

  // 7. Seed Stock Alerts (for demo)
  db.prepare(`
    INSERT INTO stock_alerts (id, user_id, medicine_id, pharmacy_id, is_triggered, created_at)
    VALUES (?, ?, ?, ?, 0, datetime('now'))
  `).run(uuidv4(), userCitizenId, 'med-1-paracetamol-650', 'pharmacy-3-wellness');

  console.log('✅ MediFind database successfully seeded with complete demo data!');
}

// If run directly via tsx
if (process.argv[1]?.endsWith('seed.ts')) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
