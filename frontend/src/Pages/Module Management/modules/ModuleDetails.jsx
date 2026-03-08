import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Sidebar from '../../../Components/ModuleManagement/Sidebar.jsx'
import Navbar from '../../../Components/NavBar/NavBar.jsx'

export default function ModuleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [module,  setModule]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`http://localhost:5000/api/modules/${id}`)
      .then(({ data }) => setModule(data.data ?? data))
      .catch(() => toast.error('Failed to load module'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${module?.moduleName}"?`)) return
    try {
      await axios.delete(`http://localhost:5000/api/modules/${id}`)
      toast.success('Module deleted')
      navigate('/modules')
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
  if (!module) return <p className="text-gray-500">Module not found.</p>

  const sem = module.semester

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
       <Sidebar />
  
  
   <div className="ml-56 flex-1 p-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <Link to="/faculties" className="hover:text-blue-600 transition-colors">Faculties</Link>
        <span>/</span>
        <Link to={`/faculties/${module.faculty?._id}`} className="hover:text-blue-600 transition-colors">{module.faculty?.name}</Link>
        <span>/</span>
        <Link to="/semesters" className="hover:text-blue-600 transition-colors">Semesters</Link>
        {sem && (<><span>/</span><Link to={`/semesters/${sem._id}`} className="hover:text-blue-600 transition-colors">Year {sem.year} — Sem {sem.semester}</Link></>)}
        <span>/</span>
        <Link to="/modules" className="hover:text-blue-600 transition-colors">Modules</Link>
        <span>/</span>
        <span className="text-gray-700">{module.moduleName}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{module.moduleName}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">{module.moduleNumber}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{module.description || 'No description provided'}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/modules/${id}/edit`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm">Edit</Link>
          <button onClick={handleDelete} className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Module No.', value: module.moduleNumber },
          { label: 'Faculty',    value: module.faculty?.code },
          ...(sem ? [
            { label: 'Year',     value: `Year ${sem.year}` },
            { label: 'Semester', value: `Semester ${sem.semester}` },
          ] : []),
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {module.description && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Description</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{module.description}</p>
        </div>
      )}

      <div className="flex gap-3">
        {sem && <Link to={`/semesters/${sem._id}`} className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">← Back to Semester</Link>}
        <Link to="/modules" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">All Modules</Link>
      </div>
    </div>
    </div>
  )
}
