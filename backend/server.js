const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory database of scan history records
let scanHistory = [
  {
    id: 'AUD-89240-2026',
    name: "Nature's Harvest Oats",
    category: "Food & Beverages",
    date: "2026-08-27 10:15",
    score: 100,
    weightedScore: 94,
    violationsCount: 0,
    status: "Compliant",
    productKey: "oats",
    fieldConfidences: {
      productName: 98, netQty: 95, mrp: 96, mfgDate: 94, expiryDate: 92,
      manufacturerName: 91, customerCare: 90, fssaiLicense: 97, batchNumber: 93
    },
    fields: {
      productName: "Nature's Harvest Oats",
      netQty: "500g",
      mrp: "Rs. 145.00 (Incl. of all taxes)",
      mfgDate: "12/2025",
      expiryDate: "12/2026",
      manufacturerName: "Nature Food Foods Pvt Ltd, Plot 42, Okhla Ind Area, New Delhi",
      customerCare: "care@natureharvest.com, Ph: 1800-11-2233",
      fssaiLicense: "10014011001895",
      batchNumber: "NH-OAT-998"
    }
  },
  {
    id: 'AUD-89212-2026',
    name: "Spicy Fusion Masala",
    category: "Spices & Condiments",
    date: "2026-08-27 09:30",
    score: 75,
    weightedScore: 78,
    violationsCount: 2,
    status: "Non-Compliant",
    productKey: "masala",
    fieldConfidences: {
      productName: 92, netQty: 85, mrp: 88, mfgDate: 84, expiryDate: 80,
      manufacturerName: 79, customerCare: 62, fssaiLicense: 70, batchNumber: 88
    },
    fields: {
      productName: "Spicy Fusion Garam Masala",
      netQty: "100 grams",
      mrp: "₹ 65",
      mfgDate: "04/2026",
      expiryDate: "04/2027",
      manufacturerName: "Spicy Spices Ltd, Sector 5, Haridwar",
      customerCare: "Ph: 01334-222333",
      fssaiLicense: "1234F567891234",
      batchNumber: "SFM-88A"
    }
  },
  {
    id: 'AUD-89190-2026',
    name: "Glow Radiant Face Cream",
    category: "Cosmetics & Personal Care",
    date: "2026-08-26 16:45",
    score: 50,
    weightedScore: 52,
    violationsCount: 2,
    status: "Non-Compliant",
    productKey: "cream",
    fieldConfidences: {
      productName: 89, netQty: 68, mrp: 0, mfgDate: 78, expiryDate: 75,
      manufacturerName: 82, customerCare: 71, fssaiLicense: 0, batchNumber: 80
    },
    fields: {
      productName: "Glow Radiant Face Cream",
      netQty: "1.7 oz",
      mrp: "",
      mfgDate: "02/2026",
      expiryDate: "02/2028",
      manufacturerName: "Radiant Beauty Cosmetics, Mumbai",
      customerCare: "Ph: 9999999999",
      fssaiLicense: "N/A",
      batchNumber: "GB-77B"
    }
  }
];

// Historical Manufacturer Labels Database (for Cross-Label Consistency comparison)
const productHistoryRegistry = {
  biscuit: {
    productName: "BRITANNIA Good Day Butter Cookies",
    sku: "8901063370050",
    manufacturer: "BRITANNIA INDUSTRIES LTD., 5/1 A HUNGERFORD STREET, KOLKATA-700017, WEST BENGAL",
    revisionsCount: 3,
    lastRevisionPeriod: "4 months ago",
    history: [
      {
        batch: "B01124L M/C 601",
        date: "10/01/2026",
        mrp: "₹ 5.00",
        mrpNumeric: 5.0,
        netQty: "35.0g",
        netQtyNumeric: 35.0,
        netQtyUnit: "g",
        manufacturer: "BRITANNIA INDUSTRIES LTD., KOLKATA-700017",
        sku: "8901063370050"
      },
      {
        batch: "B02188L M/C 604",
        date: "15/04/2026",
        mrp: "₹ 5.00",
        mrpNumeric: 5.0,
        netQty: "34.5g",
        netQtyNumeric: 34.5,
        netQtyUnit: "g",
        manufacturer: "BRITANNIA INDUSTRIES LTD., KOLKATA-700017",
        sku: "8901063370050"
      }
    ]
  },
  struck: {
    productName: "BRITANNIA Good Day Butter Cookies",
    sku: "8901063370050",
    manufacturer: "BRITANNIA INDUSTRIES LTD., 5/1 A HUNGERFORD STREET, KOLKATA-700017, WEST BENGAL",
    revisionsCount: 3,
    lastRevisionPeriod: "4 months ago",
    history: [
      {
        batch: "B01124L M/C 601",
        date: "10/01/2026",
        mrp: "₹ 5.00",
        mrpNumeric: 5.0,
        netQty: "35.0g",
        netQtyNumeric: 35.0,
        netQtyUnit: "g",
        manufacturer: "BRITANNIA INDUSTRIES LTD., KOLKATA-700017",
        sku: "8901063370050"
      }
    ]
  },
  tampered_mrp: {
    productName: "BRITANNIA Good Day Butter Cookies",
    sku: "8901063370050",
    manufacturer: "BRITANNIA INDUSTRIES LTD., 5/1 A HUNGERFORD STREET, KOLKATA-700017, WEST BENGAL",
    revisionsCount: 3,
    lastRevisionPeriod: "4 months ago",
    history: [
      {
        batch: "B02188L M/C 604",
        date: "15/04/2026",
        mrp: "₹ 5.00",
        mrpNumeric: 5.0,
        netQty: "34.5g",
        netQtyNumeric: 34.5,
        netQtyUnit: "g",
        manufacturer: "BRITANNIA INDUSTRIES LTD., KOLKATA-700017",
        sku: "8901063370050"
      }
    ]
  },
  snack: {
    productName: "Crunchy Masala Chips",
    sku: "8902201100045",
    manufacturer: "Crunchy Snacks Pvt Ltd, Plot 14, Okhla Phase 3, New Delhi",
    revisionsCount: 4,
    lastRevisionPeriod: "2 months ago",
    history: [
      {
        batch: "MC-2025-A2",
        date: "15/11/2025",
        mrp: "₹ 40.00",
        mrpNumeric: 40.0,
        netQty: "160g",
        netQtyNumeric: 160.0,
        netQtyUnit: "g",
        manufacturer: "Crunchy Snacks Pvt Ltd, Plot 14, Okhla Phase 3, New Delhi",
        sku: "8902201100045"
      },
      {
        batch: "MC-2026-A9",
        date: "10/04/2026",
        mrp: "₹ 45.00",
        mrpNumeric: 45.0,
        netQty: "150g",
        netQtyNumeric: 150.0,
        netQtyUnit: "g",
        manufacturer: "Crunchy Snacks Pvt Ltd, Plot 14, Okhla Phase 3, New Delhi",
        sku: "8902201100045"
      }
    ]
  },
  oats: {
    productName: "Nature's Harvest Oats",
    sku: "8901401100189",
    manufacturer: "Nature Food Foods Pvt Ltd, Plot 42, Okhla Ind Area, New Delhi",
    revisionsCount: 2,
    lastRevisionPeriod: "6 months ago",
    history: [
      {
        batch: "NH-OAT-910",
        date: "06/2025",
        mrp: "₹ 140.00",
        mrpNumeric: 140.0,
        netQty: "500g",
        netQtyNumeric: 500.0,
        netQtyUnit: "g",
        manufacturer: "Nature Food Foods Pvt Ltd, Plot 42, Okhla Ind Area, New Delhi",
        sku: "8901401100189"
      }
    ]
  },
  masala: {
    productName: "Spicy Fusion Garam Masala",
    sku: "8901234567891",
    manufacturer: "Spicy Spices Ltd, Sector 5, Haridwar",
    revisionsCount: 2,
    lastRevisionPeriod: "5 months ago",
    history: [
      {
        batch: "SFM-72",
        date: "11/2025",
        mrp: "₹ 60.00",
        mrpNumeric: 60.0,
        netQty: "100 grams",
        netQtyNumeric: 100.0,
        netQtyUnit: "g",
        manufacturer: "Spicy Spices Ltd, Sector 5, Haridwar",
        sku: "8901234567891"
      }
    ]
  },
  cream: {
    productName: "Glow Radiant Face Cream",
    sku: "8909999999999",
    manufacturer: "Radiant Beauty Cosmetics, Mumbai",
    revisionsCount: 1,
    lastRevisionPeriod: "7 months ago",
    history: [
      {
        batch: "GB-60",
        date: "08/2025",
        mrp: "₹ 199.00",
        mrpNumeric: 199.0,
        netQty: "50g",
        netQtyNumeric: 50.0,
        netQtyUnit: "g",
        manufacturer: "Radiant Beauty Cosmetics, Mumbai",
        sku: "8909999999999"
      }
    ]
  },
  tamil_oil: {
    productName: "அஞ்சல் நல்லெண்ணெய் (Anjali Sesame Oil)",
    sku: "8906012450012",
    manufacturer: "அஞ்சல் ஆயில் மில்ஸ், 12 காமராஜர் சாலை, மதுரை - 625009, தமிழ்நாடு",
    revisionsCount: 2,
    lastRevisionPeriod: "3 months ago",
    history: [
      {
        batch: "TN-2025-A1",
        date: "12/2025",
        mrp: "₹ 115.00",
        mrpNumeric: 115.0,
        netQty: "500 மில்லி",
        netQtyNumeric: 500.0,
        netQtyUnit: "ml",
        manufacturer: "அஞ்சல் ஆயில் மில்ஸ், மதுரை",
        sku: "8906012450012"
      }
    ]
  },
  hindi_ghee: {
    productName: "पतंजलि गाय का घी (Patanjali Cow Ghee)",
    sku: "8904109400234",
    manufacturer: "पतंजलि आयुर्वेद लिमिटेड, महर्षि दयानंद ग्राम, हरिद्वार, उत्तराखंड - 249401",
    revisionsCount: 3,
    lastRevisionPeriod: "4 months ago",
    history: [
      {
        batch: "PT-7710",
        date: "01/2026",
        mrp: "₹ 250.00",
        mrpNumeric: 250.0,
        netQty: "500 मिली",
        netQtyNumeric: 500.0,
        netQtyUnit: "ml",
        manufacturer: "पतंजलि आयुर्वेद लिमिटेड, हरिद्वार, उत्तराखंड",
        sku: "8904109400234"
      }
    ]
  }
};

// Product mock configs mapping OCR bounding box coordinates and extracted values
const productMockConfigs = {
  biscuit: {
    key: 'biscuit',
    name: "BRITANNIA Good Day Butter Cookies (Full Back Wrapper)",
    category: "food",
    bgClass: "biscuit-mock",
    confidence: 98,
    fssaiMandatory: true,
    barcode: "8901063370050",
    language: "eng",
    fieldConfidences: {
      productName: 99,
      netQty: 97,
      mrp: 98,
      mfgDate: 96,
      expiryDate: 95,
      manufacturerName: 94,
      customerCare: 92,
      fssaiLicense: 98,
      batchNumber: 95,
      barcode: 99
    },
    tamperZone: null,
    boxes: [
      { id: 'productName', top: '10px', left: '10px', width: '280px', height: '24px', name: 'Product: BRITANNIA Good Day Butter Cookies', class: 'mfg' },
      { id: 'netQty', top: '40px', left: '10px', width: '280px', height: '20px', name: 'Net Wt: 30.2g + 4.3g EXTRA# = 34.5g', class: 'qty' },
      { id: 'mrp', top: '65px', left: '10px', width: '280px', height: '22px', name: 'MRP: ₹ 5.00 (INCL., OF ALL TAXES) Rs. 0.14 per g', class: 'mrp' },
      { id: 'mfgDate', top: '92px', left: '10px', width: '135px', height: '20px', name: 'PKD: 26/08/26', class: 'date' },
      { id: 'expiryDate', top: '92px', left: '150px', width: '140px', height: '20px', name: 'Use By: 25/01/27', class: 'date' },
      { id: 'batchNumber', top: '115px', left: '10px', width: '280px', height: '18px', name: 'Lot: B08269L M/C 606 16:02', class: 'date' },
      { id: 'manufacturerName', top: '136px', left: '10px', width: '280px', height: '28px', name: 'Mfr: BRITANNIA INDUSTRIES LTD., KOLKATA-700017', class: 'mfg' },
      { id: 'customerCare', top: '168px', left: '10px', width: '280px', height: '28px', name: 'Care: 1-800-4254449 / feedback@britindia.com', class: 'mfg' },
      { id: 'fssaiLicense', top: '200px', left: '10px', width: '280px', height: '18px', name: 'FSSAI: Lic. No. 10015043001129', class: 'qty' },
      { id: 'barcode', top: '222px', left: '10px', width: '280px', height: '18px', name: 'EAN-13 Barcode: 8901063370050', class: 'qty' }
    ],
    fields: {
      productName: "BRITANNIA Good Day Butter Cookies",
      netQty: "30.2g + 4.3g EXTRA# = 34.5g",
      mrp: "MRP ₹ 5.00 (INCL., OF ALL TAXES) Rs. 0.14 per g",
      mfgDate: "26/08/26",
      expiryDate: "25/01/27",
      manufacturerName: "BRITANNIA INDUSTRIES LTD., 5/1 A HUNGERFORD STREET, KOLKATA-700017, WEST BENGAL",
      customerCare: "Executive, Consumer Care Cell, Ph: 1-800-4254449 / 1-800-30004530, Email: feedback@britindia.com",
      fssaiLicense: "Lic. No. 10015043001129 BRITANNIA INDUSTRIES LTD.",
      batchNumber: "B08269L M/C 606 16:02",
      barcode: "8901063370050"
    }
  },
  struck: {
    key: 'struck',
    name: "BRITANNIA Good Day (Struck-Out / Defaced Date Offence)",
    category: "food",
    bgClass: "biscuit-mock",
    confidence: 86,
    fssaiMandatory: true,
    barcode: "8901063370050",
    language: "eng",
    fieldConfidences: {
      productName: 98,
      netQty: 96,
      mrp: 97,
      mfgDate: 24,
      expiryDate: 28,
      manufacturerName: 93,
      customerCare: 91,
      fssaiLicense: 95,
      batchNumber: 89,
      barcode: 99
    },
    tamperZone: {
      detected: true,
      x: 10,
      y: 92,
      width: 280,
      height: 24,
      severity: "CRITICAL",
      type: "INK_DEFACEMENT_STRUCK_OUT",
      targetField: "mfgDate",
      description: "Manual ink obliteration / strike-through detected over statutory PKD Date and Expiry fields.",
      confidence: 96
    },
    boxes: [
      { id: 'productName', top: '10px', left: '10px', width: '280px', height: '24px', name: 'Product: BRITANNIA Good Day Butter Cookies', class: 'mfg' },
      { id: 'netQty', top: '40px', left: '10px', width: '280px', height: '20px', name: 'Net Wt: 30.2g + 4.3g EXTRA# = 34.5g', class: 'qty' },
      { id: 'mrp', top: '65px', left: '10px', width: '280px', height: '22px', name: 'MRP: ₹ 5.00 (INCL. TAXES)', class: 'mrp' },
      { id: 'mfgDate', top: '92px', left: '10px', width: '280px', height: '22px', name: 'PKD/USE BY: [DEFACED/STRUCK OUT WITH INK]', class: 'missing-box' },
      { id: 'batchNumber', top: '118px', left: '10px', width: '280px', height: '18px', name: 'Lot: B08269L M/C 606 16:02', class: 'date' },
      { id: 'manufacturerName', top: '140px', left: '10px', width: '280px', height: '24px', name: 'Mfr: BRITANNIA INDUSTRIES LTD., KOLKATA', class: 'mfg' },
      { id: 'customerCare', top: '168px', left: '10px', width: '280px', height: '24px', name: 'Care: 1-800-4254449 / feedback@britindia.com', class: 'mfg' },
      { id: 'barcode', top: '196px', left: '10px', width: '280px', height: '20px', name: 'EAN-13 Barcode: 8901063370050 (GS1 Verified)', class: 'qty' }
    ],
    fields: {
      productName: "BRITANNIA Good Day Butter Cookies",
      netQty: "30.2g + 4.3g EXTRA# = 34.5g",
      mrp: "MRP ₹ 5.00 (INCL., OF ALL TAXES) Rs. 0.14 per g",
      mfgDate: "",
      expiryDate: "",
      manufacturerName: "BRITANNIA INDUSTRIES LTD., 5/1 A HUNGERFORD STREET, KOLKATA-700017, WEST BENGAL",
      customerCare: "Executive, Consumer Care Cell, Ph: 1-800-4254449 / 1-800-30004530, Email: feedback@britindia.com",
      fssaiLicense: "Lic. No. 10015043001129 BRITANNIA INDUSTRIES LTD.",
      batchNumber: "B08269L M/C 606 16:02",
      barcode: "8901063370050"
    }
  },
  tampered_mrp: {
    key: 'tampered_mrp',
    name: "BRITANNIA Good Day (Tampered MRP Price Sticker Offence)",
    category: "food",
    bgClass: "biscuit-mock",
    confidence: 88,
    fssaiMandatory: true,
    barcode: "8901063370050",
    language: "eng",
    fieldConfidences: {
      productName: 98,
      netQty: 96,
      mrp: 61,
      mfgDate: 95,
      expiryDate: 94,
      manufacturerName: 93,
      customerCare: 91,
      fssaiLicense: 96,
      batchNumber: 94,
      barcode: 99
    },
    tamperZone: {
      detected: true,
      x: 10,
      y: 65,
      width: 280,
      height: 24,
      severity: "HIGH",
      type: "PRICE_STICKER_OVERWRITE",
      targetField: "mrp",
      description: "Unauthorised sticker alteration detected over MRP zone. Original ₹5.00 overwritten with ₹7.00.",
      confidence: 93
    },
    boxes: [
      { id: 'productName', top: '10px', left: '10px', width: '280px', height: '24px', name: 'Product: BRITANNIA Good Day Butter Cookies', class: 'mfg' },
      { id: 'netQty', top: '40px', left: '10px', width: '280px', height: '20px', name: 'Net Wt: 30.2g + 4.3g EXTRA# = 34.5g', class: 'qty' },
      { id: 'mrp', top: '65px', left: '10px', width: '280px', height: '22px', name: 'MRP: ₹ 7.00 [ALTERED STICKER]', class: 'missing-box' },
      { id: 'mfgDate', top: '92px', left: '10px', width: '135px', height: '20px', name: 'PKD: 26/08/26', class: 'date' },
      { id: 'expiryDate', top: '92px', left: '150px', width: '140px', height: '20px', name: 'Use By: 25/01/27', class: 'date' },
      { id: 'batchNumber', top: '115px', left: '10px', width: '280px', height: '18px', name: 'Lot: B08269L M/C 606 16:02', class: 'date' },
      { id: 'manufacturerName', top: '136px', left: '10px', width: '280px', height: '28px', name: 'Mfr: BRITANNIA INDUSTRIES LTD., KOLKATA-700017', class: 'mfg' },
      { id: 'customerCare', top: '168px', left: '10px', width: '280px', height: '28px', name: 'Care: 1-800-4254449 / feedback@britindia.com', class: 'mfg' }
    ],
    fields: {
      productName: "BRITANNIA Good Day Butter Cookies",
      netQty: "30.2g + 4.3g EXTRA# = 34.5g",
      mrp: "₹ 7.00 [Tampered Sticker]",
      mfgDate: "26/08/26",
      expiryDate: "25/01/27",
      manufacturerName: "BRITANNIA INDUSTRIES LTD., 5/1 A HUNGERFORD STREET, KOLKATA-700017, WEST BENGAL",
      customerCare: "Executive, Consumer Care Cell, Ph: 1-800-4254449 / 1-800-30004530, Email: feedback@britindia.com",
      fssaiLicense: "Lic. No. 10015043001129 BRITANNIA INDUSTRIES LTD.",
      batchNumber: "B08269L M/C 606 16:02",
      barcode: "8901063370050"
    }
  },
  tamil_oil: {
    key: 'tamil_oil',
    name: "அஞ்சல் நல்லெண்ணெய் / Anjali Sesame Oil (Tamil Regional)",
    category: "food",
    bgClass: "oil-mock",
    confidence: 96,
    fssaiMandatory: true,
    barcode: "8906012450012",
    language: "tam",
    fieldConfidences: {
      productName: 97,
      netQty: 95,
      mrp: 96,
      mfgDate: 94,
      expiryDate: 93,
      manufacturerName: 92,
      customerCare: 90,
      fssaiLicense: 98,
      batchNumber: 93,
      barcode: 99
    },
    tamperZone: null,
    boxes: [
      { id: 'productName', top: '14px', left: '10px', width: '280px', height: '36px', name: 'Product: அஞ்சல் நல்லெண்ணெய்', class: 'mfg' },
      { id: 'mrp', top: '56px', left: '10px', width: '280px', height: '22px', name: 'அதிகபட்ச சில்லறை விலை: ₹ 120.00', class: 'mrp' },
      { id: 'netQty', top: '82px', left: '10px', width: '280px', height: '20px', name: 'நிகர அளவு: 500 மில்லி (500 ml)', class: 'qty' },
      { id: 'mfgDate', top: '106px', left: '10px', width: '135px', height: '20px', name: 'தயாரிப்பு: 15/07/2026', class: 'date' },
      { id: 'expiryDate', top: '106px', left: '150px', width: '140px', height: '20px', name: 'காலாவதி: 14/07/2027', class: 'date' },
      { id: 'batchNumber', top: '130px', left: '10px', width: '280px', height: '18px', name: 'தொகுதி: TN-2026-B4', class: 'date' },
      { id: 'manufacturerName', top: '152px', left: '10px', width: '280px', height: '32px', name: 'உற்பத்தியாளர்: அஞ்சல் ஆயில் மில்ஸ், மதுரை', class: 'mfg' },
      { id: 'customerCare', top: '188px', left: '10px', width: '280px', height: '26px', name: 'வாடிக்கையாளர் சேவை: 1800-425-2828', class: 'mfg' },
      { id: 'fssaiLicense', top: '218px', left: '10px', width: '280px', height: '18px', name: 'FSSAI: 10015042000215', class: 'qty' },
      { id: 'barcode', top: '240px', left: '10px', width: '280px', height: '18px', name: 'Barcode: 8906012450012', class: 'qty' }
    ],
    fields: {
      productName: "அஞ்சல் நல்லெண்ணெய் (Anjali Sesame Oil)",
      netQty: "500 மில்லி (500 ml)",
      mrp: "அதிகபட்ச சில்லறை விலை: ₹ 120.00 (அனைத்து வரிகளும் உட்பட)",
      mfgDate: "15/07/2026",
      expiryDate: "14/07/2027",
      manufacturerName: "அஞ்சல் ஆயில் மில்ஸ், 12 காமராஜர் சாலை, மதுரை - 625009, தமிழ்நாடு",
      customerCare: "வாடிக்கையாளர் சேவை: 1800-425-2828 / care@anjalioil.com",
      fssaiLicense: "10015042000215",
      batchNumber: "TN-2026-B4",
      barcode: "8906012450012"
    }
  },
  hindi_ghee: {
    key: 'hindi_ghee',
    name: "पतंजलि गाय का घी / Patanjali Cow Ghee (Hindi Regional)",
    category: "food",
    bgClass: "ghee-mock",
    confidence: 95,
    fssaiMandatory: true,
    barcode: "8904109400234",
    language: "hin",
    fieldConfidences: {
      productName: 96,
      netQty: 95,
      mrp: 94,
      mfgDate: 93,
      expiryDate: 91,
      manufacturerName: 90,
      customerCare: 89,
      fssaiLicense: 97,
      batchNumber: 94,
      barcode: 99
    },
    tamperZone: null,
    boxes: [
      { id: 'productName', top: '14px', left: '10px', width: '280px', height: '36px', name: 'Product: पतंजलि गाय का शुद्ध देशी घी', class: 'mfg' },
      { id: 'mrp', top: '56px', left: '10px', width: '280px', height: '22px', name: 'अधिकतम खुदरा मूल्य: ₹ 260.00', class: 'mrp' },
      { id: 'netQty', top: '82px', left: '10px', width: '280px', height: '20px', name: 'शुद्ध मात्रा: 500 मिली (500 ml)', class: 'qty' },
      { id: 'mfgDate', top: '106px', left: '10px', width: '135px', height: '20px', name: 'निर्माण तिथि: 10/06/2026', class: 'date' },
      { id: 'expiryDate', top: '106px', left: '150px', width: '140px', height: '20px', name: 'उपयोग तिथि: 09/06/2027', class: 'date' },
      { id: 'batchNumber', top: '130px', left: '10px', width: '280px', height: '18px', name: 'बैच: PT-8820', class: 'date' },
      { id: 'manufacturerName', top: '152px', left: '10px', width: '280px', height: '32px', name: 'निर्माता: पतंजलि आयुर्वेद लि, हरिद्वार', class: 'mfg' },
      { id: 'customerCare', top: '188px', left: '10px', width: '280px', height: '26px', name: 'उपभोक्ता सेवा: 1800-180-4108', class: 'mfg' },
      { id: 'fssaiLicense', top: '218px', left: '10px', width: '280px', height: '18px', name: 'FSSAI: 10014012000266', class: 'qty' },
      { id: 'barcode', top: '240px', left: '10px', width: '280px', height: '18px', name: 'Barcode: 8904109400234', class: 'qty' }
    ],
    fields: {
      productName: "पतंजलि गाय का शुद्ध देशी घी",
      netQty: "500 मिली (500 ml)",
      mrp: "अधिकतम खुदरा मूल्य: ₹ 260.00 (सभी कर सहित)",
      mfgDate: "10/06/2026",
      expiryDate: "09/06/2027",
      manufacturerName: "पतंजलि आयुर्वेद लिमिटेड, महर्षि दयानंद ग्राम, हरिद्वार, उत्तराखंड - 249401",
      customerCare: "उपभोक्ता सेवा: 1800-180-4108 / customercare@patanjaliayurved.org",
      fssaiLicense: "10014012000266",
      batchNumber: "PT-8820",
      barcode: "8904109400234"
    }
  },
  snack: {
    key: 'snack',
    name: "Crunchy Masala Chips (Snack Packet)",
    category: "food",
    bgClass: "snack-mock",
    confidence: 91,
    fssaiMandatory: true,
    barcode: "8902201100045",
    language: "eng",
    fieldConfidences: {
      productName: 94,
      netQty: 92,
      mrp: 90,
      mfgDate: 88,
      expiryDate: 86,
      manufacturerName: 0,
      customerCare: 0,
      fssaiLicense: 93,
      batchNumber: 90,
      barcode: 98
    },
    tamperZone: null,
    boxes: [
      { id: 'batchNumber', top: '14px', left: '12px', width: '110px', height: '18px', name: 'Batch: MC-2026-B8', class: 'date' },
      { id: 'productName', top: '38px', left: '12px', width: '276px', height: '44px', name: 'Product Name', class: 'mfg' },
      { id: 'netQty', top: '228px', left: '12px', width: '276px', height: '22px', name: 'Net Qty: 150g', class: 'qty' },
      { id: 'mrp', top: '254px', left: '12px', width: '276px', height: '22px', name: 'MRP: ₹45.00', class: 'mrp' },
      { id: 'mfgDate', top: '280px', left: '12px', width: '276px', height: '22px', name: 'Mfg Date: 12/08/2026', class: 'date' },
      { id: 'manufacturerName', top: '306px', left: '12px', width: '276px', height: '24px', name: 'Mfr: [NOT FOUND]', class: 'missing-box' },
      { id: 'customerCare', top: '334px', left: '12px', width: '276px', height: '24px', name: 'Helpline: [NOT FOUND]', class: 'missing-box' }
    ],
    fields: {
      productName: "Crunchy Masala Chips",
      netQty: "150g",
      mrp: "₹45.00",
      mfgDate: "12/08/2026",
      expiryDate: "12/02/2027",
      manufacturerName: "",
      customerCare: "",
      fssaiLicense: "10022011000452",
      batchNumber: "MC-2026-B8",
      barcode: "8902201100045"
    }
  },
  oats: {
    key: 'oats',
    name: "Nature's Harvest Oats",
    category: "food",
    bgClass: "oats-mock",
    confidence: 94,
    fssaiMandatory: true,
    barcode: "8901401100189",
    language: "eng",
    fieldConfidences: {
      productName: 98,
      netQty: 95,
      mrp: 96,
      mfgDate: 94,
      expiryDate: 92,
      manufacturerName: 91,
      customerCare: 90,
      fssaiLicense: 97,
      batchNumber: 93,
      barcode: 99
    },
    tamperZone: null,
    boxes: [
      { id: 'batchNumber', top: '12px', left: '10px', width: '100px', height: '16px', name: 'Batch No', class: 'date' },
      { id: 'fssaiLicense', top: '12px', left: '170px', width: '140px', height: '16px', name: 'FSSAI License', class: 'qty' },
      { id: 'productName', top: '32px', left: '10px', width: '300px', height: '54px', name: 'Product Name', class: 'mfg' },
      { id: 'customerCare', top: '230px', left: '10px', width: '300px', height: '24px', name: 'Customer Care', class: 'mfg' },
      { id: 'netQty', top: '264px', left: '10px', width: '300px', height: '16px', name: 'Net Qty', class: 'qty' },
      { id: 'mrp', top: '280px', left: '10px', width: '300px', height: '16px', name: 'MRP Price', class: 'mrp' },
      { id: 'mfgDate', top: '296px', left: '10px', width: '145px', height: '16px', name: 'MFG Date', class: 'date' },
      { id: 'expiryDate', top: '296px', left: '160px', width: '150px', height: '16px', name: 'Expiry Date', class: 'date' },
      { id: 'manufacturerName', top: '314px', left: '10px', width: '300px', height: '22px', name: 'Manufacturer Address', class: 'mfg' }
    ],
    fields: {
      productName: "Nature's Harvest Oats",
      netQty: "500g",
      mrp: "Rs. 145.00 (Incl. of all taxes)",
      mfgDate: "12/2025",
      expiryDate: "12/2026",
      manufacturerName: "Nature Food Foods Pvt Ltd, Plot 42, Okhla Ind Area, New Delhi",
      customerCare: "care@natureharvest.com, Ph: 1800-11-2233",
      fssaiLicense: "10014011001895",
      batchNumber: "NH-OAT-998",
      barcode: "8901401100189"
    }
  },
  masala: {
    key: 'masala',
    name: "Spicy Fusion Masala",
    category: "food",
    bgClass: "masala-mock",
    confidence: 82,
    fssaiMandatory: true,
    barcode: "8901234567891",
    language: "eng",
    fieldConfidences: {
      productName: 92,
      netQty: 85,
      mrp: 88,
      mfgDate: 84,
      expiryDate: 80,
      manufacturerName: 79,
      customerCare: 62,
      fssaiLicense: 70,
      batchNumber: 88,
      barcode: 97
    },
    tamperZone: null,
    boxes: [
      { id: 'batchNumber', top: '12px', left: '10px', width: '100px', height: '16px', name: 'Batch No', class: 'date' },
      { id: 'fssaiLicense', top: '12px', left: '170px', width: '140px', height: '16px', name: 'FSSAI License', class: 'qty' },
      { id: 'productName', top: '32px', left: '10px', width: '300px', height: '54px', name: 'Product Name', class: 'mfg' },
      { id: 'customerCare', top: '230px', left: '10px', width: '300px', height: '24px', name: 'Customer Care', class: 'mfg' },
      { id: 'netQty', top: '264px', left: '10px', width: '300px', height: '16px', name: 'Net Qty', class: 'qty' },
      { id: 'mrp', top: '280px', left: '10px', width: '300px', height: '16px', name: 'MRP Price', class: 'mrp' },
      { id: 'mfgDate', top: '296px', left: '10px', width: '145px', height: '16px', name: 'MFG Date', class: 'date' },
      { id: 'expiryDate', top: '296px', left: '160px', width: '150px', height: '16px', name: 'Expiry Date', class: 'date' },
      { id: 'manufacturerName', top: '314px', left: '10px', width: '300px', height: '22px', name: 'Manufacturer Address', class: 'mfg' }
    ],
    fields: {
      productName: "Spicy Fusion Garam Masala",
      netQty: "100 grams",
      mrp: "₹ 65",
      mfgDate: "04/2026",
      expiryDate: "04/2027",
      manufacturerName: "Spicy Spices Ltd, Sector 5, Haridwar",
      customerCare: "Ph: 01334-222333",
      fssaiLicense: "1234F567891234",
      batchNumber: "SFM-88A",
      barcode: "8901234567891"
    }
  },
  cream: {
    key: 'cream',
    name: "Glow Radiant Face Cream",
    category: "cosmetics",
    bgClass: "cream-mock",
    confidence: 76,
    fssaiMandatory: false,
    barcode: "8909999999999",
    language: "eng",
    fieldConfidences: {
      productName: 89,
      netQty: 68,
      mrp: 0,
      mfgDate: 78,
      expiryDate: 75,
      manufacturerName: 82,
      customerCare: 71,
      fssaiLicense: 0,
      batchNumber: 80,
      barcode: 96
    },
    tamperZone: null,
    boxes: [
      { id: 'batchNumber', top: '12px', left: '10px', width: '100px', height: '16px', name: 'Batch No', class: 'date' },
      { id: 'productName', top: '32px', left: '10px', width: '300px', height: '54px', name: 'Product Name', class: 'mfg' },
      { id: 'customerCare', top: '230px', left: '10px', width: '300px', height: '24px', name: 'Customer Care', class: 'mfg' },
      { id: 'netQty', top: '264px', left: '10px', width: '300px', height: '16px', name: 'Net Qty', class: 'qty' },
      { id: 'mrp', top: '280px', left: '10px', width: '300px', height: '16px', name: 'MRP Price', class: 'mrp' },
      { id: 'mfgDate', top: '296px', left: '10px', width: '145px', height: '16px', name: 'MFG Date', class: 'date' },
      { id: 'expiryDate', top: '296px', left: '160px', width: '150px', height: '16px', name: 'Expiry Date', class: 'date' },
      { id: 'manufacturerName', top: '314px', left: '10px', width: '300px', height: '22px', name: 'Manufacturer Address', class: 'mfg' }
    ],
    fields: {
      productName: "Glow Radiant Face Cream",
      netQty: "1.7 oz",
      mrp: "",
      mfgDate: "02/2026",
      expiryDate: "02/2028",
      manufacturerName: "Radiant Beauty Cosmetics, Mumbai",
      customerCare: "Ph: 9999999999",
      fssaiLicense: "N/A",
      batchNumber: "GB-77B",
      barcode: "8909999999999"
    }
  }
};

// Cross-Label Consistency comparison analyzer
function analyzeCrossLabelConsistency(productKey, currentFields = {}) {
  let baseKey = productKey;
  if (!productHistoryRegistry[baseKey]) {
    const foundKey = Object.keys(productHistoryRegistry).find(k => 
      productHistoryRegistry[k].productName.toLowerCase().includes((currentFields.productName || '').toLowerCase())
    );
    baseKey = foundKey || 'biscuit';
  }

  const baseline = productHistoryRegistry[baseKey] || productHistoryRegistry.biscuit;
  const previous = baseline.history[baseline.history.length - 1]; // latest prior version

  // 1. MRP Comparison (e.g. ₹100 -> ₹105)
  const extractNum = (str) => {
    if (!str) return 0;
    const cleaned = String(str).replace(/,/g, '');
    const m = cleaned.match(/([0-9]+(?:\.[0-9]+)?)/);
    return m ? parseFloat(m[1]) : 0;
  };

  const currentMrpNum = extractNum(currentFields.mrp);
  const prevMrpNum = previous.mrpNumeric || extractNum(previous.mrp);
  const mrpDiff = Math.round((currentMrpNum - prevMrpNum) * 100) / 100;
  const mrpPercentChange = prevMrpNum > 0 ? ((mrpDiff / prevMrpNum) * 100).toFixed(1) : "0.0";

  // 2. Net Quantity & Shrinkflation Detection (e.g. 100ml -> 90ml, 35g -> 34.5g)
  const parseQty = (str) => {
    if (!str) return { num: 0, unit: 'g' };
    const m = String(str).match(/([0-9]+(?:\.[0-9]+)?)\s*(g|gm|gms|grams?|kg|ml|l|ltr|litres?|மில்லி|மி\.லி|मिली|लीटर|ग्राम)/i);
    return m ? { num: parseFloat(m[1]), unit: m[2] } : { num: 0, unit: 'g' };
  };

  const currentQty = parseQty(currentFields.netQty);
  const prevQty = parseQty(previous.netQty);
  const qtyDiff = Math.round((currentQty.num - prevQty.num) * 100) / 100;
  const qtyPercentChange = prevQty.num > 0 ? ((qtyDiff / prevQty.num) * 100).toFixed(1) : "0.0";

  // Flag Shrinkflation: quantity decreased while price remained same or increased
  const isShrinkflation = qtyDiff < 0 && mrpDiff >= 0;

  // 3. Product Size Status
  let sizeStatus = "Consistent (Same Size Class)";
  if (qtyDiff < 0) sizeStatus = `Shrinkage: Down ${Math.abs(qtyDiff)}${prevQty.unit} (${Math.abs(qtyPercentChange)}% reduction)`;
  else if (qtyDiff > 0) sizeStatus = `Bonus / Upsized: Up ${qtyDiff}${prevQty.unit} (+${qtyPercentChange}%)`;

  // 4. Manufacturer & Facility Check
  const prevMfr = (previous.manufacturer || baseline.manufacturer || '').toLowerCase().trim();
  const currMfr = (currentFields.manufacturerName || '').toLowerCase().trim();
  const mfrMatch = currMfr.length > 5 && prevMfr.length > 5 ? (currMfr.includes(prevMfr.slice(0, 18)) || prevMfr.includes(currMfr.slice(0, 18))) : true;
  const mfrStatus = !currMfr ? "Missing on current label" : (mfrMatch ? "Matches Certified Production Unit" : "Potential Unlicensed Plant Relocation");

  // 5. Barcode / SKU Validation
  const registeredSku = baseline.sku || previous.sku;
  const currentBarcode = currentFields.barcode || '';
  const skuMatch = !currentBarcode || (currentBarcode === registeredSku);

  // 6. Chronological Progression
  const batchProgression = currentFields.batchNumber 
    ? `Batch: ${currentFields.batchNumber} (Prior: ${previous.batch})` 
    : "Sequential Batch Verification Required";

  // 7. Historical Frequency of Changes
  const frequencyText = `${baseline.revisionsCount} label revisions logged in the last 6 months (${baseline.lastRevisionPeriod})`;

  // Summary flags
  const flags = [];
  if (isShrinkflation) {
    flags.push(`🚨 SHRINKFLATION ALERT: Net quantity reduced by ${Math.abs(qtyDiff)}${prevQty.unit} (${Math.abs(qtyPercentChange)}%) while retail price remained ₹${currentMrpNum.toFixed(2)}.`);
  }
  if (mrpDiff > 0) {
    flags.push(`📈 PRICE ESCALATION: MRP increased from ${previous.mrp} to ₹${currentMrpNum.toFixed(2)} (+${mrpPercentChange}% increase).`);
  }
  if (!mfrMatch && currMfr) {
    flags.push(`🏭 FACILITY SHIFT: Manufacturing address does not match previously audited facility (${previous.manufacturer}).`);
  }

  const summaryText = flags.length > 0 ? flags.join(' ') : 'Scanned label is consistent with manufacturer master records across all verified batches.';

  return {
    productName: baseline.productName,
    baselineKey: baseKey,
    historicalMaster: {
      lastApprovedBatch: previous.batch,
      approvedDate: previous.date,
      mrp: previous.mrp,
      netQty: previous.netQty,
      productSize: previous.productSize || previous.netQty,
      manufacturerFacility: previous.manufacturer || baseline.manufacturer,
      sku: registeredSku
    },
    previousLabel: {
      batch: previous.batch,
      date: previous.date,
      mrp: previous.mrp,
      netQty: previous.netQty,
      manufacturer: previous.manufacturer || baseline.manufacturer,
      sku: registeredSku
    },
    currentLabel: {
      batch: currentFields.batchNumber || "Current Audit Batch",
      date: currentFields.mfgDate || "Current Scan",
      mrp: currentFields.mrp || `₹ ${currentMrpNum.toFixed(2)}`,
      netQty: currentFields.netQty || `${currentQty.num} ${currentQty.unit}`,
      manufacturer: currentFields.manufacturerName || "Current Mfr",
      sku: currentBarcode || registeredSku
    },
    isShrinkflation,
    hasMrpDrift: mrpDiff !== 0,
    mrpDifferencePercent: parseFloat(mrpPercentChange),
    netQtyDeltaPercent: parseFloat(qtyPercentChange),
    facilityMatch: mfrMatch,
    skuMatch,
    changeFrequency: frequencyText,
    comparisonSummary: summaryText,
    comparison: {
      mrpDiff: mrpDiff !== 0 ? (mrpDiff > 0 ? `+₹${mrpDiff.toFixed(2)} (+${mrpPercentChange}%)` : `-₹${Math.abs(mrpDiff).toFixed(2)} (${mrpPercentChange}%)`) : 'Stable (₹0.00)',
      mrpDirection: mrpDiff > 0 ? 'INCREASE' : (mrpDiff < 0 ? 'DECREASE' : 'STABLE'),
      qtyDiff: qtyDiff !== 0 ? (qtyDiff > 0 ? `+${qtyDiff}${prevQty.unit} (+${qtyPercentChange}%)` : `${qtyDiff}${prevQty.unit} (${qtyPercentChange}%)`) : 'Stable',
      qtyDirection: qtyDiff < 0 ? 'REDUCED' : (qtyDiff > 0 ? 'INCREASED' : 'STABLE'),
      isShrinkflation,
      sizeStatus,
      mfrStatus,
      skuMatch,
      batchProgression,
      frequencyText,
      revisionsCount: baseline.revisionsCount
    },
    flags,
    isConsistent: flags.length === 0
  };
}

// API: Run OCR and AI Object detection scanning simulator
app.post('/api/scan', (req, res) => {
  const { templateKey } = req.body;
  const selectedConfig = productMockConfigs[templateKey] || productMockConfigs.biscuit;
  
  res.json({
    success: true,
    templateKey: selectedConfig.key,
    name: selectedConfig.name,
    ocrConfidence: selectedConfig.confidence,
    bgClass: selectedConfig.bgClass,
    language: selectedConfig.language || 'eng',
    fssaiMandatory: selectedConfig.fssaiMandatory,
    barcode: selectedConfig.barcode,
    fieldConfidences: selectedConfig.fieldConfidences,
    tamperZone: selectedConfig.tamperZone,
    boxes: selectedConfig.boxes,
    fields: selectedConfig.fields
  });
});

// API: Cross-Label Consistency Comparison
app.post('/api/cross-label/compare', (req, res) => {
  const { productKey, fields } = req.body;
  const analysis = analyzeCrossLabelConsistency(productKey, fields);
  res.json({
    success: true,
    analysis
  });
});

// API: Save inspection audit record to Firebase Cloud Firestore simulation
app.post('/api/firebase/save', (req, res) => {
  const auditData = req.body;
  const docId = `FS-${Math.floor(100000 + Math.random() * 900000)}`;
  const timestamp = new Date().toISOString();
  
  const firestoreRecord = {
    id: auditData.id || `AUD-${Math.floor(10000 + Math.random() * 90000)}-2026`,
    firestoreDocId: docId,
    collection: 'metroscan-audits',
    createdAt: timestamp,
    syncedAt: timestamp,
    syncedBy: auditData.inspector || 'Inspector S. Verma (LM-DL-2026-042)',
    status: auditData.status || 'Non-Compliant',
    score: auditData.score ?? 60,
    weightedScore: auditData.weightedScore ?? 60,
    name: auditData.name || 'BRITANNIA Good Day Butter Cookies',
    violationsCount: auditData.violationsCount ?? 0,
    fieldConfidences: auditData.fieldConfidences || {},
    tamperDetected: Boolean(auditData.tamperZone?.detected),
    shrinkflationFlag: Boolean(auditData.isShrinkflation),
    fields: auditData.fields || {}
  };

  // Update in-memory scan history
  scanHistory = scanHistory.filter(h => h.name !== firestoreRecord.name);
  scanHistory.unshift(firestoreRecord);

  res.json({
    success: true,
    firestoreDocId: docId,
    collection: 'metroscan-audits',
    message: `Audit successfully committed to Firebase Cloud Firestore collection 'metroscan-audits'`,
    record: firestoreRecord
  });
});

// API: Fetch compliance history logs list
app.get('/api/history', (req, res) => {
  res.json(scanHistory);
});

// API: Add new audit record into compliance database
app.post('/api/history', (req, res) => {
  const newRecord = req.body;
  
  if (!newRecord.id) {
    newRecord.id = `AUD-${Math.floor(10000 + Math.random() * 90000)}-2026`;
  }
  if (!newRecord.date) {
    newRecord.date = new Date().toISOString().replace('T', ' ').substring(0, 16);
  }

  scanHistory = scanHistory.filter(h => h.name !== newRecord.name);
  scanHistory.unshift(newRecord);
  
  res.json({ success: true, record: newRecord });
});

// API: Floating Chatbot Assistant metrology compliance response handler
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message content required' });
  }

  const query = message.toLowerCase();
  let botResponse = 'Thank you for reaching out. Please specify your question regarding Legal Metrology standards.';

  if (query.includes('shrinkflation') || query.includes('cross label') || query.includes('consistency')) {
    botResponse = `**Cross-Label Consistency & Shrinkflation Verification**:
    Under the Legal Metrology Rules and Consumer Protection Act 2019, deceptive quantity reduction (shrinkflation) without proportional price adjustment or clear notification is a recognized deceptive trade practice. MetroScan verifies:
    1. Historical MRP vs Current MRP progression
    2. Net Quantity volumetric delta
    3. Manufacturer registered facility consistency
    4. Frequency of alterations over the previous 6 months.`;
  } else if (query.includes('tamper') || query.includes('heatmap') || query.includes('defacement')) {
    botResponse = `**Tamper Localization Heatmap**:
    Section 36 of the Legal Metrology Act 2009 penalizes alteration or defacement of mandatory packaging statements (such as striking through PKD dates or pasting stickers over MRP). The Tamper Localization Heatmap automatically identifies anomalous pixel regions and highlights the affected bounding zone in thermal colors.`;
  } else if (query.includes('tamil') || query.includes('hindi') || query.includes('regional') || query.includes('language')) {
    botResponse = `**Regional Language Label Compliance**:
    Under Rule 9 of the Legal Metrology (Packaged Commodities) Rules 2011, declarations may be made in Hindi in Devanagari script, or in English, or in any regional language (such as Tamil). MetroScan's Multilingual OCR parser natively recognizes:
    - Tamil: அதிகபட்ச சில்லறை விலை (MRP), நிகர அளவு (Net Qty), தயாரிப்பு தேதி (Mfg Date)
    - Hindi: अधिकतम खुदरा मूल्य (MRP), शुद्ध मात्रा (Net Qty), निर्माण तिथि (Mfg Date).`;
  } else if (query.includes('mandatory') || query.includes('declarations') || query.includes('rule 6')) {
    botResponse = `Under **Rule 6(1) of Legal Metrology (Packaged Commodities) Rules 2011**, every package must contain:
    1. Name & address of manufacturer/packer/importer.
    2. Generic name of commodity.
    3. Net quantity in metric units.
    4. Month & year of manufacture/import.
    5. Maximum Retail Price (MRP) inclusive of all taxes.
    6. Consumer care contact details (phone and email).`;
  } else if (query.includes('font') || query.includes('size') || query.includes('height') || query.includes('rule 13')) {
    botResponse = `Under **Rule 13**, the minimum height of numerals & letters depends on net capacity:
    - Up to 50g/ml: minimum **1.0 mm** height.
    - 50g to 100g/ml: minimum **1.5 mm** height.
    - 100g to 500g/ml: minimum **2.0 mm** height.
    - 500g to 2kg/liter: minimum **4.0 mm** height.
    - Above 2kg/liter: minimum **6.0 mm** height.`;
  } else if (query.includes('fssai') || query.includes('food') || query.includes('license')) {
    botResponse = `For food products, the **FSSAI Packaging and Labelling Regulations 2020** mandate:
    1. FSSAI logo and 14-digit license number must be printed on the principal display panel.
    2. Color of the FSSAI logo must contrast with background.
    3. Batch code, allergen declarations, and veg/non-veg logos are compulsory.`;
  } else if (query.includes('ounces') || query.includes('metric') || query.includes('unit')) {
    botResponse = `**Rule 13(1)** prohibits the use of non-metric capacity expressions (ounces, pounds, inches) on principal packaging displays in India. Volume declarations must appear in ml or liters, and weights must appear in grams or kilograms.`;
  } else if (query.includes('hi') || query.includes('hello') || query.includes('namaste')) {
    botResponse = `Namaste! I am your Legal Metrology Compliance Assistant. You can ask me questions about:
    - Cross-Label Consistency & Shrinkflation checks
    - Tamper Localization Heatmaps (Section 36)
    - Regional language declarations (Tamil, Hindi, English)
    - Mandatory package declarations (Rule 6).`;
  }

  res.json({ response: botResponse });
});

// API: Stream PDF Audit certificate simulation
app.get('/api/reports/download/:id', (req, res) => {
  const auditId = req.params.id;
  const record = scanHistory.find(h => h.id === auditId) || scanHistory[0];

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Metrology_Audit_${auditId}.pdf`);

  const mockPdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources <<>> /Contents 4 0 R >> endobj
4 0 obj << /Length 120 >> stream
BT /F1 12 Tf 50 700 Td (LEGAL METROLOGY COMPLIANCE AUDIT REPORT) Tj 0 -20 Td (Product: ${record.name}) Tj 0 -20 Td (Score: ${record.score}% | Weighted OCR Certainty: ${record.weightedScore || record.score}%) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000185 00000 n
trailer << /Size 5 /Root 1 0 R >>
startxref
350
%%EOF`;

  res.send(Buffer.from(mockPdfContent, 'utf-8'));
});

// API: Stream PDF Audit certificate simulation
app.get('/api/reports/download/:id', (req, res) => {
  const auditId = req.params.id;
  const record = scanHistory.find(h => h.id === auditId) || scanHistory[0];

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Metrology_Audit_${auditId}.pdf`);

  // Stream mock empty text PDF content buffer representing the report file
  const mockPdfContent = `%PDF-1.4
1 0 obj <<span>/Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <<span>/Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <<span>/Type /Page /Parent 2 0 R /Resources <<>> /Contents 4 0 R>> endobj
4 0 obj <<span>/Length 80>> stream
BT /F1 12 Tf 50 700 Td (LEGAL METROLOGY COMPLIANCE AUDIT REPORT) Tj 0 -20 Td (Product: ${record.name}) Tj 0 -20 Td (Score: ${record.score}%) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000185 00000 n
trailer <<span>/Size 5 /Root 1 0 R>>
startxref
315
%%EOF`;

  res.send(Buffer.from(mockPdfContent, 'utf-8'));
});

// Run server listening check
app.listen(PORT, () => {
  console.log(`ComplianceScan AI Backend listening on port ${PORT}`);
});
