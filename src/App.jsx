import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Bell, Moon, Sun, Menu, User, Lock, LogOut, 
  HelpCircle, LayoutDashboard, ScanLine, History as HistoryIcon, 
  BarChart3, FileText, Settings as SettingsIcon, MessageSquare, 
  X, Bot, Send
} from 'lucide-react';

// Import sub-components
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import History from './components/History';
import Analytics from './components/Analytics';
import Reports from './components/Reports';
import Settings from './components/Settings';
import ReportModal from './components/ReportModal';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [darkTheme, setDarkTheme] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', text: 'Scan completed: Spicy Fusion Masala failed 2 regulations.', time: '5 mins ago', unread: true },
    { id: 2, type: 'success', text: 'OCR AI engine successfully calibrated.', time: '1 hour ago', unread: true }
  ]);
  
  // Scans history, loaded from backend
  const [historyList, setHistoryList] = useState([]);
  
  // Scanner state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [ocrFields, setOcrFields] = useState({
    productName: '', netQty: '', mrp: '', mfgDate: '', expiryDate: '',
    manufacturerName: '', customerCare: '', fssaiLicense: '', batchNumber: ''
  });
  
  // Selected preset rule
  const [rulePreset, setRulePreset] = useState('standard-lm');
  
  // Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: 'Namaste! I am your Legal Metrology Compliance Assistant. How can I help you verify commodity declarations or understand the Packaged Commodity Rules 2011 today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Toasts state
  const [toasts, setToasts] = useState([]);
  
  // Active Report Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRecord, setModalRecord] = useState(null);

  // Sync dark theme to HTML element
  const toggleTheme = (isDark) => {
    setDarkTheme(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toast notifier helper
  const addToast = (title, message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load history list on startup
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error("Failed to fetch scan history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Default dark theme detection
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    toggleTheme(prefersDark);
  }, []);

  // Set selected product to scan
  const loadDemoProduct = (productKey) => {
    setMobileMenuOpen(false);
    
    // Config preset mapper
    let preset = 'standard-lm';
    if (productKey === 'cream') preset = 'cosmetics-rules';
    setRulePreset(preset);

    // Call API helper to load details
    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateKey: productKey })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setSelectedProduct({
          key: productKey,
          name: productKey === 'oats' ? "Nature's Harvest Oats" : (productKey === 'masala' ? "Spicy Fusion Masala" : "Glow Radiant Face Cream"),
          bgClass: data.bgClass,
          boxes: data.boxes,
          fields: data.fields,
          confidence: data.ocrConfidence
        });
        
        // Reset scanner states
        setOcrConfidence(0);
        setOcrFields({
          productName: '', netQty: '', mrp: '', mfgDate: '', expiryDate: '',
          manufacturerName: '', customerCare: '', fssaiLicense: '', batchNumber: ''
        });

        setActiveView('scanner');
        addToast('Demo Product Loaded', `Loaded template for scanning: ${productKey.toUpperCase()}`, 'success');
      }
    })
    .catch(err => {
      addToast('Error', 'Failed to load product template', 'danger');
      console.error(err);
    });
  };

  // Chat assistant query sender
  const handleSendChatMessage = async (textToSend = '') => {
    const text = textToSend || chatInput.trim();
    if (!text) return;

    if (!textToSend) setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          setChatMessages(prev => [...prev, { sender: 'assistant', text: data.response }]);
        }, 300);
      }
    } catch (err) {
      console.error("Chatbot failed", err);
    }
  };

  // Open modal for specific record
  const viewReportRecord = (record) => {
    setModalRecord(record);
    setModalOpen(true);
  };

  // Clear unreads
  const clearNotifications = () => {
    setNotifications([]);
    addToast('Info', 'Cleared all notifications', 'success');
  };

  return (
    <div className={`app-container min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col`}>
      
      {/* Top Header Navigation */}
      <header className="top-nav h-16 flex items-center justify-between bg-white dark:bg-[#121826] border-b border-slate-200 dark:border-[#232c40] px-6 sticky top-0 z-50 shadow-sm transition-colors duration-200">
        <div className="header-left flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="icon-btn md:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full"
            aria-label="Toggle Menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="logo-area flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="logo-icon bg-gradient-to-br from-blue-700 to-blue-500 text-white w-9 h-9 rounded flex items-center justify-center shadow-md">
              <ShieldCheck size={20} />
            </div>
            <span className="logo-text font-display text-lg font-bold">
              ComplianceScan <span className="logo-accent bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent">AI</span>
            </span>
          </div>
          <span className="sih-badge bg-orange-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">SIH 2026</span>
        </div>

        <div className="header-center hidden md:block flex-1 max-w-[460px] mx-6">
          <div className="search-bar flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 gap-2 focus-within:border-blue-600 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 transition-all duration-150">
            <Search className="search-icon text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products, brands, or compliance logs..."
              className="w-full text-xs font-sans focus:outline-none bg-transparent"
              onChange={(e) => {
                if (activeView === 'history') {
                  const el = document.getElementById('history-search-react');
                  if (el) {
                    el.value = e.target.value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="header-right flex items-center gap-4">
          <div className="status-indicators hidden lg:flex gap-2">
            <span className="status-pill green inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
              <span className="dot w-1.5 h-1.5 rounded-full bg-emerald-500"></span> AI Model v1.2
            </span>
            <span className="status-pill green inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
              <span className="dot w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ruleset 2026.1
            </span>
          </div>

          {/* Dark Mode Toggle */}
          <button 
            onClick={() => toggleTheme(!darkTheme)} 
            className="icon-btn text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"
            title="Toggle Theme"
          >
            {darkTheme ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="notifications-dropdown-container relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
              className="icon-btn text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full relative"
              title="Notifications"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="badge-count absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#121826] animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="dropdown-menu absolute top-12 right-0 bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl w-80 py-2.5 z-[100] animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-header flex justify-between items-center px-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold">System Alerts</h3>
                  {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline">Clear All</button>
                  )}
                </div>
                <ul className="notification-list max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="text-center py-6 text-slate-500 text-xs">No pending alerts</li>
                  ) : (
                    notifications.map(item => (
                      <li key={item.id} className="flex gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-900 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                        <div className={`notification-icon w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'warning' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-500' : 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500'}`}>
                          <ShieldCheck size={16} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="notification-text text-xs leading-normal">{item.text}</p>
                          <span className="notification-time text-[10px] text-slate-500">{item.time}</span>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* User Profile avatar dropdown */}
          <div className="profile-dropdown-container relative">
            <div 
              onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
              className="profile-avatar w-9 h-9 rounded-full relative cursor-pointer p-0.5 border-2 border-transparent hover:border-blue-600 transition-colors"
            >
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
                alt="Officer Avatar"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=SIH+Inspector&background=1E40AF&color=fff'; }}
              />
              <span className="online-indicator absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#121826] rounded-full"></span>
            </div>
            
            {profileOpen && (
              <div className="dropdown-menu absolute top-12 right-0 bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl w-72 py-2 z-[100] animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="profile-info-header flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="avatar-large w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Officer" className="w-full h-full object-cover" />
                  </div>
                  <div className="info-details flex flex-col">
                    <h4 className="text-xs font-bold">Inspector S. Verma</h4>
                    <p className="text-[10px] text-slate-500">Consumer Affairs Ministry</p>
                    <span className="role-badge bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded w-fit mt-1">Admin Inspector</span>
                  </div>
                </div>
                <ul className="dropdown-links py-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <li>
                    <a href="#settings" onClick={() => { setActiveView('settings'); setProfileOpen(false); }} className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-850">
                      <User size={15} /> Edit Profile
                    </a>
                  </li>
                  <li>
                    <a href="#settings" onClick={() => { setActiveView('settings'); setProfileOpen(false); }} className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-850">
                      <Lock size={15} /> Security Credentials
                    </a>
                  </li>
                  <li><hr className="border-slate-200 dark:border-slate-800 my-1" /></li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); addToast('Logged Out', 'Inspector logged out', 'success'); setProfileOpen(false); }} className="flex items-center gap-2.5 px-4 py-2 text-red-500 hover:bg-slate-100 dark:hover:bg-slate-850">
                      <LogOut size={15} /> Log Out
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout Shell */}
      <div className="flex flex-1 relative h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Sidebar Menu */}
        <aside className={`sidebar w-64 bg-white dark:bg-[#121826] border-r border-slate-200 dark:border-[#232c40] flex flex-col justify-between p-6 fixed md:sticky top-0 z-40 h-full transition-all duration-200 ${mobileMenuOpen ? 'left-0 shadow-2xl' : '-left-64 md:left-0'}`}>
          <nav className="sidebar-nav">
            <ul className="flex flex-col gap-1.5 list-none">
              <li>
                <button 
                  onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-xs transition-all ${activeView === 'dashboard' ? 'bg-blue-50 dark:bg-[#161f36] text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'}`}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveView('scanner'); setMobileMenuOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-xs transition-all ${activeView === 'scanner' ? 'bg-blue-50 dark:bg-[#161f36] text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'}`}
                >
                  <ScanLine size={18} />
                  <span>Scan Product</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveView('history'); setMobileMenuOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-xs transition-all ${activeView === 'history' ? 'bg-blue-50 dark:bg-[#161f36] text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'}`}
                >
                  <HistoryIcon size={18} />
                  <span>Compliance History</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveView('analytics'); setMobileMenuOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-xs transition-all ${activeView === 'analytics' ? 'bg-blue-50 dark:bg-[#161f36] text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'}`}
                >
                  <BarChart3 size={18} />
                  <span>Analytics</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveView('reports'); setMobileMenuOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-xs transition-all ${activeView === 'reports' ? 'bg-blue-50 dark:bg-[#161f36] text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'}`}
                >
                  <FileText size={18} />
                  <span>Reports</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveView('settings'); setMobileMenuOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-xs transition-all ${activeView === 'settings' ? 'bg-blue-50 dark:bg-[#161f36] text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'}`}
                >
                  <SettingsIcon size={18} />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="sidebar-footer flex flex-col gap-5 mt-auto">
            <div className="help-box bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex gap-2.5 items-start">
              <HelpCircle className="text-blue-700 dark:text-blue-400 w-5 h-5 flex-shrink-0" />
              <div>
                <h4 className="text-[10px] font-bold text-slate-800 dark:text-slate-200">Legal Metrology Acts</h4>
                <p className="text-[9px] text-slate-500 leading-normal mt-0.5">Check declarations standards for packaged commodity rules.</p>
              </div>
            </div>
            <div className="govt-seal flex flex-col items-center text-center pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <span className="seal-text text-[9px] font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase">Legal Metrology Dept</span>
              <span className="seal-sub text-[8px] text-slate-500 font-semibold">Govt of India</span>
            </div>
          </div>
        </aside>

        {/* View Section Container Panel */}
        <main className="main-content flex-1 p-6 md:p-8 overflow-y-auto h-full" id="main-content">
          {activeView === 'dashboard' && (
            <Dashboard 
              loadDemoProduct={loadDemoProduct} 
              navigateToView={setActiveView} 
              historyList={historyList}
              addToast={addToast}
            />
          )}
          {activeView === 'scanner' && (
            <Scanner 
              selectedProduct={selectedProduct} 
              setSelectedProduct={setSelectedProduct}
              ocrConfidence={ocrConfidence}
              setOcrConfidence={setOcrConfidence}
              ocrFields={ocrFields}
              setOcrFields={setOcrFields}
              rulePreset={rulePreset}
              setRulePreset={setRulePreset}
              addToast={addToast}
              viewReportRecord={viewReportRecord}
              fetchHistory={fetchHistory}
            />
          )}
          {activeView === 'history' && (
            <History 
              historyList={historyList} 
              setHistoryList={setHistoryList}
              viewReportRecord={viewReportRecord}
              addToast={addToast}
            />
          )}
          {activeView === 'analytics' && (
            <Analytics 
              historyList={historyList} 
              darkTheme={darkTheme}
            />
          )}
          {activeView === 'reports' && (
            <Reports 
              addToast={addToast}
            />
          )}
          {activeView === 'settings' && (
            <Settings 
              darkTheme={darkTheme} 
              toggleTheme={toggleTheme} 
              addToast={addToast}
            />
          )}
        </main>
      </div>

      {/* FLOATING AI ASSISTANT DRAWER */}
      <div className="ai-assistant-container fixed bottom-6 right-6 z-[1000]" id="ai-chat-container">
        {/* Toggle Bubble */}
        <button 
          onClick={() => { setChatOpen(!chatOpen); }}
          className="ai-assistant-bubble w-14 h-14 rounded-full bg-gradient-to-br from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all relative group"
          title="AI Compliance Assistant"
        >
          <MessageSquare size={24} />
          <span className="bubble-tooltip absolute right-16 top-1/2 -translate-y-1/2 bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap">
            Ask Compliance Assistant
          </span>
        </button>

        {/* Chat Drawer Window */}
        {chatOpen && (
          <div className="ai-assistant-window absolute bottom-16 right-0 w-80 sm:w-96 h-[460px] bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden z-[1000] animate-in zoom-in-95 duration-200">
            <div className="chat-header bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-3 flex justify-between items-center">
              <div className="chat-header-profile flex items-center gap-2.5">
                <div className="chat-avatar w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Bot size={18} /></div>
                <div className="flex flex-col">
                  <h4 className="text-xs font-bold leading-none">Compliance Assistant</h4>
                  <span className="text-[9px] opacity-80 mt-0.5">Legal Metrology Expert AI</span>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>
            
            <div className="chat-body flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`message flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                  <div 
                    className={`message-bubble px-3 py-2 rounded-lg text-xs leading-normal ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-[#1e2538] border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 rounded-tl-none shadow-sm'}`}
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                  />
                </div>
              ))}
            </div>

            <div className="chat-suggestions-box px-4 py-2 flex gap-2 overflow-x-auto bg-white dark:bg-[#121826] border-t border-slate-100 dark:border-slate-900 whitespace-nowrap">
              <button 
                onClick={() => handleSendChatMessage('What declarations are mandatory on packages?')} 
                className="suggestion-chip bg-slate-50 dark:bg-slate-900 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full text-[10px] font-semibold transition-all"
              >
                Mandatory Declarations
              </button>
              <button 
                onClick={() => handleSendChatMessage('What is the minimum font size for net qty?')} 
                className="suggestion-chip bg-slate-50 dark:bg-slate-900 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full text-[10px] font-semibold transition-all"
              >
                Font Size Rules
              </button>
              <button 
                onClick={() => handleSendChatMessage('Is it mandatory to include FSSAI on food?')} 
                className="suggestion-chip bg-slate-50 dark:bg-slate-900 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full text-[10px] font-semibold transition-all"
              >
                FSSAI Rules
              </button>
            </div>
            
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }} 
              className="chat-input-area flex items-center gap-2 p-3 bg-white dark:bg-[#121826] border-t border-slate-200 dark:border-slate-800"
            >
              <input 
                type="text" 
                placeholder="Ask compliance questions..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
              />
              <button type="submit" className="chat-send-btn bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* TOAST SYSTEM CONTAINER */}
      <div className="toast-container fixed top-20 right-6 z-[1100] flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast flex items-start gap-3 p-3.5 bg-white dark:bg-[#121826] border-l-4 rounded shadow-lg pointer-events-auto transition-opacity duration-300 animate-in slide-in-from-right-4 ${toast.type === 'success' ? 'border-emerald-500' : (toast.type === 'warning' ? 'border-amber-500' : (toast.type === 'danger' ? 'border-red-500' : 'border-blue-500'))}`}>
            <div className={`toast-icon ${toast.type === 'success' ? 'text-emerald-500' : (toast.type === 'warning' ? 'text-amber-500' : (toast.type === 'danger' ? 'text-red-500' : 'text-blue-500'))}`}>
              <ShieldCheck size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="toast-title text-xs font-bold">{toast.title}</span>
              <span className="toast-message text-[10px] text-slate-500 leading-normal">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-650 ml-auto"><X size={14} /></button>
          </div>
        ))}
      </div>

      {/* PDF REPORT AUDIT MODAL */}
      {modalOpen && (
        <ReportModal 
          record={modalRecord} 
          onClose={() => setModalOpen(false)} 
          addToast={addToast}
        />
      )}

    </div>
  );
}
