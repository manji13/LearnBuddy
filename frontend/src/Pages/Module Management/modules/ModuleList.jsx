import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Sidebar from '../../../Components/ModuleManagement/Sidebar.jsx'
import Navbar from '../../../Components/NavBar/NavBar.jsx'

const selectCls = "w-full max-w-xs px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"

export default function ModuleList() {
  const [modules,    setModules]    = useState([])
  const [faculties,  setFaculties]  = useState([])
  const [allSems,    setAllSems]    = useState([])
  const [filterSems, setFilterSems] = useState([])
  const [facFilter,  setFacFilter]  = useState('')
  const [semFilter,  setSemFilter]  = useState('')
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([axios.get('http://localhost:5000/api/faculties'), axios.get('http://localhost:5000/api/semesters')])
      .then(([{ data: fd }, { data: sd }]) => {
        setFaculties(fd.data ?? fd)
        setAllSems(sd.data ?? sd)
      })
  }, [])

  useEffect(() => {
    setFilterSems(facFilter ? allSems.filter(s => (s.faculty?._id || s.faculty) === facFilter) : allSems)
    setSemFilter('')
  }, [facFilter, allSems])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (facFilter) params.faculty  = facFilter
      if (semFilter) params.semester = semFilter
      const { data } = await axios.get('http://localhost:5000/api/modules', { params })
      setModules(data.data ?? data)
    } catch {
      toast.error('Failed to load modules')
    } finally {
      setLoading(false)
    }
  }, [facFilter, semFilter])

  useEffect(() => { load() }, [load])

  const handleDelete = async m => {
    if (!window.confirm(`Delete "${m.moduleName}"?`)) return
    try {
      await axios.delete(`http://localhost:5000/api/modules/${m._id}`)
      toast.success('Module deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
       <Sidebar />
  
  
   <div className="ml-56 flex-1 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modules</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage course modules across semesters</p>
        </div>
        <Link to="/modules/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          + Add Module
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className={selectCls} value={facFilter} onChange={e => setFacFilter(e.target.value)}>
          <option value="">All Faculties</option>
          {faculties.map(f => <option key={f._id} value={f._id}>{f.name} ({f.code})</option>)}
        </select>
        <select className={selectCls} value={semFilter} onChange={e => setSemFilter(e.target.value)}>
          <option value="">All Semesters</option>
          {filterSems.map(s => <option key={s._id} value={s._id}>{s.faculty?.code} — Year {s.year} Sem {s.semester}</option>)}
        </select>
        {(facFilter || semFilter) && (
          <button onClick={() => { setFacFilter(''); setSemFilter('') }} className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            Clear ✕
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-sm text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            Loading modules...
          </div>
        ) : modules.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-2 text-center">
            <span className="text-5xl">📚</span>
            <p className="font-semibold text-gray-600 mt-2">No modules found</p>
            <p className="text-sm text-gray-400">Adjust filters or click "Add Module"</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['#', 'Module No.', 'Module Name', 'Faculty', 'Semester', 'Description', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {modules.map((m, i) => (
                <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-400 w-10">{i + 1}</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">{m.moduleNumber}</span></td>
                  <td className="px-5 py-4"><Link to={`/modules/${m._id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-sm transition-colors">{m.moduleName}</Link></td>
                  <td className="px-5 py-4 text-sm text-gray-500">{m.faculty?.name} <span className="text-gray-400 text-xs">({m.faculty?.code})</span></td>
                  <td className="px-5 py-4">
                    {m.semester
                      ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">Y{m.semester.year}S{m.semester.semester}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400 max-w-[160px] truncate">{m.description || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Link to={`/modules/${m._id}`}      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">View</Link>
                      <Link to={`/modules/${m._id}/edit`} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors">Edit</Link>
                      <button onClick={() => handleDelete(m)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </div>
  )
}
