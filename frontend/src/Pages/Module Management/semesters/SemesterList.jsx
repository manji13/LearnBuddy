import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Sidebar from '../../../Components/ModuleManagement/Sidebar.jsx'
import Navbar from '../../../Components/NavBar/NavBar.jsx'

const selectCls = "w-full max-w-xs px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"

export default function SemesterList() {
  const [semesters, setSemesters] = useState([])
  const [faculties, setFaculties] = useState([])
  const [filter,    setFilter]    = useState('')
  const [loading,   setLoading]   = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const params = filter ? { faculty: filter } : {}
      const [{ data: sd }, { data: fd }] = await Promise.all([
        axios.get('http://localhost:5000/api/semesters', { params }),
        axios.get('http://localhost:5000/api/faculties'),
      ])
      setSemesters(sd.data ?? sd)
      setFaculties(fd.data ?? fd)
    } catch {
      toast.error('Failed to load semesters')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleDelete = async s => {
    if (!window.confirm(`Delete "Year ${s.year} — Semester ${s.semester}"?\nAll modules inside will be removed.`)) return
    try {
      await axios.delete(`http://localhost:5000/api/semesters/${s._id}`)
      toast.success('Semester deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  // ✅ Group semesters by faculty, ordered by year then semester within each group
  const grouped = semesters.reduce((acc, s) => {
    const key   = s.faculty?._id ?? 'unknown'
    const label = s.faculty?.name ?? 'Unknown Faculty'
    const code  = s.faculty?.code ?? ''
    const fid   = s.faculty?._id  ?? ''
    if (!acc[key]) acc[key] = { label, code, fid, items: [] }
    acc[key].items.push(s)
    return acc
  }, {})

  // Sort items within each group by year, then semester
  Object.values(grouped).forEach(g => {
    g.items.sort((a, b) => a.year !== b.year ? a.year - b.year : a.semester - b.semester)
  })

  // Sort groups alphabetically by faculty name
  const groupList = Object.values(grouped).sort((a, b) => a.label.localeCompare(b.label))

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="ml-56 flex-1 p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Semesters</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage semesters per faculty</p>
            </div>
            <Link to="/semesters/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              + Add Semester
            </Link>
          </div>

          {/* Faculty filter */}
          <div className="mb-6">
            <select className={selectCls} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">All Faculties</option>
              {faculties.map(f => <option key={f._id} value={f._id}>{f.name} ({f.code})</option>)}
            </select>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-sm text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              Loading semesters...
            </div>
          ) : semesters.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-2 text-center">
              <span className="text-5xl">📅</span>
              <p className="font-semibold text-gray-600 mt-2">No semesters found</p>
              <p className="text-sm text-gray-400">{filter ? 'Try a different filter' : 'Click "Add Semester" to get started'}</p>
            </div>
          ) : (
            // ✅ One table block per faculty group
            <div className="space-y-8">
              {groupList.map(({ label, code, fid, items }) => (
                <div key={fid}>

                  {/* Faculty heading */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs select-none shrink-0">
                      {code}
                    </div>
                    <Link
                      to={`/faculties/${fid}`}
                      className="text-base font-bold text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      {label}
                    </Link>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                      {code}
                    </span>
                    <span className="text-xs text-gray-400">{items.length} semester{items.length !== 1 ? 's' : ''}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                    {/* ✅ Quick-add semester for this faculty */}
                    <Link
                      to={`/semesters/new?facultyId=${fid}`}
                      className="text-xs font-medium text-blue-600 hover:underline shrink-0"
                    >
                      + Add
                    </Link>
                  </div>

                  {/* Semesters table for this faculty */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {['#', 'Year', 'Semester', 'Actions'].map(h => (
                            <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((s, i) => (
                          <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4 text-sm text-gray-400 w-10">{i + 1}</td>
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                Year {s.year}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                                Semester {s.semester}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex gap-2">
                                <Link to={`/semesters/${s._id}`}      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">View</Link>
                                <Link to={`/semesters/${s._id}/edit`} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors">Edit</Link>
                                <button onClick={() => handleDelete(s)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
