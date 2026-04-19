import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

function SavedResourcesPage() {
  const [data, setData] = useState({ notes: [], pastPapers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('Please sign in to view saved resources.');
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/bookmarks/user/${userId}`);
        const payload = res.data?.data || {};
        setData({
          notes: payload.notes || [],
          pastPapers: payload.pastPapers || [],
        });
      } catch (err) {
        console.error(err);
        const message = err.response?.data?.message || 'Failed to load saved resources';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900">My Saved Resources</h1>
          <p className="text-sm text-slate-600">
            Quick access to lecture notes and past papers you have starred.
          </p>
        </header>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <span className="mt-0.5 text-lg">!</span>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600">Loading saved resources...</p>
        ) : (
          <div className="space-y-6">
            <section className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Lecture notes</h2>
              {data.notes.length === 0 ? (
                <p className="text-sm text-slate-500">No notes saved yet. Star notes to access them here.</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-800">
                  {data.notes.map((n) => (
                    <li
                      key={n._id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {n.moduleName}
                          {n.topic ? ` · ${n.topic}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`/notes-ai?moduleName=${encodeURIComponent(n.moduleName)}`}
                          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Open in AI notes
                        </a>
                        <button
                          type="button"
                          onClick={() => window.open(`${API_BASE_URL}/api/notes/download/${n._id}`, '_blank')}
                          className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                          Download
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Past papers</h2>
              {data.pastPapers.length === 0 ? (
                <p className="text-sm text-slate-500">No past papers saved yet. Star useful papers to find them here.</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-800">
                  {data.pastPapers.map((p) => (
                    <li
                      key={p._id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {p.moduleName}
                          {p.semester ? ` · ${p.semester}` : ''}
                          {p.year ? ` · ${p.year}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`/past-papers?moduleName=${encodeURIComponent(p.moduleName)}`}
                          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View in list
                        </a>
                        <button
                          type="button"
                          onClick={() => window.open(`${API_BASE_URL}/api/pastpapers/download/${p._id}`, '_blank')}
                          className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                          Download
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedResourcesPage;
