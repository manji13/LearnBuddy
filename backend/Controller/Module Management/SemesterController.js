const Semester = require('../models/Semester');

// @desc    Get all semesters
// @route   GET /api/semesters
// @access  Private
const getSemesters = async (req, res) => {
  try {
    const filter = {};
    if (req.query.faculty) filter.faculty = req.query.faculty;
    const semesters = await Semester.find(filter).populate('faculty', 'name code').sort({ number: 1 });
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get semester by ID
// @route   GET /api/semesters/:id
// @access  Private
const getSemesterById = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id).populate('faculty', 'name code');
    if (semester) {
      res.json(semester);
    } else {
      res.status(404).json({ message: 'Semester not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create semester
// @route   POST /api/semesters
// @access  Private/Admin
const createSemester = async (req, res) => {
  try {
    const { name, number, faculty, academicYear, description } = req.body;
    const semester = await Semester.create({ name, number, faculty, academicYear, description });
    const populated = await semester.populate('faculty', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update semester
// @route   PUT /api/semesters/:id
// @access  Private/Admin
const updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (semester) {
      semester.name = req.body.name || semester.name;
      semester.number = req.body.number || semester.number;
      semester.faculty = req.body.faculty || semester.faculty;
      semester.academicYear = req.body.academicYear ?? semester.academicYear;
      semester.description = req.body.description ?? semester.description;
      const updated = await semester.save();
      await updated.populate('faculty', 'name code');
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Semester not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete semester
// @route   DELETE /api/semesters/:id
// @access  Private/Admin
const deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (semester) {
      await semester.deleteOne();
      res.json({ message: 'Semester removed' });
    } else {
      res.status(404).json({ message: 'Semester not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSemesters, getSemesterById, createSemester, updateSemester, deleteSemester };
