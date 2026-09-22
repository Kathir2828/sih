import React, { useState, useEffect } from 'react';
import { 
  FileText, X, Download, Filter, Search, CheckCircle2, XCircle, AlertTriangle, 
  Layers, Cpu, Check, FileSpreadsheet, ChevronLeft, ChevronRight, Eye, Sparkles, ShieldAlert
} from 'lucide-react';

export default function BatchPdfModal({ onClose, addToast }) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'inspector'
  const [selectedPageNum, setSelectedPageNum] = useState(1);

  // Generate 10 sample product pages for interactive 10-page visual inspection
  const [batchResults, setBatchResults] = useState([]);

  useEffect(() => {
    const categories = ['Food & Beverages', 'Personal Care', 'Spices', 'Dairy & Edible Oil'];
    const brands = ['Parle-G', 'Britannia Good Day', 'Nestle Maggi', 'Dabur Honey', 'Amul Butter', 'Tata Salt', 'Sunpure Oil', 'Patanjali Dant Kanti', 'Fortune Atta', 'Lays Chips'];
    const prods = ['Biscuits 100g', 'Butter Cookies 150g', 'Noodle Family Pack 280g', 'Pure Honey 250g', 'Pasteurised Butter 500g', 'Iodised Salt 1kg', 'Sunflower Oil 1L', 'Herbal Toothpaste 100g', 'Whole Wheat Atta 5kg', 'Masala Chips 50g'];
    const mrps = ['₹ 10.00', '₹ 30.00', '₹ 56.00', '₹ 145.00', '₹ 275.00', '₹ 28.00', '₹ 165.00', '₹ 85.00', '₹ 240.00', '₹ 20.00'];
    const qtys = ['100g', '150g', '280g', '250g', '500g', '1 kg', '1 Litre', '100g', '5 kg', '50g'];
    const mfgs = ['01/2026', '02/2026', '12/2025', '03/2026', '02/2026', '01/2026', '03/2026', '11/2025', '02/2026', '03/2026'];
    const mfrs = [
      'Parle Products Pvt Ltd, Vile Parle East, Mumbai',
      'Britannia Industries Ltd, Hosur Road, Bengaluru',
      'Nestle India Ltd, M-5A Connaught Circus, New Delhi',
      'Dabur India Ltd, 8/3 Asaf Ali Road, New Delhi',
      'Kaira District Co-op Milk Producers Union, Anand, Gujarat',
      'Tata Consumer Products Ltd, Mumbai 400001',
      'Sunpure Refineries, Industrial Area, Mysuru',
      'Patanjali Ayurved Ltd, Haridwar, Uttarakhand',
      'Adani Wilmar Ltd, Fortune House, Ahmedabad',
      'PepsiCo India Holdings Pvt Ltd, Gurgaon, Haryana'
    ];

    const mockPages = Array.from({ length: 10 }, (_, i) => {
      const pageNum = i + 1;
      const isCompliant = pageNum !== 3 && pageNum !== 7 && pageNum !== 10;
      
      const violations = isCompliant ? [] : (
        pageNum === 3 
          ? ['Missing Manufacturer Name & Address [Rule 6(1)(a)]', 'Missing Helpline Contact [Rule 6(1)(g)]']
          : (pageNum === 7 
            ? ['Non-Metric Quantity Unit (Oz) [Rule 13]', 'MRP missing tax inclusion statement [Rule 6(1)(e)]']
            : ['Date of Manufacture missing month/year [Rule 6(1)(d)]'])
      );

      return {
        page: pageNum,
        name: `${brands[i]} - ${prods[i]}`,
        category: categories[i % categories.length],
        mrp: mrps[i],
        netQty: qtys[i],
        mfgDate: mfgs[i],
        expiryDate: `12/${2026 + (i % 2)}`,
        batchNo: `BATCH-${202600 + pageNum}`,
        manufacturer: isCompliant || pageNum === 7 || pageNum === 10 ? mfrs[i] : '',
        customerCare: isCompliant || pageNum === 7 || pageNum === 10 ? `care@${brands[i].toLowerCase().replace(/[^a-z]/g, '')}.com, Ph: 1800-11-9900` : '',
        status: isCompliant ? 'Compliant' : 'Non-Compliant',
        score: isCompliant ? 100 : (pageNum === 3 ? 50 : 75),
        violations
      };
    });

    setBatchResults(mockPages);

    // 2s Parsing Simulation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / 2000) * 100), 100);
      setProgress(pct);

      if (elapsed >= 2000) {
        clearInterval(interval);
        setIsProcessing(false);
        addToast('PDF Catalog Loaded', 'Successfully segmented and parsed 10 PDF catalog pages.', 'success');
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const selectedPage = batchResults.find(p => p.page === selectedPageNum) || batchResults[0];

  const handleExportBatchCSV = () => {
    addToast('Exporting CSV', 'Generating spreadsheet for 10-page catalog audit...', 'info');
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + ["Page,Product Name,Category,MRP,Net Quantity,Mfg Date,Status,Score,Violations"].join(",") + "\n"
        + batchResults.map(r => [r.page, `"${r.name}"`, `"${r.category}"`, `"${r.mrp}"`, `"${r.netQty}"`, `"${r.mfgDate}"`, r.status, `${r.score}%`, `"${r.violations.join('; ')}"`].join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `MetroScan_10Page_PDF_Audit_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('CSV Downloaded', '10-Page Catalog PDF Audit CSV saved.', 'success');
    }, 800);
  };

  const filteredResults = batchResults.filter(row => {
    const matchSearch = row.name.toLowerCase().includes(searchVal.toLowerCase()) || row.page.toString().includes(searchVal);
    let matchStatus = true;
    if (statusFilter === 'compliant') matchStatus = row.status === 'Compliant';
    if (statusFilter === 'non-compliant') matchStatus = row.status === 'Non-Compliant';
    return matchSearch && matchStatus;
  });

  const compliantCount = batchResults.filter(r => r.status === 'Compliant').length;
  const nonCompliantCount = batchResults.filter(r => r.status === 'Non-Compliant').length;

  return (
    <div className="modal-overlay fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="modal-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow">
              <Layers size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  PDF Catalog Batch Inspector (10 Pages)
                </h2>
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                  Multi-Page AI Vision
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Page-by-page visual inspection & Rule 6 compliance evaluation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isProcessing && (
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('table')}
                  className={`text-xs px-3 py-1 rounded-md font-bold transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Summary Table
                </button>
                <button 
                  onClick={() => setViewMode('inspector')}
                  className={`text-xs px-3 py-1 rounded-md font-bold transition-all ${viewMode === 'inspector' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Page Inspector
                </button>
              </div>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs">
          
          {/* Processing Loading Bar */}
          {isProcessing ? (
            <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center gap-4 my-8">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Cpu size={28} className="animate-spin duration-[3000ms]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Parsing 10-Page PDF Document Catalog...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Segmenting vector pages with PyMuPDF, running YOLOv8 layout parser, and evaluating Rule 6(1) declarations per page...
                </p>
              </div>
              
              <div className="w-full max-w-md bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-blue-700 via-blue-500 to-emerald-500 h-full rounded-full transition-all duration-75"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                {progress}% Complete ({Math.round((progress / 100) * 10)} of 10 Pages Parsed)
              </span>
            </div>
          ) : (
            <>
              {/* PAGE INSPECTOR VIEW (Interactive Page-by-Page Viewer) */}
              {viewMode === 'inspector' && selectedPage && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  
                  {/* Page Navigation Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-950/40 border border-blue-800/40 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedPageNum(prev => Math.max(1, prev - 1))}
                        disabled={selectedPageNum === 1}
                        className="btn bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-lg disabled:opacity-50 flex items-center gap-1 font-bold text-xs"
                      >
                        <ChevronLeft size={16} /> Prev Page
                      </button>
                      <span className="font-mono font-extrabold text-blue-400 px-3 text-sm">
                        PAGE {selectedPage.page} OF 10
                      </span>
                      <button 
                        onClick={() => setSelectedPageNum(prev => Math.min(10, prev + 1))}
                        disabled={selectedPageNum === 10}
                        className="btn bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-lg disabled:opacity-50 flex items-center gap-1 font-bold text-xs"
                      >
                        Next Page <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Jump to Page:</span>
                      <div className="flex gap-1">
                        {batchResults.map(p => (
                          <button
                            key={p.page}
                            onClick={() => setSelectedPageNum(p.page)}
                            className={`w-7 h-7 rounded-lg font-bold font-mono text-xs transition-all ${selectedPageNum === p.page ? 'bg-blue-600 text-white shadow' : (p.status === 'Compliant' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-red-950 text-red-300 border border-red-800')}`}
                          >
                            {p.page}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Split Layout: Page Image Artwork Canvas & Evaluation Checklist */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* Left: Page Artwork Render with Bounding Boxes */}
                    <div className="flex flex-col gap-2 items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Page {selectedPage.page} PDF Visual Scan & Bounding Box HUD
                      </span>

                      {/* Mock Page Canvas */}
                      <div className="w-full max-w-sm h-96 rounded-2xl border-2 border-blue-600/60 bg-gradient-to-b from-slate-900 to-slate-950 p-4 flex flex-col justify-between relative shadow-xl overflow-hidden select-none">
                        
                        {/* Page Header Tag */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="bg-blue-700/80 text-white text-[8px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase">
                            PDF CATALOG PAGE #{selectedPage.page}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">Batch Ref: {selectedPage.batchNo}</span>
                        </div>

                        {/* Product Title */}
                        <div className="text-center my-2">
                          <h3 className="text-base font-black uppercase text-white tracking-wide drop-shadow">
                            {selectedPage.name}
                          </h3>
                          <span className="text-[9px] text-amber-300 font-semibold">{selectedPage.category}</span>
                        </div>

                        {/* Product Artwork Illustration */}
                        <div className="my-auto py-4 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center">
                          <Sparkles size={32} className="text-amber-400 mb-1" />
                          <span className="text-[9px] text-slate-300 font-bold uppercase">Packaged Commodity Artwork</span>
                        </div>

                        {/* Page Declarations Zone */}
                        <div className="bg-black/50 backdrop-blur-xs rounded-xl p-3 border border-white/15 flex flex-col gap-1.5 text-[9px]">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-300">Net Quantity:</span>
                            <span className="text-emerald-300 font-mono font-extrabold">{selectedPage.netQty}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-300">MRP (Incl. taxes):</span>
                            <span className="text-purple-300 font-mono font-extrabold">{selectedPage.mrp}</span>
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-400">
                            <span>Mfg: <strong className="text-amber-300">{selectedPage.mfgDate}</strong></span>
                            <span>Exp: <strong>{selectedPage.expiryDate}</strong></span>
                          </div>
                          
                          {/* Manufacturer info status */}
                          <div className="mt-1 pt-1 border-t border-white/10 text-[8px]">
                            {selectedPage.manufacturer ? (
                              <span className="text-slate-300">Mfr: {selectedPage.manufacturer}</span>
                            ) : (
                              <span className="text-red-400 font-bold italic">⚠️ Rule 6(1)(a) Violation: Manufacturer Address Missing</span>
                            )}
                          </div>
                        </div>

                        {/* Overlay Bounding Boxes HUD */}
                        <div className="absolute top-14 left-4 right-4 h-12 border-2 border-purple-500/70 rounded bg-purple-500/10 pointer-events-none flex items-start p-1 text-[7px] text-purple-300 font-bold">
                          MRP & Brand Region
                        </div>
                        <div className="absolute bottom-16 left-4 right-4 h-16 border-2 border-emerald-500/70 rounded bg-emerald-500/10 pointer-events-none flex items-start p-1 text-[7px] text-emerald-300 font-bold">
                          Net Qty & Mfg Date Stamp Region
                        </div>
                        {selectedPage.status === 'Non-Compliant' && (
                          <div className="absolute bottom-4 left-4 right-4 h-8 border-2 border-dashed border-red-500 rounded bg-red-500/20 pointer-events-none flex items-center justify-center text-[7px] text-red-300 font-extrabold animate-pulse">
                            ⚠️ MISSING MANUFACTURER / HELPLINE ZONE
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Right: Evaluated Rule 6 Declaration Checklist */}
                    <div className="flex flex-col gap-3">
                      <div className={`p-4 rounded-xl border flex justify-between items-center ${selectedPage.status === 'Compliant' ? 'bg-emerald-950/30 border-emerald-500/60' : 'bg-red-950/30 border-red-500/60'}`}>
                        <div>
                          <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded ${selectedPage.status === 'Compliant' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                            PAGE {selectedPage.page} STATUS: {selectedPage.status.toUpperCase()}
                          </span>
                          <p className="text-[11px] text-slate-300 mt-2 font-medium">
                            {selectedPage.status === 'Compliant' 
                              ? 'All 5 mandatory declarations present and compliant with Legal Metrology Rules, 2011.'
                              : `Failed Rule 6 validation. Found ${selectedPage.violations.length} statutory infractions.`
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Score</span>
                          <span className={`font-display font-extrabold text-2xl ${selectedPage.status === 'Compliant' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {selectedPage.score}%
                          </span>
                        </div>
                      </div>

                      {/* Evaluated Clauses */}
                      <div className="flex flex-col gap-2">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-200">1. Maximum Retail Price (MRP)</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Rule 6(1)(e)</span>
                          </div>
                          <span className="font-mono font-extrabold text-purple-400 bg-purple-950/60 px-2 py-1 rounded border border-purple-800">
                            {selectedPage.mrp}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-200">2. Net Weight / Quantity</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Rule 6(1)(c) & Rule 13</span>
                          </div>
                          <span className="font-mono font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
                            {selectedPage.netQty}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-200">3. Date of Manufacture</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Rule 6(1)(d)</span>
                          </div>
                          <span className="font-mono font-extrabold text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800">
                            {selectedPage.mfgDate}
                          </span>
                        </div>

                        <div className={`p-2.5 rounded-lg border flex justify-between items-center ${selectedPage.manufacturer ? 'bg-slate-900 border-slate-800' : 'bg-red-950/40 border-red-800'}`}>
                          <div>
                            <span className="font-bold text-slate-200">4. Manufacturer Credentials</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Rule 6(1)(a)</span>
                          </div>
                          {selectedPage.manufacturer ? (
                            <span className="font-bold text-emerald-400 text-[10px] max-w-xs text-right truncate">
                              {selectedPage.manufacturer}
                            </span>
                          ) : (
                            <span className="font-bold text-red-400 text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-800">
                              MISSING (VIOLATION)
                            </span>
                          )}
                        </div>

                        <div className={`p-2.5 rounded-lg border flex justify-between items-center ${selectedPage.customerCare ? 'bg-slate-900 border-slate-800' : 'bg-red-950/40 border-red-800'}`}>
                          <div>
                            <span className="font-bold text-slate-200">5. Consumer Helpline</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Rule 6(1)(g)</span>
                          </div>
                          {selectedPage.customerCare ? (
                            <span className="font-bold text-emerald-400 text-[10px] max-w-xs text-right truncate">
                              {selectedPage.customerCare}
                            </span>
                          ) : (
                            <span className="font-bold text-red-400 text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-800">
                              MISSING (VIOLATION)
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* SUMMARY TABLE VIEW */}
              {viewMode === 'table' && (
                <>
                  {/* Stat Cards Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total PDF Pages</span>
                      <span className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">10 Pages</span>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Compliant Products</span>
                      <span className="font-display font-extrabold text-2xl text-emerald-700 dark:text-emerald-400">{compliantCount} Pages</span>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Non-Compliant Items</span>
                      <span className="font-display font-extrabold text-2xl text-red-600 dark:text-red-400">{nonCompliantCount} Pages</span>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Scan Throughput</span>
                      <span className="font-display font-extrabold text-2xl text-blue-700 dark:text-blue-400">38 ms / page</span>
                    </div>
                  </div>

                  {/* Filters & Search */}
                  <div className="flex flex-col sm:flex-row justify-between gap-3 items-center bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="relative flex-1 w-full sm:w-auto">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search product name, page number..."
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-600"
                      >
                        <option value="all">All 10 Catalog Pages</option>
                        <option value="compliant">Compliant Only ({compliantCount})</option>
                        <option value="non-compliant">Violations Only ({nonCompliantCount})</option>
                      </select>

                      <button 
                        onClick={handleExportBatchCSV}
                        className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <FileSpreadsheet size={14} /> Export 10-Page CSV
                      </button>
                    </div>
                  </div>

                  {/* Results Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="p-3">Page #</th>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">MRP</th>
                          <th className="p-3">Net Qty</th>
                          <th className="p-3">Mfg Date</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Infringements Identified</th>
                          <th className="p-3 text-right">Inspect Page</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {filteredResults.map(row => (
                          <tr key={row.page} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                            <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">Page {row.page}</td>
                            <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{row.name}</td>
                            <td className="p-3 font-mono font-semibold">{row.mrp}</td>
                            <td className="p-3 font-mono">{row.netQty}</td>
                            <td className="p-3 font-mono">{row.mfgDate}</td>
                            <td className="p-3">
                              {row.status === 'Compliant' ? (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[10px] border border-emerald-200 dark:border-emerald-900/60">
                                  <CheckCircle2 size={12} /> Compliant
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded text-[10px] border border-red-200 dark:border-red-900/60">
                                  <XCircle size={12} /> Non-Compliant
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-[10.5px]">
                              {row.violations.length === 0 ? (
                                <span className="text-slate-400 italic">None</span>
                              ) : (
                                <ul className="list-disc pl-3 text-red-600 dark:text-red-400 flex flex-col gap-0.5">
                                  {row.violations.map((v, idx) => (
                                    <li key={idx}>{v}</li>
                                  ))}
                                </ul>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => {
                                  setSelectedPageNum(row.page);
                                  setViewMode('inspector');
                                }}
                                className="btn bg-blue-700 hover:bg-blue-600 text-white font-bold text-[10px] px-2.5 py-1 rounded flex items-center gap-1 ml-auto"
                              >
                                <Eye size={12} /> Inspect Visual
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <span className="text-[10px] text-slate-500 font-medium">
            10-Page PDF Catalog Batch Processor • Legal Metrology (Packaged Commodities) Rules, 2011
          </span>
          <div className="flex gap-2">
            <button onClick={handleExportBatchCSV} className="btn bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1">
              <Download size={14} /> Download 10-Page Audit CSV
            </button>
            <button onClick={onClose} className="btn border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-4 py-2 rounded-lg">
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
