import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EmployeeNavbar from "../../Components/NavBar/employeeNavbar";

const API_URL = "http://localhost:8080/api";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminAnnouncementList = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    topic: "",
  });

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/announcements`, {
        headers: authHeader(),
      });
      setAnnouncements(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/announcements/${deleteModal.id}`, {
        headers: authHeader(),
      });
      setAnnouncements((prev) => prev.filter((a) => a._id !== deleteModal.id));
      showSuccess("Announcement deleted successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete announcement"
      );
    } finally {
      setLoading(false);
      setDeleteModal({ open: false, id: null, topic: "" });
    }
  };

  const filtered = announcements.filter((a) => {
    const topic = a.topic?.toLowerCase() || "";
    const description = a.description?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return topic.includes(query) || description.includes(query);
  });

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div >

      <EmployeeNavbar />

      {/* Header */}
        <div className="max-w-8xl mx-auto p-8">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 m-0">
            Announcements
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {announcements.length} total announcement
            {announcements.length !== 1 ? "s" : ""}
          </p>
        </div>
        {/* ✅ FIXED: was /create, now matches App.jsx route /new */}
        <button
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer border-0"
          onClick={() => navigate("/admin/announcements/new")}
        >
          <span className="text-lg">＋</span> New Announcement
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="px-4 py-3 rounded-lg mb-4 text-sm font-medium bg-emerald-100 text-emerald-800">
          ✓ {successMessage}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-lg mb-4 text-sm font-medium bg-red-100 text-red-800">
          ✕ {error}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 mb-5 gap-2">
        <span>🔍</span>
        <input
          className="border-0 bg-transparent outline-none text-sm flex-1 text-gray-700 placeholder-gray-400"
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer text-sm"
            onClick={() => setSearchQuery("")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center py-16">
          <div className="w-9 h-9 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 mt-3 text-sm">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-3">📢</div>
          <p className="text-base mb-4">
            {searchQuery ? "No results found" : "No announcements yet"}
          </p>
          {!searchQuery && (
            // ✅ FIXED: was /create, now matches App.jsx route /new
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer"
              onClick={() => navigate("/admin/announcements/new")}
            >
              Create your first announcement
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["#", "Topic", "Description", "Created By", "Date", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="bg-gray-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ann, idx) => (
                <tr
                  key={ann._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3.5 text-xs text-gray-400 w-10">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 max-w-[200px]">
                    {ann.topic}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 max-w-[280px]">
                    {ann.description.length > 80
                      ? ann.description.slice(0, 80) + "…"
                      : ann.description}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">
                    {ann.createdBy?.name || "Admin"}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(ann.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1.5 justify-center flex-wrap">
                      <button
                        className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-xs font-semibold cursor-pointer hover:bg-blue-100"
                        onClick={() =>
                          navigate(`/admin/announcements/${ann._id}`)
                        }
                      >
                        View
                      </button>
                      {/* ✅ FIXED: matches /edit/:id route in App.jsx */}
                      <button
                        className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-md text-xs font-semibold cursor-pointer hover:bg-green-100"
                        onClick={() =>
                          navigate(`/admin/announcements/edit/${ann._id}`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs font-semibold cursor-pointer hover:bg-red-100"
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            id: ann._id,
                            topic: ann.topic,
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-9 max-w-md w-11/12 text-center shadow-2xl">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-xl font-bold mb-2">Delete Announcement</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Are you sure you want to delete{" "}
              <strong>"{deleteModal.topic}"</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold cursor-pointer bg-white text-gray-700 hover:bg-gray-50"
                onClick={() =>
                  setDeleteModal({ open: false, id: null, topic: "" })
                }
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 border-0 rounded-lg text-sm font-semibold cursor-pointer bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminAnnouncementList;