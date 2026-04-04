import API_URL from '../../../api/config';
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import EmployeeNavbar from '../../../Components/NavBar/employeeNavbar';

const EMPTY = { faculty: '', semester: '', moduleNumber: '', moduleName: '', description: '' }
const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"

export default function ModuleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

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
  const [fieldErrors, setFieldErrors] = useState({ moduleNumber: '', moduleName: '' })

  // For left panel – existing modules in the selected semester
  const [existingModules, setExistingModules] = useState([])
  const [modulesLoading, setModulesLoading] = useState(false)

  // Fetch faculties & semesters on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [{ data: fd }, { data: sd }] = await Promise.all([
          axios.get(`${API_URL}/faculties`),
          axios.get(`${API_URL}/semesters`),
        ])
        const fList = fd.data ?? fd
        const sList = sd.data ?? sd
        setFaculties(fList)
        setAllSems(sList)

        if (preselectedFacultyId) {
          setFormSems(sList.filter(s => (s.faculty?._id || s.faculty) === preselectedFacultyId))
        }

        if (isEdit) {
          const { data: md } = await axios.get(`${API_URL}/modules/${id}`)
          const m = md.data ?? md
          const fid = m.faculty?._id || m.faculty
          const semId = m.semester?._id || m.semester
          setForm({
            faculty:      fid,
            semester:     semId,
            moduleNumber: m.moduleNumber,
            moduleName:   m.moduleName,
            description:  m.description || '',
          })
          setFormSems(sList.filter(s => (s.faculty?._id || s.faculty) === fid))
          // Load existing modules for that semester
          if (semId) fetchExistingModules(semId)
        }
      } catch {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id, isEdit, preselectedFacultyId])

  // Fetch modules of the currently selected semester for left panel
  const fetchExistingModules = async (semesterId) => {
    if (!semesterId) {
      setExistingModules([])
      return
    }
    setModulesLoading(true)
    try {
      const { data } = await axios.get(`${API_URL}/modules?semester=${semesterId}`)
      const list = data.data ?? data
      setExistingModules(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Failed to load modules list')
      setExistingModules([])
    } finally {
      setModulesLoading(false)
    }
  }

  // When semester changes, refresh the left panel list
  const onSemesterChange = (semId) => {
    setForm(p => ({ ...p, semester: semId }))
    fetchExistingModules(semId)
    // Clear module-specific errors when semester changes
    setFieldErrors({ moduleNumber: '', moduleName: '' })
  }

  const onFacultyChange = fid => {
    setForm(p => ({ ...p, faculty: fid, semester: '' }))
    setFormSems(allSems.filter(s => (s.faculty?._id || s.faculty) === fid))
    setExistingModules([]) // clear left panel
    setFieldErrors({ moduleNumber: '', moduleName: '' })
  }

  const setField = k => e => {
    const value = e.target.value
    setForm(p => ({ ...p, [k]: value }))
    // Clear specific field error
    if (k === 'moduleNumber') setFieldErrors(prev => ({ ...prev, moduleNumber: '' }))
    if (k === 'moduleName')   setFieldErrors(prev => ({ ...prev, moduleName: '' }))
  }

  // Validation with toast popups
  const validateForm = () => {
    const moduleNumberTrim = form.moduleNumber.trim()
    const moduleNameTrim = form.moduleName.trim()

    if (!form.faculty) {
      toast.error('Please select a faculty')
      return false
    }
    if (!form.semester) {
      toast.error('Please select a semester')
      return false
    }
    if (!moduleNumberTrim) {
      toast.error('Module number is required')
      setFieldErrors(prev => ({ ...prev, moduleNumber: 'Module number is required' }))
      return false
    }
    if (!moduleNameTrim) {
      toast.error('Module name is required')
      setFieldErrors(prev => ({ ...prev, moduleName: 'Module name is required' }))
      return false
    }

    // Module number format: alphanumeric, hyphens, underscores, 2-20 chars
    const moduleNumberRegex = /^[A-Za-z0-9_-]{2,20}$/
    if (!moduleNumberRegex.test(moduleNumberTrim)) {
      toast.error('Module number must be 2–20 characters (letters, numbers, hyphens, underscores)')
      setFieldErrors(prev => ({ ...prev, moduleNumber: 'Invalid format (2–20 chars, alphanumeric, -, _)' }))
      return false
    }

    // Module name: at least 2 chars, max 100, letters, numbers, spaces, basic punctuation
    const moduleNameRegex = /^[A-Za-z0-9\s\-',.()]{2,100}$/
    if (!moduleNameRegex.test(moduleNameTrim)) {
      toast.error('Module name must be 2–100 characters (letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses)')
      setFieldErrors(prev => ({ ...prev, moduleName: 'Invalid characters or length' }))
      return false
    }

    // Optional: check for duplicate module number within same semester (only for create, or edit if number changed)
    const existingDuplicate = existingModules.find(m =>
      m.moduleNumber === moduleNumberTrim && (!isEdit || m._id !== id)
    )
    if (existingDuplicate) {
      toast.error(`Module number "${moduleNumberTrim}" already exists in this semester`)
      setFieldErrors(prev => ({ ...prev, moduleNumber: 'Duplicate module number' }))
      return false
    }

    // Description length limit
    if (form.description && form.description.length > 500) {
      toast.error('Description cannot exceed 500 characters')
      return false
    }

    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/modules/${id}`, form)
        toast.success('Module updated successfully')
        navigate(`/modules/${id}`)
      } else {
        const { data } = await axios.post(`${API_URL}/modules`, form)
        toast.success('Module created successfully')
        if (preselectedSemesterId) {
          navigate(`/semesters/${preselectedSemesterId}`)
        } else {
          navigate(`/modules/${(data.data ?? data)._id}`)
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong'
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

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
      <EmployeeNavbar />

      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT PANEL: Existing Modules in Selected Semester ── */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">Modules in this Semester</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {!form.semester
                      ? 'Select a semester first'
                      : modulesLoading
                      ? 'Loading…'
                      : `${existingModules.length} module${existingModules.length === 1 ? '' : 's'} found`}
                  </p>
                </div>
                {form.semester && !modulesLoading && (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                    {existingModules.length}
                  </span>
                )}
              </div>

              <ul className="divide-y divide-gray-50 max-h-[calc(100vh-14rem)] overflow-y-auto">
                {!form.semester ? (
                  <li className="px-5 py-10 text-center text-sm text-gray-400">
                    Choose a semester to see existing modules
                  </li>
                ) : modulesLoading ? (
                  <li className="px-5 py-8 flex flex-col items-center gap-2 text-gray-400">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-xs">Loading modules…</span>
                  </li>
                ) : existingModules.length === 0 ? (
                  <li className="px-5 py-10 text-center text-sm text-gray-400">
                    No modules added to this semester yet.
                  </li>
                ) : (
                  existingModules.map(mod => (
                    <li key={mod._id}>
                      <Link
                        to={`/modules/${mod._id}`}
                        className={`flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group ${id === mod._id ? 'bg-blue-50' : ''}`}
                      >
                        <span className={`mt-0.5 inline-flex items-center justify-center min-w-[2.5rem] h-7 px-2 rounded-md text-[11px] font-bold tracking-wide flex-shrink-0
                          ${id === mod._id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                          } transition-colors`}>
                          {mod.moduleNumber}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${id === mod._id ? 'text-blue-700' : 'text-gray-800'}`}>
                            {mod.moduleName}
                          </p>
                          {mod.description && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{mod.description}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>

              {form.semester && (
                <div className="px-5 py-3 border-t border-gray-100 bg-slate-50">
                  <Link
                    to={`/semesters/${form.semester}`}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    View semester details →
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* ── RIGHT PANEL: Form ── */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{isEdit ? 'Edit Module' : 'New Module'}</h1>
            <p className="text-sm text-gray-500 mb-6">
              {isEdit ? "Update this module's details below" : 'Add a new module to a semester'}
            </p>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-lg">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Faculty */}
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

                {/* Semester */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Semester *</label>
                  <select
                    className={`${inputCls} cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                    value={form.semester}
                    onChange={e => onSemesterChange(e.target.value)}
                    disabled={(Boolean(preselectedSemesterId) && !isEdit) || !form.faculty}
                  >
                    <option value="">{form.faculty ? 'Select a semester' : 'Select faculty first'}</option>
                    {formSems.map(s => <option key={s._id} value={s._id}>Year {s.year} — Semester {s.semester}</option>)}
                  </select>
                  {preselectedSemesterId && !isEdit && (
                    <p className="text-xs text-blue-500 mt-1">✓ Semester pre-selected from parent page</p>
                  )}
                </div>

                {/* Module Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Module Number *</label>
                  <input
                    className={`${inputCls} ${fieldErrors.moduleNumber ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                    value={form.moduleNumber}
                    onChange={setField('moduleNumber')}
                    placeholder="e.g. CS101"
                  />
                  {fieldErrors.moduleNumber && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.moduleNumber}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">2–20 characters (letters, numbers, hyphens, underscores)</p>
                </div>

                {/* Module Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Module Name *</label>
                  <input
                    className={`${inputCls} ${fieldErrors.moduleName ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                    value={form.moduleName}
                    onChange={setField('moduleName')}
                    placeholder="e.g. Introduction to Programming"
                  />
                  {fieldErrors.moduleName && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.moduleName}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">2–100 characters (letters, numbers, spaces, basic punctuation)</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea
                    className={`${inputCls} min-h-[80px] resize-y`}
                    value={form.description}
                    onChange={setField('description')}
                    placeholder="Optional description (max 500 characters)..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Module'}
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