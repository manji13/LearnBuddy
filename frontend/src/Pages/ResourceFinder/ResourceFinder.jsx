// src/Pages/ResourceFinder.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../../Components/NavBar/NavBar.jsx';

// Keeping only essential keyframes that are not native to Tailwind
const essentialKeyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
  }
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

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
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
      const response = await axios.post(
        'http://localhost:5000/api/resources/search', 
        { query: trimmedQuery }, 
        axiosConfig
      );
      
      setCurrentResults(response.data.data);
      fetchHistory(); 
    } catch (err) {
      console.error("Error searching", err);
      setError(err.response?.data?.message || 'Search failed. Please try again.');
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
      <div className="flex flex-col h-screen font-sans bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-5">
          <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] text-center">
            <span className="text-5xl block mb-5">🔐</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Resource Finder</h2>
            <p className="text-red-600 font-medium">Please sign in to access Resource Finder.</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading View
  if (pageLoading) {
    return (
      <div className="flex flex-col h-screen font-sans bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-5"></div>
          <h3 className="text-gray-700 font-semibold text-lg">Loading your workspace...</h3>
          <p className="text-gray-400 text-sm mt-2">Preparing your learning resources</p>
        </div>
      </div>
    );
  }

  return (
    /* The main wrapper is now a flex column taking the full height of the screen */
    <div className="flex flex-col h-screen font-sans bg-white overflow-hidden text-gray-800">
      <style>{essentialKeyframes}</style>

      {/* Navbar sits safely at the top */}
      <Navbar />

      {/* Main content area takes remaining space */}
      <div className="flex flex-1 relative overflow-hidden border-t border-gray-200">
        
        {/* TOUR MODAL */}
        {showTour && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-5">
            <div className="animate-fade-in-up bg-white p-8 rounded-[28px] max-w-[500px] w-full shadow-2xl">
              <div className="text-center mb-5"><span className="text-6xl block">🎓</span></div>
              <h2 className="text-2xl font-bold text-blue-600 text-center mb-3">Welcome to Resource Finder!</h2>
              <p className="text-gray-600 text-center mb-5">Your AI-powered learning companion</p>
              
              <div className="bg-blue-50/50 p-5 rounded-2xl mb-6 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">💬</span>
                  <div>
                    <strong className="block text-[15px] text-gray-800">Smart Search</strong>
                    <span className="text-[13px] text-gray-500">Get curated YouTube tutorials instantly</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl">📚</span>
                  <div>
                    <strong className="block text-[15px] text-gray-800">Search History</strong>
                    <span className="text-[13px] text-gray-500">Revisit past searches anytime</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🗑️</span>
                  <div>
                    <strong className="block text-[15px] text-gray-800">Easy Management</strong>
                    <span className="text-[13px] text-gray-500">Delete individual or all history</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={closeTour}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-md"
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
            className="absolute left-4 top-4 z-30 bg-blue-600 text-white w-11 h-11 rounded-xl shadow-lg flex items-center justify-center transition-transform hover:scale-105"
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
        
        {/* SIDEBAR */}
        <div 
          className={`
            bg-gray-50 border-r border-gray-200 flex flex-col z-50 transition-all duration-300 ease-in-out whitespace-nowrap
            ${isMobile ? 'absolute top-0 bottom-0 shadow-2xl' : 'relative h-full'}
            ${(isMobile ? mobileSidebarOpen : !sidebarCollapsed) ? 'w-[300px] px-4 py-5' : 'w-0 overflow-hidden opacity-0'}
            ${isMobile && !mobileSidebarOpen ? '-left-[300px]' : 'left-0'}
          `}
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-gray-800 text-lg font-semibold tracking-tight">📚 History</h3>
            {isMobile && (
              <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl">✕</button>
            )}
          </div>

          <button 
            onClick={startNewSearch}
            className="flex items-center justify-center gap-2 w-full py-3.5 mb-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[15px] transition-all transform hover:scale-[1.02] shadow-sm"
          >
            <span className="text-xl leading-none">+</span> New Search
          </button>

          <div className="flex justify-between items-center mb-4 px-1">
            <h4 className="m-0 text-gray-500 text-xs font-bold uppercase tracking-wider">Recent Searches</h4>
            {history.length > 0 && (
              <button 
                onClick={handleClearHistory} 
                className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors" 
                title="Clear all history"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            {history.length === 0 ? (
              <div className="text-center py-10 px-5">
                <span className="text-5xl opacity-50 block mb-3">📭</span>
                <p className="text-gray-500 text-sm font-medium">No searches yet</p>
                <p className="text-gray-400 text-xs mt-1">Start by typing a topic above</p>
              </div>
            ) : (
              history.map((histItem) => (
                <div 
                  key={histItem._id} 
                  onClick={() => openHistorySession(histItem)}
                  className={`
                    group p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all duration-200
                    ${activeHistory?._id === histItem._id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-200/50'}
                    ${deletingId === histItem._id ? 'opacity-0 -translate-x-5' : 'opacity-100'}
                  `}
                >
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-[14px] flex items-center gap-2.5">
                    <span className="text-[16px] opacity-70">🔍</span> {histItem.searchQuery}
                  </div>
                  <button 
                    onClick={(e) => handleDeleteHistoryItem(e, histItem._id)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
          
          {error && (
            <div className="m-5 mx-auto w-[90%] max-w-2xl bg-red-50 text-red-700 px-5 py-3 rounded-xl flex items-center justify-between shadow-sm z-10">
              <span className="font-medium flex items-center gap-2">⚠️ {error}</span>
              <button onClick={() => setError('')} className="text-xl text-red-500 hover:text-red-800">✕</button>
            </div>
          )}

          <div 
            ref={mainContentRef} 
            className={`
              flex-1 overflow-y-auto flex flex-col gap-6 
              ${isMobile ? 'px-4 pt-5 pb-32' : 'px-[10%] pt-8 pb-36'}
              [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
            `}
          >
            
            {/* EMPTY STATE */}
            {currentResults.length === 0 && !loading && !activeHistory && !lastSearch && (
              <div className="animate-fade-in-up flex flex-col justify-center items-center min-h-[60vh] text-center text-gray-500 mt-10">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[40px] mb-8 shadow-xl shadow-indigo-200">
                  <span className="text-[50px] leading-none block">🎯</span>
                </div>
                <h2 className="text-gray-800 font-bold mb-3 text-2xl md:text-3xl">Find Your Perfect Tutorial</h2>
                <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">Ask me anything — from coding to cooking, I'll find the best YouTube videos for you.</p>
                <div className="flex flex-wrap gap-2.5 mt-8 justify-center max-w-2xl">
                  {['React Tutorial', 'Machine Learning', 'Python Basics', 'CSS Grid', 'JavaScript', 'TypeScript', 'Node.js'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      className="px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium border border-gray-100 rounded-full text-sm transition-all hover:scale-105 hover:border-blue-200 shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* USER MESSAGE */}
            {(lastSearch || activeHistory) && (
              <div className="animate-fade-in-up flex gap-3 self-end max-w-[85%]">
                <div className="bg-blue-600 text-white py-3 px-5 rounded-t-[22px] rounded-bl-[22px] rounded-br-[4px] text-[15px] leading-relaxed shadow-sm break-words">
                  {activeHistory ? activeHistory.searchQuery : lastSearch}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  You
                </div>
              </div>
            )}

            {/* LOADING INDICATOR */}
            {loading && (
              <div className="animate-fade-in-up flex gap-3 self-start max-w-[85%]">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl shrink-0 border border-blue-100">✨</div>
                <div className="bg-white border border-gray-100 py-3 px-5 rounded-t-[22px] rounded-br-[22px] rounded-bl-[4px] shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <span className="ml-2 text-gray-500 text-sm font-medium">Finding resources...</span>
                  </div>
                </div>
              </div>
            )}

            {/* RESULTS */}
            {currentResults.length > 0 && (
              <div className="animate-fade-in-up flex gap-3 self-start w-full">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl shrink-0 border border-blue-100 shadow-sm mt-1">✨</div>
                <div className="w-[calc(100%-52px)]">
                  <div className="bg-gray-50 border border-gray-100 py-3.5 px-5 rounded-2xl mb-6 shadow-sm">
                    <p className="m-0 text-[14px] text-gray-800">
                      Here are the best resources I found for <strong className="text-blue-700">"{activeHistory ? activeHistory.searchQuery : lastSearch}"</strong>:
                    </p>
                  </div>
                  
                  <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))]'}`}>
                    {currentResults.map((video, index) => (
                      <div 
                        key={index} 
                        className="group border border-gray-200 rounded-[16px] overflow-hidden bg-white flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                      >
                        <div className="relative overflow-hidden aspect-video">
                          <img 
                            src={video.thumbnail} 
                            alt="thumbnail" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">
                            ▶ YouTube
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col bg-white group-hover:bg-blue-50/10 transition-colors">
                          <h4 className="m-0 mb-2.5 text-[15px] text-gray-900 leading-snug font-bold line-clamp-2">
                            {video.title}
                          </h4>
                          <p className="m-0 mb-4 text-[13px] text-gray-500 leading-relaxed flex-1 line-clamp-3">
                            {video.description || 'No description available'}
                          </p>
                          <button 
                            className="w-full block text-center bg-gray-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300"
                          >
                            Watch Now →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT BAR */}
          <div className={`absolute bottom-0 left-0 right-0 ${isMobile ? 'p-4' : 'px-[10%] py-6'} bg-gradient-to-t from-white via-white to-transparent pt-10`}>
            <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto">
              <div className={`
                flex items-center rounded-full bg-white transition-all duration-300 border
                ${query.trim() ? 'border-blue-300 shadow-[0_4px_20px_rgba(26,115,232,0.15)]' : 'border-gray-200 shadow-md'}
                focus-within:border-blue-500 focus-within:shadow-[0_4px_25px_rgba(26,115,232,0.2)] focus-within:ring-2 focus-within:ring-blue-100
              `}>
                <input 
                  type="text" 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder={loading ? "Searching resources..." : "Ask for a tutorial or topic..."}
                  className={`flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 ${isMobile ? 'py-3.5 px-5 text-[15px]' : 'py-4 px-6 text-base'}`}
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  disabled={loading || !query.trim()} 
                  className={`
                    mr-2 rounded-full flex items-center justify-center transition-all duration-300
                    ${isMobile ? 'w-10 h-10' : 'w-11 h-11'}
                    ${loading || !query.trim() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700 hover:scale-105 shadow-md'}
                  `}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </form>
            <div className="text-center mt-3 text-[11px] font-medium text-gray-400 tracking-wide">
              🔍 Resource Finder uses AI to find the best YouTube tutorials for your learning journey
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceFinder;