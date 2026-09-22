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
    violationsCount: 0,
    status: "Compliant",
    productKey: "oats",
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
    violationsCount: 2,
    status: "Non-Compliant",
    productKey: "masala",
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
    violationsCount: 2,
    status: "Non-Compliant",
    productKey: "cream",
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

// Product mock configs mapping OCR bounding box coordinates and extracted values
const productMockConfigs = {
  snack: {
    key: 'snack',
    name: "Crunchy Masala Chips (Snack Packet)",
    category: "food",
    bgClass: "snack-mock",
    confidence: 91,
    fssaiMandatory: true,
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
      batchNumber: "MC-2026-B8"
    }
  },
  biscuit: {
    key: 'biscuit',
    name: "BRITANNIA Good Day Butter Cookies (Full Back Wrapper)",
    category: "food",
    bgClass: "biscuit-mock",
    confidence: 98,
    fssaiMandatory: true,
    barcode: "8901063370050",
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
    confidence: 94,
    fssaiMandatory: true,
    barcode: "8901063370050",
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
  oats: {
    key: 'oats',
    name: "Nature's Harvest Oats",
    category: "food",
    bgClass: "oats-mock",
    confidence: 94,
    fssaiMandatory: true,
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
      batchNumber: "NH-OAT-998"
    }
  },
  masala: {
    key: 'masala',
    name: "Spicy Fusion Masala",
    category: "food",
    bgClass: "masala-mock",
    confidence: 82,
    fssaiMandatory: true,
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
      batchNumber: "SFM-88A"
    }
  },
  cream: {
    key: 'cream',
    name: "Glow Radiant Face Cream",
    category: "cosmetics",
    bgClass: "cream-mock",
    confidence: 76,
    fssaiMandatory: false,
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
      batchNumber: "GB-77B"
    }
  }
};

// API: Run OCR and AI Object detection scanning simulator
app.post('/api/scan', (req, res) => {
  const { templateKey } = req.body;
  
  // Select a preset template, default to 'snack' which matches the prompt scenario
  const selectedConfig = productMockConfigs[templateKey] || productMockConfigs.snack;
  
  // Return configuration including mock bounding boxes & parsed OCR values
  res.json({
    success: true,
    templateKey: selectedConfig.key,
    name: selectedConfig.name,
    ocrConfidence: selectedConfig.confidence,
    bgClass: selectedConfig.bgClass,
    fssaiMandatory: selectedConfig.fssaiMandatory,
    boxes: selectedConfig.boxes,
    fields: selectedConfig.fields
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
    name: auditData.name || 'Crunchy Masala Chips',
    violationsCount: auditData.violationsCount ?? 2,
    fields: auditData.fields || {}
  };

  // Also update in-memory scan history
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
  
  // Clean dates or generate audits keys if missing
  if (!newRecord.id) {
    newRecord.id = `AUD-${Math.floor(10000 + Math.random() * 90000)}-2026`;
  }
  if (!newRecord.date) {
    newRecord.date = new Date().toISOString().replace('T', ' ').substring(0, 16);
  }

  // Remove existing same named records to allow overwriting updates
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

  if (query.includes('mandatory') || query.includes('declarations') || query.includes('rule 6')) {
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
    - Mandatory package declarations (Rule 6)
    - Font size guidelines (Rule 13)
    - Metric unit regulations
    - FSSAI food licensing declarations.`;
  }

  res.json({ response: botResponse });
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
