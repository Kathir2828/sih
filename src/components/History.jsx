import React, { useState } from 'react';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function History({ historyList, setHistoryList, viewReportRecord, addToast }) {
  const [searchVal, setSearchVal] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const handleExportCSV = () => {
    addToast('CSV Exporting', 'Compiling spreadsheet audit log datasets...', 'info');
    setTimeout(() => {
      // Mock CSV data download link trigger
      const csvContent = "data:text/csv;charset=utf-8," 
        + ["Audit ID,Product,Category,Scan Date,Compliance Score,Status"].join(",") + "\n"
        + historyList.map(h => [h.id, h.name, h.category, h.date, `${h.score}%`, h.status].join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Metrology_Audit_Logs_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('CSV Exported', 'CSV logs saved successfully.', 'success');
    }, 1200);
  };

  // Filter history logic
  const filteredList = historyList.filter(row => {
    const matchSearch = row.name.toLowerCase().includes(searchVal.toLowerCase()) || row.id.toLowerCase().includes(searchVal.toLowerCase());
    
    let matchStatus = true;
    if (filterStatus === 'compliant') matchStatus = row.score === 100;
    if (filterStatus === 'non-compliant') matchStatus = row.score < 100;

    let matchCategory = true;
    if (filterCategory === 'food') matchCategory = row.category.includes('Food');
    if (filterCategory === 'cosmetics') matchCategory = row.category.includes('Cosmetics') || row.category.includes('Personal');
    if (filterCategory === 'spices') matchCategory = row.category.includes('Spices');

    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="view-section animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="view-header flex justify-between items-start mb-6">
        <div>
          <h1 className="view-title font-display text-2xl font-extrabold tracking-tight">Product Compliance Records</h1>
          <p className="view-subtitle text-slate-500 text-xs mt-1">Search, filter, and audit past packaged commodity scan records and AI-generated reports.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="btn border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Download size={14} /> Export All to CSV
        </button>
      </div>

      {/* Filter and search bar controls */}
      <div className="filters-card bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="filters-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="form-group flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Search Product / Brand</label>
            <div className="input-icon-wrapper relative flex items-center">
              <Search className="input-icon absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input 
                type="text" 
                id="history-search-react"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="form-control w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all" 
                placeholder="Search name, brand, bar..."
              />
            </div>
          </div>
          
          <div className="form-group flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Compliance Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="compliant">Compliant (100%)</option>
              <option value="non-compliant">Non-Compliant (Violations)</option>
            </select>
          </div>

          <div className="form-group flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Product Category</label>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-select w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            >
              <option value="all">All Categories</option>
              <option value="food">Food & Beverages</option>
              <option value="cosmetics">Cosmetics & Personal Care</option>
              <option value="spices">Spices & Condiments</option>
            </select>
          </div>

          <div className="form-group flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Time Period</label>
            <select 
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="form-select w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* History table panel */}
      <div className="panel-card bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-200 overflow-hidden p-0">
        <div className="table-responsive w-full overflow-x-auto">
          <table className="history-table w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Scan Date</th>
                <th className="px-5 py-3.5">Compliance Score</th>
                <th className="px-5 py-3.5">Violations Found</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">No matching scan records located.</td>
                </tr>
              ) : (
                filteredList.map(row => {
                  const isCompliant = row.score === 100;
                  return (
                    <tr key={row.id} className="border-b border-slate-150 last:border-b-0 hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="table-product-cell flex items-center gap-3">
                          <div className={`table-thumbnail w-9 h-9 rounded bg-[#fdf6e2] flex items-center justify-center flex-shrink-0 text-[7px] font-mono leading-none border select-none ${row.productKey === 'oats' ? 'bg-[#fdf6e2] border-emerald-500/20 text-[#15803d]' : (row.productKey === 'masala' ? 'bg-[#fff5eb] border-red-500/20 text-[#b91c1c]' : 'bg-[#faf5ff] border-purple-500/20 text-[#7c3aed]')}`}>
                            {row.productKey.toUpperCase()}
                          </div>
                          <strong className="font-bold text-slate-900">{row.name}</strong>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{row.category}</td>
                      <td className="px-5 py-4 text-slate-600">{row.date}</td>
                      <td className="px-5 py-4">
                        <span className={`score-badge text-[10px] font-bold px-2 py-0.5 rounded-full ${isCompliant ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (row.score >= 70 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200')}`}>
                          {row.score}%
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">{row.violationsCount} violations</td>
                      <td className="px-5 py-4">
                        <span className={`status-badge text-[10px] font-bold px-2.5 py-0.5 rounded ${isCompliant ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button 
                          onClick={() => viewReportRecord(row)}
                          className="btn border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1 rounded text-[10px] font-bold shadow-2xs transition-colors"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination bar */}
        <div className="table-pagination flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-white text-xs">
          <span className="pagination-info text-slate-500">Showing <strong>1</strong> to <strong>{filteredList.length}</strong> of <strong>{filteredList.length}</strong> records</span>
          <div className="pagination-controls flex gap-2">
            <button className="btn border border-slate-250 px-2.5 py-1 rounded text-[10px] disabled:opacity-40" disabled><ChevronLeft size={14} /> Previous</button>
            <button className="btn bg-blue-700 text-white font-bold px-3 py-1 rounded text-[10px]">1</button>
            <button className="btn border border-slate-250 px-2.5 py-1 rounded text-[10px] disabled:opacity-40" disabled>Next <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

    </div>
  );
}
