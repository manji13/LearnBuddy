const Faculty = require('../models/Faculty');

// @desc    Get all faculties
// @route   GET /api/faculties
// @access  Private
const getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find({}).sort({ name: 1 });
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get faculty by ID
// @route   GET /api/faculties/:id
// @access  Private
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (faculty) {
      res.json(faculty);
    } else {
      res.status(404).json({ message: 'Faculty not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create faculty
// @route   POST /api/faculties
// @access  Private/Admin
const createFaculty = async (req, res) => {
  try {
    const { name, code, description, dean } = req.body;
    const faculty = await Faculty.create({ name, code, description, dean });
    res.status(201).json(faculty);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Faculty name or code already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update faculty
// @route   PUT /api/faculties/:id
// @access  Private/Admin
const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (faculty) {
      faculty.name = req.body.name || faculty.name;
      faculty.code = req.body.code || faculty.code;
      faculty.description = req.body.description ?? faculty.description;
      faculty.dean = req.body.dean ?? faculty.dean;
      const updated = await faculty.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Faculty not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete faculty
// @route   DELETE /api/faculties/:id
// @access  Private/Admin
const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (faculty) {
      await faculty.deleteOne();
      res.json({ message: 'Faculty removed' });
    } else {
      res.status(404).json({ message: 'Faculty not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFaculties, getFacultyById, createFaculty, updateFaculty, deleteFaculty };
