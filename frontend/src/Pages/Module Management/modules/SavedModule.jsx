import API_URL from '../../../api/config'
import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

import ProfileNavbar from '../../../Components/NavBar/ProfileNavbar.jsx'

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
  const [hoveredId, setHoveredId] = useState(null)

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

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-semibold">Loading modules...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
  

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 py-6">
        {/* Left Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 md:sticky md:top-20 md:h-fit">
          <ProfileNavbar />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📌 My Saved Modules</h1>
                <p className="text-sm text-gray-500 mt-1">Your personal collection</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">{modules.length}</p>
                <p className="text-xs text-gray-500">Saved modules</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search modules..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Content */}
          {modules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No saved modules</h3>
              <p className="text-sm text-gray-500 mb-4">Start saving modules to see them here</p>
              <Link
                to="/student/faculties"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Faculties
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No modules match your search</p>
              <button onClick={() => setSearch('')} className="text-indigo-600 text-sm hover:underline mt-2">
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((module) => (
                <div
                  key={module._id}
                  onClick={() => navigate(`/student/modules/${module._id}`)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group"
                >
                  {/* Top badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex gap-2 flex-wrap">
                      {module.moduleNumber && (
                        <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">
                          {module.moduleNumber}
                        </span>
                      )}
                      {module.faculty && (
                        <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {module.faculty.code}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        unsave(e, module._id)
                      }}
                      disabled={removing.has(module._id)}
                      className="text-xs font-medium px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {removing.has(module._id) ? '...' : '✕'}
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2">
                    {module.moduleName}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {module.description || <span className="text-gray-400">No description</span>}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                    {module.semester && (
                      <span>Y{module.semester.year} • S{module.semester.semester}</span>
                    )}
                    <span className="text-indigo-600 font-medium">View →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}