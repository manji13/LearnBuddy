import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Sidebar from '../../../Components/ModuleManagement/Sidebar.jsx'
import Navbar from '../../../Components/NavBar/NavBar.jsx'

export default function StudentSemesters() {
  const { facultyId } = useParams()
  const [faculty,   setFaculty]   = useState(null)
  const [semesters, setSemesters] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`http://localhost:5000/api/faculties/${facultyId}`),
      axios.get('http://localhost:5000/api/semesters', { params: { faculty: facultyId } }),
    ])
      .then(([{ data: fd }, { data: sd }]) => {
        setFaculty(fd.data ?? fd)
        setSemesters(sd.data ?? sd)
      })
      .catch(() => toast.error('Failed to load semesters'))
      .finally(() => setLoading(false))
  }, [facultyId])

  // Group semesters by year
  const byYear = semesters.reduce((acc, s) => {
    const y = `Year ${s.year}`
    if (!acc[y]) acc[y] = []
    acc[y].push(s)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
     

      <div className="ml-56 flex-1 p-8">

        {/* Back */}
        <Link
          to="/student/faculties"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6"
        >
          ← Back to Faculties
        </Link>

        {/* Header */}
        {faculty && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                {faculty.code}
              </span>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Semesters</p>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{faculty.name}</h1>
            {faculty.description && (
              <p className="text-sm text-gray-500 mt-1 max-w-xl">{faculty.description}</p>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-sm text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            Loading semesters...
          </div>
        ) : semesters.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-3 text-center">
            <span className="text-6xl">📅</span>
            <p className="font-semibold text-gray-600 mt-2">No semesters yet</p>
            <p className="text-sm text-gray-400">This faculty has no semesters added yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(byYear).sort().map(([year, sems]) => (
              <div key={year}>
                {/* Year heading */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {year.replace('Year ', '')}
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">{year}</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Semester cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sems.sort((a, b) => a.semester - b.semester).map(s => (
                    <Link
                      key={s._id}
                      to={`/student/faculties/${facultyId}/semesters/${s._id}/modules`}
                      className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-xl">
                          📅
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700">
                          Sem {s.semester}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                        Semester {s.semester}
                      </h3>
                      <p className="text-sm text-gray-400 mt-0.5">{year} · {faculty?.name}</p>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          {new Date(s.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                          View Modules →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
