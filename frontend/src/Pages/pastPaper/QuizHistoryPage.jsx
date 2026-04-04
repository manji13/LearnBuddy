import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function QuizHistoryPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('Please sign in to view your quiz history.');
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/pastpapers/quiz-results`, {
          params: { userId },
        });

        setResults(res.data.data || []);
      } catch (err) {
        console.error(err);
        const message = err.response?.data?.message || 'Failed to load quiz history';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quiz History</h1>
            <p className="mt-1 text-sm text-slate-600">
              Review your past AI quizzes, scores, and progress over time.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <span className="mt-0.5 text-lg">!</span>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          {loading ? (
            <p className="text-sm text-slate-600">Loading quiz history...</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-slate-600">No quiz attempts recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Date</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Past Paper</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Difficulty</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {results.map((r) => {
                    const paper = r.pastPaper || {};
                    const created = r.createdAt ? new Date(r.createdAt) : null;
                    const dateLabel = created
                      ? created.toLocaleDateString() + ' ' + created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '-';
                    const percent = r.totalQuestions
                      ? Math.round((r.score / r.totalQuestions) * 100)
                      : null;

                    return (
                      <tr key={r._id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-700 whitespace-nowrap">{dateLabel}</td>
                        <td className="px-4 py-2 text-slate-800">
                          <div className="font-medium text-sm">{paper.title || 'Past paper'}</div>
                          <div className="text-xs text-slate-500">
                            {paper.moduleName && <span>{paper.moduleName}</span>}
                            {paper.semester && <span> · {paper.semester}</span>}
                            {paper.year && <span> · {paper.year}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-slate-700 capitalize">{r.difficulty}</td>
                        <td className="px-4 py-2 text-slate-800">
                          <span className="font-semibold">{r.score}</span>
                          <span className="text-slate-500 text-xs"> / {r.totalQuestions}</span>
                          {percent !== null && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                              {percent}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizHistoryPage;
