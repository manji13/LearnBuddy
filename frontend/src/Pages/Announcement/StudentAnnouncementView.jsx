import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Components/Navbar/Navbar";

const API_URL = "http://localhost:8080/api";
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
const formatDateLong = (d) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
const formatTime = (d) =>
  new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const StudentAnnouncementView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch list
  useEffect(() => {
    const fetchAll = async () => {
      setListLoading(true);
      try {
        const res = await axios.get(`${API_URL}/announcements`, { headers: authHeader() });
        const data = res.data.data;
        setAnnouncements(data);
        localStorage.setItem("announcement_last_seen_count", data.length.toString());
      } catch (err) {
        console.error(err);
      } finally {
        setListLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Fetch detail when id changes (or auto-select first)
  useEffect(() => {
    if (!id && announcements.length > 0) {
      navigate(`/student/announcements/${announcements[0]._id}`, { replace: true });
      return;
    }
    if (!id) return;

    const fetchOne = async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const res = await axios.get(`${API_URL}/announcements/${id}`, { headers: authHeader() });
        setSelected(res.data.data);
      } catch (err) {
        setDetailError(err.response?.data?.message || "Failed to load announcement");
      } finally {
        setDetailLoading(false);
      }
    };
    fetchOne();
  }, [id, announcements]);

  const filtered = announcements.filter((a) => {
    const q = searchQuery.toLowerCase();
    return a.topic?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Panel: List ── */}
        <div className="w-80 shrink-0 flex flex-col border-r border-gray-100 bg-gray-50">

          {/* Search */}
          <div className="px-3 py-3 border-b border-gray-100">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 gap-2">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                className="border-0 bg-transparent outline-none text-xs flex-1 text-gray-700 placeholder-gray-400"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="text-gray-300 hover:text-gray-500 bg-transparent border-0 cursor-pointer text-xs" onClick={() => setSearchQuery("")}>✕</button>
              )}
            </div>
          </div>

          {/* Count */}
          <div className="px-4 py-2 text-xs text-gray-400">
            {filtered.length} announcement{filtered.length !== 1 ? "s" : ""}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {listLoading ? (
              <div className="flex flex-col gap-2 px-3 py-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg px-3 py-3 border border-gray-100 animate-pulse">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-2.5 bg-gray-100 rounded w-full mb-1" />
                    <div className="h-2 bg-gray-100 rounded w-1/3 mt-2" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">No announcements found</div>
            ) : (
              <div className="flex flex-col">
                {filtered.map((ann) => {
                  const isActive = ann._id === id;
                  return (
                    <button
                      key={ann._id}
                      onClick={() => navigate(`/student/announcements/${ann._id}`)}
                      className={`w-full text-left px-4 py-3.5 border-b border-gray-100 transition-all duration-150 cursor-pointer
                        ${isActive
                          ? "bg-white border-l-4 border-l-indigo-500 pl-3"
                          : "bg-transparent border-l-4 border-l-transparent hover:bg-white pl-3"
                        }`}
                    >
                      <div className={`text-sm font-semibold mb-0.5 truncate ${isActive ? "text-indigo-700" : "text-gray-800"}`}>
                        {ann.topic}
                      </div>
                      <div className="text-xs text-gray-400 truncate mb-1.5">
                        {ann.description}
                      </div>
                      <div className="text-xs text-gray-300">{formatDate(ann.createdAt)}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel: Detail ── */}
        <div className="flex-1 overflow-y-auto bg-white">
          {detailLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-gray-400 mt-3 text-sm">Loading...</p>
            </div>
          ) : detailError ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <p className="text-red-500 text-sm mb-4">{detailError}</p>
            </div>
          ) : !selected ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm">Select an announcement</p>
            </div>
          ) : (
            <div className="py-10 px-12 max-w-3xl">
              <span className="inline-block bg-violet-100 text-violet-700 text-xs font-bold tracking-widest px-3.5 py-1.5 rounded-full mb-6 uppercase">
                📢 Official Announcement
              </span>

              <h1 className="text-3xl font-extrabold text-gray-900 leading-snug mb-6">{selected.topic}</h1>

              <div className="flex gap-8 flex-wrap mb-6">
                {[
                  { label: "Date Posted", value: formatDateLong(selected.createdAt) },
                  { label: "Time", value: formatTime(selected.createdAt) },
                  { label: "Posted By", value: selected.createdBy?.name || "Administration" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</div>
                    <div className="text-sm font-semibold text-gray-800">{value}</div>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100 mb-6" />

              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Details</h2>
              <p className="text-base text-gray-700 leading-loose whitespace-pre-wrap">{selected.description}</p>

              {selected.updatedAt && selected.updatedAt !== selected.createdAt && (
                <p className="mt-8 text-xs text-gray-400 italic">
                  Last updated: {formatDateLong(selected.updatedAt)} at {formatTime(selected.updatedAt)}
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentAnnouncementView;