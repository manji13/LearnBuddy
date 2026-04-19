import API_URL from '../../../api/config'
import { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Navbar from '../../../Components/NavBar/NavBar.jsx'

const authAxios = () => {
  const token = localStorage.getItem('token')
  return axios.create({ headers: { Authorization: `Bearer ${token}` } })
}

export default function StudentModules() {
  const { facultyId, semesterId } = useParams()
  const navigate = useNavigate()

  const [faculty,    setFaculty]    = useState(null)
  const [semester,   setSemester]   = useState(null)
  const [modules,    setModules]    = useState([])
  const [savedIds,   setSavedIds]   = useState(new Set())
  const [loading,    setLoading]    = useState(true)
  const [btnLoading, setBtnLoading] = useState(new Set())
  const [search,     setSearch]     = useState('')

  // ── your original working useEffect — untouched ──────────────────────────
  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/faculties/${facultyId}`),
      axios.get(`${API_URL}/semesters/${semesterId}`),
      axios.get(`${API_URL}/modules`, { params: { semester: semesterId } }),
    ])
      .then(([{ data: fd }, { data: sd }, { data: md }]) => {
        setFaculty(fd.data ?? fd)
        setSemester(sd.data ?? sd)
        setModules(md.data ?? md)
      })
      .catch(() => toast.error('Failed to load modules'))
      .finally(() => setLoading(false))
  }, [facultyId, semesterId])

  // ── saved modules fetched separately so it never breaks the main load ────
  useEffect(() => {
    authAxios()
      .get(`${API_URL}/saved-modules`)
      .then(({ data }) => {
        const ids = (data.data ?? []).map(m => String(m._id))
        setSavedIds(new Set(ids))
      })
      .catch(() => {
        // silent fail — save buttons still work, just won't show saved state
      })
  }, [])

  // ── save / unsave ─────────────────────────────────────────────────────────
  const toggleSave = useCallback(async (e, moduleId) => {
    e.stopPropagation()
    const isSaved = savedIds.has(String(moduleId))

    // optimistic update
    setSavedIds(prev => {
      const next = new Set(prev)
      isSaved ? next.delete(String(moduleId)) : next.add(String(moduleId))
      return next
    })
    setBtnLoading(prev => new Set(prev).add(moduleId))

    try {
      if (isSaved) {
        await authAxios().delete(`${API_URL}/saved-modules/${moduleId}`)
        toast.success('Removed from My Modules')
      } else {
        await authAxios().post(`${API_URL}/saved-modules`, { moduleId })
        toast.success('Saved to My Modules!')
      }
    } catch (err) {
      // revert on error
      setSavedIds(prev => {
        const next = new Set(prev)
        isSaved ? next.add(String(moduleId)) : next.delete(String(moduleId))
        return next
      })
      toast.error(err.response?.data?.message ?? 'Action failed')
    } finally {
      setBtnLoading(prev => { const n = new Set(prev); n.delete(moduleId); return n })
    }
  }, [savedIds])

  const filtered   = modules.filter(m =>
    m.moduleName.toLowerCase().includes(search.toLowerCase()) ||
    m.moduleNumber.toLowerCase().includes(search.toLowerCase())
  )
  const savedCount = savedIds.size

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <div className="max-w-8xl mx-auto p-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link to="/student/faculties" className="hover:text-blue-600 transition-colors">Faculties</Link>
          <span>/</span>
          <Link to={`/student/faculties/${facultyId}/semesters`} className="hover:text-blue-600 transition-colors">
            {faculty?.name ?? 'Semesters'}
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">
            {semester ? `Year ${semester.year} — Sem ${semester.semester}` : 'Modules'}
          </span>
        </div>

        {/* Header */}
        {semester && faculty && (
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Modules</p>
              <h1 className="text-3xl font-bold text-gray-900">
                Year {semester.year} — Semester {semester.semester}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                  {faculty.code}
                </span>
                <span className="text-sm text-gray-500">{faculty.name}</span>
              </div>
            </div>

            {savedCount > 0 && (
              <Link
                to="/profile/modules"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
              >
                📌 My Modules
                <span className="bg-white text-indigo-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {savedCount}
                </span>
              </Link>
            )}
          </div>
        )}

        {/* Stats + Search */}
        {!loading && modules.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-xs text-gray-400">Total modules</span>
                <p className="text-xl font-bold text-gray-900 leading-tight">{modules.length}</p>
              </div>
              {savedCount > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2">
                  <span className="text-xs text-indigo-400">Saved by you</span>
                  <p className="text-xl font-bold text-indigo-700 leading-tight">{savedCount}</p>
                </div>
              )}
            </div>
            <input
              className="w-full max-w-xs px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Search modules..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-sm text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            Loading modules...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-3 text-center">
            <span className="text-6xl">📚</span>
            <p className="font-semibold text-gray-600 mt-2">
              {search ? 'No modules match your search' : 'No modules yet'}
            </p>
            <p className="text-sm text-gray-400">
              {search ? 'Try a different keyword' : 'This semester has no modules added yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((module) => {
              const isSaved = savedIds.has(String(module._id))
              const isBusy  = btnLoading.has(module._id)

              return (
                <div
                  key={module._id}
                  onClick={() => navigate(`/student/modules/${module._id}`)}
                  className={`relative bg-white rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden
                    ${isSaved ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200'}`}
                >
                  {isSaved && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-2xl" />
                  )}

                  <div className="p-5 pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                        {module.moduleNumber}
                      </span>

                      <button
                        onClick={(e) => toggleSave(e, module._id)}
                        disabled={isBusy}
                        title={isSaved ? 'Remove from My Modules' : 'Save to My Modules'}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                          ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}
                          ${isSaved
                            ? 'bg-indigo-100 text-indigo-700 hover:bg-red-50 hover:text-red-600'
                            : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                      >
                        {isBusy
                          ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                          : <span>{isSaved ? '📌' : '📍'}</span>
                        }
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {module.moduleName}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-3">
                      {module.description || <span className="text-gray-300">No description</span>}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      {isSaved
                        ? <span className="text-xs text-indigo-500 font-medium">In My Modules</span>
                        : <span />}
                      <span className="text-indigo-500 text-sm font-medium">View details →</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to={`/student/faculties/${facultyId}/semesters`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
          >
            ← Back to Semesters
          </Link>
          {savedCount > 0 && (
            <Link
              to="/student/my-modules"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-sm font-medium text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              📌 View My {savedCount} Saved Module{savedCount !== 1 ? 's' : ''}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}