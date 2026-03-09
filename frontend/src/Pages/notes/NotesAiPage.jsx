import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function NotesAiPage() {
  const [form, setForm] = useState({
    title: '',
    moduleName: '',
    topic: '',
    uploadedBy: '',
  });
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [activeSummaryTitle, setActiveSummaryTitle] = useState('');
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [questionsData, setQuestionsData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Quiz state for AI questions (MCQ with 4 options + marks)
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const fetchNotes = async () => {
    try {
      setLoadingList(true);
      const res = await axios.get(`${API_BASE_URL}/api/notes`);
      setNotes(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load lecture notes');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchNotes();
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

    if (!form.title || !form.moduleName) {
      setError('Please fill Title and Module Name');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('moduleName', form.moduleName);
    formData.append('topic', form.topic);
    formData.append('uploadedBy', form.uploadedBy);
    formData.append('file', file);

    try {
      setLoadingUpload(true);
      await axios.post(`${API_BASE_URL}/api/notes/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Lecture note uploaded successfully');
      setForm({ title: '', moduleName: '', topic: '', uploadedBy: '' });
      setFile(null);
      await fetchNotes();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Failed to upload lecture note';
      setError(message);
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleDelete = async (id) => {
    resetMessages();
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/notes/${id}`);
      setSuccess('Lecture note deleted successfully');
      await fetchNotes();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Failed to delete note';
      setError(message);
    }
  };

  const handleDownload = (id) => {
    window.open(`${API_BASE_URL}/api/notes/download/${id}`, '_blank');
  };

  const handleSummarize = async (id) => {
    resetMessages();
    setAiLoading(true);
    setSummaryData(null);
    const note = notes.find((n) => n._id === id);
    setActiveSummaryTitle(note?.title || 'Lecture Summary');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/notes/${id}/summarize`);
      setSummaryData(res.data.data || res.data);
      setSummaryModalOpen(true);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to summarize notes';
      setError(message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateQuestions = async (id) => {
    resetMessages();
    setAiLoading(true);
    setQuestionsData(null);
    setQuizQuestions([]);
    setQuizSubmitted(false);
    setQuizScore(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/notes/${id}/generate-questions`, {
        difficulty: 'medium',
      });
      const raw = res.data.data || res.data;
      setQuestionsData(raw);

      const questions = (raw.questions || []).map((q) => {
        if (Array.isArray(q.options) && Number.isInteger(q.correctIndex)) {
          return {
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            selectedIndex: null,
          };
        }

        const correct = q.answer || 'Correct answer not provided.';
        const options = [
          correct,
          'A vague description that does not properly address the main ideas.',
          'An incorrect explanation that mixes unrelated concepts.',
          'A statement that contradicts standard university-level understanding.',
        ];

        return {
          question: q.question,
          options,
          correctIndex: 0,
          selectedIndex: null,
        };
      });

      setQuizQuestions(questions);
      setQuestionsModalOpen(true);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to generate questions';
      setError(message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) =>
        idx === questionIndex
          ? {
              ...q,
              selectedIndex: optionIndex,
            }
          : q
      )
    );
  };

  const handleSubmitQuiz = () => {
    if (!quizQuestions.length) return;

    let score = 0;
    quizQuestions.forEach((q) => {
      if (q.selectedIndex === q.correctIndex) {
        score += 1;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleDownloadSummary = () => {
    if (!summaryData || !Array.isArray(summaryData.summary) || !summaryData.summary.length) return;

    const title = activeSummaryTitle || 'Lecture Summary';
    const header = `AI Summary - ${title}\n\n`;
    const body = summaryData.summary
      .map((line, idx) => `${idx + 1}. ${line}`)
      .join('\n\n');

    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9_-]+/gi, '_').toLowerCase()}_summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lecture Notes AI Assistant</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Upload lecture slides or tutorial notes as PDF files. The system can generate a quick summary and
              practice questions to support exam revision.
            </p>
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

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Upload Lecture Note</h2>
              <p className="mt-1 text-xs text-slate-500">Upload slides or tutorials to generate summaries and questions.</p>
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
                placeholder="e.g. Week 03 - OSI Model"
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
              <label className="text-sm font-medium text-gray-700 mb-1">Topic (optional)</label>
              <input
                type="text"
                name="topic"
                value={form.topic}
                onChange={handleInputChange}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. OSI Model / TCP vs UDP"
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
                placeholder="Lecturer / Student"
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
                disabled={loadingUpload}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                {loadingUpload ? 'Uploading...' : 'Upload Note'}
              </button>
            </div>
          </form>
        </div>

        {/* Notes Table */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Uploaded Lecture Notes</h2>
          </div>

          <div className="overflow-x-auto">
            {loadingList ? (
              <p className="text-sm text-slate-600">Loading notes...</p>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Title</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Module</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Topic</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {notes.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-gray-500 text-sm">
                        No lecture notes uploaded yet.
                      </td>
                    </tr>
                  )}

                  {notes.map((note) => (
                    <tr key={note._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">{note.title}</td>
                      <td className="px-4 py-2 text-gray-700">{note.moduleName}</td>
                      <td className="px-4 py-2 text-gray-700">{note.topic}</td>
                      <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDownload(note._id)}
                          className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSummarize(note._id)}
                          className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                          disabled={aiLoading}
                        >
                          {aiLoading ? 'Processing...' : 'AI Summary'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGenerateQuestions(note._id)}
                          className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                          disabled={aiLoading}
                        >
                          {aiLoading ? 'Processing...' : 'AI Questions'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(note._id)}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Summary Modal */}
        {summaryModalOpen && summaryData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6 relative">
              <button
                type="button"
                onClick={() => setSummaryModalOpen(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">AI Summary</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Key points extracted from <span className="font-medium">{activeSummaryTitle}</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSummary}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Download Summary
                </button>
              </div>
              {summaryData.summaryParagraph && (
                <p className="text-sm text-gray-800 mb-3 bg-slate-50 border border-slate-100 rounded-md px-3 py-2">
                  {summaryData.summaryShort || summaryData.summaryParagraph}
                </p>
              )}

              {Array.isArray(summaryData.keywords) && summaryData.keywords.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {summaryData.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 border border-indigo-100"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              <ul className="list-decimal pl-5 space-y-1 text-sm text-gray-800 max-h-72 overflow-y-auto pr-2">
                {(summaryData.summary || []).slice(0, 6).map((line, idx) => {
                  const maxLen = 220;
                  let text = line || '';
                  if (text.length > maxLen) {
                    text = `${text.slice(0, maxLen).trimEnd()}...`;
                  }
                  return <li key={idx}>{text}</li>;
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Questions Modal */}
        {questionsModalOpen && questionsData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6 relative">
              <button
                type="button"
                onClick={() => {
                  setQuestionsModalOpen(false);
                  setQuizSubmitted(false);
                  setQuizScore(null);
                  setQuizQuestions([]);
                }}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Generated Quiz</h3>
              <p className="text-xs text-gray-500 mb-4">
                Answer the multiple-choice questions below. After you submit, you will see your mark and the correct
                answers highlighted.
              </p>

              {quizSubmitted && (
                <div className="mb-3 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
                  You scored <span className="font-semibold">{quizScore}</span> out of{' '}
                  <span className="font-semibold">{quizQuestions.length}</span>.
                </div>
              )}

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 text-sm text-gray-800">
                {quizQuestions.map((item, qIndex) => (
                  <div key={qIndex} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                    <p className="font-medium text-gray-900 text-sm mb-2">
                      Q{qIndex + 1}. {item.question}
                    </p>
                    <div className="space-y-1">
                      {item.options.map((opt, oIndex) => {
                        const isSelected = item.selectedIndex === oIndex;
                        const isCorrect = item.correctIndex === oIndex;
                        const showState = quizSubmitted;

                        let baseClasses =
                          'w-full text-left rounded-md border px-3 py-1.5 text-xs sm:text-sm transition-colors';
                        let stateClasses = 'border-gray-300 text-gray-800 bg-white hover:bg-gray-50';

                        if (showState) {
                          if (isCorrect) {
                            stateClasses = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                          } else if (isSelected && !isCorrect) {
                            stateClasses = 'border-red-400 bg-red-50 text-red-800';
                          } else {
                            stateClasses = 'border-gray-200 text-gray-700 bg-white';
                          }
                        } else if (isSelected) {
                          stateClasses = 'border-blue-500 bg-blue-50 text-blue-900';
                        }

                        return (
                          <button
                            key={oIndex}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => handleOptionSelect(qIndex, oIndex)}
                            className={`${baseClasses} ${stateClasses}`}
                          >
                            <span className="mr-2 font-semibold">{String.fromCharCode(65 + oIndex)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {quizQuestions.length === 0 && (
                  <p className="text-xs text-gray-500">No questions generated.</p>
                )}
              </div>

              {!quizSubmitted && quizQuestions.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Submit Answers
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesAiPage;
