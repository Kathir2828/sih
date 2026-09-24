import React, { useEffect, useRef } from 'react';
import { RefreshCw, PieChart, BarChart3, TrendingUp, Activity } from 'lucide-react';
import Chart from 'chart.js/auto';

export default function Analytics({ historyList, darkTheme }) {
  const chartRefs = {
    ratio: useRef(null),
    category: useRef(null),
    daily: useRef(null),
    radar: useRef(null)
  };

  const chartInstances = useRef({});

  const refreshCharts = () => {
    const isDark = darkTheme;
    const textThemeColor = isDark ? '#94a3b8' : '#64748b';
    const gridThemeColor = isDark ? '#232c40' : '#e2e8f0';

    // 1. Ratio doughnut
    if (chartRefs.ratio.current) {
      if (chartInstances.current.ratio) chartInstances.current.ratio.destroy();
      
      const compliant = historyList.filter(h => h.score === 100).length + 1214;
      const noncompliant = historyList.filter(h => h.score < 100).length + 216;

      chartInstances.current.ratio = new Chart(chartRefs.ratio.current.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Compliant Products', 'Non-Compliant Products'],
          datasets: [{
            data: [compliant, noncompliant],
            backgroundColor: ['#10b981', '#ef4444'],
            borderColor: isDark ? '#121826' : '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textThemeColor } }
          }
        }
      });
    }

    // 2. Category violations bar
    if (chartRefs.category.current) {
      if (chartInstances.current.category) chartInstances.current.category.destroy();

      chartInstances.current.category = new Chart(chartRefs.category.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Food & Drink', 'Spices & Conds', 'Cosmetics', 'Electronics', 'Baby Food', 'Pesticides'],
          datasets: [
            { label: 'Net Qty Violations', data: [4, 8, 12, 2, 0, 1], backgroundColor: '#ef4444' },
            { label: 'MRP Violations', data: [9, 14, 18, 5, 1, 3], backgroundColor: '#8b5cf6' }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { position: 'bottom', labels: { color: textThemeColor } }
          },
          scales: {
            x: { stacked: true, grid: { color: gridThemeColor }, ticks: { color: textThemeColor } },
            y: { stacked: true, grid: { display: false }, ticks: { color: textThemeColor } }
          }
        }
      });
    }

    // 3. Daily Line
    if (chartRefs.daily.current) {
      if (chartInstances.current.daily) chartInstances.current.daily.destroy();

      chartInstances.current.daily = new Chart(chartRefs.daily.current.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Aug 21', 'Aug 22', 'Aug 23', 'Aug 24', 'Aug 25', 'Aug 26', 'Aug 27'],
          datasets: [
            { label: 'Compliant Scans', data: [82, 94, 73, 112, 105, 98, 120], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.05)', fill: true, tension: 0.3 },
            { label: 'Infringements Tagged', data: [12, 18, 9, 24, 15, 11, 14], borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.05)', fill: true, tension: 0.3 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textThemeColor } }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: textThemeColor } },
            y: { grid: { color: gridThemeColor }, ticks: { color: textThemeColor } }
          }
        }
      });
    }

    // 4. Radar fail percentage
    if (chartRefs.radar.current) {
      if (chartInstances.current.radar) chartInstances.current.radar.destroy();

      chartInstances.current.radar = new Chart(chartRefs.radar.current.getContext('2d'), {
        type: 'radar',
        data: {
          labels: ['Net Quantity', 'MRP Tag', 'Mfg Date', 'Expiry Date', 'Address Details', 'Consumer Support', 'FSSAI Details'],
          datasets: [{
            label: 'Violation Frequency (%)',
            data: [25, 45, 15, 10, 32, 28, 52],
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            r: {
              grid: { color: gridThemeColor },
              angleLines: { color: gridThemeColor },
              pointLabels: { color: textThemeColor, font: { size: 10 } }
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    refreshCharts();
    return () => {
      // Clean up on unmount
      Object.keys(chartInstances.current).forEach(key => {
        if (chartInstances.current[key]) {
          chartInstances.current[key].destroy();
        }
      });
    };
  }, [historyList, darkTheme]);

  return (
    <div className="view-section animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="view-header flex justify-between items-start mb-6">
        <div>
          <h1 className="view-title font-display text-2xl font-extrabold tracking-tight">Compliance Analytics & Violations Heatmap</h1>
          <p className="view-subtitle text-slate-500 text-xs mt-1">Detailed metric visualisations of parsed commodities, audit status, and common failure rates.</p>
        </div>
        <button 
          onClick={refreshCharts}
          className="btn border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-2xs transition-colors"
        >
          <RefreshCw size={14} /> Refresh Charts
        </button>
      </div>

      <div className="analytics-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="panel-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="panel-header flex justify-between items-center mb-4">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-900">Compliant vs Non-Compliant Products</h3>
            <PieChart className="text-blue-700 w-5 h-5 flex-shrink-0" />
          </div>
          <div className="chart-canvas-container h-64 relative">
            <canvas ref={chartRefs.ratio}></canvas>
          </div>
        </div>

        <div className="panel-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="panel-header flex justify-between items-center mb-4">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-900">Violations Categorized by Commodity Type</h3>
            <BarChart3 className="text-emerald-500 w-5 h-5 flex-shrink-0" />
          </div>
          <div className="chart-canvas-container h-64 relative">
            <canvas ref={chartRefs.category}></canvas>
          </div>
        </div>

        <div className="panel-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="panel-header flex justify-between items-center mb-4">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-900">Daily Scans & Detection Rates (August 2026)</h3>
            <TrendingUp className="text-blue-600 w-5 h-5 flex-shrink-0" />
          </div>
          <div className="chart-canvas-container h-64 relative">
            <canvas ref={chartRefs.daily}></canvas>
          </div>
        </div>

        <div className="panel-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="panel-header flex justify-between items-center mb-4">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-900">Metrology Rule Failure Rates (Percentage)</h3>
            <Activity className="text-red-500 w-5 h-5 flex-shrink-0" />
          </div>
          <div className="chart-canvas-container h-64 relative">
            <canvas ref={chartRefs.radar}></canvas>
          </div>
        </div>

      </div>

    </div>
  );
}
