import API_URL from '../../../api/config'
import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Navbar from '../../../Components/NavBar/NavBar.jsx'

const authAxios = () => {
  const token = localStorage.getItem('token')
  return axios.create({ headers: { Authorization: `Bearer ${token}` } })
}

export default function MyModules() {
  const navigate = useNavigate()

  const [modules,  setModules]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [removing, setRemoving] = useState(new Set())
  const [search,   setSearch]   = useState('')

  // GET /api/saved-modules  returns:
  // { success, count, data: [{ _id, moduleName, moduleNumber, description,
  //    faculty: { _id, name, code }, semester: { _id, year, semester },
  //    savedAt, savedDocId, facultyId, semesterId }] }
  useEffect(() => {
    authAxios()
      .get(`${API_URL}/saved-modules`)
      .then(({ data }) => setModules(data.data ?? []))
      .catch(() => toast.error('Failed to load saved modules'))
      .finally(() => setLoading(false))
  }, [])

  const unsave = useCallback(async (e, moduleId) => {
    e.stopPropagation()
    setRemoving(prev => new Set(prev).add(moduleId))

    try {
      await authAxios().delete(`${API_URL}/saved-modules/${moduleId}`)
      setModules(prev => prev.filter(m => m._id !== moduleId))
      toast.success('Module removed')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to remove')
    } finally {
      setRemoving(prev => { const n = new Set(prev); n.delete(moduleId); return n })
    }
  }, [])

  const filtered = modules.filter(m =>
    m.moduleName?.toLowerCase().includes(search.toLowerCase()) ||
    m.moduleNumber?.toLowerCase().includes(search.toLowerCase()) ||
    m.faculty?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <div className="max-w-8xl mx-auto p-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/student/faculties" className="hover:text-blue-600 transition-colors">Faculties</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">My Modules</span>
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">Personal Collection</p>
            <h1 className="text-3xl font-bold text-gray-900">📌 My Modules</h1>
            <p className="text-sm text-gray-500 mt-1">Modules you've saved — only visible to you</p>
          </div>
        </div>

        {/* Stats + Search */}
        {!loading && modules.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2">
                <span className="text-xs text-indigo-400">Saved modules</span>
                <p className="text-xl font-bold text-indigo-700 leading-tight">{modules.length}</p>
              </div>
              {search && filtered.length !== modules.length && (
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-2">
                  <span className="text-xs text-gray-400">Matching</span>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{filtered.length}</p>
                </div>
              )}
            </div>
            <input
              className="w-full max-w-xs px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              placeholder="Search saved modules..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-sm text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
            Loading your modules...
          </div>

        ) : modules.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-4 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl">
              📌
            </div>
            <div>
              <p className="font-semibold text-gray-700 text-lg">No saved modules yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Browse your courses and save modules to find them here quickly
              </p>
            </div>
            <Link
              to="/student/faculties"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Browse Faculties
            </Link>
          </div>

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <span className="text-5xl">🔍</span>
            <p className="font-semibold text-gray-600">No modules match your search</p>
            <button onClick={() => setSearch('')} className="text-sm text-indigo-600 hover:underline">
              Clear search
            </button>
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((module) => {
              const isRemoving = removing.has(module._id)

              return (
                <div
                  key={module._id}
                  onClick={() => navigate(`/student/modules/${module._id}`)}
                  className="relative bg-white rounded-2xl border border-indigo-100 ring-1 ring-indigo-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {/* top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-2xl" />

                  <div className="p-5 pt-6">
                    {/* Badges + Remove button */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                          {module.moduleNumber}
                        </span>
                        {module.faculty && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            {module.faculty.code ?? module.faculty.name}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => unsave(e, module._id)}
                        disabled={isRemoving}
                        title="Remove from My Modules"
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0
                          bg-indigo-100 text-indigo-700 hover:bg-red-50 hover:text-red-600
                          ${isRemoving ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isRemoving
                          ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                          : '📌'
                        }
                        {isRemoving ? 'Removing…' : 'Remove'}
                      </button>
                    </div>

                    {/* Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {module.moduleName}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-500 line-clamp-3">
                      {module.description || <span className="text-gray-300">No description</span>}
                    </p>

                    {/* Semester + arrow */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      {module.semester ? (
                        <span className="text-xs text-gray-400">
                          Year {module.semester.year} · Sem {module.semester.semester}
                        </span>
                      ) : <span />}
                      <span className="text-indigo-500 text-sm font-medium">View details →</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10">
          <Link
            to="/student/faculties"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
          >
            ← Browse More Modules
          </Link>
        </div>
      </div>
    </div>
  )
}