import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function PastPaperPage() {
  const [pastPapers, setPastPapers] = useState([]);
  const [search, setSearch] = useState({ moduleName: '', semester: '', year: '' });
  const [qaModalOpen, setQaModalOpen] = useState(false);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaData, setQaData] = useState(null);
  const [qaDifficulty, setQaDifficulty] = useState('medium'); // default fallback
  const [difficultyModalOpen, setDifficultyModalOpen] = useState(false);
  const [pendingPaperId, setPendingPaperId] = useState(null);
  const [quizPaperId, setQuizPaperId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]); // MCQ data with selections
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  // Exam analysis state
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const location = useLocation();

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const fetchPastPapers = async (moduleNameFilter) => {
    try {
      let url = `${API_BASE_URL}/api/pastpapers`;
      const config = {};

      if (moduleNameFilter) {
        url = `${API_BASE_URL}/api/pastpapers/search`;
        config.params = { moduleName: moduleNameFilter };
      }

      const res = await axios.get(url, config);
      setPastPapers(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load past papers');
    }
  };

  // Support linking from module pages: /past-papers?moduleName=ABC
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const moduleNameParam = params.get('moduleName');

    if (moduleNameParam) {
      setSearch((prev) => ({ ...prev, moduleName: moduleNameParam }));
      fetchPastPapers(moduleNameParam);
    } else {
      fetchPastPapers();
    }
  }, [location.search]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({ ...prev, [name]: value }));
  };


  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    try {
      const params = {};
      if (search.moduleName) params.moduleName = search.moduleName;
      if (search.semester) params.semester = search.semester;
      if (search.year) params.year = search.year;

      const res = await axios.get(`${API_BASE_URL}/api/pastpapers/search`, { params });
      setPastPapers(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to search past papers');
    }
  };

  const handleResetSearch = async () => {
    setSearch({ moduleName: '', semester: '', year: '' });
    await fetchPastPapers();
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

  const handleAnalyseExam = async (id) => {
    resetMessages();
    setAnalysisLoading(true);
    setAnalysisData(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/pastpapers/analyse-exam/${id}`);
      setAnalysisData(res.data.data || res.data);
      setAnalysisModalOpen(true);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to analyse exam';
      setError(message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleGenerateQA = async (id, difficulty) => {
    resetMessages();
    setQaLoading(true);
    setQaData(null);
    setQuizQuestions([]);
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizPaperId(id);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/pastpapers/generate-qa/${id}`, {
        difficulty: difficulty || qaDifficulty,
      });
      const raw = res.data.data || res.data;
      setQaData(raw);

      const questions = (raw.questions || []).map((q) => {
        // If backend already sends options + correctIndex, just use them
        if (Array.isArray(q.options) && Number.isInteger(q.correctIndex)) {
          return {
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            selectedIndex: null,
          };
        }

        // Backwards compatibility: build simple options from free-text answer
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
      setQaModalOpen(true);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to generate AI questions';
      setError(message);
    } finally {
      setQaLoading(false);
    }
  };

  const openDifficultyModal = (id) => {
    resetMessages();
    setPendingPaperId(id);
    setDifficultyModalOpen(true);
  };

  const handleDifficultySelect = async (difficulty) => {
    setDifficultyModalOpen(false);
    if (!pendingPaperId) return;
    setQaDifficulty(difficulty);
    await handleGenerateQA(pendingPaperId, difficulty);
    setPendingPaperId(null);
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

    const userId = localStorage.getItem('userId');
    if (!userId || !quizPaperId) {
      return;
    }

    const answers = quizQuestions.map((q) =>
      typeof q.selectedIndex === 'number' ? q.selectedIndex : -1
    );

    axios
      .post(`${API_BASE_URL}/api/pastpapers/quiz-results`, {
        userId,
        pastPaperId: quizPaperId,
        difficulty: qaDifficulty,
        answers,
        score,
        totalQuestions: quizQuestions.length,
      })
      .then(() => {
        // Optional: brief success message; avoid overriding other messages
        console.log('Quiz result saved');
      })
      .catch((err) => {
        console.error('Failed to save quiz result', err);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Past Papers</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Search previous exam papers by module, semester, or year. Download PDFs or use AI to generate practice
              questions and exam insights.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium text-slate-500 sm:inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Student workspace
            </span>
            <Link
              to="/quiz-history"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md transition"
            >
              Quiz history
            </Link>
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

        {/* Search & Table (Student side) */}
        <div className="bg-white/90 rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Browse past papers</h2>
              <p className="mt-1 text-xs text-slate-500 max-w-md">
                Use the filters below to narrow down by module, semester, or year.
              </p>
            </div>
            <div className="text-xs text-slate-500 flex flex-col items-start md:items-end">
              <span className="font-medium text-slate-700">
                {pastPapers.length} paper{pastPapers.length === 1 ? '' : 's'} found
              </span>
              <span className="mt-0.5 text-[11px] text-slate-400">
                AI questions and exam analysis are available for each paper.
              </span>
            </div>
          </div>

          <form
            className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
            onSubmit={handleSearchSubmit}
          >
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1">Module</label>
              <input
                type="text"
                name="moduleName"
                value={search.moduleName}
                onChange={handleSearchChange}
                placeholder="eg: Data Structures"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1">Semester</label>
              <input
                type="text"
                name="semester"
                value={search.semester}
                onChange={handleSearchChange}
                placeholder="eg: Semester 1"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1">Year</label>
              <input
                type="number"
                name="year"
                value={search.year}
                onChange={handleSearchChange}
                placeholder="eg: 2024"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={handleResetSearch}
                className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:flex-none"
              >
                Reset
              </button>
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:flex-none"
              >
                Search
              </button>
            </div>
          </form>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100/80">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Title
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Module
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Semester
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Year
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pastPapers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
                      No past papers match your filters. Try adjusting the module, semester, or year.
                    </td>
                  </tr>
                )}

                {pastPapers.map((paper) => (
                  <tr key={paper._id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-slate-900">{paper.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">ID: {paper._id.slice(-6)}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-700">{paper.moduleName}</td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700">
                        {paper.semester || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-700">{paper.year}</td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(paper._id)}
                          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => openDifficultyModal(paper._id)}
                          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                          disabled={qaLoading}
                        >
                          {qaLoading ? 'Generating questions…' : 'AI questions'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnalyseExam(paper._id)}
                          className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                          disabled={analysisLoading}
                        >
                          {analysisLoading ? 'Analysing…' : 'Exam insights'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QA Modal (MCQ Quiz) */}
        {qaModalOpen && qaData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-6 relative">
              <button
                type="button"
                onClick={() => {
                  setQaModalOpen(false);
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
                Answer the 10 multiple-choice questions below. After you submit, you will see your score and the
                correct answers highlighted.
              </p>
              {qaLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-600 text-sm">
                  Generating questions...
                </div>
              ) : (
                <>
                  {quizSubmitted && (
                    <div className="mb-3 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
                      You scored <span className="font-semibold">{quizScore}</span> out of{' '}
                      <span className="font-semibold">{quizQuestions.length}</span>.
                    </div>
                  )}
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
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
                                stateClasses =
                                  'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
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
                </>
              )}
            </div>
          </div>
        )}

        {/* Difficulty Selection Modal */}
        {difficultyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Difficulty</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose the difficulty level for the generated practice questions.
              </p>
              <div className="flex flex-col gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleDifficultySelect('easy')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Easy
                </button>
                <button
                  type="button"
                  onClick={() => handleDifficultySelect('medium')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => handleDifficultySelect('hard')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Hard
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDifficultyModalOpen(false);
                  setPendingPaperId(null);
                }}
                className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Exam Analysis Modal */}
        {analysisModalOpen && analysisData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-6 relative">
              <button
                type="button"
                onClick={() => setAnalysisModalOpen(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Exam Insights</h3>
              <p className="text-xs text-gray-500 mb-4">
                High-level analysis generated from the uploaded past paper.
              </p>

              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
                  Difficulty:
                  <span className="ml-1 font-semibold">
                    {analysisData.difficulty || 'Unknown'}
                  </span>
                </span>
                {typeof analysisData.estimatedDurationMinutes === 'number' && (
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    Estimated time ~ {Math.max(1, Math.round(analysisData.estimatedDurationMinutes / 10) * 10)} min
                  </span>
                )}
              </div>

              {Array.isArray(analysisData.questionTypeBreakdown) && analysisData.questionTypeBreakdown.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Question types</h4>
                  <ul className="text-xs text-gray-800 space-y-0.5">
                    {analysisData.questionTypeBreakdown.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>{item.label}</span>
                        <span className="font-semibold">{item.percentage}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(analysisData.topics) && analysisData.topics.length > 0 && (
                <div className="mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Main topics</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysisData.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-800 border border-violet-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PastPaperPage;
