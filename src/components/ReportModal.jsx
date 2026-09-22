import React from 'react';
import { FileBarChart, X, Download, Share2, AlertTriangle, AlertCircle, Wrench, Quote } from 'lucide-react';

export default function ReportModal({ record, onClose, addToast }) {
  if (!record) return null;

  const isCompliant = record.score === 100;

  // Handle mock PDF file download
  const handleDownloadPDF = () => {
    addToast('Generating PDF', 'Building PDF audit report certificate...', 'info');
    setTimeout(() => {
      window.open(`/api/reports/download/${record.id || 'AUD-DOWNLOAD'}`, '_blank');
      addToast('Download Complete', 'Compliance report PDF downloaded successfully.', 'success');
      onClose();
    }, 1200);
  };

  // Handle copy shared link to clipboard
  const handleShare = () => {
    const link = `https://compliancescan.gov.in/reports/share/${record.id || 'AUD-123'}`;
    navigator.clipboard.writeText(link).then(() => {
      addToast('Copied Link', 'Audit report link copied to clipboard.', 'success');
    });
  };

  // Generate mock summaries based on product keys & automated audit reports
  const getAiSummaryText = () => {
    if (record.crossLabelReport?.isShrinkflation) {
      return `CRITICAL ANOMALY: Cross-label consistency analysis identified potential shrinkflation. ${record.crossLabelReport.comparisonSummary} Scanned confidence-weighted score: ${record.score}%.`;
    }
    if (record.tamperZone?.detected) {
      return `DEFACEMENT LOCALIZED: Automated thermal heatmap identified localized physical tampering (${record.tamperZone.type}) on field "${record.tamperZone.targetField}" with ${record.tamperZone.confidence}% confidence. Overall confidence-weighted score: ${record.score}%.`;
    }
    if (record.productKey === 'tamil_oil' || record.selectedLanguage === 'tam') {
      return 'Tamil Regional Language Label verified: Successfully recognized mandatory statutory declarations in Tamil (அதிகபட்ச சில்லறை விலை, நிகர அளவு, தயாரிப்பு தேதி). All Rule 6 clauses confirmed compliant with bilingual Legal Metrology provisions.';
    }
    if (record.productKey === 'hindi_ghee' || record.selectedLanguage === 'hin') {
      return 'Hindi Regional Language Label verified: Successfully recognized mandatory statutory declarations in Hindi (अधिकतम खुदरा मूल्य, शुद्ध मात्रा, निर्माण तिथि). All Rule 6 clauses confirmed compliant under National Language Metrology provisions.';
    }
    if (record.productKey === 'oats') {
      return 'The OCR engine detected all mandatory label fields with an average layout parsing confidence of 94%. Net weight, MRP, manufacturer, and consumer details were located, validated, and confirmed to meet regulatory standards.';
    } else if (record.productKey === 'masala') {
      return 'Layout segmentation isolated 8 items. Found critical FSSAI licensing errors. License number contains alphabetic characters (invalid format). Helpline email tag is missing. Legal metrology compliance rating stands at 75%.';
    } else if (isCompliant) {
      return `All Rule 6 mandatory declarations verified compliant with confidence-weighted score of ${record.score}%. Cross-label consistency matrix verified against manufacturer master registration.`;
    } else {
      return `AI parsing detected packaging defects. Confidence-weighted compliance score stands at ${record.score}%. Identified ${record.violationsCount || 'multiple'} mandatory statutory non-conformities under Legal Metrology Rules, 2011.`;
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-[#090d16]/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      <div className="modal-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="modal-header px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
          <div className="header-details flex items-center gap-2.5">
            <FileBarChart className="text-blue-700 w-5 h-5" />
            <h2 className="font-display text-sm font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-wider">Regulatory Compliance Certificate</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-650"><X size={18} /></button>
        </div>
        
        <div className="modal-body p-6 overflow-y-auto flex flex-col gap-5 text-xs">
          
          {/* Status banner */}
          <div className={`report-status-banner flex justify-between items-center p-4.5 rounded-xl text-white ${isCompliant ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-gradient-to-r from-red-600 to-red-500'}`}>
            <div className="banner-content flex flex-col gap-0.5 max-w-[70%]">
              <h3 className="font-display text-sm font-extrabold tracking-wider uppercase">
                {isCompliant ? 'CONFORMITY PASSED' : 'NON-COMPLIANCE DETECTED'}
              </h3>
              <p className="text-[10px] opacity-90 leading-normal">
                {isCompliant 
                  ? 'The product successfully meets all mandatory declaration requirements under Legal Metrology Rules, 2011.'
                  : `Product label infringes packaging regulations. Found ${record.score < 70 ? 'multiple' : 'minor'} mandatory formatting errors.`
                }
              </p>
            </div>
            <div className="banner-score flex flex-col items-center leading-none bg-white/20 border border-white/25 px-3.5 py-2 rounded-lg">
              <span className="font-display text-lg font-extrabold">{record.score}%</span>
              <span className="text-[7px] font-bold uppercase tracking-wider mt-1">Audit Score</span>
            </div>
          </div>
          
          {/* Metadata grid */}
          <div className="report-metadata-grid grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="meta-item flex flex-col gap-0.5">
              <span className="label text-[9px] font-bold text-slate-400 uppercase tracking-wider">Product Name</span>
              <strong className="text-slate-800 dark:text-slate-200">{record.name}</strong>
            </div>
            <div className="meta-item flex flex-col gap-0.5">
              <span className="label text-[9px] font-bold text-slate-400 uppercase tracking-wider">Audit ID</span>
              <strong className="text-slate-800 dark:text-slate-200">{record.id || 'AUD-MOCK'}</strong>
            </div>
            <div className="meta-item flex flex-col gap-0.5">
              <span className="label text-[9px] font-bold text-slate-400 uppercase tracking-wider">Inspection Date</span>
              <strong className="text-slate-800 dark:text-slate-200">{record.date}</strong>
            </div>
            <div className="meta-item flex flex-col gap-0.5">
              <span className="label text-[9px] font-bold text-slate-400 uppercase tracking-wider">AI Scanner Model</span>
              <strong className="text-slate-850 dark:text-slate-200">LM-YOLOv8</strong>
            </div>
          </div>

          {/* AI Assessment text */}
          <div className="report-section flex flex-col gap-2">
            <h3 className="font-display text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
              <Quote className="text-blue-700 w-4 h-4 flex-shrink-0" /> AI Assessment Summary
            </h3>
            <div className="report-ai-summary-box bg-blue-50/50 dark:bg-slate-900 border-l-4 border-blue-600 p-3.5 rounded-r-lg">
              <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-350 font-medium">{getAiSummaryText()}</p>
            </div>
          </div>

          {/* Violations warnings */}
          {!isCompliant && (
            <div className="report-section flex flex-col gap-2">
              <h3 className="font-display text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                <AlertCircle className="text-red-500 w-4 h-4 flex-shrink-0" /> Identified Infringements
              </h3>
              <div className="violations-cards-list flex flex-col gap-2.5">
                
                {/* Tamper Heatmap Infringement Card */}
                {record.tamperZone?.detected && (
                  <div className="violation-card-item bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900/40 rounded-xl p-3 flex gap-3">
                    <AlertTriangle className="text-red-600 flex-shrink-0" size={16} />
                    <div className="violation-details">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-red-700">Tamper Anomaly Localized ({record.tamperZone.confidence}% Confidence)</h4>
                        <span className="text-[9px] bg-red-200 text-red-900 font-extrabold px-1.5 py-0.2 rounded font-mono">
                          {record.tamperZone.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-normal mt-0.5">
                        {record.tamperZone.description} Target Field: <strong className="font-mono">{record.tamperZone.targetField}</strong>. Thermal heatmap highlights localized physical strike-through or label alteration violating Rule 6 authenticity provisions.
                      </p>
                    </div>
                  </div>
                )}

                {/* Shrinkflation / Cross-Label Infringement Card */}
                {record.crossLabelReport?.isShrinkflation && (
                  <div className="violation-card-item bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900/40 rounded-xl p-3 flex gap-3">
                    <AlertTriangle className="text-red-600 flex-shrink-0" size={16} />
                    <div className="violation-details">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-red-700">Deceptive Downsizing / Shrinkflation Detected</h4>
                        <span className="text-[9px] bg-red-200 text-red-900 font-extrabold px-1.5 py-0.2 rounded font-mono">
                          {record.crossLabelReport.netQtyDeltaPercent}% NET QTY
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-normal mt-0.5">
                        {record.crossLabelReport.comparisonSummary} Scanned net quantity contravenes registered consumer volume standards.
                      </p>
                    </div>
                  </div>
                )}
                {(record.productKey === 'masala' || record.fields.fssaiLicense === '1234F567891234') && (
                  <>
                    <div className="violation-card-item bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 rounded-xl p-3 flex gap-3">
                      <AlertTriangle className="text-red-500 flex-shrink-0" size={16} />
                      <div className="violation-details">
                        <h4 className="font-bold text-red-600">Invalid FSSAI License Format</h4>
                        <p className="text-slate-500 leading-normal mt-0.5">FSSAI license must represent a 14-digit numeric code. Extracted code "{record.fields.fssaiLicense}" contains illegal alphabetical characters.</p>
                      </div>
                    </div>
                    <div className="violation-card-item bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 rounded-xl p-3 flex gap-3">
                      <AlertTriangle className="text-red-500 flex-shrink-0" size={16} />
                      <div className="violation-details">
                        <h4 className="font-bold text-red-600">Missing Helpline Email Support</h4>
                        <p className="text-slate-500 leading-normal mt-0.5">Legal Metrology Packaged Commodity Rule 6(1)(g) mandates printing of both telephone number and email helpline for consumer care redressal.</p>
                      </div>
                    </div>
                  </>
                )}

                {(record.productKey === 'cream' || record.fields.netQty === '1.7 oz') && (
                  <>
                    <div className="violation-card-item bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 rounded-xl p-3 flex gap-3">
                      <AlertTriangle className="text-red-500 flex-shrink-0" size={16} />
                      <div className="violation-details">
                        <h4 className="font-bold text-red-600">Non-Metric Quantity Units (Rule 13)</h4>
                        <p className="text-slate-500 leading-normal mt-0.5">Packaged commodities sold in India must declare quantities in standardized metric units (grams, kg, ml, liters). Ounces ("1.7 oz") are forbidden on principal displays.</p>
                      </div>
                    </div>
                    <div className="violation-card-item bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 rounded-xl p-3 flex gap-3">
                      <AlertTriangle className="text-red-500 flex-shrink-0" size={16} />
                      <div className="violation-details">
                        <h4 className="font-bold text-red-600">MRP Value Missing (Rule 6(1)(e))</h4>
                        <p className="text-slate-500 leading-normal mt-0.5">Maximum retail price tag is completely absent. Commodity rules mandate price declarations inclusive of all central/state taxes.</p>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>
          )}

          {/* AI Corrections section */}
          {!isCompliant && (
            <div className="report-section flex flex-col gap-2">
              <h3 className="font-display text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                <Wrench className="text-emerald-500 w-4 h-4 flex-shrink-0" /> Suggested Label Corrections (AI Generated)
              </h3>
              <div className="corrections-box bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <ul className="flex flex-col gap-2 list-none pl-0">
                  {record.productKey === 'masala' && (
                    <>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-600 font-bold">→</span> <span>Re-print labels replacing FSSAI code "1234F567891234" with correct 14-digit numeric license code.</span></li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-600 font-bold">→</span> <span>Insert a valid consumer care email address details block on display panel.</span></li>
                    </>
                  )}
                  {record.productKey === 'cream' && (
                    <>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-600 font-bold">→</span> <span>Convert net capacity "1.7 oz" to metric "50 ml" (or "50g") in standard rule fonts.</span></li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-600 font-bold">→</span> <span>Print price tags following structure: "MRP Rs. [Value] (incl. of all taxes)".</span></li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

        </div>
        
        <div className="modal-footer px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
          <button onClick={handleDownloadPDF} className="btn border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-bold text-xs py-2 px-4.5 rounded-lg flex items-center gap-1.5"><Download size={14} /> Download PDF Report</button>
          <button onClick={handleShare} className="btn border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-bold text-xs py-2 px-4.5 rounded-lg flex items-center gap-1.5"><Share2 size={14} /> Share Report</button>
          <button onClick={onClose} className="btn btn-primary bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs py-2 px-4.5 rounded-lg">Close Report</button>
        </div>
      </div>
      
    </div>
  );
}
