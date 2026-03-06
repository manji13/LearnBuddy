import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Sidebar from '../../../Components/ModuleManagement/Sidebar.jsx'
import Navbar from '../../../Components/NavBar/NavBar.jsx'

const EMPTY = { faculty: '', year: '', semester: '' }
const fieldCls = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"

export default function SemesterForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  // ✅ Read ?facultyId= from URL (passed from FacultyDetail)
  const [searchParams] = useSearchParams()
  const preselectedFacultyId = searchParams.get('facultyId')

  const [form,      setForm]      = useState({ ...EMPTY, faculty: preselectedFacultyId || '' })
  const [faculties, setFaculties] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const { data: fd } = await axios.get('http://localhost:5000/api/faculties')
        setFaculties(fd.data ?? fd)
        if (isEdit) {
          const { data: sd } = await axios.get(`http://localhost:5000/api/semesters/${id}`)
          const s = sd.data ?? sd
          setForm({ faculty: s.faculty?._id || s.faculty, year: String(s.year), semester: String(s.semester) })
        }
      } catch {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id, isEdit])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.faculty || !form.year || !form.semester) return toast.error('All fields are required')
    setSaving(true)
    try {
      const payload = { faculty: form.faculty, year: Number(form.year), semester: Number(form.semester) }
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/semesters/${id}`, payload)
        toast.success('Semester updated')
        navigate(`/semesters/${id}`)
      } else {
        const { data } = await axios.post('http://localhost:5000/api/semesters', payload)
        toast.success('Semester created')
        // ✅ After creating, go to the new semester's detail page
        navigate(`/semesters/${(data.data ?? data)._id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // Cancel goes back to the faculty page if we came from one, otherwise semesters list
  const cancelTo = preselectedFacultyId ? `/faculties/${preselectedFacultyId}` : isEdit ? `/semesters/${id}` : '/semesters'

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-sm text-gray-400">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      Loading...
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="ml-56 flex-1 p-8">
          <div className="max-w-lg mx-auto">

            <h1 className="text-2xl font-bold text-gray-900 mb-1">{isEdit ? 'Edit Semester' : 'New Semester'}</h1>
            <p className="text-sm text-gray-500 mb-6">{isEdit ? 'Update semester details' : 'Add a new semester to a faculty'}</p>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Faculty *</label>
                  <select
                    className={fieldCls}
                    value={form.faculty}
                    onChange={set('faculty')}
                    // ✅ Lock the select if faculty was pre-selected from parent page
                    disabled={Boolean(preselectedFacultyId) && !isEdit}
                  >
                    <option value="">Select a faculty</option>
                    {faculties.map(f => <option key={f._id} value={f._id}>{f.name} ({f.code})</option>)}
                  </select>
                  {preselectedFacultyId && !isEdit && (
                    <p className="text-xs text-blue-500 mt-1">
                      ✓ Faculty pre-selected from parent page
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Year *</label>
                    <select className={fieldCls} value={form.year} onChange={set('year')}>
                      <option value="">Select year</option>
                      {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Semester *</label>
                    <select className={fieldCls} value={form.semester} onChange={set('semester')}>
                      <option value="">Select</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Semester'}
                  </button>
                  <Link to={cancelTo} className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
                    Cancel
                  </Link>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
