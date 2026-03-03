const express = require('express');
const router = express.Router();
const {
  getFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/', protect, getFaculties);
router.get('/:id', protect, getFacultyById);
router.post('/', protect, adminOnly, createFaculty);
router.put('/:id', protect, adminOnly, updateFaculty);
router.delete('/:id', protect, adminOnly, deleteFaculty);

module.exports = router;
