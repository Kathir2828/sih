import React, { useEffect, useRef } from 'react';
import { 
  PlusCircle, UploadCloud, Camera, Sparkles, Package, 
  CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown, 
  AlertTriangle, HelpCircle
} from 'lucide-react';
import Chart from 'chart.js/auto';

export default function Dashboard({ loadDemoProduct, navigateToView, historyList, addToast }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Compute stats dynamically from history list (with high-number base offsets for SIH mockup realism)
  const totalScanned = historyList.length + 1479;
  const compliantCount = historyList.filter(h => h.score === 100).length + 1214;
  const nonCompliantCount = historyList.filter(h => h.score < 100).length + 216;
  const pendingReview = 49; // Fixed indicator
  const complianceRate = Math.round((compliantCount / totalScanned) * 100);

  // Fetch recent 3 timeline logs from history
  const recentTimelineLogs = historyList.slice(0, 3);

  // Trigger file chooser helper
  const handleUploadClick = () => {
    const input = document.getElementById('real-file-input-react');
    if (input) input.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length) {
      const file = e.target.files[0];
      addToast('File Uploaded', `Successfully loaded: ${file.name}`, 'success');
      // Simulate scanning by loading random product key
      const keys = ['oats', 'masala', 'cream'];
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      loadDemoProduct(randomKey);
    }
  };

  // Draw dashboard breakdown bar chart on startup
  useEffect(() => {
    if (chartRef.current) {
      // Clean up previous instance
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['FSSAI Format', 'Net Quantity', 'MRP Tag', 'Dates Format', 'Helpline Address', 'Font Height'],
          datasets: [{
            label: 'Failure count',
            data: [42, 28, 35, 12, 19, 8],
            backgroundColor: '#3b82f6',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(148, 163, 184, 0.1)' } }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="view-section animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header section */}
      <div className="view-header flex justify-between items-start mb-6">
        <div>
          <h1 className="view-title font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Legal Metrology Compliance Overview
          </h1>
          <p className="view-subtitle text-slate-500 text-xs mt-1">
            National Enforcement Dashboard for Legal Metrology (Packaged Commodities) Rules, 2011 • Dept of Consumer Affairs
          </p>
        </div>
        <button 
          onClick={() => navigateToView('scanner')}
          className="btn btn-primary bg-[#0f2942] hover:bg-[#183e63] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <PlusCircle size={16} className="text-amber-400" /> New Product Scan
        </button>
      </div>

      {/* Hero Interactive Upload Banner */}
      <div className="hero-card bg-[#0f2942] text-white p-7 rounded-2xl grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-7 shadow-xs border border-slate-800 relative overflow-hidden">
        <div className="hero-content flex flex-col justify-center gap-3.5 z-10">
          <div className="flex items-center gap-2">
            <span className="hero-tag bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider w-fit">
              Government of India • SIH26034
            </span>
            <span className="text-[10px] font-mono text-blue-200">PCR 2011 Rule 6 Compliant</span>
          </div>
          <h2 className="font-display text-xl lg:text-2xl font-bold leading-tight text-white">
            Verify Packaged Products Instantly with On-Device Tesseract.js OCR
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed max-w-lg">
            Upload packaging display panels, capture webcam snapshots, or process 100-page catalogs to automatically detect MRP, Net Quantity, Date of Manufacture, Manufacturer Address, and Consumer Care details under Section 36 of Legal Metrology Act, 2009.
          </p>
          
          <div className="hero-actions flex flex-wrap gap-2.5 mt-1">
            <button onClick={handleUploadClick} className="btn bg-white hover:bg-slate-100 text-[#0f2942] font-bold text-xs px-4 py-2 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-colors">
              <UploadCloud size={15} /> Upload Packaging Image
            </button>
            <button onClick={() => navigateToView('scanner')} className="btn border border-white/30 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2 cursor-pointer transition-colors">
              <Camera size={15} className="text-amber-400" /> Open Scanner Console
            </button>
            <input type="file" id="real-file-input-react" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
          </div>
        </div>
        <div className="hero-interactive flex items-center justify-center z-10">
          <div 
            onClick={handleUploadClick}
            className="drag-drop-zone w-full h-40 border-2 border-dashed border-white/30 hover:border-amber-400 rounded-xl bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors"
          >
            <UploadCloud className="drag-icon text-amber-400 mb-2" size={28} />
            <p className="text-xs font-bold text-white">Drop packaging display panel here</p>
            <span className="text-[10px] text-slate-300 mt-0.5">High-Resolution JPEG, PNG, WEBP, or PDF (Auto-OCR)</span>
          </div>
        </div>
      </div>

      {/* Demo Package Templates selector carousel */}
      <div className="demo-selector-card bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-7 shadow-xs">
        <div className="demo-header flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Pre-Calibrated Test Samples (Instant Legal Metrology Rule 6 Verification)
          </h3>
        </div>
        <div className="demo-grid grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div onClick={() => loadDemoProduct('biscuit')} className="demo-product-card flex bg-slate-50 dark:bg-[#182030]/60 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-blue-600 transition-all duration-200">
            <div className="demo-product-thumbnail w-28 bg-[#fdf6e2] flex flex-col justify-between p-2 flex-shrink-0 text-[8px] font-mono leading-tight border-r border-slate-200">
              <div className="flex justify-between font-bold text-blue-800">
                <span>GOOD DAY</span>
                <span className="bg-emerald-600 text-white px-1 rounded-[2px] text-[6px]">Compliant</span>
              </div>
              <div className="text-center font-display my-1">
                <span className="font-extrabold text-[9px] block text-blue-900">Butter Cookies</span>
                <span className="text-[6px] text-slate-500">Biscuit</span>
              </div>
              <div className="border-t border-slate-200 pt-1 text-[6px] text-slate-600 flex flex-col gap-0.5">
                <span>Net Wt: <strong>34.5g</strong></span>
                <span>MRP: <strong>₹5.00</strong></span>
              </div>
            </div>
            <div className="demo-product-info p-3.5 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-xs font-bold leading-tight">Britannia Good Day Butter Cookies</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">Fully compliant packaging design with all mandatory declarations.</p>
              </div>
              <div className="demo-score bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded w-fit mt-3">100% Score</div>
            </div>
          </div>

          <div onClick={() => loadDemoProduct('oats')} className="demo-product-card flex bg-slate-50 dark:bg-[#182030]/60 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-blue-600 transition-all duration-200">
            <div className="demo-product-thumbnail w-28 bg-[#fdf6e2] flex flex-col justify-between p-2 flex-shrink-0 text-[8px] font-mono leading-tight">
              <div className="flex justify-between font-bold text-[#15803d]">
                <span>NH-OAT-998</span>
                <span className="bg-emerald-600 text-white px-1 rounded-[2px] text-[6px]">Compliant</span>
              </div>
              <div className="text-center font-display my-1">
                <span className="font-extrabold text-[9px] block text-emerald-800">Harvest Oats</span>
                <span className="text-[6px] text-slate-500">100% Whole Grains</span>
              </div>
              <div className="border-t border-slate-200 pt-1 text-[6px] text-slate-600 flex flex-col gap-0.5">
                <span>Net Weight: <strong>500g</strong></span>
                <span>MRP: <strong>Rs. 145</strong></span>
              </div>
            </div>
            <div className="demo-product-info p-3.5 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-xs font-bold leading-tight">Nature's Harvest Oats</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">Fully compliant packaging design with all mandatory declarations.</p>
              </div>
              <div className="demo-score bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded w-fit mt-3">100% Score</div>
            </div>
          </div>
          
          <div onClick={() => loadDemoProduct('masala')} className="demo-product-card flex bg-slate-50 dark:bg-[#182030]/60 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-blue-600 transition-all duration-200">
            <div className="demo-product-thumbnail w-28 bg-[#fff5eb] flex flex-col justify-between p-2 flex-shrink-0 text-[8px] font-mono leading-tight">
              <div className="flex justify-between font-bold text-red-600">
                <span>SFM-88A</span>
                <span className="bg-red-600 text-white px-1 rounded-[2px] text-[6px]">Non-Compliant</span>
              </div>
              <div className="text-center font-display my-1">
                <span className="font-extrabold text-[9px] block text-red-800">Fusion Masala</span>
                <span className="text-[6px] text-slate-500">Spices mix</span>
              </div>
              <div className="border-t border-slate-200 pt-1 text-[6px] text-slate-600 flex flex-col gap-0.5">
                <span>Net Weight: <strong>100g</strong></span>
                <span>MRP: <strong>₹ 65</strong></span>
              </div>
            </div>
            <div className="demo-product-info p-3.5 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-xs font-bold leading-tight">Spicy Fusion Masala</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">Infringement: Invalid 14-digit FSSAI License structure.</p>
              </div>
              <div className="demo-score bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500 text-[10px] font-bold px-2 py-0.5 rounded w-fit mt-3">75% Score</div>
            </div>
          </div>
          
          <div onClick={() => loadDemoProduct('cream')} className="demo-product-card flex bg-slate-50 dark:bg-[#182030]/60 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-blue-600 transition-all duration-200">
            <div className="demo-product-thumbnail w-28 bg-[#faf5ff] flex flex-col justify-between p-2 flex-shrink-0 text-[8px] font-mono leading-tight">
              <div className="flex justify-between font-bold text-purple-700">
                <span>GB-77B</span>
                <span className="bg-red-600 text-white px-1 rounded-[2px] text-[6px]">Violations</span>
              </div>
              <div className="text-center font-display my-1">
                <span className="font-extrabold text-[9px] block text-purple-800">Glow Cream</span>
                <span className="text-[6px] text-slate-500">Hydration pack</span>
              </div>
              <div className="border-t border-slate-200 pt-1 text-[6px] text-slate-600 flex flex-col gap-0.5">
                <span>Net Volume: <strong>1.7 oz</strong></span>
                <span className="text-red-500">Price: <strong>N/A</strong></span>
              </div>
            </div>
            <div className="demo-product-info p-3.5 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-xs font-bold leading-tight">Glow Radiant Face Cream</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">Violations: Imperial unit (ounces) and missing MRP tag.</p>
              </div>
              <div className="demo-score bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500 text-[10px] font-bold px-2 py-0.5 rounded w-fit mt-3">50% Score</div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Statistics Cards Row */}
      <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        
        <div className="stat-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-sm transition-all duration-200">
          <div className="stat-header flex justify-between items-start">
            <span className="stat-title text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Products Scanned</span>
            <div className="stat-icon bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 w-9 h-9 rounded-lg flex items-center justify-center"><Package size={18} /></div>
          </div>
          <div className="stat-value font-display text-2xl font-extrabold text-slate-850 dark:text-slate-100">{totalScanned.toLocaleString()}</div>
          <div className="stat-footer flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="trend positive font-bold text-emerald-600 inline-flex items-center gap-0.5"><TrendingUp size={12} /> +12%</span>
            <span>from last week</span>
          </div>
          <div className="progress-bar-container w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="progress-bar-fill h-full bg-blue-700 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="stat-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-sm transition-all duration-200">
          <div className="stat-header flex justify-between items-start">
            <span className="stat-title text-[10px] font-bold text-slate-500 uppercase tracking-wider">Compliant Products</span>
            <div className="stat-icon bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-500 w-9 h-9 rounded-lg flex items-center justify-center"><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-value font-display text-2xl font-extrabold text-slate-850 dark:text-slate-100">{compliantCount.toLocaleString()}</div>
          <div className="stat-footer flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="trend positive font-bold text-emerald-600 inline-flex items-center gap-0.5"><TrendingUp size={12} /> +14.2%</span>
            <span>compliance rate ({complianceRate}%)</span>
          </div>
          <div className="progress-bar-container w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="progress-bar-fill h-full bg-emerald-500 rounded-full" style={{ width: `${complianceRate}%` }}></div>
          </div>
        </div>

        <div className="stat-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-sm transition-all duration-200">
          <div className="stat-header flex justify-between items-start">
            <span className="stat-title text-[10px] font-bold text-slate-500 uppercase tracking-wider">Non-Compliant Products</span>
            <div className="stat-icon bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-500 w-9 h-9 rounded-lg flex items-center justify-center"><XCircle size={18} /></div>
          </div>
          <div className="stat-value font-display text-2xl font-extrabold text-slate-850 dark:text-slate-100">{nonCompliantCount.toLocaleString()}</div>
          <div className="stat-footer flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="trend negative font-bold text-red-600 inline-flex items-center gap-0.5"><TrendingDown size={12} /> -3.5%</span>
            <span>violations detected</span>
          </div>
          <div className="progress-bar-container w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="progress-bar-fill h-full bg-red-500 rounded-full" style={{ width: `${Math.round((nonCompliantCount / totalScanned) * 100)}%` }}></div>
          </div>
        </div>

        <div className="stat-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-sm transition-all duration-200">
          <div className="stat-header flex justify-between items-start">
            <span className="stat-title text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Reviews</span>
            <div className="stat-icon bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-500 w-9 h-9 rounded-lg flex items-center justify-center"><Clock size={18} /></div>
          </div>
          <div className="stat-value font-display text-2xl font-extrabold text-slate-850 dark:text-slate-100">{pendingReview}</div>
          <div className="stat-footer flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="trend neutral font-bold text-slate-500">0% change</span>
            <span>requires audit action</span>
          </div>
          <div className="progress-bar-container w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="progress-bar-fill h-full bg-amber-500 rounded-full" style={{ width: '4%' }}></div>
          </div>
        </div>

      </div>

      {/* Timeline Failure Log stream + Bar chart breakdowns */}
      <div className="dashboard-bottom-grid grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        
        {/* Timeline failures list */}
        <div className="panel-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-all duration-200">
          <div className="panel-header flex justify-between items-center mb-5">
            <h3 className="font-display text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Critical Compliance Failure Log</h3>
            <button onClick={() => navigateToView('history')} className="text-btn text-xs font-semibold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="activity-timeline flex flex-col gap-4 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800">
            {recentTimelineLogs.length === 0 ? (
              <p className="text-slate-500 text-xs py-8 text-center">No audits registered. Run a scan to see event history.</p>
            ) : (
              recentTimelineLogs.map(row => {
                const isCompliant = row.score === 100;
                let descText = 'Custom product scanning complete. Checked compliance variables.';
                
                if (row.productKey === 'oats') {
                  descText = 'Passed all declarations checks. Generated Legal Metrology Conformity Report.';
                } else if (row.productKey === 'masala') {
                  descText = `FSSAI license code '${row.fields.fssaiLicense}' represents an invalid format. Missing consumer helpline email address details.`;
                } else if (row.productKey === 'cream') {
                  descText = `Net volume listed in imperial units (${row.fields.netQty || 'Not Printed'}). Price tag (MRP) is completely missing.`;
                }

                return (
                  <div key={row.id} className="timeline-item relative flex flex-col gap-1.5">
                    {/* Circle dot marker */}
                    <div className={`timeline-marker absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#121826] ${isCompliant ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    
                    <div className="timeline-content bg-slate-50 dark:bg-[#182030]/30 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-1.5">
                      <div className="timeline-meta flex justify-between items-center text-xs">
                        <strong className="font-bold text-slate-800 dark:text-slate-200">{row.name}</strong>
                        <span className="timeline-time text-[10px] text-slate-500">{row.date}</span>
                      </div>
                      <p className="timeline-desc text-[11px] text-slate-500 leading-normal">{descText}</p>
                      <span className={`tag text-[9px] font-bold px-2 py-0.5 rounded w-fit ${isCompliant ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500' : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500'}`}>
                        {isCompliant ? 'Compliant' : `${row.violationsCount} Violations`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Failure bar breakdown chart */}
        <div className="panel-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-all duration-200">
          <div className="panel-header flex justify-between items-center mb-5">
            <h3 className="font-display text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Common Compliance Failure Breakdown</h3>
            <HelpCircle className="text-slate-400 w-5 h-5 flex-shrink-0" title="Most common reasons why packages fail Legal Metrology checks" />
          </div>
          <div className="quick-chart-container h-60 relative flex items-center justify-center">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

      </div>

    </div>
  );
}
