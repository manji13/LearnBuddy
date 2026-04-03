import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Components/Navbar/Navbar";

const API_URL = "http://localhost:5000/api";
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const StudentAnnouncementList = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/announcements`, { headers: authHeader() });
      setAnnouncements(res.data.data);

      // Call this after announcements are fetched successfully
localStorage.setItem('announcement_last_seen_count', announcements.length.toString());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => { fetchAll(); }, []);

const filtered = announcements.filter((a) => {
  const topic = a.topic?.toLowerCase() || "";
  const description = a.description?.toLowerCase() || "";
  const query = searchQuery.toLowerCase();

  return topic.includes(query) || description.includes(query);
});

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const getDaysAgo = (d) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

 return (
  <div>
    <Navbar />

    {/* Search */}
    <div className="p-4 max-w-8xl mx-auto">
 <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3 gap-2 shadow-sm w-fit min-w-[220px]">
  <span className="text-xs text-gray-400">🔍</span>
  <input
    className="border-0 bg-transparent outline-none text-xs flex-1 text-gray-700 placeholder-gray-400"
    placeholder="Search announcements..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  {searchQuery && (
    <button
      className="text-gray-300 hover:text-gray-500 bg-transparent border-0 cursor-pointer text-xs"
      onClick={() => setSearchQuery("")}
    >
      ✕
    </button>
  )}
</div>

    {!loading && !error && (
      <p className="text-xs text-gray-400 mb-5">
        {filtered.length} announcement{filtered.length !== 1 ? "s" : ""}
        {searchQuery ? ` for "${searchQuery}"` : ""}
      </p>
    )}

    {/* Error */}
    {error && (
      <div className="bg-red-50 text-red-700 px-4 py-3.5 rounded-xl mb-5 flex items-center justify-between text-sm">
        ⚠️ {error}
        <button
          className="bg-red-600 text-white border-0 rounded-md px-3 py-1.5 text-xs cursor-pointer hover:bg-red-700"
          onClick={fetchAll}
        >
          Retry
        </button>
      </div>
    )}

    {/* Skeletons */}
    {loading ? (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl px-5 py-3.5 border border-gray-100 animate-pulse flex items-center gap-4">
            <div className="h-3 bg-gray-200 rounded w-24 shrink-0" />
            <div className="h-4 bg-gray-200 rounded w-40 shrink-0" />
            <div className="h-3 bg-gray-200 rounded flex-1" />
          </div>
        ))}
      </div>
    ) : filtered.length === 0 ? (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          {searchQuery ? "No results found" : "No announcements yet"}
        </h3>
        <p className="text-sm text-gray-400">
          {searchQuery ? "Try a different search term." : "Check back later for updates."}
        </p>
      </div>
    ) : (
      <div className="flex flex-col gap-2">
        {filtered.map((ann) => (
          <div
            key={ann._id}
            className="bg-white rounded-xl px-5 py-3.5 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 flex items-center gap-4 min-w-0"
            onClick={() => navigate(`/student/announcements/${ann._id}`)}
          >
            {/* Date */}
            <span className="text-xs text-gray-400 shrink-0 w-24">
              {formatDate(ann.createdAt)}
            </span>

            {/* Title */}
            <span className="text-sm font-bold text-gray-900 shrink-0 max-w-[180px] truncate">
              {ann.topic}
            </span>

            {/* Divider */}
            <span className="text-gray-300 shrink-0">|</span>

            {/* Preview */}
            <span className="text-sm text-gray-400 truncate flex-1">
              {ann.description}
            </span>

            {/* Arrow */}
            <span className="text-indigo-500 text-sm shrink-0">→</span>
          </div>
        ))}
      </div>
    )}
     </div>
  </div>
);
};

export default StudentAnnouncementList;