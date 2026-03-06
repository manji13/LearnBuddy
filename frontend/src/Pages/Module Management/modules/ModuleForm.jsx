import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Sidebar from '../../../Components/ModuleManagement/Sidebar.jsx'
import Navbar from '../../../Components/NavBar/NavBar.jsx'

const EMPTY = { faculty: '', semester: '', moduleNumber: '', moduleName: '', description: '' }
const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"

export default function ModuleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  // ✅ Read ?facultyId and ?semesterId passed from SemesterDetail
  const [searchParams] = useSearchParams()
  const preselectedFacultyId   = searchParams.get('facultyId')
  const preselectedSemesterId  = searchParams.get('semesterId')

  const [form,      setForm]      = useState({
    ...EMPTY,
    faculty:  preselectedFacultyId  || '',
    semester: preselectedSemesterId || '',
  })
  const [faculties, setFaculties] = useState([])
  const [allSems,   setAllSems]   = useState([])
  const [formSems,  setFormSems]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const [{ data: fd }, { data: sd }] = await Promise.all([
          axios.get('http://localhost:5000/api/faculties'),
          axios.get('http://localhost:5000/api/semesters'),
        ])
        const fList = fd.data ?? fd
        const sList = sd.data ?? sd
        setFaculties(fList)
        setAllSems(sList)

        // ✅ Pre-filter semesters if facultyId was passed
        if (preselectedFacultyId) {
          setFormSems(sList.filter(s => (s.faculty?._id || s.faculty) === preselectedFacultyId))
        }

        if (isEdit) {
          const { data: md } = await axios.get(`http://localhost:5000/api/modules/${id}`)
          const m = md.data ?? md
          const fid = m.faculty?._id || m.faculty
          setForm({
            faculty:      fid,
            semester:     m.semester?._id || m.semester,
            moduleNumber: m.moduleNumber,
            moduleName:   m.moduleName,
            description:  m.description || '',
          })
          setFormSems(sList.filter(s => (s.faculty?._id || s.faculty) === fid))
        }
      } catch {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id, isEdit, preselectedFacultyId])

  const onFacultyChange = fid => {
    setForm(p => ({ ...p, faculty: fid, semester: '' }))
    setFormSems(allSems.filter(s => (s.faculty?._id || s.faculty) === fid))
  }

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.faculty || !form.semester || !form.moduleNumber.trim() || !form.moduleName.trim()) {
      return toast.error('Faculty, semester, module number and name are required')
    }
    setSaving(true)
    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/modules/${id}`, form)
        toast.success('Module updated')
        navigate(`/modules/${id}`)
      } else {
        const { data } = await axios.post('http://localhost:5000/api/modules', form)
        toast.success('Module created')
        // ✅ After creating, go back to the semester's detail page if we came from one
        if (preselectedSemesterId) {
          navigate(`/semesters/${preselectedSemesterId}`)
        } else {
          navigate(`/modules/${(data.data ?? data)._id}`)
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // Cancel goes back to the semester page if we came from one
  const cancelTo = preselectedSemesterId
    ? `/semesters/${preselectedSemesterId}`
    : isEdit ? `/modules/${id}` : '/modules'

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
        <main className="ml-56 flex-1 p-8">
          <div className="max-w-lg mx-auto">

            <h1 className="text-2xl font-bold text-gray-900 mb-1">{isEdit ? 'Edit Module' : 'New Module'}</h1>
            <p className="text-sm text-gray-500 mb-6">
              {isEdit ? "Update this module's details below" : 'Add a new module to a semester'}
            </p>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Faculty — locked if pre-selected */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Faculty *</label>
                  <select
                    className={`${inputCls} cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                    value={form.faculty}
                    onChange={e => onFacultyChange(e.target.value)}
                    disabled={Boolean(preselectedFacultyId) && !isEdit}
                  >
                    <option value="">Select a faculty</option>
                    {faculties.map(f => <option key={f._id} value={f._id}>{f.name} ({f.code})</option>)}
                  </select>
                  {preselectedFacultyId && !isEdit && (
                    <p className="text-xs text-blue-500 mt-1">✓ Faculty pre-selected from parent page</p>
                  )}
                </div>

                {/* Semester — locked if pre-selected */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Semester *</label>
                  <select
                    className={`${inputCls} cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                    value={form.semester}
                    onChange={set('semester')}
                    disabled={(Boolean(preselectedSemesterId) && !isEdit) || !form.faculty}
                  >
                    <option value="">{form.faculty ? 'Select a semester' : 'Select faculty first'}</option>
                    {formSems.map(s => <option key={s._id} value={s._id}>Year {s.year} — Semester {s.semester}</option>)}
                  </select>
                  {preselectedSemesterId && !isEdit && (
                    <p className="text-xs text-blue-500 mt-1">✓ Semester pre-selected from parent page</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Module Number *</label>
                  <input className={inputCls} value={form.moduleNumber} onChange={set('moduleNumber')} placeholder="e.g. CS101" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Module Name *</label>
                  <input className={inputCls} value={form.moduleName} onChange={set('moduleName')} placeholder="e.g. Introduction to Programming" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.description} onChange={set('description')} placeholder="Optional description..." />
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Module'}
                  </button>
                  <Link to={cancelTo} className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
                    Cancel
                  </Link>
                </div>

              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
