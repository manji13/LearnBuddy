import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function AdminPastPaperPage() {
  const [form, setForm] = useState({
    title: '',
    moduleName: '',
    semester: '',
    year: '',
    uploadedBy: '',
  });
  const [file, setFile] = useState(null);
  const [pastPapers, setPastPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const fetchPastPapers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/pastpapers`);
      setPastPapers(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load past papers');
    }
  };

  useEffect(() => {
    fetchPastPapers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!form.title || !form.moduleName || !form.semester || !form.year) {
      setError('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('moduleName', form.moduleName);
    formData.append('semester', form.semester);
    formData.append('year', form.year);
    if (form.uploadedBy) {
      formData.append('uploadedBy', form.uploadedBy);
    }
    formData.append('file', file);

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/pastpapers/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Past paper uploaded successfully');
      setForm({ title: '', moduleName: '', semester: '', year: '', uploadedBy: '' });
      setFile(null);
      await fetchPastPapers();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Failed to upload past paper';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    resetMessages();
    if (!window.confirm('Are you sure you want to delete this past paper?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/pastpapers/${id}`);
      setSuccess('Past paper deleted successfully');
      await fetchPastPapers();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Failed to delete past paper';
      setError(message);
    }
  };

  const handleDownload = (id) => {
    window.open(`${API_BASE_URL}/api/pastpapers/download/${id}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Past Papers Management</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Admins and lecturers can upload, download, and delete past exam papers used by students.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-lg shadow-sm">
            <span>Admin / Lecturer view</span>
          </div>
        </header>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <span className="mt-0.5 text-lg">!</span>
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
            <span className="mt-0.5 text-lg">✓</span>
            <p>{success}</p>
          </div>
        )}

        {/* Upload Form (Admin) */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Upload Past Paper</h2>
              <p className="mt-1 text-xs text-slate-500">Add new PDFs to the central past paper library.</p>
            </div>
            <span className="hidden sm:inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              PDF · max 10MB
            </span>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleUpload}>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. CS101 Midterm 2023"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Module Name *</label>
              <input
                type="text"
                name="moduleName"
                value={form.moduleName}
                onChange={handleInputChange}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Computer Networks"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <input
                type="text"
                name="semester"
                value={form.semester}
                onChange={handleInputChange}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Semester 1"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleInputChange}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 2024"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Uploaded By (optional)</label>
              <input
                type="text"
                name="uploadedBy"
                value={form.uploadedBy}
                onChange={handleInputChange}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lecturer name"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">PDF File *</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                {loading ? 'Uploading...' : 'Upload Past Paper'}
              </button>
            </div>
          </form>
        </div>

        {/* Past Papers Table (Admin) */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">All Past Papers</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Title</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Module</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Semester</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Year</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pastPapers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500 text-sm">
                      No past papers found.
                    </td>
                  </tr>
                )}

                {pastPapers.map((paper) => (
                  <tr key={paper._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">{paper.title}</td>
                    <td className="px-4 py-2 text-gray-700">{paper.moduleName}</td>
                    <td className="px-4 py-2 text-gray-700">{paper.semester}</td>
                    <td className="px-4 py-2 text-gray-700">{paper.year}</td>
                    <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDownload(paper._id)}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(paper._id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPastPaperPage;
