import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, UploadCloud, Camera, Cpu, Zap, 
  Eye, RefreshCw, ClipboardList, FileDown, CheckCircle2, 
  XCircle, Edit3, Aperture, AlertOctagon, Info
} from 'lucide-react';

export default function Scanner({ 
  selectedProduct, setSelectedProduct,
  ocrConfidence, setOcrConfidence,
  ocrFields, setOcrFields,
  rulePreset, setRulePreset,
  addToast, viewReportRecord, fetchHistory
}) {
  const [activeTab, setActiveTab] = useState('fields'); // 'fields' | 'rules'
  const [isScanning, setIsScanning] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [activeHoverField, setActiveHoverField] = useState(null);
  
  // Custom checklist state
  const [complianceChecks, setComplianceChecks] = useState([]);
  const [complianceScore, setComplianceScore] = useState(0);

  // Clear scanner state
  const resetScanner = () => {
    setSelectedProduct(null);
    setOcrConfidence(0);
    setOcrFields({
      productName: '', netQty: '', mrp: '', mfgDate: '', expiryDate: '',
      manufacturerName: '', customerCare: '', fssaiLicense: '', batchNumber: ''
    });
    setComplianceChecks([]);
    setComplianceScore(0);
    setWebcamActive(false);
    setActiveTab('fields');
  };

  // Simulates OCR processing server delay
  const runAIOCRScan = () => {
    if (!selectedProduct) return;

    setIsScanning(true);
    addToast('OCR Engine Started', 'AI is parsing label layout segmentation...', 'info');

    // Make mock API call to backend
    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateKey: selectedProduct.key })
    })
    .then(res => res.json())
    .then(data => {
      setTimeout(() => {
        setIsScanning(false);
        setOcrConfidence(data.ocrConfidence);
        setOcrFields(data.fields);
        addToast('OCR Complete', `Extracted packaged declarations. Confidence: ${data.ocrConfidence}%`, 'success');
        setActiveTab('rules');
      }, 1500);
    })
    .catch(err => {
      setIsScanning(false);
      addToast('Scan Error', 'API connection failed', 'danger');
      console.error(err);
    });
  };

  // Capture frame webcam simulation
  const handleCapture = () => {
    setWebcamActive(false);
    const keys = ['oats', 'masala', 'cream'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    
    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateKey: randomKey })
    })
    .then(res => res.json())
    .then(data => {
      setSelectedProduct({
        key: randomKey,
        name: randomKey === 'oats' ? "Nature's Harvest Oats" : (randomKey === 'masala' ? "Spicy Fusion Masala" : "Glow Radiant Face Cream"),
        bgClass: data.bgClass,
        boxes: data.boxes,
        fields: data.fields,
        confidence: data.ocrConfidence
      });
      addToast('Image Captured', 'Loaded package template from camera.', 'success');
    });
  };

  // Rule engine checking runner
  const runRulesCheck = () => {
    const rules = [
      {
        id: 'netqty',
        title: 'Net Quantity Declaration',
        law: 'Rule 6(1)(c) & Rule 13 (Metric quantity)',
        check: () => {
          const val = ocrFields.netQty.trim().toLowerCase();
          if (!val) return { success: false, desc: 'Net Quantity tag is missing entirely.' };
          
          const metricPattern = /\b\d+(\.\d+)?\s*(g|grams|kg|kilograms|ml|millilitres|l|litres|liters)\b/;
          const nonMetricPattern = /\b\d+(\.\d+)?\s*(oz|ounce|ounces|lbs|pound|pounds|fl\s*oz)\b/;
          
          if (nonMetricPattern.test(val) && !metricPattern.test(val)) {
            return { success: false, desc: 'Net quantity declared in non-metric units (ounces) violating Rule 13.' };
          }
          return { success: true, desc: 'Metric unit quantity verified.' };
        }
      },
      {
        id: 'mrp',
        title: 'Maximum Retail Price (MRP)',
        law: 'Rule 6(1)(e) (Price Tag)',
        check: () => {
          const val = ocrFields.mrp.trim().toLowerCase();
          if (!val) return { success: false, desc: 'MRP declaration is missing.' };
          
          const currencyCheck = /\b(rs\.?|₹|inr|rupees)\b/;
          if (!currencyCheck.test(val)) {
            return { success: false, desc: 'Price format missing currency indicator (Rs. or ₹).' };
          }
          return { success: true, desc: 'MRP declaration verified.' };
        }
      },
      {
        id: 'manufacturer',
        title: 'Manufacturer Address details',
        law: 'Rule 6(1)(a) (Identification)',
        check: () => {
          const val = ocrFields.manufacturerName.trim();
          if (!val) return { success: false, desc: 'Manufacturer credentials not detected.' };
          if (val.length < 15) return { success: false, desc: 'Address appears incomplete. Full details required.' };
          return { success: true, desc: 'Manufacturer details verified.' };
        }
      },
      {
        id: 'consumercare',
        title: 'Consumer Support Helpline Info',
        law: 'Rule 6(1)(g) (Helpline contact)',
        check: () => {
          const val = ocrFields.customerCare.trim().toLowerCase();
          if (!val) return { success: false, desc: 'Helpline details missing.' };
          
          const hasPhone = /\b\d{10}\b|\b1800\b|\b\d{3,4}-\d{6,8}\b/;
          const hasEmail = /@\w+\.\w+/;
          
          if (!hasPhone.test(val)) {
            return { success: false, desc: 'Helpline contact telephone number missing.' };
          }
          if (!hasEmail.test(val)) {
            return { success: false, desc: 'Consumer email helpline missing (Mandatory disclaimer).' };
          }
          return { success: true, desc: 'Helpline details parsed successfully.' };
        }
      },
      {
        id: 'dates',
        title: 'Date of Manufacture',
        law: 'Rule 6(1)(d) (Dating format)',
        check: () => {
          const val = ocrFields.mfgDate.trim();
          if (!val) return { success: false, desc: 'Date of manufacturing missing.' };
          
          const datePattern = /^(0[1-9]|1[0-2])\/?(20)?\d{2}$/;
          if (!datePattern.test(val)) {
            return { success: false, desc: 'Mfg date format must be MM/YYYY.' };
          }
          return { success: true, desc: 'Manufacturing dating verified.' };
        }
      },
      {
        id: 'fssai',
        title: 'FSSAI License Standard validation',
        law: 'Food Safety & Standards Regulations 2020',
        check: () => {
          const isFood = rulePreset === 'fssai-food' || (selectedProduct && selectedProduct.category === 'food');
          if (!isFood) return { success: true, desc: 'Not applicable (Non-food commodity).' };

          const val = ocrFields.fssaiLicense.trim();
          if (!val || val === 'N/A') return { success: false, desc: 'FSSAI License tag missing for food category.' };
          
          const numPattern = /^\d{14}$/;
          if (!numPattern.test(val)) {
            return { success: false, desc: 'FSSAI License must be a 14-digit number. Value contains invalid chars.' };
          }
          return { success: true, desc: '14-digit FSSAI license parsed.' };
        }
      },
      {
        id: 'fontsize',
        title: 'Font size Height Rule',
        law: 'Rule 13 (Font numeral height)',
        check: () => {
          if (ocrConfidence > 0 && ocrConfidence < 75) {
            return { success: false, desc: 'Extracted characters are blurry, failing minimum letter size height limit checks.' };
          }
          return { success: true, desc: 'Label font size checked and compliant.' };
        }
      }
    ];

    let passed = 0;
    const checks = rules.map(rule => {
      const res = rule.check();
      if (res.success) passed++;
      return { ...rule, result: res };
    });

    const score = Math.round((passed / rules.length) * 100);
    setComplianceChecks(checks);
    setComplianceScore(score);
  };

  // Re-run rules validation engine whenever editable OCR input fields change
  useEffect(() => {
    if (ocrConfidence > 0) {
      runRulesCheck();
    }
  }, [ocrFields, rulePreset]);

  // Sync edited card input changes to local state
  const handleFieldEdit = (key, value) => {
    setOcrFields(prev => ({ ...prev, [key]: value }));
  };

  // Handle saving compliance record to backend history
  const handleSaveReport = async () => {
    if (!selectedProduct) return;

    let violationsCount = 0;
    if (complianceScore < 100) {
      violationsCount = complianceScore < 70 ? 2 : 1;
    }

    const auditRecord = {
      name: selectedProduct.name,
      category: selectedProduct.category === 'food' ? 'Food & Beverages' : 'Cosmetics & Personal Care',
      score: complianceScore,
      violationsCount,
      status: complianceScore === 100 ? 'Compliant' : 'Non-Compliant',
      productKey: selectedProduct.key,
      fields: ocrFields
    };

    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditRecord)
      });
      if (res.ok) {
        addToast('Report Saved', `Successfully cataloged audit record for ${selectedProduct.name}`, 'success');
        fetchHistory(); // Reload app history list
      }
    } catch (err) {
      console.error(err);
      addToast('Error', 'Failed to save audit record to history database', 'danger');
    }
  };

  // Simulated PDF download from server
  const handleDownloadPDF = async () => {
    if (!selectedProduct) return;
    
    // Save/update first to ensure DB records are updated
    await handleSaveReport();

    // Use dummy audit ID to download
    const auditId = 'AUD-DOWNLOAD';
    addToast('Generating PDF', 'Compiling PDF document buffers...', 'info');

    setTimeout(() => {
      window.open(`/api/reports/download/${auditId}`, '_blank');
      addToast('PDF Downloaded', 'Legal Metrology compliance certificate saved successfully.', 'success');
    }, 1200);
  };

  // Compute SVG circular dash
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (complianceScore / 100) * circumference;

  return (
    <div className="view-section animate-in fade-in slide-in-from-bottom-2 duration-300 h-full">
      <div className="view-header flex justify-between items-start mb-6">
        <div>
          <h1 className="view-title font-display text-2xl font-extrabold tracking-tight">Interactive AI OCR Compliance Scanner</h1>
          <p className="view-subtitle text-slate-500 text-xs mt-1">Upload packing labels, check OCR confidence, view visual bounding boxes, edit fields, and run compliance validation rules.</p>
        </div>
        <button onClick={resetScanner} className="btn border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2">
          <RefreshCw size={14} /> Clear Scanner
        </button>
      </div>

      <div className="scanner-layout grid grid-cols-1 lg:grid-cols-[280px_1fr_340px] gap-5 items-stretch h-[calc(100vh-190px)] min-h-[520px]">
        
        {/* LEFT COLUMN: SOURCE SELECTION */}
        <div className="scanner-panel flex flex-col bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <h3 className="panel-title-text text-xs font-extrabold uppercase tracking-wider p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex items-center gap-2">
            <ImageIcon className="text-blue-700 dark:text-blue-400" size={16} /> Input Packaged Product
          </h3>
          
          <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
            {/* Upload Area OR Webcam view */}
            {!selectedProduct && !webcamActive && (
              <div 
                onClick={() => setWebcamActive(true)}
                className="scanner-upload-area border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all duration-150 h-44"
              >
                <UploadCloud className="text-slate-400 w-10 h-10" />
                <h4 className="text-xs font-bold">Drag & drop image or click to scan</h4>
                <p className="text-[9px] text-slate-500">Supports PNG, JPG, JPEG, and PDF</p>
                <button onClick={(e) => { e.stopPropagation(); setWebcamActive(true); }} className="btn btn-primary bg-blue-700 hover:bg-blue-600 text-white font-semibold text-[10px] px-3.5 py-1.5 rounded shadow mt-1">Activate Camera</button>
              </div>
            )}

            {/* Webcam feed simulation */}
            {webcamActive && (
              <div className="webcam-simulator flex flex-col gap-3">
                <div className="webcam-viewport w-full h-36 bg-black rounded-lg relative overflow-hidden flex flex-col justify-center items-center text-center text-white p-4">
                  <div className="scanner-laser absolute top-0 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_8px_1px_rgba(239,68,68,1)] animate-laser z-10"></div>
                  <Aperture className="text-slate-500 mb-2 animate-spin duration-[4000ms]" size={28} />
                  <span className="text-[10px] font-bold">Simulating Camera Feed...</span>
                  <p className="text-[8px] text-slate-400 leading-normal mt-1">Place the product package label directly in front of the camera lense</p>
                </div>
                <div className="webcam-controls flex gap-2">
                  <button onClick={handleCapture} className="btn bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] py-2 flex-1 rounded flex items-center justify-center gap-1.5"><Aperture size={14} /> Capture Label</button>
                  <button onClick={() => setWebcamActive(false)} className="btn border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 font-semibold text-[10px] py-2 px-3 rounded">Cancel</button>
                </div>
              </div>
            )}

            {/* Loaded product preview */}
            {selectedProduct && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col gap-2 relative">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Loaded Product</span>
                  <button onClick={resetScanner} className="text-red-500 hover:text-red-700 text-[10px] font-bold">Clear</button>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{selectedProduct.name}</h4>
                <div className="w-full h-24 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-[#121826] overflow-hidden text-[10px] font-mono text-slate-400">
                  {selectedProduct.key.toUpperCase()} TEMPLATE
                </div>
              </div>
            )}

            {/* AI Engine preferences forms */}
            <div className="ocr-settings-box border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Engine Config</h4>
              <div className="settings-form-row flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-medium">OCR Language</label>
                <select className="form-select-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1.5 text-[10px] focus:outline-none focus:border-blue-600">
                  <option value="eng">English (IN - Metrology)</option>
                  <option value="hin">Hindi (हिन्दी)</option>
                  <option value="multilingual">Multilingual Engine</option>
                </select>
              </div>
              <div className="settings-form-row flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-medium">Layout parser Model</label>
                <select className="form-select-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1.5 text-[10px] focus:outline-none focus:border-blue-600">
                  <option value="metrology-yolov8">LegalMetrology-YOLOv8</option>
                  <option value="general-ocr">General LayoutParser</option>
                </select>
              </div>
              <div className="settings-form-row flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-medium">Rule Preset Engine</label>
                <select 
                  value={rulePreset}
                  onChange={(e) => setRulePreset(e.target.value)}
                  className="form-select-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1.5 text-[10px] focus:outline-none focus:border-blue-600"
                >
                  <option value="standard-lm">Legal Metrology Packaged Rules 2011</option>
                  <option value="fssai-food">FSSAI Packaging & Labelling 2020</option>
                  <option value="cosmetics-rules">Cosmetics Rules 2020</option>
                </select>
              </div>
            </div>

            {/* AI Confidence gauge */}
            <div className="confidence-widget border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-1.5">
              <div className="widget-meta flex justify-between text-[10px]">
                <span className="font-semibold text-slate-500">AI OCR Confidence</span>
                <span className="font-bold text-blue-700 dark:text-blue-400">{ocrConfidence}%</span>
              </div>
              <div className="progress-bar-container w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`progress-bar-fill h-full rounded-full transition-all duration-500 ${ocrConfidence >= 90 ? 'bg-emerald-500' : (ocrConfidence >= 70 ? 'bg-blue-600' : 'bg-amber-500')}`} 
                  style={{ width: `${ocrConfidence}%` }}
                ></div>
              </div>
            </div>
            
            <button 
              onClick={runAIOCRScan}
              disabled={!selectedProduct || isScanning}
              className="btn btn-primary bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-lg w-full flex items-center justify-center gap-2 mt-4 shadow disabled:bg-slate-400 disabled:shadow-none"
            >
              <Zap size={16} /> {isScanning ? 'AI Engine Scanning...' : 'Run AI OCR Engine'}
            </button>
          </div>
        </div>

        {/* CENTER COLUMN: INTERACTIVE VISUAL CANVAS */}
        <div className="scanner-panel flex flex-col bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex-1">
          <div className="panel-header-toolbar flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pr-4 bg-slate-50 dark:bg-slate-900/30">
            <h3 className="panel-title-text text-xs font-extrabold uppercase tracking-wider p-4 flex items-center gap-2 bg-transparent">
              <Eye className="text-blue-700 dark:text-blue-400" size={16} /> Label Detection Viewer
            </h3>
            <div className="box-legends flex gap-3 text-[9px] font-bold">
              <span className="legend-item inline-flex items-center gap-1"><span className="legend-dot w-2 h-2 rounded-full bg-[#8b5cf6]"></span> MRP</span>
              <span className="legend-item inline-flex items-center gap-1"><span className="legend-dot w-2 h-2 rounded-full bg-[#10b981]"></span> Net Qty</span>
              <span className="legend-item inline-flex items-center gap-1"><span className="legend-dot w-2 h-2 rounded-full bg-[#f59e0b]"></span> Dates</span>
              <span className="legend-item inline-flex items-center gap-1"><span className="legend-dot w-2 h-2 rounded-full bg-[#3b82f6]"></span> Mfr</span>
            </div>
          </div>

          <div className="packaging-canvas-wrapper flex-1 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-auto">
            {/* Loading scanner screen */}
            {isScanning && (
              <div className="scanner-loading-overlay absolute inset-0 bg-white/80 dark:bg-[#090d16]/85 backdrop-blur flex items-center justify-center text-center z-[100] animate-in fade-in duration-200">
                <div className="spinner-container flex flex-col items-center gap-3.5 max-w-xs">
                  <div className="sih-spinner w-9 h-9 border-4 border-slate-200 dark:border-slate-800 border-t-blue-700 dark:border-t-blue-500 rounded-full animate-spin"></div>
                  <h4 className="text-xs font-bold">AI Model is Parsing Layout...</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">Segmenting labels, reading text fields, and verifying regulatory format rules...</p>
                </div>
              </div>
            )}
            
            {!selectedProduct ? (
              <div className="no-image-placeholder flex flex-col items-center text-center gap-3 text-slate-400 max-w-xs">
                <ImageIcon className="placeholder-icon w-12 h-12 text-slate-300 dark:text-slate-700" />
                <p className="text-xs leading-normal">Upload packaging image or select an Interactive Demo Product to begin live compliance scanning.</p>
              </div>
            ) : (
              <div className={`active-package-renderer relative shadow-lg rounded-xl overflow-hidden w-[300px] h-[390px] border-3 select-none ${selectedProduct.key === 'oats' ? 'bg-[#fdfaf2] border-[#15803d]' : (selectedProduct.key === 'masala' ? 'bg-[#fff5f5] border-[#b91c1c]' : 'bg-[#faf5ff] border-[#7c3aed]')}`}>
                {/* SVG Graphics inside mock packaging */}
                <div className="package-card-mockup flex flex-col justify-between h-full p-4 font-sans text-slate-900 leading-normal">
                  <div className="flex justify-between items-center text-[7px] font-mono font-bold text-slate-500">
                    <span>Batch: {selectedProduct.fields.batchNumber || 'GB-77B'}</span>
                    <span>Lic: {selectedProduct.fields.fssaiLicense || 'N/A'}</span>
                  </div>
                  
                  <div className="text-center mt-1">
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider block ${selectedProduct.key === 'oats' ? 'text-[#15803d]' : (selectedProduct.key === 'masala' ? 'text-[#b91c1c]' : 'text-[#7c3aed]')}`}>
                      {selectedProduct.key === 'oats' ? "Nature's Fields" : (selectedProduct.key === 'masala' ? "Spicy Fusion" : "Glow Radiant")}
                    </span>
                    <h3 className="text-base font-extrabold tracking-tight text-slate-950 leading-none mt-0.5">
                      {selectedProduct.key === 'oats' ? "ROASTRY OATS" : (selectedProduct.key === 'masala' ? "GARAM MASALA" : "FACE CREAM")}
                    </h3>
                  </div>

                  {/* Image Graphic segment */}
                  <div className={`mockup-illustration flex-1 my-3 rounded-lg border flex items-center justify-center ${selectedProduct.key === 'oats' ? 'bg-emerald-50 border-emerald-100' : (selectedProduct.key === 'masala' ? 'bg-red-50 border-red-100' : 'bg-purple-50 border-purple-100')}`}>
                    <Cpu className={`w-8 h-8 opacity-60 ${selectedProduct.key === 'oats' ? 'text-emerald-700' : (selectedProduct.key === 'masala' ? 'text-red-700' : 'text-purple-700')}`} />
                  </div>

                  <div className="text-[7px] text-slate-500 font-semibold leading-normal mb-1">
                    Support Contacts: {selectedProduct.fields.customerCare || 'Ph: 9999999999'}
                  </div>

                  <div className="mockup-footer-details border-t border-slate-200 pt-1.5 flex flex-col gap-0.5 text-[8px] text-slate-800">
                    <div className="flex justify-between"><span>Net Quantity:</span> <strong>{ocrFields.netQty || selectedProduct.fields.netQty || 'Not Printed'}</strong></div>
                    <div className="flex justify-between"><span>Max Retail Price:</span> <strong>{ocrFields.mrp || selectedProduct.fields.mrp || 'Not Printed'}</strong></div>
                    <div className="flex justify-between text-[7px] text-slate-500">
                      <span>Mfg: <strong>{ocrFields.mfgDate || selectedProduct.fields.mfgDate || 'N/A'}</strong></span>
                      <span>Exp: <strong>{ocrFields.expiryDate || selectedProduct.fields.expiryDate || 'N/A'}</strong></span>
                    </div>
                    <div className="text-[6px] text-slate-400 mt-1 pt-1 border-t border-slate-100 leading-normal">
                      Mfd: {selectedProduct.fields.manufacturerName}
                    </div>
                  </div>
                </div>

                {/* Bounding box layer overlay */}
                {ocrConfidence > 0 && (
                  <div className="bounding-boxes-overlay absolute inset-0 w-full h-full z-20">
                    {selectedProduct.boxes.map(box => (
                      <div 
                        key={box.id}
                        onMouseEnter={() => setActiveHoverField(box.id)}
                        onMouseLeave={() => setActiveHoverField(null)}
                        className={`bounding-box ${box.class} ${activeHoverField === box.id ? 'active' : ''}`}
                        style={{
                          top: box.top,
                          left: box.left,
                          width: box.width,
                          height: box.height
                        }}
                        data-field-name={box.name}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedProduct && ocrConfidence > 0 && (
            <div className="viewer-actions flex justify-between items-center px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121826] text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><Info size={12} className="text-blue-700" /> Hover bounding boxes to highlight inputs. Edits run checklists instantly.</span>
              <button onClick={() => addToast('Aligned', 'Re-aligned layout anchors', 'success')} className="btn border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 px-2 py-0.5 rounded text-[9px] font-bold"><RefreshCw size={10} /> Re-Align Boxes</button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: OCR RESULTS & LIVE CHECKS */}
        <div className="scanner-panel flex flex-col bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden w-80 lg:w-[340px]">
          <h3 className="panel-title-text text-xs font-extrabold uppercase tracking-wider p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex items-center gap-2">
            <ClipboardList className="text-blue-700 dark:text-blue-400" size={16} /> Results & Checklists
          </h3>

          <div className="tab-controls-scanner flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10">
            <button 
              onClick={() => setActiveTab('fields')} 
              className={`flex-1 text-center py-2.5 text-xs font-semibold border-b-2 transition-all ${activeTab === 'fields' ? 'border-blue-700 text-blue-700 dark:text-blue-400 bg-white dark:bg-[#121826] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}
            >
              Extracted Data
            </button>
            <button 
              onClick={() => setActiveTab('rules')}
              className={`flex-1 text-center py-2.5 text-xs font-semibold border-b-2 transition-all ${activeTab === 'rules' ? 'border-blue-700 text-blue-700 dark:text-blue-400 bg-white dark:bg-[#121826] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}
            >
              Compliance Engine
            </button>
          </div>

          <div className="scanner-tab-content flex-1 overflow-y-auto p-4 bg-white dark:bg-[#121826]">
            
            {/* 1. EXTRACTED DATA FIELDS TAB */}
            {activeTab === 'fields' && (
              <div className="extracted-fields-list flex flex-col gap-3">
                {ocrConfidence === 0 ? (
                  <div className="no-fields-prompt text-center py-12 text-slate-500 text-xs">
                    <p>No OCR data extracted yet. Run the AI scan to pull packaged fields.</p>
                  </div>
                ) : (
                  Object.keys(ocrFields).map(key => {
                    // Friendly labels mapper
                    const labels = {
                      productName: 'Product Name', netQty: 'Net Quantity', mrp: 'MRP Price Tag',
                      mfgDate: 'Manufacturing Date', expiryDate: 'Expiry Date',
                      manufacturerName: 'Manufacturer Address', customerCare: 'Consumer Support Info',
                      fssaiLicense: 'FSSAI License No', batchNumber: 'Batch Number'
                    };

                    const val = ocrFields[key];
                    const isHovered = activeHoverField === key;

                    return (
                      <div 
                        key={key} 
                        className={`ocr-field-card border rounded-xl p-3 flex flex-col gap-1.5 transition-all duration-150 ${isHovered ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/15 shadow-sm' : 'border-slate-200 dark:border-slate-800'}`}
                        onMouseEnter={() => setActiveHoverField(key)}
                        onMouseLeave={() => setActiveHoverField(null)}
                      >
                        <div className="field-meta-row flex justify-between items-center">
                          <span className="field-label text-[9px] font-bold text-slate-500 uppercase tracking-wider">{labels[key] || key}</span>
                          <span className={`field-confidence text-[8px] font-bold px-2 py-0.5 rounded-full ${val && val !== 'N/A' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500' : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500'}`}>
                            {val && val !== 'N/A' ? 'High' : 'N/A'}
                          </span>
                        </div>
                        <div className="field-value-row flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 gap-2 focus-within:border-blue-600 focus-within:bg-white dark:focus-within:bg-slate-950">
                          <input 
                            type="text" 
                            className="field-input-box w-full text-xs focus:outline-none bg-transparent"
                            value={val}
                            placeholder="Not detected"
                            onChange={(e) => handleFieldEdit(key, e.target.value)}
                          />
                          <Edit3 className="text-slate-400 w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 2. COMPLIANCE RULES CHECKLIST TAB */}
            {activeTab === 'rules' && (
              <div className="compliance-rules-box flex flex-col gap-4">
                
                {/* Visual circular dials score progress */}
                <div className="overall-score-panel flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="circular-score-wrapper w-16 h-16 relative flex-shrink-0">
                    <svg className="circular-progress transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                      <circle className="bg-circle stroke-slate-200 dark:stroke-slate-800 fill-none" strokeWidth="8" cx="50" cy="50" r={radius}></circle>
                      <circle 
                        className="fg-circle fill-none stroke-emerald-500" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        cx="50" 
                        cy="50" 
                        r={radius}
                        style={{
                          strokeDasharray: circumference,
                          strokeDashoffset: strokeDashoffset,
                          stroke: complianceScore === 100 ? 'var(--color-compliance-green)' : (complianceScore >= 70 ? 'var(--color-warning)' : 'var(--color-violation-red)')
                        }}
                      ></circle>
                    </svg>
                    <div className="circular-score-value absolute inset-0 flex flex-col items-center justify-center line-none">
                      <span className="font-display text-base font-extrabold text-slate-850 dark:text-slate-100 leading-none">{complianceScore}%</span>
                      <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Rating</span>
                    </div>
                  </div>
                  <div className="score-meta flex flex-col gap-0.5">
                    {ocrConfidence === 0 ? (
                      <>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Compliance Evaluation</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">Run AI OCR on label to audit rule lists.</p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                          {complianceScore === 100 ? (
                            <span className="text-emerald-600 dark:text-emerald-500">Fully Compliant</span>
                          ) : (complianceScore >= 70 ? (
                            <span className="text-amber-500">Minor Violations</span>
                          ) : (
                            <span className="text-red-500">Severe Failures</span>
                          ))}
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          {complianceScore === 100 
                            ? 'All mandatory packaging rules passed validation checks.' 
                            : 'Identified infringements require label adjustments.'
                          }
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Rules checkboxes lists */}
                <div className="rules-checklist flex flex-col gap-2.5">
                  {ocrConfidence === 0 ? (
                    <p className="text-slate-500 text-xs py-8 text-center">Scan a package label to check rule lists.</p>
                  ) : (
                    complianceChecks.map(check => {
                      const isSuccess = check.result.success;
                      return (
                        <div key={check.id} className="rule-check-item flex justify-between items-center p-3 bg-slate-50 dark:bg-[#182030]/20 border border-slate-250 dark:border-slate-800/80 rounded-xl">
                          <div className="rule-check-meta flex flex-col gap-0.5">
                            <span className="rule-check-title text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{check.title}</span>
                            <span className="rule-check-law text-[9px] text-slate-500 leading-none">{check.law}</span>
                            <p className={`text-[10px] leading-normal mt-1 font-semibold ${isSuccess ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-500'}`}>{check.result.desc}</p>
                          </div>
                          <div className={`rule-status-indicator flex-shrink-0 ${isSuccess ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-500'}`}>
                            {isSuccess ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Action panels footer */}
          <div className="scanner-panel-footer p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button 
              onClick={() => viewReportRecord({
                name: selectedProduct.name,
                category: selectedProduct.category === 'food' ? 'Food & Beverages' : 'Cosmetics & Personal Care',
                score: complianceScore,
                date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
                productKey: selectedProduct.key,
                fields: ocrFields,
                violationsCount: complianceScore < 100 ? (complianceScore < 70 ? 2 : 1) : 0
              })}
              disabled={ocrConfidence === 0}
              className="btn border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 font-semibold text-xs py-2 px-3 rounded-lg flex-1 disabled:opacity-50"
            >
              <ClipboardList size={14} className="inline-block mr-1" /> Full Report
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={ocrConfidence === 0}
              className="btn btn-success bg-[#10b981] hover:bg-emerald-600 text-white font-semibold text-xs py-2 px-3 rounded-lg flex-1 disabled:opacity-50"
            >
              <FileDown size={14} className="inline-block mr-1" /> Export PDF
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
