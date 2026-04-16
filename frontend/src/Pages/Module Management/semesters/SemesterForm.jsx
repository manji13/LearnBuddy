import API_URL from '../../../api/config';
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import EmployeeNavbar from '../../../Components/NavBar/employeeNavbar';

const EMPTY = { faculty: '', year: '', semester: '' }
const fieldCls = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"

export default function SemesterForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [searchParams] = useSearchParams()
  const preselectedFacultyId = searchParams.get('facultyId')

  const [form,       setForm]       = useState({ ...EMPTY, faculty: preselectedFacultyId || '' })
  const [faculties,  setFaculties]  = useState([])
  const [semesters,  setSemesters]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [semLoading, setSemLoading] = useState(false)
  const [saving,     setSaving]     = useState(false)

  // Load faculties + current semester if editing
  useEffect(() => {
    const init = async () => {
      try {
        const { data: fd } = await axios.get(`${API_URL}/faculties`)
        setFaculties(fd.data ?? fd)
        if (isEdit) {
          const { data: sd } = await axios.get(`${API_URL}/semesters/${id}`)
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

  // Load semesters only for the selected faculty
  useEffect(() => {
    const facultyId = preselectedFacultyId || form.faculty
    if (!facultyId) {
      setSemesters([])
      return
    }
    setSemLoading(true)
    axios.get(`${API_URL}/semesters?faculty=${facultyId}`)
      .then(({ data }) => {
        const list = data.data ?? data
        setSemesters(Array.isArray(list) ? list : [])
      })
      .catch(() => toast.error('Failed to load semesters'))
      .finally(() => setSemLoading(false))
  }, [preselectedFacultyId, form.faculty])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.faculty || !form.year || !form.semester) return toast.error('All fields are required')
    setSaving(true)
    try {
      const payload = { faculty: form.faculty, year: Number(form.year), semester: Number(form.semester) }
      if (isEdit) {
        await axios.put(`${API_URL}/semesters/${id}`, payload)
        toast.success('Semester updated')
        navigate(`/semesters/${id}`)
      } else {
        const { data } = await axios.post(`${API_URL}/semesters`, payload)
        toast.success('Semester created')
        navigate(`/semesters/${(data.data ?? data)._id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const cancelTo = preselectedFacultyId ? `/faculties/${preselectedFacultyId}` : isEdit ? `/semesters/${id}` : '/semesters'

  // Derive active faculty for left panel header
  const activeFacultyId = preselectedFacultyId || form.faculty
  const selectedFaculty = faculties.find(f => f._id === activeFacultyId)

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-sm text-gray-400">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      Loading...
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <EmployeeNavbar />

      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT PANEL: Selected Faculty's Semesters ── */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-gray-800 truncate">
                    {selectedFaculty ? selectedFaculty.name : 'Faculty Semesters'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {!activeFacultyId
                      ? 'Select a faculty to see its semesters'
                      : semLoading
                        ? 'Loading…'
                        : `${semesters.length} semester${semesters.length === 1 ? '' : 's'}`}
                  </p>
                </div>
                {activeFacultyId && (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex-shrink-0">
                    {semLoading ? '…' : semesters.length}
                  </span>
                )}
              </div>

              {/* List */}
              <ul className="divide-y divide-gray-50 max-h-[calc(100vh-14rem)] overflow-y-auto">
                {!activeFacultyId ? (
                  <li className="px-5 py-10 text-center text-sm text-gray-400">
                    Select a faculty first.
                  </li>
                ) : semLoading ? (
                  <li className="px-5 py-8 flex flex-col items-center gap-2 text-gray-400">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-xs">Loading semesters…</span>
                  </li>
                ) : semesters.length === 0 ? (
                  <li className="px-5 py-10 text-center text-sm text-gray-400">
                    No semesters for this faculty yet.
                  </li>
                ) : (
                  semesters.map(sem => (
                    <li key={sem._id}>
                      <Link
                        to={`/semesters/${sem._id}`}
                        className={`flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group ${id === sem._id ? 'bg-blue-50' : ''}`}
                      >
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold flex-shrink-0 transition-colors
                          ${id === sem._id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                          }`}>
                          Y{sem.year}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${id === sem._id ? 'text-blue-700' : 'text-gray-800'}`}>
                            Semester {sem.semester}
                          </p>
                          <p className="text-xs text-gray-400">Year {sem.year}</p>
                        </div>
                        {id === sem._id && (
                          <span className="ml-auto text-[10px] font-semibold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
                            Editing
                          </span>
                        )}
                      </Link>
                    </li>
                  ))
                )}
              </ul>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 bg-slate-50">
                <Link to="/semesters" className="text-xs text-blue-600 hover:underline font-medium">
                  View all semesters →
                </Link>
              </div>
            </div>
          </aside>

          {/* ── RIGHT PANEL: Form ── */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isEdit ? 'Edit Semester' : 'New Semester'}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {isEdit ? 'Update semester details' : 'Add a new semester to a faculty'}
            </p>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-lg">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Faculty */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Faculty *</label>
                  <select
                    className={fieldCls}
                    value={form.faculty}
                    onChange={set('faculty')}
                    disabled={Boolean(preselectedFacultyId) && !isEdit}
                  >
                    <option value="">Select a faculty</option>
                    {faculties.map(f => (
                      <option key={f._id} value={f._id}>{f.name} ({f.code})</option>
                    ))}
                  </select>
                  {preselectedFacultyId && !isEdit && (
                    <p className="text-xs text-blue-500 mt-1">✓ Faculty pre-selected from parent page</p>
                  )}
                </div>

                {/* Year & Semester */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Year *</label>
                    <select className={fieldCls} value={form.year} onChange={set('year')}>
                      <option value="">Select year</option>
                      {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
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

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Semester'}
                  </button>
                  <Link
                    to={cancelTo}
                    className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Cancel
                  </Link>
                </div>

              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}