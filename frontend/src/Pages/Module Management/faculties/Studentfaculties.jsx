import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Sidebar from '../../../Components/ModuleManagement/Sidebar.jsx'
import Navbar from '../../../Components/NavBar/NavBar.jsx'

export default function StudentFaculties() {
  const [faculties, setFaculties] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    axios.get('http://localhost:5000/api/faculties')
      .then(({ data }) => setFaculties(data.data ?? data))
      .catch(() => toast.error('Failed to load faculties'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = faculties.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
     

      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Browse</p>
          <h1 className="text-3xl font-bold text-gray-900">Faculties</h1>
          <p className="text-sm text-gray-500 mt-1">Select a faculty to explore its semesters and modules</p>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-sm">
          <input
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            placeholder="Search faculties..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-sm text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            Loading faculties...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-3 text-center">
            <span className="text-6xl">🏛</span>
            <p className="font-semibold text-gray-600 mt-2">No faculties found</p>
            <p className="text-sm text-gray-400">{search ? 'Try a different search term' : 'No faculties available yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(f => (
              <Link
                key={f._id}
                to={`/student/faculties/${f._id}/semesters`}
                className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
              >
                {/* Icon + Code */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                    🏛
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                    {f.code}
                  </span>
                </div>

                {/* Name */}
                <h2 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors leading-snug mb-1">
                  {f.name}
                </h2>

                {/* Description */}
                {f.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{f.description}</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {new Date(f.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    View Semesters →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
