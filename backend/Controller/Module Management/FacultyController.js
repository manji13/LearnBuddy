const Faculty  = require('../../Model/Module Management/FacultyModel')
const Semester = require('../../Model/Module Management/SemesterModel')
const Module   = require('../../Model/Module Management/ModuleModel')

// GET /api/faculties
const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ createdAt: -1 })
    res.json({ success: true, count: faculties.length, data: faculties })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/faculties/:id
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' })
    res.json({ success: true, data: faculty })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/faculties
const createFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.create(req.body)
    res.status(201).json({ success: true, data: faculty })
  } catch (err) {
    const msg = err.code === 11000 ? 'Faculty code already exists' : err.message
    res.status(400).json({ success: false, message: msg })
  }
}

// PUT /api/faculties/:id
const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' })
    res.json({ success: true, data: faculty })
  } catch (err) {
    const msg = err.code === 11000 ? 'Faculty code already exists' : err.message
    res.status(400).json({ success: false, message: msg })
  }
}

// DELETE /api/faculties/:id  (cascade)
const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' })
    const semesters = await Semester.find({ faculty: req.params.id })
    const semIds = semesters.map(s => s._id)
    await Module.deleteMany({ semester: { $in: semIds } })
    await Semester.deleteMany({ faculty: req.params.id })
    await Faculty.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Faculty and all related data deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getAllFaculties, getFacultyById, createFaculty, updateFaculty, deleteFaculty }
