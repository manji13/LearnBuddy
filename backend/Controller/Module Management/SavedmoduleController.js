const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const SavedModule = require('../../Model/Module Management/SavedmoduleModel')

// Reads Bearer token and returns userId as ObjectId
const getUserId = (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.split(' ')[1]
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'learnbuddy_secret_123')
  return new mongoose.Types.ObjectId(decoded.id)
}

// GET /api/saved-modules
const getSavedModules = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ success: false, message: 'Not authorized' })

    const saved = await SavedModule.find({ user: userId })
      .populate({
        path: 'module',
        populate: [
          { path: 'faculty',  select: 'name code' },
          { path: 'semester', select: 'year semester' },
        ],
      })
      .sort({ savedAt: -1 })

    const data = saved
      .filter(s => s.module != null)
      .map(s => ({
        ...s.module.toObject(),
        savedAt:    s.savedAt,
        savedDocId: s._id,
        facultyId:  s.module.faculty?._id  ?? null,
        semesterId: s.module.semester?._id ?? null,
      }))

    res.json({ success: true, count: data.length, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/saved-modules   body: { moduleId }
const saveModule = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ success: false, message: 'Not authorized' })

    const { moduleId } = req.body
    if (!moduleId) return res.status(400).json({ success: false, message: 'moduleId is required' })

    const saved = await SavedModule.create({
      user:   userId,
      module: new mongoose.Types.ObjectId(moduleId),
    })
    res.status(201).json({ success: true, data: saved })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Module already saved' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/saved-modules/:moduleId
const unsaveModule = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ success: false, message: 'Not authorized' })

    const deleted = await SavedModule.findOneAndDelete({
      user:   userId,
      module: new mongoose.Types.ObjectId(req.params.moduleId),
    })
    if (!deleted) return res.status(404).json({ success: false, message: 'Saved module not found' })

    res.json({ success: true, message: 'Module removed from saved' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getSavedModules, saveModule, unsaveModule }