const Module = require('../models/Module');

// @desc    Get all modules
// @route   GET /api/modules
// @access  Private
const getModules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.faculty) filter.faculty = req.query.faculty;
    if (req.query.semester) filter.semester = req.query.semester;
    const modules = await Module.find(filter)
      .populate('faculty', 'name code')
      .populate('semester', 'name number')
      .sort({ name: 1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get module by ID
// @route   GET /api/modules/:id
// @access  Private
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('faculty', 'name code')
      .populate('semester', 'name number');
    if (module) {
      res.json(module);
    } else {
      res.status(404).json({ message: 'Module not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create module
// @route   POST /api/modules
// @access  Private/Admin
const createModule = async (req, res) => {
  try {
    const { name, code, semester, faculty, credits, description, lecturer } = req.body;
    const module = await Module.create({ name, code, semester, faculty, credits, description, lecturer });
    const populated = await module.populate([
      { path: 'faculty', select: 'name code' },
      { path: 'semester', select: 'name number' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Private/Admin
const updateModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (module) {
      module.name = req.body.name || module.name;
      module.code = req.body.code || module.code;
      module.semester = req.body.semester || module.semester;
      module.faculty = req.body.faculty || module.faculty;
      module.credits = req.body.credits || module.credits;
      module.description = req.body.description ?? module.description;
      module.lecturer = req.body.lecturer ?? module.lecturer;
      const updated = await module.save();
      await updated.populate([
        { path: 'faculty', select: 'name code' },
        { path: 'semester', select: 'name number' },
      ]);
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Module not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private/Admin
const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (module) {
      await module.deleteOne();
      res.json({ message: 'Module removed' });
    } else {
      res.status(404).json({ message: 'Module not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getModules, getModuleById, createModule, updateModule, deleteModule };
