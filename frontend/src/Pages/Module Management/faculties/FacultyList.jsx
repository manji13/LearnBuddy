import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function FacultyList() {
  const [faculties, setFaculties] = useState([])
  const [loading,   setLoading]   = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('http://localhost:5000/api/faculties')
      setFaculties(data.data ?? data)
    } catch {
      toast.error('Failed to load faculties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (f) => {
    if (!window.confirm(`Delete "${f.name}"?\nAll semesters and modules will also be removed.`)) return
    try {
      await axios.delete(`http://localhost:5000/api/faculties/${f._id}`)
      toast.success('Faculty deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculties</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage academic faculties</p>
        </div>
        <Link to="/faculties/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          + Add Faculty
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-sm text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            Loading faculties...
          </div>
        ) : faculties.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-2 text-center">
            <span className="text-5xl">🏛</span>
            <p className="font-semibold text-gray-600 mt-2">No faculties yet</p>
            <p className="text-sm text-gray-400">Click "Add Faculty" to create the first one</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['#', 'Name', 'Code', 'Description', 'Created', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {faculties.map((f, i) => (
                <tr key={f._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-400 w-10">{i + 1}</td>
                  <td className="px-5 py-4">
                    <Link to={`/faculties/${f._id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-sm transition-colors">
                      {f.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                      {f.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 max-w-xs truncate">{f.description || '—'}</td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(f.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/faculties/${f._id}`} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">View</Link>
                      <Link to={`/faculties/${f._id}/edit`} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors">Edit</Link>
                      <button onClick={() => handleDelete(f)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
