import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NavBar from "../../Components/NavBar/NavBar";
const API_URL = "http://localhost:5000/api";
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminAnnouncementView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    const fetchOne = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/announcements/${id}`, { headers: authHeader() });
        setAnnouncement(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load announcement");
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/announcements/${id}`, { headers: authHeader() });
      setSuccessMessage("Announcement deleted successfully!");
      setTimeout(() => navigate("/admin/announcements"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete announcement");
    } finally {
      setLoading(false);
      setDeleteModal(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  if (loading && !announcement) {
    return (
      <div className="flex flex-col items-center justify-center h-64 font-sans">
        <div className="w-9 h-9 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-500 mt-3 text-sm">Loading...</p>
      </div>
    );
  }

  if (error && !announcement) {
    return (
      <div className="flex flex-col items-center justify-center h-64 font-sans text-center">
        <p className="text-red-600 text-base mb-4">{error}</p>
        <button className="bg-indigo-600 text-white border-0 rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-indigo-700"
          onClick={() => navigate("/admin/announcements")}>← Back to list</button>
      </div>
    );
  }

  if (!announcement) return null;
  const ann = announcement;

  return (
   <div className="min-h-screen bg-gray-50 font-sans">
<NavBar/>
      {successMessage && (
        <div className="px-4 py-3 rounded-lg mb-5 text-sm font-medium bg-emerald-100 text-emerald-800">✓ {successMessage}</div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-lg mb-5 text-sm font-medium bg-red-100 text-red-800">✕ {error}</div>
      )}

      <div className="bg-white rounded-2xl shadow-md border border-gray-100">

        {/* Nav */}
        <div className="flex justify-between items-center px-9 pt-7 pb-0 flex-wrap gap-3">
          <button className="text-indigo-600 text-sm font-semibold bg-transparent border-0 cursor-pointer p-0 hover:text-indigo-800"
            onClick={() => navigate("/announcements")}>← Back to Announcements</button>
          <div className="flex gap-2.5">
            <button className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold cursor-pointer hover:bg-green-100"
              onClick={() => navigate(`/admin/announcements/edit/${ann._id}`)}>✏️ Edit</button>
            <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold cursor-pointer hover:bg-red-100"
              onClick={() => setDeleteModal(true)}>🗑️ Delete</button>
          </div>
        </div>

        <div className="px-9 pb-9 pt-6">
          <span className="inline-block bg-violet-100 text-violet-700 text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-4 uppercase">
            Announcement
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-5 leading-snug">{ann.topic}</h1>

          <div className="flex flex-col gap-2.5 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span>📅</span>
              <span><strong>Posted:</strong> {formatDate(ann.createdAt)} at {formatTime(ann.createdAt)}</span>
            </div>
            {ann.updatedAt !== ann.createdAt && (
              <div className="flex items-start gap-2">
                <span>🔄</span>
                <span><strong>Updated:</strong> {formatDate(ann.updatedAt)} at {formatTime(ann.updatedAt)}</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <span>👤</span>
              <span>
                <strong>By:</strong> {ann.createdBy?.name || "Admin"}{" "}
                {ann.createdBy?.email && <span className="text-gray-400">({ann.createdBy.email})</span>}
              </span>
            </div>
          </div>

          <hr className="border-0 border-t border-gray-100 my-6" />

          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Description</h3>
          <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap m-0">{ann.description}</p>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-9 max-w-sm w-11/12 text-center shadow-2xl">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-xl font-bold mb-2">Delete Announcement?</h3>
            <p className="text-sm text-gray-500 mb-6">This will permanently delete <strong>"{ann.topic}"</strong>.</p>
            <div className="flex gap-3 justify-center">
              <button className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold cursor-pointer bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => setDeleteModal(false)}>Cancel</button>
              <button className="px-6 py-2.5 border-0 rounded-lg text-sm font-semibold cursor-pointer bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
                onClick={handleDelete} disabled={loading}>{loading ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncementView;