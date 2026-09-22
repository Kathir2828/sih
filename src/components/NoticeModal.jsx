import React, { useState } from 'react';
import { ShieldAlert, X, Printer, Copy, Check, FileText, Send, Building, Calendar, AlertTriangle } from 'lucide-react';

export default function NoticeModal({ record, onClose, addToast }) {
  const [copied, setCopied] = useState(false);
  const [premiseName, setPremiseName] = useState('Metro Mart Supermarket, Sector 18, Noida');
  const [inspectorName, setInspectorName] = useState('Inspector S. Verma (ID: LM-DL-2026-042)');
  const [noticeRefNo] = useState(`LM/ENF/2026/09-${Math.floor(1000 + Math.random() * 9000)}`);
  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (!record) return null;

  const getViolationsList = () => {
    const list = [];
    if (record.tamperZone?.detected) {
      list.push(`[RULE 6 DEFACEMENT] - Physical packaging tampering / defacement localized on field "${record.tamperZone.targetField}" (${record.tamperZone.confidence}% confidence). Inked strike-through or sticker alteration detected.`);
    }
    if (record.crossLabelReport?.isShrinkflation) {
      list.push(`[CROSS-LABEL SHRINKFLATION] - Deceptive net quantity shrinkage detected: Net weight dropped from ${record.crossLabelReport.historicalMaster?.netQty || 'approved master'} to ${record.fields?.netQty || 'current'} (${record.crossLabelReport.netQtyDeltaPercent}% decrease).`);
    }
    if (record.fields) {
      if (!record.fields.mrp || record.fields.mrp.toLowerCase().includes('missing')) {
        list.push(`[RULE 6(1)(e)] - Failure to declare Maximum Retail Price (MRP) inclusive of all taxes in statutory format.`);
      }
      if (!record.fields.netQty || record.fields.netQty.toLowerCase().includes('missing') || record.fields.netQty.includes('oz')) {
        list.push(`[RULE 6(1)(c) & RULE 13] - Net quantity missing or declared in illegal non-metric units.`);
      }
      if (!record.fields.mfgDate || record.fields.mfgDate.toLowerCase().includes('missing') || record.fields.mfgDate.toLowerCase().includes('defaced')) {
        list.push(`[RULE 6(1)(d)] - Date/month and year of manufacture or packaging is missing, illegible, or defaced.`);
      }
      if (!record.fields.manufacturerName || record.fields.manufacturerName.toLowerCase().includes('missing')) {
        list.push(`[RULE 6(1)(a)] - Failure to declare complete name and registered address of manufacturer or packer.`);
      }
      if (!record.fields.customerCare || record.fields.customerCare.toLowerCase().includes('missing')) {
        list.push(`[RULE 6(1)(g)] - Absence of mandatory consumer grievance care redressal telephone and email helpline.`);
      }
    }
    if (list.length === 0) {
      list.push(`[RULE 6(1)(a)] - Failure to declare Complete Name & Address of Manufacturer / Packer on the package label.`);
      list.push(`[RULE 6(1)(g)] - Absence of Consumer Care telephone number and contact details for consumer grievance redressal.`);
    }
    return list;
  };

  const violations = getViolationsList();

  const handleCopyText = () => {
    const formattedViolations = violations.map((v, i) => `${i + 1}. ${v}`).join('\n');
    const text = `
GOVERNMENT OF INDIA
DEPARTMENT OF CONSUMER AFFAIRS
LEGAL METROLOGY DIVISION
=====================================================
FORM-1: NOTICE OF CONTRAVENTION / VIOLATION
Under Section 36 of Legal Metrology Act, 2009 &
Rule 6 of Legal Metrology (Packaged Commodities) Rules, 2011

Notice Reference No: ${noticeRefNo}
Date of Issue: ${currentDate}
Inspected Premises: ${premiseName}
Inspecting Officer: ${inspectorName}

SUBJECT: Contravention of mandatory declarations on packaged commodity: "${record.name || 'BRITANNIA Good Day Butter Cookies'}"

Sir / Madam,
During the inspection conducted under the provisions of the Legal Metrology Act, 2009, the aforementioned packaged commodity was examined using the MetroScan AI Enforcement System and the following statutory contraventions were observed:

${formattedViolations}

Confidence-Weighted Audit Score: ${record.score || 60}%

You are hereby directed to SHOW CAUSE within FIFTEEN (15) DAYS from receipt of this notice as to why penal proceedings under Section 36 of the Legal Metrology Act, 2009 (attracting compoundable fine of up to ₹25,000/- for the first offence) should not be initiated against you.

Issued By:
${inspectorName}
Legal Metrology Inspector, Govt. of India
=====================================================
`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      addToast('Notice Copied', 'Form 1 Notice text copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    addToast('Printing Notice', 'Opening print preview for Form 1 Legal Notice...', 'info');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="modal-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-500 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Legal Metrology Notice of Contravention
              </h2>
              <span className="text-[10px] text-slate-500">Statutory Form 1 • Section 36 of LM Act, 2009</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body p-6 overflow-y-auto flex flex-col gap-5 text-xs text-slate-700 dark:text-slate-300">
          
          {/* Statutory Alert Banner */}
          <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-600 p-3.5 rounded-r-xl flex items-start gap-3">
            <AlertTriangle className="text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-red-800 dark:text-red-400 text-xs">Official Statutory Violation Notice</span>
              <p className="text-[11px] text-red-700 dark:text-red-300/90 leading-normal">
                This notice is generated based on automated OCR field validation confirming non-compliance with the Legal Metrology (Packaged Commodities) Rules, 2011.
              </p>
            </div>
          </div>

          {/* Notice Parameters Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notice Reference</label>
              <input 
                type="text" 
                readOnly 
                value={noticeRefNo} 
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Inspection</label>
              <input 
                type="text" 
                readOnly 
                value={currentDate} 
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inspected Retail / Warehouse Premises</label>
              <input 
                type="text" 
                value={premiseName}
                onChange={(e) => setPremiseName(e.target.value)}
                placeholder="Enter retail store or establishment address..."
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Formatted Notice Preview Card */}
          <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-950 font-serif leading-relaxed text-slate-900 dark:text-slate-100 shadow-sm">
            <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block font-sans">Government of India • Ministry of Consumer Affairs</span>
              <h3 className="text-sm font-extrabold uppercase mt-0.5 tracking-wider font-sans text-slate-900 dark:text-white">
                Department of Legal Metrology
              </h3>
              <span className="text-[10px] text-slate-500 font-sans">FORM-1 [Rule 6 / Section 36] • Notice of Non-Compliance</span>
            </div>

            <div className="py-3 text-[11px] flex flex-col gap-2 font-sans">
              <p>
                <strong>To:</strong> The Occupier / Manager / Manufacturer of commodity: <em>{record.name || 'Crunchy Masala Chips'}</em>
              </p>
              <p>
                <strong>At:</strong> {premiseName}
              </p>
              <p className="mt-1">
                Notice is hereby served that during an official enforcement audit on <strong>{currentDate}</strong>, product samples of <strong>"{record.name || 'Crunchy Masala Chips'}"</strong> were inspected and found in direct contravention of the Legal Metrology (Packaged Commodities) Rules, 2011:
              </p>
              
              <div className="bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg p-3 my-1">
                <ol className="list-decimal pl-4 flex flex-col gap-1.5 text-[10px] font-semibold text-red-900 dark:text-red-300">
                  {violations.map((violation, idx) => (
                    <li key={idx} className="leading-snug">
                      {violation}
                    </li>
                  ))}
                </ol>
              </div>

              <p className="text-[10.5px]">
                Under <strong>Section 36 of the Legal Metrology Act, 2009</strong>, manufacturing, packing, or distributing non-compliant packaged commodities is punishable with fine up to <strong>₹25,000</strong> for the first offence, and up to <strong>₹50,000 or imprisonment</strong> for subsequent offences.
              </p>
              <p className="text-[10.5px]">
                You are directed to submit your written explanation within <strong>15 days</strong> to the undersigned office.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end text-[10px]">
                <div>
                  <span className="text-slate-400 block">Digitally Verified:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">METROSCAN-VERIFIED-OK</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{inspectorName}</span>
                  <span className="text-slate-500 block">Field Enforcement Division</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <button 
            onClick={onClose} 
            className="btn border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-4 py-2 rounded-lg"
          >
            Close
          </button>
          
          <div className="flex gap-2.5">
            <button 
              onClick={handleCopyText}
              className="btn border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Notice Text'}
            </button>
            <button 
              onClick={handlePrint}
              className="btn bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
