// src/Pages/ResourceFinder.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../../Components/NavBar/NavBar.jsx';

const advancedKeyframes = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes dotBounce {
    0%,80%,100% { transform: scale(0.7); opacity:0.4; }
    40% { transform: scale(1); opacity:1; }
  }
  .animate-fade-in-up { animation: fadeInUp 0.35s cubic-bezier(.4,0,.2,1) forwards; }
  .animate-slide-in-left { animation: slideInLeft 0.35s cubic-bezier(.4,0,.2,1) forwards; }
  .dot1 { animation: dotBounce 1.2s ease-in-out infinite; animation-delay: 0s; display:inline-block; }
  .dot2 { animation: dotBounce 1.2s ease-in-out infinite; animation-delay: 0.2s; display:inline-block; }
  .dot3 { animation: dotBounce 1.2s ease-in-out infinite; animation-delay: 0.4s; display:inline-block; }
  * { font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { border-radius: 99px; background: #d6d3d1; }
`;

const ResourceFinder = () => {
  const [query, setQuery] = useState('');
  const [lastSearch, setLastSearch] = useState('');
  const [currentResults, setCurrentResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeHistory, setActiveHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showTour, setShowTour] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [skillLevel, setSkillLevel] = useState('all');
  const [duration, setDuration] = useState('all');
  const [resourceType, setResourceType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [relatedTopics, setRelatedTopics] = useState([]);
  
  // Voice feature state
  const [isListening, setIsListening] = useState(false);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const axiosConfig = {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'x-user-id': userId || ''
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(`bookmarks_${userId}`);
    if (saved) setBookmarkedIds(JSON.parse(saved));
  }, [userId]);

  const saveBookmarks = (ids) => localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(ids));

  const toggleBookmark = (videoId) => {
    const updated = bookmarkedIds.includes(videoId)
      ? bookmarkedIds.filter(id => id !== videoId)
      : [...bookmarkedIds, videoId];
    setBookmarkedIds(updated);
    saveBookmarks(updated);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setSidebarCollapsed(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!token || !userId) { setError('Please sign in to use Resource Finder'); setPageLoading(false); return; }
    setTimeout(() => { fetchHistory().then(() => setPageLoading(false)); }, 800);
    if (!localStorage.getItem('hasSeenResourceTour')) setShowTour(true);
  }, []);

  const closeTour = () => { setShowTour(false); localStorage.setItem('hasSeenResourceTour', 'true'); };

  const fetchHistory = async () => {
    if (!token || !userId) return;
    try {
      setError('');
      const res = await axios.get('http://localhost:5000/api/resources/history', axiosConfig);
      setHistory(res.data.data);
    } catch (err) {
      console.error('Error fetching history', err);
      setError('Failed to load search history');
    }
  };

  // --- Voice Synthesis Function ---
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any currently playing audio
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Voice Recognition Function ---
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Your browser doesn't support voice recognition. Try Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      executeSearch(transcript); // Automatically run search
    };

    recognition.onerror = (event) => {
      setError(`Voice recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Extracted core search logic
  const executeSearch = async (searchQuery) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    if (!token || !userId) { setError('Please sign in to search'); return; }
    
    setLastSearch(trimmedQuery);
    setQuery('');
    setLoading(true);
    setError('');
    setActiveHistory(null);
    setCurrentResults([]);
    if (isMobile) setMobileSidebarOpen(false);
    
    try {
      const res = await axios.post('http://localhost:5000/api/resources/search', { query: trimmedQuery }, axiosConfig);
      const results = res.data.data;
      setCurrentResults(results);
      setRelatedTopics(res.data.relatedTopics || []);
      
      // Voice Response Success
      speakText(`Found ${results.length} resources for ${trimmedQuery}`);
      
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Search failed. Please try again.');
      speakText('Sorry, the search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const filteredResults = currentResults.filter(video => {
    if (skillLevel !== 'all' && video.skillLevel !== skillLevel) return false;
    if (duration !== 'all') {
      const dur = parseInt(video.duration) || 0;
      if (duration === 'short' && dur > 600) return false;
      if (duration === 'medium' && (dur < 600 || dur > 1800)) return false;
      if (duration === 'long' && dur < 1800) return false;
    }
    if (resourceType !== 'all' && video.resourceType !== resourceType) return false;
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'duration-asc') return (parseInt(a.duration)||0)-(parseInt(b.duration)||0);
    if (sortBy === 'duration-desc') return (parseInt(b.duration)||0)-(parseInt(a.duration)||0);
    const o = { beginner:0, intermediate:1, advanced:2 };
    if (sortBy === 'skill-asc') return (o[a.skillLevel]||1)-(o[b.skillLevel]||1);
    if (sortBy === 'skill-desc') return (o[b.skillLevel]||1)-(o[a.skillLevel]||1);
    return 0;
  });

  const mainContentRef = useRef(null);

  const openHistorySession = (histItem) => {
    setActiveHistory(histItem);
    setCurrentResults(histItem.results);
    setQuery(histItem.searchQuery);
    setLastSearch(histItem.searchQuery);
    setError('');
    if (isMobile) setMobileSidebarOpen(false);
  };

  const startNewSearch = () => {
    setActiveHistory(null); setCurrentResults([]); setLastSearch('');
    setQuery(''); setError(''); setShowFilters(false);
    if (isMobile) setMobileSidebarOpen(false);
  };

  const handleDeleteHistoryItem = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this search?')) return;
    setDeletingId(id);
    setTimeout(async () => {
      try {
        await axios.delete(`http://localhost:5000/api/resources/history/${id}`, axiosConfig);
        setHistory(prev => prev.filter(item => item._id !== id));
        if (activeHistory?._id === id) { setActiveHistory(null); setCurrentResults([]); }
      } catch { setError('Could not delete history item.'); }
      finally { setDeletingId(null); }
    }, 300);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all history?')) return;
    try {
      await axios.delete('http://localhost:5000/api/resources/history', axiosConfig);
      setHistory([]); setActiveHistory(null); setCurrentResults([]); setError('');
    } catch { setError('Could not clear history.'); }
  };

  useEffect(() => {
    if (mainContentRef.current) mainContentRef.current.scrollTop = mainContentRef.current.scrollHeight;
  }, [currentResults, loading]);

  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // ── Theme tokens ───────────────────────────────────────────
  const t = {
    bg:              darkMode ? '#18181b' : '#f5f5f4',
    sidebar:         darkMode ? '#1c1c1f' : '#ffffff',
    sidebarBorder:   darkMode ? '#2a2a2e' : '#e7e5e4',
    card:            darkMode ? '#27272a' : '#ffffff',
    cardBorder:      darkMode ? '#3f3f46' : '#e7e5e4',
    text:            darkMode ? '#fafaf9' : '#1c1917',
    textSub:         darkMode ? '#a8a29e' : '#78716c',
    textMuted:       darkMode ? '#57534e' : '#a8a29e',
    inputBg:         darkMode ? '#27272a' : '#ffffff',
    inputBorder:     darkMode ? '#3f3f46' : '#d6d3d1',
    accent:          '#16a34a',
    accentLight:     darkMode ? 'rgba(22,163,74,0.15)' : 'rgba(22,163,74,0.08)',
    accentText:      '#16a34a',
    pillBg:          darkMode ? '#3f3f46' : '#f5f5f4',
    pillText:        darkMode ? '#d4d4d8' : '#57534e',
    navbarBg:        darkMode ? '#18181b' : '#ffffff',
    navbarBorder:    darkMode ? '#27272a' : '#e7e5e4',
    botBubble:       darkMode ? '#1e2a1e' : '#f0fdf4',
    botBubbleBorder: darkMode ? '#166534' : '#bbf7d0',
    userBubble:      darkMode ? '#1e3a5f' : '#eff6ff',
    userBubbleText:  darkMode ? '#93c5fd' : '#1e40af',
    histActive:      darkMode ? 'rgba(22,163,74,0.18)' : 'rgba(22,163,74,0.10)',
    histHover:       darkMode ? '#2a2a2e' : '#f5f5f4',
  };

  // ── Auth guard ──────────────────────────────────────────────
  if (!token || !userId) {
    return (
      <div style={{ background: t.bg }} className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-5">
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }}
            className="max-w-sm w-full p-10 rounded-2xl shadow-xl text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 text-3xl" style={{ background: t.accentLight }}>🔐</div>
            <h2 className="text-2xl font-bold mb-2">Resource Finder</h2>
            <p className="text-sm mb-6" style={{ color: t.textSub }}>Sign in to access your learning workspace</p>
            <button onClick={() => window.location.href = '/signin'}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background: t.accent }}>Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div style={{ background: t.bg }} className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${t.accent} transparent transparent transparent` }}></div>
          <p className="text-sm font-medium" style={{ color: t.textSub }}>Loading your workspace…</p>
        </div>
      </div>
    );
  }

  const suggestions = ['React Hooks','Machine Learning','Python','CSS Grid','JavaScript','Web APIs','Database Design','Docker','TypeScript','Node.js'];

  return (
    <div style={{ background: t.bg, color: t.text }} className="flex flex-col h-screen overflow-hidden">
      <style>{advancedKeyframes}</style>

      {/* Tour Modal */}
      {showTour && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="animate-fade-in-up w-full max-w-md rounded-2xl p-8 shadow-2xl"
            style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5" style={{ background: t.accentLight }}>🎓</div>
            <h2 className="text-2xl font-bold text-center mb-1" style={{ color: t.text }}>Welcome to Resource Finder</h2>
            <p className="text-sm text-center mb-6" style={{ color: t.textSub }}>Your AI-powered learning companion</p>
            <div className="space-y-3 mb-6">
              {[['🔍','Smart Search','Get curated YouTube tutorials instantly'],['⭐','Bookmarks','Save your favourite resources'],['🎚️','Filters','Filter by skill level, duration & more'],['🎙️','Voice Search','Speak to search and hear responses']].map(([icon,title,desc],i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: t.accentLight }}>
                  <span className="text-xl">{icon}</span>
                  <div><p className="text-sm font-semibold" style={{ color: t.text }}>{title}</p><p className="text-xs" style={{ color: t.textSub }}>{desc}</p></div>
                </div>
              ))}
            </div>
            <button onClick={closeTour} className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: t.accent }}>Get Started</button>
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b shrink-0"
        style={{ background: t.navbarBg, borderColor: t.navbarBorder, zIndex: 20 }}>
        <Navbar />
        <div className="flex items-center gap-1 p-1 rounded-xl shrink-0" style={{ background: t.pillBg }}>
          <button onClick={() => setDarkMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: !darkMode ? '#fff' : 'transparent', color: !darkMode ? '#1c1917' : t.textSub, boxShadow: !darkMode ? '0 1px 3px rgba(0,0,0,0.12)' : 'none' }}>
            ☀️ Light
          </button>
          <button onClick={() => setDarkMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: darkMode ? '#3f3f46' : 'transparent', color: darkMode ? '#fafaf9' : t.textSub, boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : 'none' }}>
            🌙 Dark
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        {isMobile && mobileSidebarOpen && (
          <div onClick={() => setMobileSidebarOpen(false)} className="absolute inset-0 z-40" style={{ background: 'rgba(0,0,0,0.4)' }} />
        )}

        {/* ── SIDEBAR ── */}
        <div
          className={`flex flex-col border-r z-50 transition-all duration-300 shrink-0 ${isMobile ? 'absolute top-0 bottom-0' : 'relative'}`}
          style={{
            width: (isMobile ? mobileSidebarOpen : !sidebarCollapsed) ? 260 : 0,
            minWidth: (isMobile ? mobileSidebarOpen : !sidebarCollapsed) ? 260 : 0,
            overflow: 'hidden',
            background: t.sidebar,
            borderColor: t.sidebarBorder,
          }}>
          <div style={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column', padding: '18px 14px' }}>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: t.accentLight }}>🎯</div>
                <span className="text-sm font-bold" style={{ color: t.text }}>Resource Finder</span>
              </div>
              {isMobile && <button onClick={() => setMobileSidebarOpen(false)} style={{ color: t.textSub }}>✕</button>}
            </div>

            <button onClick={startNewSearch}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white mb-4 transition-all hover:opacity-90"
              style={{ background: t.accent }}>
              <span className="text-lg leading-none">+</span> New Search
            </button>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-5 text-sm font-semibold"
              style={{ background: t.accentLight, color: t.accentText }}>
              <span>🔍</span> AI Search
            </div>

            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: t.textMuted }}>
                🕐 Recent Chat
              </span>
              {history.length > 0 && (
                <button onClick={handleClearHistory}
                  className="text-[10px] font-semibold transition-colors"
                  style={{ color: t.textMuted }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = t.textMuted}>
                  Clear all
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
              {history.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <span className="text-4xl block mb-3 opacity-25">📭</span>
                  <p className="text-xs font-medium" style={{ color: t.textMuted }}>No searches yet</p>
                  <p className="text-[10px] mt-1" style={{ color: t.textMuted }}>Your search history will appear here</p>
                </div>
              ) : (
                history.map((histItem, idx) => {
                  const isActive = activeHistory?._id === histItem._id;
                  const isDeleting = deletingId === histItem._id;
                  const prevItem = history[idx - 1];
                  const curLabel = formatHistoryDate(histItem.createdAt);
                  const prevLabel = formatHistoryDate(prevItem?.createdAt);
                  const showDateLabel = idx === 0 || curLabel !== prevLabel;

                  return (
                    <React.Fragment key={histItem._id}>
                      {showDateLabel && (
                        <p className="text-[9px] font-bold uppercase tracking-widest px-2 pt-3 pb-1 select-none"
                          style={{ color: t.textMuted }}>
                          {curLabel}
                        </p>
                      )}
                      <div
                        onClick={() => openHistorySession(histItem)}
                        className="group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-[13px] transition-all"
                        style={{
                          background: isActive ? t.histActive : 'transparent',
                          color: isActive ? t.accentText : t.textSub,
                          opacity: isDeleting ? 0 : 1,
                          transform: isDeleting ? 'translateX(-10px)' : 'translateX(0)',
                          transition: 'all 0.25s',
                          fontWeight: isActive ? 600 : 400,
                          borderLeft: isActive ? `3px solid ${t.accent}` : '3px solid transparent',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.histHover; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xs shrink-0" style={{ color: isActive ? t.accentText : t.textMuted }}>💬</span>
                          <span className="truncate">{histItem.searchQuery}</span>
                        </div>
                        <button
                          onClick={e => handleDeleteHistoryItem(e, histItem._id)}
                          className="opacity-0 group-hover:opacity-100 ml-1 w-5 h-5 rounded-md flex items-center justify-center text-[11px] shrink-0 transition-all"
                          style={{ color: t.textMuted }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = darkMode ? '#3f3f46' : '#fee2e2'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.background = 'transparent'; }}>
                          ✕
                        </button>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {history.length > 10 && (
              <button className="mt-2 w-full text-xs font-medium py-1.5 rounded-lg transition-all"
                style={{ color: t.textSub, background: t.pillBg }}
                onMouseEnter={e => e.currentTarget.style.color = t.accentText}
                onMouseLeave={e => e.currentTarget.style.color = t.textSub}>
                Show More
              </button>
            )}

          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col overflow-hidden relative">

          <button
            onClick={() => isMobile ? setMobileSidebarOpen(true) : setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-4 left-4 z-30 w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-80"
            style={{ background: t.pillBg, color: t.textSub }}>☰
          </button>

          {error && (
            <div className="mx-auto mt-4 w-[90%] max-w-2xl px-4 py-3 rounded-xl flex justify-between items-center text-sm font-medium shrink-0"
              style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')} className="ml-4 font-bold">✕</button>
            </div>
          )}

          {showFilters && sortedResults.length > 0 && (
            <div className="animate-slide-in-left mx-auto w-[90%] max-w-2xl mt-4 p-4 rounded-2xl shrink-0"
              style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ['Skill', skillLevel, setSkillLevel, [['all','All Levels'],['beginner','🟢 Beginner'],['intermediate','🟡 Intermediate'],['advanced','🔴 Advanced']]],
                  ['Duration', duration, setDuration, [['all','Any'],['short','⏱ Short'],['medium','📺 Medium'],['long','🎬 Long']]],
                  ['Sort By', sortBy, setSortBy, [['relevance','🔍 Relevance'],['skill-asc','📈 Easy First'],['skill-desc','📉 Hard First'],['duration-asc','⏱ Short First'],['duration-desc','🎬 Long First']]],
                ].map(([label, val, setter, opts]) => (
                  <div key={label}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textMuted }}>{label}</label>
                    <select value={val} onChange={e => setter(e.target.value)}
                      className="w-full p-2 rounded-lg text-xs font-medium border focus:outline-none"
                      style={{ background: t.inputBg, borderColor: t.inputBorder, color: t.text }}>
                      {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textMuted }}>View</label>
                  <div className="flex gap-1.5">
                    {[['grid','⊞'],['list','☰']].map(([m,icon]) => (
                      <button key={m} onClick={() => setViewMode(m)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{ background: viewMode===m ? t.accent : t.pillBg, color: viewMode===m ? '#fff' : t.textSub }}>
                        {icon} {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={mainContentRef} className="flex-1 overflow-y-auto px-6 pt-14 pb-36" style={{ scrollbarWidth: 'thin', scrollbarColor: `${darkMode ? '#3f3f46' : '#d6d3d1'} transparent` }}>

            {/* ── Welcome / Empty state ── */}
            {sortedResults.length === 0 && !loading && !lastSearch && (
              <div className="animate-fade-in-up flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="relative mb-8">
                  <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl"
                    style={{ background: 'radial-gradient(circle at 35% 35%, #4ade80, #16a34a 50%, #14532d)', boxShadow: '0 20px 60px rgba(22,163,74,0.35)' }}>
                    <div className="w-16 h-16 rounded-full opacity-25" style={{ background: 'radial-gradient(circle at 30% 30%, #fff, transparent)' }} />
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: t.text }}>Welcome to Resource Finder</h2>
                <p className="text-sm mb-1" style={{ color: t.textSub }}>Get started by searching a topic and AI can do the rest.</p>
                <p className="text-sm mb-10" style={{ color: t.textSub }}>Not sure where to start?</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
                  {[
                    ['🚀','Productivity Boost','Start your day with focus. Set three main goals you want to accomplish.'],
                    ['😊','User-Friendly Onboarding','Everything is laid out easily for you to filter and sort through tutorials.'],
                    ['🎙️','Voice-Activated Responses','Click the microphone in the search bar. Speak to search and I will read the results back to you.']
                  ].map(([icon,title,desc]) => (
                    <div key={title} className="p-4 rounded-2xl text-left cursor-pointer transition-all"
                      style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-lg" style={{ background: t.accentLight }}>{icon}</div>
                      <p className="text-sm font-semibold mb-1" style={{ color: t.text }}>{title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: t.textSub }}>{desc}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: t.textMuted }}>Popular Topics</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-xl">
                  {suggestions.map(s => (
                    <button key={s} onClick={() => setQuery(s)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all hover:opacity-80"
                      style={{ background: t.pillBg, borderColor: t.cardBorder, color: t.pillText }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ── User bubble ── */}
            {(lastSearch || activeHistory) && (
              <div className="animate-fade-in-up flex justify-end mb-4">
                <div className="max-w-[70%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm font-medium"
                  style={{ background: t.userBubble, color: t.userBubbleText, border: `1px solid ${darkMode ? '#1e3a5f' : '#bfdbfe'}` }}>
                  {activeHistory ? activeHistory.searchQuery : lastSearch}
                </div>
              </div>
            )}

            {/* ── Loading ── */}
            {loading && (
              <div className="animate-fade-in-up flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0" style={{ background: t.accentLight, color: t.accentText }}>✨</div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
                  <span className="w-2 h-2 rounded-full dot1" style={{ background: t.accent }}></span>
                  <span className="w-2 h-2 rounded-full dot2" style={{ background: t.accent }}></span>
                  <span className="w-2 h-2 rounded-full dot3" style={{ background: t.accent }}></span>
                  <span className="text-xs ml-1 font-medium" style={{ color: t.textSub }}>Searching for the best resources…</span>
                </div>
              </div>
            )}

            {/* ── Results ── */}
            {sortedResults.length > 0 && (
              <div className="animate-fade-in-up flex items-start gap-3 w-full">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-1" style={{ background: t.accentLight, color: t.accentText }}>✨</div>
                <div className="flex-1 min-w-0">
                  <div className="p-4 rounded-2xl mb-4" style={{ background: t.botBubble, border: `1px solid ${t.botBubbleBorder}` }}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-sm" style={{ color: t.text }}>
                        Found <strong style={{ color: t.accentText }}>{sortedResults.length}</strong> videos for{' '}
                        <strong>"{activeHistory ? activeHistory.searchQuery : lastSearch}"</strong>
                      </p>
                      <button onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90"
                        style={{ background: t.accent }}>
                        🎚 {showFilters ? 'Hide' : 'Filters'}
                      </button>
                    </div>
                    {relatedTopics.length > 0 && (
                      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${t.botBubbleBorder}` }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: t.textMuted }}>Related Topics</p>
                        <div className="flex flex-wrap gap-1.5">
                          {relatedTopics.map((topic, idx) => (
                            <button key={idx} onClick={() => setQuery(topic)}
                              className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all hover:opacity-80"
                              style={{ background: t.pillBg, borderColor: t.cardBorder, color: t.pillText }}>
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`gap-4 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col'}`}>
                    {sortedResults.map((video, index) => {
                      const skillColors = {
                        beginner:     { bg: darkMode ? 'rgba(22,163,74,0.15)' : '#dcfce7', text: '#16a34a' },
                        intermediate: { bg: darkMode ? 'rgba(234,179,8,0.15)' : '#fef9c3', text: '#ca8a04' },
                        advanced:     { bg: darkMode ? 'rgba(239,68,68,0.15)' : '#fee2e2', text: '#dc2626' },
                      };
                      const sc = skillColors[video.skillLevel] || skillColors.intermediate;
                      const durationMins = Math.round(parseInt(video.duration) / 60) || 10;
                      const isBookmarked = bookmarkedIds.includes(video.videoId);
                      return (
                        <div key={index}
                          className={`group rounded-2xl overflow-hidden transition-all duration-200 ${viewMode === 'list' ? 'flex' : ''}`}
                          style={{ background: t.card, border: `1px solid ${t.cardBorder}`, cursor: 'pointer' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.boxShadow = `0 4px 20px rgba(22,163,74,0.12)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                          <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-44 shrink-0' : 'aspect-video'}`}>
                            <img src={video.thumbnail} alt="thumbnail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ background: 'rgba(0,0,0,0.4)' }}>
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl shadow-lg">▶</div>
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>⏱ {durationMins}m</div>
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: sc.bg, color: sc.text }}>{video.skillLevel}</div>
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h4 className="text-sm font-semibold leading-snug line-clamp-2 flex-1" style={{ color: t.text }}>{video.title}</h4>
                              <button onClick={e => { e.stopPropagation(); toggleBookmark(video.videoId); }}
                                className="text-lg shrink-0 transition-transform hover:scale-110"
                                style={{ color: isBookmarked ? '#f59e0b' : t.textMuted }}>
                                {isBookmarked ? '⭐' : '☆'}
                              </button>
                            </div>
                            <p className="text-[11px] font-medium mb-2" style={{ color: t.textSub }}>{video.channel}</p>
                            <p className="text-xs leading-relaxed line-clamp-2 mb-3 flex-1" style={{ color: t.textMuted }}>{video.description}</p>
                            <div className="flex gap-1.5 flex-wrap mb-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: sc.bg, color: sc.text }}>{video.skillLevel}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: t.pillBg, color: t.pillText }}>⏱ {durationMins}m</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: t.pillBg, color: t.pillText }}>▶ YouTube</span>
                            </div>
                            <button onClick={e => { e.stopPropagation(); window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank'); }}
                              className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                              style={{ background: t.accent }}>Watch Now →</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {sortedResults.length === 0 && currentResults.length > 0 && (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3 opacity-30">🔍</span>
                <p className="text-sm font-medium mb-4" style={{ color: t.textSub }}>No results matching your filters</p>
                <button onClick={() => { setSkillLevel('all'); setDuration('all'); setResourceType('all'); }}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                  style={{ background: t.accent }}>Reset Filters</button>
              </div>
            )}
          </div>

          {/* ── Input bar ── */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-12 shrink-0"
            style={{ background: `linear-gradient(to top, ${t.bg} 65%, transparent)` }}>
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="flex items-center rounded-2xl shadow-lg border transition-all"
                style={{
                  background: t.inputBg,
                  borderColor: isListening ? '#ef4444' : (query.trim() ? t.accent : t.inputBorder),
                  boxShadow: isListening 
                    ? '0 0 0 2px rgba(239, 68, 68, 0.3)' 
                    : (query.trim() ? `0 0 0 2px rgba(22,163,74,0.15)` : '0 2px 12px rgba(0,0,0,0.08)')
                }}>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={isListening ? 'Listening...' : (loading ? 'Searching…' : 'Ask me anything…')}
                  disabled={loading || isListening}
                  className="flex-1 bg-transparent border-none outline-none text-sm py-3.5 pl-4 pr-2 font-medium"
                  style={{ color: t.text }}
                />
                
                {/* Voice Search Microphone Button */}
                <button 
                  type="button"
                  onClick={handleVoiceSearch}
                  disabled={loading}
                  title="Voice Search"
                  className={`mr-2 w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${isListening ? 'animate-pulse' : 'hover:opacity-80'}`}
                  style={{ 
                    background: isListening ? '#ef4444' : t.pillBg, 
                    color: isListening ? '#fff' : t.textMuted
                  }}
                >
                  🎙️
                </button>

                <button type="submit" disabled={loading || isListening || !query.trim()}
                  className="mr-2 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white transition-all hover:opacity-80 disabled:opacity-30"
                  style={{ background: t.accent }}>↑</button>
              </div>
              <p className="text-center mt-2 text-[10px]" style={{ color: t.textMuted }}>
                Resource Finder may display inaccurate info, so double check responses. Your Privacy &amp; Terms.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceFinder;