import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const authHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) console.warn("No auth token found in localStorage");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AnnouncementForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Route is /edit/:id  → id will be the MongoDB ObjectId
  // Route is /new       → id will be undefined
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ topic: "", description: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Prefill on edit
  useEffect(() => {
    if (!isEdit) return;

    const fetchOne = async () => {
      setLoading(true);
      setFetchFailed(false);
      try {
        const res = await axios.get(`${API_URL}/announcements/${id}`, {
          headers: authHeader(),
        });

        const data = res.data?.data;
        if (!data) throw new Error("No data received");

        setForm({
          topic: data.topic || "",
          description: data.description || "",
        });
      } catch (err) {
        setFetchFailed(true);
        setApiError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load announcement"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOne();
  }, [id, isEdit]);

  const validate = () => {
    const errs = {};
    if (!form.topic.trim()) errs.topic = "Topic is required";
    else if (form.topic.trim().length > 200)
      errs.topic = "Topic cannot exceed 200 characters";
    if (!form.description.trim()) errs.description = "Description is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError(null);
    const payload = {
      topic: form.topic.trim(),
      description: form.description.trim(),
    };

    try {
      if (isEdit) {
        await axios.put(`${API_URL}/announcements/${id}`, payload, {
          headers: authHeader(),
        });
      } else {
        await axios.post(`${API_URL}/announcements`, payload, {
          headers: authHeader(),
        });
      }
      setSubmitted(true);
      setTimeout(() => navigate("/admin/announcements"), 1500);
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5 font-sans">
      <div className="bg-white rounded-2xl p-10 max-w-2xl mx-auto shadow-lg">

        {/* Back */}
        <button
          className="text-indigo-600 text-sm font-semibold bg-transparent border-0 cursor-pointer p-0 mb-7 flex items-center gap-1 hover:text-indigo-800 transition-colors"
          onClick={() => navigate("/admin/announcements")}
        >
          ← Back to Announcements
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">{isEdit ? "✏️" : "📢"}</div>
          <h1 className="text-2xl font-bold text-gray-900 m-0 mb-1.5">
            {isEdit ? "Edit Announcement" : "Create Announcement"}
          </h1>
          <p className="text-sm text-gray-500 m-0">
            {isEdit
              ? "Update the announcement details below."
              : "Fill in the details to post a new announcement."}
          </p>
        </div>

        {/* Success */}
        {submitted && (
          <div className="px-4 py-3 rounded-lg mb-5 text-sm font-medium bg-emerald-100 text-emerald-800">
            ✓ Announcement {isEdit ? "updated" : "created"} successfully!
            Redirecting...
          </div>
        )}

        {/* API Error */}
        {apiError && (
          <div className="px-4 py-3 rounded-lg mb-5 text-sm font-medium bg-red-100 text-red-800">
            ✕ {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

          {/* Topic */}
          <div className="flex flex-col">
            <label
              className="text-sm font-semibold text-gray-700 mb-2"
              htmlFor="topic"
            >
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              id="topic"
              name="topic"
              type="text"
              value={form.topic}
              onChange={handleChange}
              placeholder="Enter announcement topic"
              maxLength={200}
              className={`border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                ${errors.topic ? "border-red-400" : "border-gray-300"}`}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-red-500">{errors.topic || ""}</span>
              <span className="text-xs text-gray-400">
                {form.topic.length}/200
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label
              className="text-sm font-semibold text-gray-700 mb-2"
              htmlFor="description"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write the full announcement details here..."
              rows={7}
              className={`border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 outline-none resize-y leading-relaxed font-sans transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                ${errors.description ? "border-red-400" : "border-gray-300"}`}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-red-500">
                {errors.description || ""}
              </span>
              <span className="text-xs text-gray-400">
                {form.description.length} characters
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate("/admin/announcements")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || submitted || (isEdit && fetchFailed)}
              className="px-7 py-2.5 border-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                ? "Save Changes"
                : "Post Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementForm;