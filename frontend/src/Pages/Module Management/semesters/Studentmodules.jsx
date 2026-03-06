import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Sidebar from '../../../Components/ModuleManagement/Sidebar.jsx'
import Navbar from '../../../Components/NavBar/NavBar.jsx'

export default function StudentModules() {
  const { facultyId, semesterId } = useParams()
  const [faculty,  setFaculty]  = useState(null)
  const [semester, setSemester] = useState(null)
  const [modules,  setModules]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    Promise.all([
      axios.get(`http://localhost:5000/api/faculties/${facultyId}`),
      axios.get(`http://localhost:5000/api/semesters/${semesterId}`),
      axios.get('http://localhost:5000/api/modules', { params: { semester: semesterId } }),
    ])
      .then(([{ data: fd }, { data: sd }, { data: md }]) => {
        setFaculty(fd.data ?? fd)
        setSemester(sd.data ?? sd)
        setModules(md.data ?? md)
      })
      .catch(() => toast.error('Failed to load modules'))
      .finally(() => setLoading(false))
  }, [facultyId, semesterId])

  const filtered = modules.filter(m =>
    m.moduleName.toLowerCase().includes(search.toLowerCase()) ||
    m.moduleNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
     

      <div className="ml-56 flex-1 p-8">

        {/* Back navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link to="/student/faculties" className="hover:text-blue-600 transition-colors">
            Faculties
          </Link>
          <span>/</span>
          <Link
            to={`/student/faculties/${facultyId}/semesters`}
            className="hover:text-blue-600 transition-colors"
          >
            {faculty?.name ?? 'Semesters'}
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">
            {semester ? `Year ${semester.year} — Sem ${semester.semester}` : 'Modules'}
          </span>
        </div>

        {/* Header */}
        {semester && faculty && (
          <div className="mb-8">
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
        )}

        {/* Stats + Search */}
        {!loading && modules.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-xs text-gray-400">Total modules</span>
                <p className="text-xl font-bold text-gray-900 leading-tight">{modules.length}</p>
              </div>
            </div>
            <input
              className="w-full max-w-xs px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Search modules..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Content */}
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
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['#', 'Module No.', 'Module Name', 'Description'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((m, i) => (
                  <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-400 w-10">{i + 1}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                        {m.moduleNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 text-sm">{m.moduleName}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 max-w-xs">
                      {m.description || <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Back button */}
        <div className="mt-8">
          <Link
            to={`/student/faculties/${facultyId}/semesters`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
          >
            ← Back to Semesters
          </Link>
        </div>
      </div>
    </div>
  )
}
