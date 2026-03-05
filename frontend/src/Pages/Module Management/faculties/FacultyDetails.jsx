import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function FacultyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [faculty,   setFaculty]   = useState(null)
  const [semesters, setSemesters] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`http://localhost:5000/api/faculties/${id}`),
      axios.get('http://localhost:5000/api/semesters', { params: { faculty: id } }),
    ])
      .then(([{ data: fd }, { data: sd }]) => {
        setFaculty(fd.data ?? fd)
        setSemesters(sd.data ?? sd)
      })
      .catch(() => toast.error('Failed to load faculty'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${faculty?.name}"?\nAll semesters and modules will be removed.`)) return
    try {
      await axios.delete(`http://localhost:5000/api/faculties/${id}`)
      toast.success('Faculty deleted')
      navigate('/faculties')
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
  if (!faculty) return <p className="text-gray-500">Faculty not found.</p>

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/faculties" className="hover:text-blue-600 transition-colors">Faculties</Link>
        <span>/</span>
        <span className="text-gray-700">{faculty.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{faculty.name}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">{faculty.code}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{faculty.description || 'No description'}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/faculties/${id}/edit`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm">Edit</Link>
          <button onClick={handleDelete} className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Code',      value: faculty.code },
          { label: 'Semesters', value: semesters.length },
          { label: 'Created',   value: new Date(faculty.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">Semesters</h2>
        <Link to="/semesters/new" className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors">+ Add Semester</Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {semesters.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2 text-center">
            <span className="text-3xl">📅</span>
            <p className="text-sm text-gray-500">No semesters yet for this faculty</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Year', 'Semester', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {semesters.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Year {s.year}</span></td>
                  <td className="px-5 py-3"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">Semester {s.semester}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Link to={`/semesters/${s._id}`}      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">View</Link>
                      <Link to={`/semesters/${s._id}/edit`} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors">Edit</Link>
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
