// src/Pages/ResourceFinder.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../../Components/NavBar/NavBar.jsx';

// Advanced keyframes for animations
const advancedKeyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
    50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
  }
  .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
  .animate-slide-in-left { animation: slideInLeft 0.4s ease-out forwards; }
  .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
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
  
  // Advanced filters
  const [skillLevel, setSkillLevel] = useState('all');
  const [duration, setDuration] = useState('all');
  const [resourceType, setResourceType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [relatedTopics, setRelatedTopics] = useState([]);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const axiosConfig = {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'x-user-id': userId || ''
    }
  };

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`bookmarks_${userId}`);
    if (saved) setBookmarkedIds(JSON.parse(saved));
  }, [userId]);

  // Save bookmarks to localStorage
  const saveBookmarks = (ids) => {
    localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(ids));
  };

  const toggleBookmark = (videoId) => {
    const updated = bookmarkedIds.includes(videoId)
      ? bookmarkedIds.filter(id => id !== videoId)
      : [...bookmarkedIds, videoId];
    setBookmarkedIds(updated);
    saveBookmarks(updated);
  };

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!token || !userId) {
      setError('Please sign in to use Resource Finder');
      setPageLoading(false);
      return;
    }
    
    setTimeout(() => {
      fetchHistory().then(() => setPageLoading(false));
    }, 800);

    const hasSeenTour = localStorage.getItem('hasSeenResourceTour');
    if (!hasSeenTour) {
      setShowTour(true);
    }
    // eslint-disable-next-line
  }, []);

  const closeTour = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenResourceTour', 'true');
  };

  const fetchHistory = async () => {
    if (!token || !userId) return;
    try {
      setError('');
      const response = await axios.get('http://localhost:5000/api/resources/history', axiosConfig);
      setHistory(response.data.data);
    } catch (err) {
      console.error("Error fetching history", err);
      setError('Failed to load search history');
    }
  };

  const filteredResults = currentResults.filter(video => {
    // Filter by skill level
    if (skillLevel !== 'all' && video.skillLevel !== skillLevel) {
      return false;
    }
    
    // Filter by duration
    if (duration !== 'all') {
      const dur = parseInt(video.duration) || 0;
      if (duration === 'short' && dur > 600) return false;
      if (duration === 'medium' && (dur < 600 || dur > 1800)) return false;
      if (duration === 'long' && dur < 1800) return false;
    }
    
    // Filter by resource type
    if (resourceType !== 'all' && video.resourceType !== resourceType) {
      return false;
    }
    
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'duration-asc') return (parseInt(a.duration) || 0) - (parseInt(b.duration) || 0);
    if (sortBy === 'duration-desc') return (parseInt(b.duration) || 0) - (parseInt(a.duration) || 0);
    if (sortBy === 'skill-asc') {
      const skillOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 };
      return (skillOrder[a.skillLevel] || 1) - (skillOrder[b.skillLevel] || 1);
    }
    if (sortBy === 'skill-desc') {
      const skillOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 };
      return (skillOrder[b.skillLevel] || 1) - (skillOrder[a.skillLevel] || 1);
    }
    return 0;
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    if (!token || !userId) {
      setError('Please sign in to search');
      return;
    }

    setLastSearch(trimmedQuery);
    setQuery('');
    setLoading(true);
    setError('');
    setActiveHistory(null);
    setCurrentResults([]);
    if (isMobile) setMobileSidebarOpen(false);

    try {
      console.log(`🔍 Searching for: "${trimmedQuery}"`);
      const response = await axios.post(
        'http://localhost:5000/api/resources/search', 
        { query: trimmedQuery }, 
        axiosConfig
      );
      
      console.log(`✅ Got ${response.data.data.length} videos`);
      setCurrentResults(response.data.data);
      setRelatedTopics(response.data.relatedTopics || []);
      fetchHistory(); 
    } catch (err) {
      console.error("❌ Search error:", err);
      const errorMsg = err.response?.data?.message || err.message || 'Search failed. Please try again.';
      console.error('Error details:', {
        status: err.response?.status,
        message: errorMsg,
        url: err.config?.url
      });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
    setActiveHistory(null);
    setCurrentResults([]);
    setLastSearch('');
    setQuery('');
    setError('');
    setShowFilters(false);
    if (isMobile) setMobileSidebarOpen(false);
  };

  const handleDeleteHistoryItem = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm('Are you sure you want to delete this search history?')) return;

    setDeletingId(id);

    setTimeout(async () => {
      try {
        await axios.delete(`http://localhost:5000/api/resources/history/${id}`, axiosConfig);
        setHistory((prev) => prev.filter((item) => item._id !== id));
        if (activeHistory?._id === id) {
          setActiveHistory(null);
          setCurrentResults([]);
        }
      } catch (err) {
        console.error('Error deleting history item', err);
        setError('Could not delete history item. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }, 300);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all history? This action cannot be undone.')) return;
    try {
      await axios.delete('http://localhost:5000/api/resources/history', axiosConfig);
      setHistory([]);
      setActiveHistory(null);
      setCurrentResults([]);
      setError('');
    } catch (err) {
      console.error('Error clearing history', err);
      setError('Could not clear history. Please try again.');
    }
  };

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = mainContentRef.current.scrollHeight;
    }
  }, [currentResults, loading]);

  // Auth Guard View
  if (!token || !userId) {
    return (
      <div className="flex flex-col h-screen font-sans bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-5">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl text-center border border-white/20">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-4xl">🔐</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">Resource Finder</h2>
            <p className="text-red-600 font-semibold mb-6">Please sign in to access Resource Finder.</p>
            <button onClick={() => window.location.href = '/signin'} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading View
  if (pageLoading) {
    return (
      <div className="flex flex-col h-screen font-sans bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full"></div>
          </div>
          <h3 className="text-gray-700 font-bold text-xl">Loading your workspace...</h3>
          <p className="text-gray-500 text-sm mt-2">Preparing your learning resources</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden text-gray-800">
      <style>{advancedKeyframes}</style>

      <Navbar />

      <div className="flex flex-1 relative overflow-hidden border-t border-gray-200">
        
        {/* ADVANCED TOUR MODAL */}
        {showTour && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[1000] flex justify-center items-center p-5">
            <div className="animate-fade-in-up bg-white p-10 rounded-3xl max-w-[600px] w-full shadow-2xl border border-white/40">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-4xl">🎓</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center mb-2">Welcome to Resource Finder!</h2>
              <p className="text-gray-600 text-center mb-8 text-lg">Your AI-powered learning companion</p>
              
              <div className="space-y-4 mb-8">
                {[
                  { icon: '🔍', title: 'Smart Search', desc: 'Get curated YouTube tutorials instantly' },
                  { icon: '⭐', title: 'Bookmarks', desc: 'Save your favorite resources' },
                  { icon: '🎚️', title: 'Advanced Filters', desc: 'Filter by skill level, duration, and more' },
                  { icon: '📚', title: 'Search History', desc: 'Revisit past searches anytime' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <strong className="block text-gray-900">{item.title}</strong>
                      <span className="text-sm text-gray-600">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={closeTour}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && !sidebarCollapsed && (
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="absolute left-4 top-4 z-30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-11 h-11 rounded-xl shadow-lg flex items-center justify-center transition-transform hover:scale-110"
          >
            <span className="text-2xl leading-none">☰</span>
          </button>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/50 z-40 transition-opacity"
          />
        )}
        
        {/* ADVANCED SIDEBAR */}
        <div 
          className={`
            bg-gradient-to-b from-white to-blue-50 border-r border-gray-200 flex flex-col z-50 transition-all duration-300 ease-in-out whitespace-nowrap shadow-xl
            ${isMobile ? 'absolute top-0 bottom-0' : 'relative h-full'}
            ${(isMobile ? mobileSidebarOpen : !sidebarCollapsed) ? 'w-[340px] px-5 py-6' : 'w-0 overflow-hidden opacity-0'}
            ${isMobile && !mobileSidebarOpen ? '-left-[340px]' : 'left-0'}
          `}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="m-0 text-gray-900 text-lg font-bold">📚 History</h3>
            {isMobile && (
              <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-500 hover:text-gray-900 text-2xl">✕</button>
            )}
          </div>

          <button 
            onClick={startNewSearch}
            className="flex items-center justify-center gap-2 w-full py-3.5 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-[15px] transition-all transform hover:scale-[1.02] shadow-lg"
          >
            <span className="text-xl leading-none">+</span> New Search
          </button>

          <div className="flex justify-between items-center mb-4 px-2">
            <h4 className="m-0 text-gray-600 text-xs font-bold uppercase tracking-wider">Recent</h4>
            {history.length > 0 && (
              <button 
                onClick={handleClearHistory} 
                className="text-red-500 hover:text-red-700 text-xs font-semibold transition-colors" 
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {history.length === 0 ? (
              <div className="text-center py-12 px-4">
                <span className="text-5xl opacity-40 block mb-4">📭</span>
                <p className="text-gray-600 text-sm font-medium">No searches yet</p>
              </div>
            ) : (
              history.map((histItem) => (
                <div 
                  key={histItem._id} 
                  onClick={() => openHistorySession(histItem)}
                  className={`
                    group p-3 rounded-lg cursor-pointer flex justify-between items-center transition-all duration-200
                    ${activeHistory?._id === histItem._id ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}
                    ${deletingId === histItem._id ? 'opacity-0 -translate-x-5' : 'opacity-100'}
                  `}
                >
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-[13px] flex items-center gap-2">
                    <span>🔍</span> {histItem.searchQuery}
                  </div>
                  <button 
                    onClick={(e) => handleDeleteHistoryItem(e, histItem._id)}
                    className="text-gray-400 hover:text-red-600 p-1 transition-all opacity-0 group-hover:opacity-100"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm relative overflow-hidden">
          
          {/* Error Message */}
          {error && (
            <div className="m-5 mx-auto w-[90%] max-w-3xl bg-red-50/80 backdrop-blur text-red-700 px-5 py-3 rounded-xl flex items-center justify-between shadow-lg z-10 border border-red-200">
              <span className="font-semibold flex items-center gap-2">⚠️ {error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-800 font-bold">✕</button>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && sortedResults.length > 0 && (
            <div className="animate-slide-in-left mx-auto w-[90%] max-w-3xl mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Skill Level</label>
                  <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className="w-full mt-2 p-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="all">All Levels</option>
                    <option value="beginner">🟢 Beginner</option>
                    <option value="intermediate">🟡 Intermediate</option>
                    <option value="advanced">🔴 Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Duration</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full mt-2 p-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="all">Any Duration</option>
                    <option value="short">⏱️ Short (&lt;10 min)</option>
                    <option value="medium">📺 Medium (10-30 min)</option>
                    <option value="long">🎬 Long (&gt;30 min)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full mt-2 p-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="relevance">🔍 Relevance</option>
                    <option value="skill-asc">📈 Skill Level (Easy First)</option>
                    <option value="skill-desc">📉 Skill Level (Hard First)</option>
                    <option value="duration-asc">⏱️ Duration (Short First)</option>
                    <option value="duration-desc">🎬 Duration (Long First)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">View</label>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setViewMode('grid')} className={`flex-1 py-2 px-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-600 hover:border-blue-400'}`}>⊞ Grid</button>
                    <button onClick={() => setViewMode('list')} className={`flex-1 py-2 px-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-600 hover:border-blue-400'}`}>☰ List</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Filter Stats</label>
                  <div className="mt-2 p-2.5 bg-white border border-gray-300 rounded-lg">
                    <p className="text-sm font-bold text-blue-600">📊 {sortedResults.length} results</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div 
            ref={mainContentRef} 
            className={`
              flex-1 overflow-y-auto flex flex-col gap-6 
              ${isMobile ? 'px-4 pt-5 pb-40' : 'px-[8%] pt-8 pb-36'}
              [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-indigo-600 [&::-webkit-scrollbar-thumb]:rounded-full
            `}
          >
            
            {/* EMPTY STATE */}
            {sortedResults.length === 0 && !loading && !activeHistory && !lastSearch && (
              <div className="animate-fade-in-up flex flex-col justify-center items-center min-h-[65vh] text-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-10 rounded-3xl mb-8 shadow-2xl shadow-blue-400">
                  <span className="text-[70px] leading-none block">🎯</span>
                </div>
                <h2 className="text-gray-900 font-bold mb-3 text-4xl">Find Your Perfect Tutorial</h2>
                <p className="text-gray-600 text-lg max-w-lg mx-auto mb-12">Ask me anything — from coding to cooking. I'll find the best YouTube videos and resources for you.</p>
                
                <div className="mb-12">
                  <p className="text-gray-700 font-semibold mb-6 text-lg">Popular Topics:</p>
                  <div className="flex flex-wrap gap-3 justify-center max-w-3xl">
                    {['React Hooks', 'Machine Learning', 'Python Decorators', 'CSS Grid', 'JavaScript Async', 'Web APIs', 'Database Design', 'Docker', 'TypeScript Advanced', 'Node.js'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setQuery(suggestion)}
                        className="px-5 py-2.5 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-800 hover:text-blue-700 font-semibold border-2 border-gray-200 hover:border-blue-400 rounded-full text-sm transition-all hover:scale-105 hover:shadow-lg"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* USER MESSAGE */}
            {(lastSearch || activeHistory) && (
              <div className="animate-fade-in-up flex gap-3 self-end max-w-[85%]">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-5 rounded-3xl rounded-tr-sm text-[15px] leading-relaxed shadow-lg break-words font-medium">
                  {activeHistory ? activeHistory.searchQuery : lastSearch}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg">👤</div>
              </div>
            )}

            {/* LOADING INDICATOR */}
            {loading && (
              <div className="animate-fade-in-up flex gap-3 self-start max-w-[85%]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shrink-0 shadow-lg animate-pulse-glow">✨</div>
                <div className="bg-white border-2 border-blue-200 py-3 px-5 rounded-3xl rounded-tl-sm shadow-lg">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-bounce"></div>
                    <span className="ml-2 text-gray-600 text-sm font-semibold">Searching for the best resources...</span>
                  </div>
                </div>
              </div>
            )}

            {/* RESULTS */}
            {sortedResults.length > 0 && (
              <div className="animate-fade-in-up flex gap-3 self-start w-full">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shrink-0 shadow-lg mt-1">✨</div>
                <div className="w-[calc(100%-52px)]">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 py-4 px-5 rounded-2xl mb-6 shadow-lg">
                    <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
                      <p className="m-0 text-[14px] text-gray-800">
                        Found <strong className="text-blue-600 text-lg font-bold">{sortedResults.length}</strong> videos for <strong className="text-indigo-600">"{activeHistory ? activeHistory.searchQuery : lastSearch}"</strong>
                      </p>
                      {currentResults.length > 0 && (
                        <button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105">
                          🎚️ {showFilters ? 'Hide' : 'Show'} Filters
                        </button>
                      )}
                    </div>
                    
                    {/* Related Topics */}
                    {relatedTopics.length > 0 && (
                      <div className="border-t-2 border-blue-200 pt-4">
                        <p className="text-xs font-bold text-gray-600 uppercase mb-3">🔗 Related Topics:</p>
                        <div className="flex flex-wrap gap-2">
                          {relatedTopics.map((topic, idx) => (
                            <button
                              key={idx}
                              onClick={() => setQuery(topic)}
                              className="px-3 py-1.5 bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 text-gray-700 hover:text-white border border-gray-300 hover:border-blue-500 text-xs font-semibold rounded-full transition-all hover:scale-105"
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`gap-5 ${viewMode === 'grid' ? `grid grid-cols-1 ${!isMobile && 'sm:grid-cols-2 lg:grid-cols-2'}` : 'flex flex-col'}`}>
                    {sortedResults.map((video, index) => {
                      const skillLevelColors = {
                        beginner: { bg: 'bg-green-100', text: 'text-green-700', icon: '🟢' },
                        intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🟡' },
                        advanced: { bg: 'bg-red-100', text: 'text-red-700', icon: '🔴' }
                      };
                      const skillStyle = skillLevelColors[video.skillLevel] || skillLevelColors.intermediate;
                      const durationMins = Math.round(parseInt(video.duration) / 60) || 10;
                      
                      return (
                        <div 
                          key={index} 
                          className={`group ${viewMode === 'list' ? 'flex gap-4' : ''} border-2 border-gray-200 hover:border-blue-400 rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer`}
                        >
                          <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-32 shrink-0' : 'aspect-video'}`}>
                            <img 
                              src={video.thumbnail} 
                              alt="thumbnail" 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                                <span className="text-3xl">▶️</span>
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-white px-2 py-1 rounded-full text-xs font-bold">
                              ⏱️ {durationMins} min
                            </div>
                            <div className={`absolute bottom-2 right-2 ${skillStyle.bg} ${skillStyle.text} px-2 py-1 rounded-full text-xs font-bold`}>
                              {skillStyle.icon} {video.skillLevel}
                            </div>
                          </div>
                          <div className={`${viewMode === 'list' ? 'flex-1' : ''} p-5 flex flex-col`}>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h4 className="m-0 text-[15px] text-gray-900 leading-snug font-bold line-clamp-2 flex-1">
                                {video.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(video.videoId);
                                }}
                                className={`shrink-0 text-2xl transition-all ${bookmarkedIds.includes(video.videoId) ? 'scale-125' : 'hover:scale-110'}`}
                              >
                                {bookmarkedIds.includes(video.videoId) ? '⭐' : '☆'}
                              </button>
                            </div>
                            
                            <p className="text-xs text-gray-500 font-semibold mb-2">{video.channel}</p>
                            <p className={`m-0 text-[13px] text-gray-600 leading-relaxed ${viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'} mb-4 flex-1`}>
                              {video.description}
                            </p>
                            
                            <div className="flex gap-2 flex-wrap mb-4">
                              <span className={`px-3 py-1 ${skillStyle.bg} ${skillStyle.text} text-xs font-bold rounded-full`}>
                                {skillStyle.icon} {video.skillLevel.charAt(0).toUpperCase() + video.skillLevel.slice(1)}
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">⏱️ {durationMins} min</span>
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">▶️ YouTube</span>
                            </div>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank');
                              }}
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white group-hover:from-blue-700 group-hover:to-indigo-700 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-lg"
                            >
                              Watch Now →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* NO RESULTS STATE */}

            {/* NO RESULTS STATE */}
            {sortedResults.length === 0 && currentResults.length > 0 && (
              <div className="text-center py-12">
                <span className="text-6xl opacity-40 block mb-4">🔍</span>
                <p className="text-gray-600 text-lg font-semibold">No results matching your filters</p>
                <button onClick={() => {setSkillLevel('all'); setDuration('all'); setResourceType('all');}} className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg">
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* ADVANCED INPUT BAR */}
          <div className={`absolute bottom-0 left-0 right-0 ${isMobile ? 'p-4' : 'px-[8%] py-6'} bg-gradient-to-t from-white via-white to-transparent pt-12`}>
            <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto">
              <div className={`
                flex items-center rounded-full bg-white transition-all duration-300 border-2 shadow-2xl
                ${query.trim() ? 'border-blue-500 shadow-blue-300' : 'border-gray-300'}
                focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-300
              `}>
                <span className="ml-5 text-2xl">🔍</span>
                <input 
                  type="text" 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder={loading ? "Searching..." : "Search for tutorials, courses, concepts..."}
                  className={`flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 font-medium ${isMobile ? 'py-3.5 px-4 text-[14px]' : 'py-4 px-5 text-base'}`}
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  disabled={loading || !query.trim()} 
                  className={`
                    mr-2 rounded-full flex items-center justify-center transition-all duration-300 font-bold
                    ${isMobile ? 'w-11 h-11' : 'w-12 h-12'}
                    ${loading || !query.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer hover:from-blue-700 hover:to-indigo-700 hover:scale-110 shadow-lg'}
                  `}
                >
                  ⬆
                </button>
              </div>
              <p className="text-center mt-3 text-[11px] font-semibold text-gray-500 tracking-wide">
                💡 Powered by AI • Finding the best learning resources for you
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceFinder;