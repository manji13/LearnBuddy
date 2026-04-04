import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

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
  const [fieldErrors, setFieldErrors] = useState({});

  // Dropdown data and selections for Faculty → Year → Semester → Module
  const [faculties, setFaculties] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');

  const location = useLocation();
  const [moduleFilter, setModuleFilter] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const fetchPastPapers = async (moduleNameFilter) => {
    try {
      let res;
      if (moduleNameFilter) {
        res = await axios.get(`${API_BASE_URL}/api/pastpapers/search`, {
          params: { moduleName: moduleNameFilter },
        });
      } else {
        res = await axios.get(`${API_BASE_URL}/api/pastpapers`);
      }
      setPastPapers(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load past papers');
    }
  };

  // Load faculties and semesters for dropdowns
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [facRes, semRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/faculties`),
          axios.get(`${API_BASE_URL}/api/semesters`),
        ]);
        setFaculties(facRes.data.data || facRes.data || []);
        setSemesters(semRes.data.data || semRes.data || []);
      } catch (err) {
        console.error('Failed to load faculty/semester data', err);
      }
    };

    loadMeta();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const moduleNameFromQuery = params.get('moduleName') || '';

    if (moduleNameFromQuery) {
      setForm((prev) => ({ ...prev, moduleName: moduleNameFromQuery }));
      setModuleFilter(moduleNameFromQuery);
      fetchPastPapers(moduleNameFromQuery);
    } else {
      fetchPastPapers();
    }
  }, [location.search]);

  // Reset dependent selections when faculty changes
  useEffect(() => {
    setSelectedYear('');
    setSelectedSemesterId('');
    setSelectedModuleId('');
    setModules([]);
    setForm((prev) => ({
      ...prev,
      moduleName: '',
      semester: '',
      year: '',
    }));
    setModuleFilter('');
  }, [selectedFaculty]);

  // Reset semester/module when year changes
  useEffect(() => {
    setSelectedSemesterId('');
    setSelectedModuleId('');
    setModules([]);
    setForm((prev) => ({
      ...prev,
      moduleName: '',
      semester: '',
      year: selectedYear || '',
    }));
    setModuleFilter('');
  }, [selectedYear]);

  // When semester changes, update form semester/year and load modules for that semester
  useEffect(() => {
    const loadModulesForSemester = async () => {
      try {
        if (!selectedSemesterId) {
          setModules([]);
          setSelectedModuleId('');
          setForm((prev) => ({ ...prev, moduleName: '', semester: '' }));
          setModuleFilter('');
          return;
        }

        const semObj = semesters.find((s) => s._id === selectedSemesterId);
        setForm((prev) => ({
          ...prev,
          semester: semObj ? `Semester ${semObj.semester}` : '',
          year: semObj ? semObj.year : prev.year,
          moduleName: '',
        }));
        setModuleFilter('');

        const res = await axios.get(`${API_BASE_URL}/api/modules`, {
          params: { semester: selectedSemesterId },
        });
        setModules(res.data.data || res.data || []);
      } catch (err) {
        console.error('Failed to load modules for semester', err);
      }
    };

    loadModulesForSemester();
  }, [selectedSemesterId, semesters]);

  // When module changes, update form.moduleName and table filter
  useEffect(() => {
    if (!selectedModuleId) {
      setForm((prev) => ({ ...prev, moduleName: '' }));
      setModuleFilter('');
      return;
    }

    const modObj = modules.find((m) => m._id === selectedModuleId);
    const name = modObj?.moduleName || '';
    setForm((prev) => ({ ...prev, moduleName: name }));
    setModuleFilter(name);
  }, [selectedModuleId, modules]);

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

    const newErrors = {};

    if (!form.title || !form.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!selectedFaculty) {
      newErrors.faculty = 'Faculty is required';
    }
    if (!selectedYear) {
      newErrors.year = 'Year is required';
    }
    if (!selectedSemesterId) {
      newErrors.semesterSelect = 'Semester is required';
    }
    if (!selectedModuleId) {
      newErrors.module = 'Module is required';
    }
    if (!file) {
      newErrors.file = 'PDF file is required';
    }

    // Optional lecturer name, but must not contain numbers
    if (form.uploadedBy && /[0-9]/.test(form.uploadedBy)) {
      newErrors.uploadedBy = 'Lecturer name cannot contain numbers';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Please fill all required fields before uploading.');
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
      await fetchPastPapers(moduleFilter || undefined);
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
      await fetchPastPapers(moduleFilter || undefined);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Failed to delete past paper';
      setError(message);
    }
  };

  const handleDownload = (id) => {
    window.open(`${API_BASE_URL}/api/pastpapers/download/${id}`, '_blank');
  };

  // Derived dropdown options
  const facultySemesters = selectedFaculty
    ? semesters.filter((s) => (s.faculty?._id || s.faculty) === selectedFaculty)
    : [];

  const yearOptions = Array.from(new Set(facultySemesters.map((s) => s.year))).sort((a, b) => a - b);

  const filteredSemesters = facultySemesters.filter((s) =>
    selectedYear ? String(s.year) === String(selectedYear) : true
  );

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
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.title ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="e.g. CS101 Midterm 2023"
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Faculty *</label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                  fieldErrors.faculty ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                <option value="">Select faculty</option>
                {faculties.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
              {fieldErrors.faculty && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.faculty}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Year *</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!selectedFaculty || yearOptions.length === 0}
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400 ${
                  fieldErrors.year ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                <option value="">Select year</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {fieldErrors.year && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.year}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                disabled={!selectedFaculty || !selectedYear}
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400 ${
                  fieldErrors.semesterSelect ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                <option value="">Select semester</option>
                {filteredSemesters.map((s) => (
                  <option key={s._id} value={s._id}>
                    Semester {s.semester}
                  </option>
                ))}
              </select>
              {fieldErrors.semesterSelect && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.semesterSelect}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Module Name *</label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                disabled={!selectedSemesterId || modules.length === 0}
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400 ${
                  fieldErrors.module ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                <option value="">Select module</option>
                {modules.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.moduleNumber} 
                    {' - '} 
                    {m.moduleName}
                  </option>
                ))}
              </select>
              {fieldErrors.module && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.module}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Uploaded By (optional)</label>
              <input
                type="text"
                name="uploadedBy"
                value={form.uploadedBy}
                onChange={handleInputChange}
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.uploadedBy ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="Lecturer name"
              />
              {fieldErrors.uploadedBy && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.uploadedBy}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">PDF File *</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className={`block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 ${
                  fieldErrors.file ? 'border border-red-400 rounded-md' : ''
                }`}
              />
              {fieldErrors.file && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.file}</p>
              )}
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
