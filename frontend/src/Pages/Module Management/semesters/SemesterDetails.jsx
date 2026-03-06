import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Sidebar from '../../../Components/ModuleManagement/Sidebar.jsx'
import Navbar from '../../../Components/NavBar/NavBar.jsx'

export default function SemesterDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [semester, setSemester] = useState(null)
  const [modules,  setModules]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`http://localhost:5000/api/semesters/${id}`),
      axios.get('http://localhost:5000/api/modules', { params: { semester: id } }),
    ])
      .then(([{ data: sd }, { data: md }]) => {
        setSemester(sd.data ?? sd)
        setModules(md.data ?? md)
      })
      .catch(() => toast.error('Failed to load semester'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this semester?\nAll modules inside will be removed.')) return
    try {
      await axios.delete(`http://localhost:5000/api/semesters/${id}`)
      toast.success('Semester deleted')
      navigate('/semesters')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-sm text-gray-400">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      Loading...
    </div>
  )
  if (!semester) return <p className="text-gray-500 p-8">Semester not found.</p>

  const facultyId = semester.faculty?._id || semester.faculty

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="ml-56 flex-1 p-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
            <Link to="/faculties" className="hover:text-blue-600 transition-colors">Faculties</Link>
            <span>/</span>
            <Link to={`/faculties/${facultyId}`} className="hover:text-blue-600 transition-colors">{semester.faculty?.name}</Link>
            <span>/</span>
            <Link to="/semesters" className="hover:text-blue-600 transition-colors">Semesters</Link>
            <span>/</span>
            <span className="text-gray-700">Year {semester.year} — Semester {semester.semester}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Year {semester.year} — Semester {semester.semester}</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Y{semester.year}S{semester.semester}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Faculty: <Link to={`/faculties/${facultyId}`} className="text-blue-600 hover:underline">{semester.faculty?.name}</Link>
                <span className="ml-1 text-gray-400">({semester.faculty?.code})</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={`/semesters/${id}/edit`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm">Edit</Link>
              <button onClick={handleDelete} className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Year',     value: `Year ${semester.year}` },
              { label: 'Semester', value: `Semester ${semester.semester}` },
              { label: 'Modules',  value: modules.length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Modules section */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">Modules</h2>
            {/* ✅ Passes both facultyId and semesterId so ModuleForm auto-selects both */}
            <Link
              to={`/modules/new?facultyId=${facultyId}&semesterId=${id}`}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors"
            >
              + Add Module
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {modules.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 text-center">
                <span className="text-3xl">📚</span>
                <p className="text-sm text-gray-500">No modules in this semester yet</p>
                <Link to={`/modules/new?facultyId=${facultyId}&semesterId=${id}`} className="text-xs text-blue-600 hover:underline mt-1">
                  + Add the first module
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Module No.', 'Module Name', 'Description', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {modules.map(m => (
                    <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">{m.moduleNumber}</span></td>
                      <td className="px-5 py-3"><Link to={`/modules/${m._id}`} className="font-medium text-gray-800 hover:text-blue-600 text-sm transition-colors">{m.moduleName}</Link></td>
                      <td className="px-5 py-3 text-sm text-gray-400 max-w-xs truncate">{m.description || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <Link to={`/modules/${m._id}`}      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">View</Link>
                          <Link to={`/modules/${m._id}/edit`} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors">Edit</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}
