const Module = require('../../Model/Module Management/ModuleModel')

// GET /api/modules?faculty=ID&semester=ID
const getAllModules = async (req, res) => {
  try {
    const filter = {}
    if (req.query.faculty)  filter.faculty  = req.query.faculty
    if (req.query.semester) filter.semester = req.query.semester
    const modules = await Module.find(filter)
      .populate('faculty', 'name code')
      .populate({ path: 'semester', populate: { path: 'faculty', select: 'name code' } })
      .sort({ moduleNumber: 1 })
    res.json({ success: true, count: modules.length, data: modules })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/modules/:id
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('faculty', 'name code')
      .populate('semester')
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' })
    res.json({ success: true, data: module })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/modules
const createModule = async (req, res) => {
  try {
    const module = await Module.create(req.body)
    const populated = await Module.findById(module._id).populate('faculty', 'name code').populate('semester')
    res.status(201).json({ success: true, data: populated })
  } catch (err) {
    const msg = err.code === 11000 ? 'Module number already exists in this semester' : err.message
    res.status(400).json({ success: false, message: msg })
  }
}

// PUT /api/modules/:id
const updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('faculty', 'name code')
      .populate('semester')
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' })
    res.json({ success: true, data: module })
  } catch (err) {
    const msg = err.code === 11000 ? 'Module number already exists in this semester' : err.message
    res.status(400).json({ success: false, message: msg })
  }
}

// DELETE /api/modules/:id
const deleteModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id)
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' })
    res.json({ success: true, message: 'Module deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getAllModules, getModuleById, createModule, updateModule, deleteModule }
