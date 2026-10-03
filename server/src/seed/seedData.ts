export interface SeedPharmacy {
  id: string;
  name: string;
  license_number: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  is_verified: number;
  is_24_7: number;
  open_time: string;
  close_time: string;
  rating: number;
}

export interface SeedMedicine {
  id: string;
  name: string;
  generic_name: string;
  brand_name: string;
  category: string;
  strength: string;
  dosage_form: string;
  manufacturer: string;
  description: string;
  requires_prescription: number;
  is_emergency: number;
  average_price: number;
}

// Center reference point (Bangalore Metro Area): 12.9716, 77.5946
export const SEED_PHARMACIES: SeedPharmacy[] = [
  {
    id: 'pharmacy-1-apollo',
    name: 'Apollo Pharmacy - Indiranagar',
    license_number: 'KA-BLR-2023-9081',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    latitude: 12.9784,
    longitude: 77.6408,
    phone: '+91 98450 12345',
    email: 'apollo.indiranagar@medifind.com',
    is_verified: 1,
    is_24_7: 1,
    open_time: 'Open 24/7',
    close_time: 'Open 24/7',
    rating: 4.8
  },
  {
    id: 'pharmacy-2-medplus',
    name: 'MedPlus Pharmacy - Koramangala',
    license_number: 'KA-BLR-2022-7742',
    address: '80 Feet Road, 4th Block, Koramangala',
    city: 'Bengaluru',
    latitude: 12.9352,
    longitude: 77.6245,
    phone: '+91 98451 23456',
    email: 'medplus.kora@medifind.com',
    is_verified: 1,
    is_24_7: 0,
    open_time: '08:00 AM',
    close_time: '11:00 PM',
    rating: 4.6
  },
  {
    id: 'pharmacy-3-wellness',
    name: 'Wellness Forever - MG Road',
    license_number: 'KA-BLR-2024-1102',
    address: 'Brigade Junction, MG Road',
    city: 'Bengaluru',
    latitude: 12.9738,
    longitude: 77.6094,
    phone: '+91 98452 34567',
    email: 'wellness.mgroad@medifind.com',
    is_verified: 1,
    is_24_7: 1,
    open_time: 'Open 24/7',
    close_time: 'Open 24/7',
    rating: 4.7
  },
  {
    id: 'pharmacy-4-guardian',
    name: 'Guardian Pharmacy - HSR Layout',
    license_number: 'KA-BLR-2021-4458',
    address: 'Sector 3, 27th Main, HSR Layout',
    city: 'Bengaluru',
    latitude: 12.9121,
    longitude: 77.6446,
    phone: '+91 98453 45678',
    email: 'guardian.hsr@medifind.com',
    is_verified: 1,
    is_24_7: 0,
    open_time: '07:30 AM',
    close_time: '10:30 PM',
    rating: 4.5
  },
  {
    id: 'pharmacy-5-carecure',
    name: 'Care & Cure Meds - Whitefield',
    license_number: 'KA-BLR-2023-3390',
    address: 'ITPL Main Road, Prestige Shantiniketan, Whitefield',
    city: 'Bengaluru',
    latitude: 12.9866,
    longitude: 77.7314,
    phone: '+91 98454 56789',
    email: 'carecure.wf@medifind.com',
    is_verified: 1,
    is_24_7: 0,
    open_time: '08:00 AM',
    close_time: '10:00 PM',
    rating: 4.4
  },
  {
    id: 'pharmacy-6-healthfirst',
    name: 'HealthFirst Chemist - Jayanagar',
    license_number: 'KA-BLR-2022-8819',
    address: '11th Main, 4th Block, Jayanagar',
    city: 'Bengaluru',
    latitude: 12.9298,
    longitude: 77.5834,
    phone: '+91 98455 67890',
    email: 'healthfirst.jayanagar@medifind.com',
    is_verified: 1,
    is_24_7: 0,
    open_time: '08:30 AM',
    close_time: '10:30 PM',
    rating: 4.6
  },
  {
    id: 'pharmacy-7-lifeline',
    name: 'Lifeline Pharmacy - Malleshwaram',
    license_number: 'KA-BLR-2020-5512',
    address: 'Margosa Road, Between 8th & 9th Cross, Malleshwaram',
    city: 'Bengaluru',
    latitude: 13.0034,
    longitude: 77.5712,
    phone: '+91 98456 78901',
    email: 'lifeline.malles@medifind.com',
    is_verified: 1,
    is_24_7: 1,
    open_time: 'Open 24/7',
    close_time: 'Open 24/7',
    rating: 4.9
  },
  {
    id: 'pharmacy-8-citymeds',
    name: 'City Meds Discount Pharmacy - BTM',
    license_number: 'KA-BLR-2023-6621',
    address: 'Outer Ring Road, 1st Stage, BTM Layout',
    city: 'Bengaluru',
    latitude: 12.9166,
    longitude: 77.6101,
    phone: '+91 98457 89012',
    email: 'citymeds.btm@medifind.com',
    is_verified: 1,
    is_24_7: 0,
    open_time: '08:00 AM',
    close_time: '11:00 PM',
    rating: 4.3
  },
  {
    id: 'pharmacy-9-frankross',
    name: 'Frank Ross Pharmacy - Rajajinagar',
    license_number: 'KA-BLR-2021-9923',
    address: 'Dr. Rajkumar Road, 2nd Block, Rajajinagar',
    city: 'Bengaluru',
    latitude: 12.9982,
    longitude: 77.5531,
    phone: '+91 98458 90123',
    email: 'frankross.rajaji@medifind.com',
    is_verified: 1,
    is_24_7: 0,
    open_time: '08:00 AM',
    close_time: '10:00 PM',
    rating: 4.5
  },
  {
    id: 'pharmacy-10-apex',
    name: 'Apex 24/7 Emergency Meds - Electronic City',
    license_number: 'KA-BLR-2024-8844',
    address: 'Phase 1, Hosur Road, Electronic City',
    city: 'Bengaluru',
    latitude: 12.8452,
    longitude: 77.6602,
    phone: '+91 98459 01234',
    email: 'apex.ecity@medifind.com',
    is_verified: 1,
    is_24_7: 1,
    open_time: 'Open 24/7',
    close_time: 'Open 24/7',
    rating: 4.8
  }
];

export const SEED_MEDICINES: SeedMedicine[] = [
  // Analgesics & Antipyretics
  {
    id: 'med-1-paracetamol-650',
    name: 'Paracetamol 650 mg Tablet',
    generic_name: 'Paracetamol',
    brand_name: 'Dolo 650',
    category: 'Analgesics',
    strength: '650 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Micro Labs Ltd',
    description: 'Fast-acting fever reducer and mild-to-moderate pain reliever.',
    requires_prescription: 0,
    is_emergency: 0,
    average_price: 32.50
  },
  {
    id: 'med-2-paracetamol-500',
    name: 'Paracetamol 500 mg Tablet',
    generic_name: 'Paracetamol',
    brand_name: 'Calpol 500',
    category: 'Analgesics',
    strength: '500 mg',
    dosage_form: 'Tablet',
    manufacturer: 'GlaxoSmithKline',
    description: 'Standard antipyretic for fever, headache, and body aches.',
    requires_prescription: 0,
    is_emergency: 0,
    average_price: 24.00
  },
  {
    id: 'med-3-ibuprofen-400',
    name: 'Ibuprofen 400 mg Tablet',
    generic_name: 'Ibuprofen',
    brand_name: 'Brufen 400',
    category: 'Analgesics',
    strength: '400 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Abbott Healthcare',
    description: 'Non-steroidal anti-inflammatory drug (NSAID) for swelling and severe pain.',
    requires_prescription: 0,
    is_emergency: 0,
    average_price: 28.00
  },
  {
    id: 'med-4-diclofenac-50',
    name: 'Diclofenac Sodium 50 mg Tablet',
    generic_name: 'Diclofenac',
    brand_name: 'Voveran 50',
    category: 'Analgesics',
    strength: '50 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Novartis',
    description: 'Relief of joint pain, osteoarthritis, and acute sports injuries.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 45.00
  },

  // Antibiotics
  {
    id: 'med-5-amoxicillin-500',
    name: 'Amoxicillin 500 mg Capsule',
    generic_name: 'Amoxicillin',
    brand_name: 'Mox 500',
    category: 'Antibiotics',
    strength: '500 mg',
    dosage_form: 'Capsule',
    manufacturer: 'Ranbaxy / Sun Pharma',
    description: 'Broad-spectrum penicillin antibiotic for ear, throat, and chest infections.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 88.00
  },
  {
    id: 'med-6-azithromycin-500',
    name: 'Azithromycin 500 mg Tablet',
    generic_name: 'Azithromycin',
    brand_name: 'Azee 500',
    category: 'Antibiotics',
    strength: '500 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Cipla Ltd',
    description: 'Macrolide antibiotic for respiratory tract, sinus, and skin infections.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 119.50
  },
  {
    id: 'med-7-augmentin-625',
    name: 'Amoxicillin + Clavulanic Acid 625 mg Tablet',
    generic_name: 'Amoxicillin + Potassium Clavulanate',
    brand_name: 'Augmentin 625 Duo',
    category: 'Antibiotics',
    strength: '625 mg',
    dosage_form: 'Tablet',
    manufacturer: 'GlaxoSmithKline',
    description: 'Potent combined antibiotic for resistant bacterial infections.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 198.00
  },
  {
    id: 'med-8-ciprofloxacin-500',
    name: 'Ciprofloxacin 500 mg Tablet',
    generic_name: 'Ciprofloxacin',
    brand_name: 'Ciplox 500',
    category: 'Antibiotics',
    strength: '500 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Cipla Ltd',
    description: 'Fluoroquinolone antibiotic for urinary and gastrointestinal infections.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 42.00
  },

  // Respiratory & Asthma (Emergency)
  {
    id: 'med-9-salbutamol-inhaler',
    name: 'Salbutamol Inhaler 100 mcg (200 doses)',
    generic_name: 'Salbutamol (Albuterol)',
    brand_name: 'Asthalin Inhaler',
    category: 'Respiratory',
    strength: '100 mcg',
    dosage_form: 'Inhaler',
    manufacturer: 'Cipla Ltd',
    description: 'CRITICAL RESCUE MEDICATION: Fast-acting bronchodilator for acute asthma attack.',
    requires_prescription: 1,
    is_emergency: 1,
    average_price: 165.00
  },
  {
    id: 'med-10-budesonide-inhaler',
    name: 'Budesonide Inhaler 200 mcg',
    generic_name: 'Budesonide',
    brand_name: 'Budecort 200',
    category: 'Respiratory',
    strength: '200 mcg',
    dosage_form: 'Inhaler',
    manufacturer: 'Cipla Ltd',
    description: 'Inhaled corticosteroid for daily asthma and COPD management.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 295.00
  },
  {
    id: 'med-11-montelukast-10',
    name: 'Montelukast 10 mg Tablet',
    generic_name: 'Montelukast',
    brand_name: 'Montair 10',
    category: 'Respiratory',
    strength: '10 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Cipla Ltd',
    description: 'Leukotriene receptor antagonist for chronic asthma and seasonal allergic rhinitis.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 175.00
  },

  // Cardiovascular & Emergency
  {
    id: 'med-12-nitroglycerin-sublingual',
    name: 'Nitroglycerin Sublingual 0.5 mg Tablet',
    generic_name: 'Nitroglycerin (Glyceryl Trinitrate)',
    brand_name: 'Sorbitrate 5 mg',
    category: 'Cardiovascular',
    strength: '0.5 mg',
    dosage_form: 'Sublingual Tablet',
    manufacturer: 'Abbott',
    description: 'CRITICAL CARDIAC EMERGENCY: Rapid relief of acute angina pectoris chest pain.',
    requires_prescription: 1,
    is_emergency: 1,
    average_price: 52.00
  },
  {
    id: 'med-13-epinephrine-pen',
    name: 'Epinephrine Auto-Injector 0.3 mg',
    generic_name: 'Epinephrine (Adrenaline)',
    brand_name: 'EpiPen 0.3mg',
    category: 'Emergency Care',
    strength: '0.3 mg',
    dosage_form: 'Auto-Injector',
    manufacturer: 'Mylan / Viatris',
    description: 'CRITICAL LIFE SAVER: Immediate treatment for severe anaphylactic shock / acute allergic reaction.',
    requires_prescription: 1,
    is_emergency: 1,
    average_price: 3450.00
  },
  {
    id: 'med-14-aspirin-75',
    name: 'Aspirin Gastro-Resistant 75 mg Tablet',
    generic_name: 'Aspirin (Acetylsalicylic Acid)',
    brand_name: 'Ecosprin 75',
    category: 'Cardiovascular',
    strength: '75 mg',
    dosage_form: 'Tablet',
    manufacturer: 'USV Pvt Ltd',
    description: 'Antiplatelet therapy for prevention of heart attack, stroke, and arterial thrombosis.',
    requires_prescription: 0,
    is_emergency: 1,
    average_price: 9.80
  },
  {
    id: 'med-15-amlodipine-5',
    name: 'Amlodipine 5 mg Tablet',
    generic_name: 'Amlodipine',
    brand_name: 'Amlong 5',
    category: 'Cardiovascular',
    strength: '5 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Micro Labs',
    description: 'Calcium channel blocker for essential hypertension and chronic stable angina.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 38.00
  },
  {
    id: 'med-16-telmisartan-40',
    name: 'Telmisartan 40 mg Tablet',
    generic_name: 'Telmisartan',
    brand_name: 'Telma 40',
    category: 'Cardiovascular',
    strength: '40 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Glenmark Pharmaceuticals',
    description: 'Angiotensin II receptor blocker (ARB) for blood pressure control and cardiovascular protection.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 92.00
  },
  {
    id: 'med-17-atorvastatin-20',
    name: 'Atorvastatin 20 mg Tablet',
    generic_name: 'Atorvastatin',
    brand_name: 'Atorva 20',
    category: 'Cardiovascular',
    strength: '20 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Zydus Cadila',
    description: 'HMG-CoA reductase inhibitor (statin) for lowering LDL cholesterol.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 145.00
  },

  // Diabetes Care
  {
    id: 'med-18-metformin-500',
    name: 'Metformin Hydrochloride 500 mg Extended Release',
    generic_name: 'Metformin',
    brand_name: 'Glycomet 500 SR',
    category: 'Diabetes',
    strength: '500 mg',
    dosage_form: 'Tablet',
    manufacturer: 'USV Pvt Ltd',
    description: 'First-line biguanide oral antidiabetic for type 2 diabetes.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 25.50
  },
  {
    id: 'med-19-glimepiride-2',
    name: 'Glimepiride 2 mg Tablet',
    generic_name: 'Glimepiride',
    brand_name: 'Amaryl 2 mg',
    category: 'Diabetes',
    strength: '2 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Sanofi India',
    description: 'Sulfonylurea antidiabetic for stimulating insulin secretion in type 2 diabetes.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 85.00
  },
  {
    id: 'med-20-insulin-glargine',
    name: 'Insulin Glargine 100 IU/ml Solostar Pen',
    generic_name: 'Insulin Glargine',
    brand_name: 'Lantus SoloStar',
    category: 'Diabetes',
    strength: '100 IU/ml',
    dosage_form: 'Pre-filled Pen',
    manufacturer: 'Sanofi India',
    description: 'CRITICAL 24-HOUR BASAL INSULIN: Long-acting insulin analog for type 1 & 2 diabetes.',
    requires_prescription: 1,
    is_emergency: 1,
    average_price: 685.00
  },

  // Allergy & Antihistamines
  {
    id: 'med-21-cetirizine-10',
    name: 'Cetirizine Hydrochloride 10 mg Tablet',
    generic_name: 'Cetirizine',
    brand_name: 'Cetzine 10',
    category: 'Antihistamines',
    strength: '10 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Dr. Reddy\'s Laboratories',
    description: 'Second-generation antihistamine for seasonal allergies, hives, and allergic itching.',
    requires_prescription: 0,
    is_emergency: 0,
    average_price: 21.00
  },
  {
    id: 'med-22-levocetirizine-5',
    name: 'Levocetirizine 5 mg Tablet',
    generic_name: 'Levocetirizine',
    brand_name: 'Levocet 5',
    category: 'Antihistamines',
    strength: '5 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Glenmark',
    description: 'Pure active R-enantiomer of cetirizine with reduced drowsiness.',
    requires_prescription: 0,
    is_emergency: 0,
    average_price: 36.00
  },
  {
    id: 'med-23-fexofenadine-120',
    name: 'Fexofenadine 120 mg Tablet',
    generic_name: 'Fexofenadine',
    brand_name: 'Allegra 120',
    category: 'Antihistamines',
    strength: '120 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Sanofi India',
    description: 'Non-sedating antihistamine for allergic rhinitis and skin allergies.',
    requires_prescription: 0,
    is_emergency: 0,
    average_price: 185.00
  },

  // Gastrointestinal
  {
    id: 'med-24-pantoprazole-40',
    name: 'Pantoprazole Gastro-Resistant 40 mg Tablet',
    generic_name: 'Pantoprazole',
    brand_name: 'Pan 40',
    category: 'Gastrointestinal',
    strength: '40 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Alkem Laboratories',
    description: 'Proton pump inhibitor (PPI) for GERD, acid reflux, and peptic ulcers.',
    requires_prescription: 0,
    is_emergency: 0,
    average_price: 110.00
  },
  {
    id: 'med-25-omeprazole-20',
    name: 'Omeprazole 20 mg Capsule',
    generic_name: 'Omeprazole',
    brand_name: 'Omez 20',
    category: 'Gastrointestinal',
    strength: '20 mg',
    dosage_form: 'Capsule',
    manufacturer: 'Dr. Reddy\'s Laboratories',
    description: 'Classic PPI for hyperacidity, gastric heartburn, and ulcer healing.',
    requires_prescription: 0,
    is_emergency: 0,
    average_price: 62.00
  },
  {
    id: 'med-26-domperidone-10',
    name: 'Domperidone 10 mg Tablet',
    generic_name: 'Domperidone',
    brand_name: 'Vomistop 10',
    category: 'Gastrointestinal',
    strength: '10 mg',
    dosage_form: 'Tablet',
    manufacturer: 'Cipla Ltd',
    description: 'Dopamine antagonist antiemetic for nausea, vomiting, and fullness.',
    requires_prescription: 1,
    is_emergency: 0,
    average_price: 35.00
  },

  // Critical Hospital & Emergency Anti-Venom / Reversal
  {
    id: 'med-27-antivenom-polyvalent',
    name: 'Polyvalent Anti-Snake Venom (ASV) 10ml Vial',
    generic_name: 'Polyvalent Snake Antivenin',
    brand_name: 'Snake Antivenin Serum',
    category: 'Emergency Care',
    strength: '10 ml',
    dosage_form: 'Injection',
    manufacturer: 'Serum Institute of India',
    description: 'LIFE CRITICAL: Neutralizes venoms of Cobra, Krait, Russell\'s Viper, and Saw-scaled Viper.',
    requires_prescription: 1,
    is_emergency: 1,
    average_price: 650.00
  },
  {
    id: 'med-28-naloxone-injection',
    name: 'Naloxone Hydrochloride 0.4 mg/ml Injection',
    generic_name: 'Naloxone',
    brand_name: 'Narcan / Nalox 0.4',
    category: 'Emergency Care',
    strength: '0.4 mg/ml',
    dosage_form: 'Ampoule',
    manufacturer: 'Neon Laboratories',
    description: 'CRITICAL OPIOID OVERDOSE REVERSAL: Rapidly counters respiratory depression.',
    requires_prescription: 1,
    is_emergency: 1,
    average_price: 180.00
  },
  {
    id: 'med-29-hydrocortisone-100',
    name: 'Hydrocortisone Sodium Succinate 100 mg Injection',
    generic_name: 'Hydrocortisone',
    brand_name: 'Primacort 100',
    category: 'Emergency Care',
    strength: '100 mg',
    dosage_form: 'Vial',
    manufacturer: 'Macleods Pharma',
    description: 'CRITICAL STEROID: Immediate emergency management of acute adrenal crisis and shock.',
    requires_prescription: 1,
    is_emergency: 1,
    average_price: 48.00
  },

  // Vitamins & Supplements
  {
    id: 'med-30-vitamin-d3-60k',
    name: 'Cholecalciferol (Vitamin D3) 60,000 IU Capsule',
    generic_name: 'Cholecalciferol',
    brand_name: 'Calcirol 60K',
    category: 'Vitamins & Supplements',
    strength: '60,000 IU',
    dosage_form: 'Softgel Capsule',
    manufacturer: 'Cadila Pharmaceuticals',
    description: 'High-dose weekly vitamin D3 for bone health and deficiency correction.',
    requires_prescription: 0,
    is_emergency: 0,
    average_price: 135.00
  },
  {
    id: 'med-31-vitamin-c-zinc',
    name: 'Vitamin C 500 mg + Zinc Chewable Tablet',
    generic_name: 'Ascorbic Acid + Zinc',
    brand_name: 'Limcee Chewable',
    category: 'Vitamins & Supplements',
    strength: '500 mg',
    dosage_form: 'Chewable Tablet',
    manufacturer: 'Abbott Healthcare',
    description: 'Immunity support antioxidant supplement.',
    requires_prescription: 0,
    is_emergency: 0,
    average_price: 24.50
  },
  {
    id: 'med-32-oral-rehydration-salts',
    name: 'Oral Rehydration Salts (ORS) WHO Formula Sachet',
    generic_name: 'Sodium Chloride + Potassium Chloride + Dextrose',
    brand_name: 'Electral Sachet',
    category: 'Emergency Care',
    strength: '21.8 g sachet',
    dosage_form: 'Powder Sachet',
    manufacturer: 'FDC Ltd',
    description: 'CRITICAL DEHYDRATION TREATMENT: Restores fluid balance in severe diarrhea/vomiting.',
    requires_prescription: 0,
    is_emergency: 1,
    average_price: 22.00
  }
];
