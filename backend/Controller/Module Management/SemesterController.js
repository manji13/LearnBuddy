const Semester = require('../../Model/Module Management/SemesterModel')
const Module   = require('../../Model/Module Management/ModuleModel')

// GET /api/semesters?faculty=ID
const getAllSemesters = async (req, res) => {
  try {
    const filter = req.query.faculty ? { faculty: req.query.faculty } : {}
    const semesters = await Semester.find(filter).populate('faculty', 'name code').sort({ year: 1, semester: 1 })
    res.json({ success: true, count: semesters.length, data: semesters })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/semesters/:id
const getSemesterById = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id).populate('faculty', 'name code')
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' })
    res.json({ success: true, data: semester })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/semesters
const createSemester = async (req, res) => {
  try {
    const semester = await Semester.create(req.body)
    const populated = await semester.populate('faculty', 'name code')
    res.status(201).json({ success: true, data: populated })
  } catch (err) {
    const msg = err.code === 11000 ? 'This year/semester combination already exists for this faculty' : err.message
    res.status(400).json({ success: false, message: msg })
  }
}

// PUT /api/semesters/:id
const updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('faculty', 'name code')
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' })
    res.json({ success: true, data: semester })
  } catch (err) {
    const msg = err.code === 11000 ? 'This year/semester combination already exists for this faculty' : err.message
    res.status(400).json({ success: false, message: msg })
  }
}

// DELETE /api/semesters/:id  (cascade modules)
const deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id)
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' })
    await Module.deleteMany({ semester: req.params.id })
    await Semester.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Semester and related modules deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getAllSemesters, getSemesterById, createSemester, updateSemester, deleteSemester }
