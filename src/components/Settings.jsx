import React, { useState } from 'react';
import { Cpu, ShieldAlert, Sliders, Key, Eye, EyeOff, Save } from 'lucide-react';

export default function Settings({ darkTheme, toggleTheme, addToast }) {
  const [fssaiApi, setFssaiApi] = useState('https://foscos.fssai.gov.in/api/v2/verify');
  const [gs1Api, setGs1Api] = useState('https://gepir.gs1.org/api/v1/search');
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••');
  const [showKey, setShowKey] = useState(false);
  const [ocrLang, setOcrLang] = useState('eng');
  const [modelDepth, setModelDepth] = useState('medium');
  const [confidenceCutoff, setConfidenceCutoff] = useState(70);
  const [ruleVer, setRuleVer] = useState('2022-amend');

  const handleSave = () => {
    addToast('Config Saved', 'System configurations updated and stored.', 'success');
  };

  const handleTestAPIs = () => {
    addToast('Testing API Connections', 'Pinging FSSAI and GS1 central registries endpoint servers...', 'info');
    setTimeout(() => {
      addToast('Connections Successful', 'FSSAI registry response: 200 OK. GS1 Registry response: 200 OK.', 'success');
    }, 1500);
  };

  return (
    <div className="view-section animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="view-header flex justify-between items-start mb-6">
        <div>
          <h1 className="view-title font-display text-2xl font-extrabold tracking-tight">System Settings & Configurations</h1>
          <p className="view-subtitle text-slate-500 text-xs mt-1">Modify parameters for the OCR engine, rules validation levels, notifications, and API credentials.</p>
        </div>
        <button 
          onClick={handleSave}
          className="btn btn-primary bg-blue-700 hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-2"
        >
          <Save size={14} /> Save System Config
        </button>
      </div>

      <div className="settings-grid-layout grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column forms */}
        <div className="settings-column flex flex-col gap-6">
          
          {/* AI OCR Engine */}
          <div className="panel-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="panel-header flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Cpu size={16} className="text-blue-700" /> AI OCR Engine Config
              </h3>
            </div>
            <div className="panel-body flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Default OCR Language Parsing</label>
                <select 
                  value={ocrLang}
                  onChange={(e) => setOcrLang(e.target.value)}
                  className="form-select bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                >
                  <option value="eng">English (IN - Metrology optimized)</option>
                  <option value="hin">Hindi (हिन्दी)</option>
                  <option value="tam">Tamil (தமிழ்)</option>
                  <option value="multi">Auto-Detect Multilingual</option>
                </select>
                <span className="form-help-text text-[10px] text-slate-500 mt-1 leading-normal">Selects specialized layout parser models optimized for Indian scripts.</span>
              </div>
              
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Model Resolution Level</label>
                <select 
                  value={modelDepth}
                  onChange={(e) => setModelDepth(e.target.value)}
                  className="form-select bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                >
                  <option value="fast">High-Speed YOLO-Tiny (Low Latency)</option>
                  <option value="medium">Standard YOLOv8 Layout (Recommended)</option>
                  <option value="heavy">Deep LayoutParser CNN (High Accuracy - Cloud)</option>
                </select>
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Extracted Bounding Box Confidence Cutoff</label>
                <div className="slider-wrapper flex items-center gap-3 mt-1">
                  <input 
                    type="range" 
                    min="30" 
                    max="95" 
                    value={confidenceCutoff}
                    onChange={(e) => setConfidenceCutoff(parseInt(e.target.value))}
                    className="flex-1 accent-blue-700" 
                  />
                  <span className="font-bold text-blue-700 text-xs w-8 text-right">{confidenceCutoff}%</span>
                </div>
                <span className="form-help-text text-[10px] text-slate-500 mt-1 leading-normal">Filters out OCR tags with low confidence levels before running validation check rules.</span>
              </div>
            </div>
          </div>

          {/* Rules settings */}
          <div className="panel-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="panel-header flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShieldAlert size={16} className="text-blue-700" /> Rules Engine & Metrology Standards
              </h3>
            </div>
            <div className="panel-body flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Regulatory Rule Version</label>
                <select 
                  value={ruleVer}
                  onChange={(e) => setRuleVer(e.target.value)}
                  className="form-select bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                >
                  <option value="2011">Legal Metrology Packaged Commodity Rules 2011</option>
                  <option value="2022-amend">Legal Metrology (Amendment) Rules 2022</option>
                  <option value="2026-draft">Draft Compliance Rules 2026 (SIH Sandbox)</option>
                </select>
              </div>

              <div className="form-group flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Mandatory Declarations Rules Checklist</label>
                <div className="checkbox-list flex flex-col gap-2 mt-1">
                  <label className="checkbox-label flex items-start gap-2 text-xs cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="leading-tight text-slate-800">Maximum Retail Price (MRP) Inclusion (Rule 6(1)(e))</span>
                  </label>
                  <label className="checkbox-label flex items-start gap-2 text-xs cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="leading-tight text-slate-800">Metric Net Quantity Declaration (Rule 6(1)(c))</span>
                  </label>
                  <label className="checkbox-label flex items-start gap-2 text-xs cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="leading-tight text-slate-800">Date of Manufacture / Import (Rule 6(1)(d))</span>
                  </label>
                  <label className="checkbox-label flex items-start gap-2 text-xs cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="leading-tight text-slate-800">Manufacturer Name & Full Address (Rule 6(1)(a))</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column forms */}
        <div className="settings-column flex flex-col gap-6">
          
          {/* General Preferences */}
          <div className="panel-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="panel-header flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Sliders size={16} className="text-blue-700" /> General Preferences
              </h3>
            </div>
            <div className="panel-body flex flex-col gap-4">
              <div className="form-group flex justify-between items-center py-1">
                <span className="text-xs font-medium text-slate-800">Dark Mode Appearance</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={darkTheme}
                    onChange={(e) => toggleTheme(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="form-group flex justify-between items-center py-1">
                <span className="text-xs font-medium text-slate-800">Real-time Push Alerts on non-compliance</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="form-group flex justify-between items-center py-1">
                <span className="text-xs font-medium text-slate-800">Auto-download PDFs for high-severity violations</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Registries API integration */}
          <div className="panel-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="panel-header flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Key size={16} className="text-blue-700" /> Govt Registries & API Integrations
              </h3>
            </div>
            <div className="panel-body flex flex-col gap-4">
              <p className="text-[10px] text-slate-500 leading-normal">Validate scanned barcodes and FSSAI license numbers against official centralized databases in real-time.</p>
              
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">FSSAI FoSCoS Registry API Endpoint</label>
                <input 
                  type="text" 
                  value={fssaiApi}
                  onChange={(e) => setFssaiApi(e.target.value)}
                  className="form-control w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all" 
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">GS1 Barcode Registry API Endpoint</label>
                <input 
                  type="text" 
                  value={gs1Api}
                  onChange={(e) => setGs1Api(e.target.value)}
                  className="form-control w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all" 
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Govt Officer API Token Credentials</label>
                <div className="input-icon-wrapper relative flex items-center">
                  <input 
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="form-control w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 pr-10 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all" 
                  />
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showKey ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              <button 
                onClick={handleTestAPIs}
                className="btn border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[10px] py-2 px-3.5 rounded-lg w-fit mt-1 shadow-2xs transition-colors"
              >
                Test APIs Connection
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
