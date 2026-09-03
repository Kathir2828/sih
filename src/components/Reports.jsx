import React from 'react';
import { Calendar, CalendarDays, Building2, AlertTriangle, FileText, FileSpreadsheet } from 'lucide-react';

export default function Reports({ addToast }) {
  
  const handleDownload = (reportName, format) => {
    addToast('Generating Report', `Building audit package for ${reportName}.${format}...`, 'info');
    setTimeout(() => {
      // Direct mock file download
      window.open(`/api/reports/download/AUD-GENERIC`, '_blank');
      addToast('Download Complete', `${reportName}.${format} has been generated and saved.`, 'success');
    }, 1500);
  };

  return (
    <div className="view-section animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="view-header mb-6">
        <h1 className="view-title font-display text-2xl font-extrabold tracking-tight">Compliance Reports & Audit Exports</h1>
        <p className="view-subtitle text-slate-500 text-xs mt-1">Generate official Legal Metrology compliance certificates, audit logs, and brand summary reports.</p>
      </div>

      <div className="reports-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="report-download-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="report-icon-box w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-500 flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div className="report-details flex-1">
            <h3 className="font-display text-sm font-extrabold text-slate-850 dark:text-slate-100">Weekly Compliance Digest</h3>
            <p className="text-[11px] text-slate-500 leading-normal mt-1">Aggregated validation statistics, error trends, and enforcement alerts for the current week.</p>
            <span className="meta-label text-[9px] text-slate-400 font-semibold block mt-3">Updated: Today at 08:00 AM</span>
          </div>
          <div className="report-download-actions flex gap-2 mt-auto">
            <button onClick={() => handleDownload('Weekly_Compliance_Digest', 'pdf')} className="btn border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-semibold text-[10px] py-2 px-3 rounded-lg flex-1 flex justify-center items-center gap-1">
              <FileText size={12} /> Download PDF
            </button>
            <button onClick={() => handleDownload('Weekly_Compliance_Digest', 'csv')} className="btn border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-semibold text-[10px] py-2 px-3 rounded-lg flex-1 flex justify-center items-center gap-1">
              <FileSpreadsheet size={12} /> Export CSV
            </button>
          </div>
        </div>

        <div className="report-download-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="report-icon-box w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-650 flex items-center justify-center">
            <CalendarDays size={24} />
          </div>
          <div className="report-details flex-1">
            <h3 className="font-display text-sm font-extrabold text-slate-850 dark:text-slate-100">Monthly Metrology Audit Report</h3>
            <p className="text-[11px] text-slate-500 leading-normal mt-1">Complete dataset summary of commodity audits, inspector activity logs, and brand compliance standings.</p>
            <span className="meta-label text-[9px] text-slate-400 font-semibold block mt-3">Updated: 1 Aug 2026</span>
          </div>
          <div className="report-download-actions flex gap-2 mt-auto">
            <button onClick={() => handleDownload('Monthly_Metrology_Report', 'pdf')} className="btn border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-semibold text-[10px] py-2 px-3 rounded-lg flex-1 flex justify-center items-center gap-1">
              <FileText size={12} /> Download PDF
            </button>
            <button onClick={() => handleDownload('Monthly_Metrology_Report', 'csv')} className="btn border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-semibold text-[10px] py-2 px-3 rounded-lg flex-1 flex justify-center items-center gap-1">
              <FileSpreadsheet size={12} /> Export CSV
            </button>
          </div>
        </div>

        <div className="report-download-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="report-icon-box w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div className="report-details flex-1">
            <h3 className="font-display text-sm font-extrabold text-slate-850 dark:text-slate-100">Brand-Wise Compliance Leaderboard</h3>
            <p className="text-[11px] text-slate-500 leading-normal mt-1">Ranks major manufacturing brands based on scanning compliance scores. Highlights high-risk manufacturers.</p>
            <span className="meta-label text-[9px] text-slate-400 font-semibold block mt-3">Updated: 24 Hours Ago</span>
          </div>
          <div className="report-download-actions flex gap-2 mt-auto">
            <button onClick={() => handleDownload('Brand_Compliance_Leaderboard', 'pdf')} className="btn border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-semibold text-[10px] py-2 px-3 rounded-lg flex-1 flex justify-center items-center gap-1">
              <FileText size={12} /> Download PDF
            </button>
            <button onClick={() => handleDownload('Brand_Compliance_Leaderboard', 'csv')} className="btn border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-semibold text-[10px] py-2 px-3 rounded-lg flex-1 flex justify-center items-center gap-1">
              <FileSpreadsheet size={12} /> Export CSV
            </button>
          </div>
        </div>

        <div className="report-download-card bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="report-icon-box w-12 h-12 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div className="report-details flex-1">
            <h3 className="font-display text-sm font-extrabold text-slate-850 dark:text-slate-100">Critical Metrology Infringement Records</h3>
            <p className="text-[11px] text-slate-500 leading-normal mt-1">Export details of packages flagged with extreme non-compliance (missing MRP, invalid sizes) for enforcement action.</p>
            <span className="meta-label text-[9px] text-slate-400 font-semibold block mt-3">Updated: Live stream</span>
          </div>
          <div className="report-download-actions flex gap-2 mt-auto">
            <button onClick={() => handleDownload('Metrology_Infringement_Records', 'pdf')} className="btn border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-semibold text-[10px] py-2 px-3 rounded-lg flex-1 flex justify-center items-center gap-1">
              <FileText size={12} /> Download PDF
            </button>
            <button onClick={() => handleDownload('Metrology_Infringement_Records', 'csv')} className="btn border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-semibold text-[10px] py-2 px-3 rounded-lg flex-1 flex justify-center items-center gap-1">
              <FileSpreadsheet size={12} /> Export CSV
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
