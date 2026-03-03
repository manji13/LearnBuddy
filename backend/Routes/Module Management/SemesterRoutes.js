const express = require('express');
const router = express.Router();
const {
  getSemesters,
  getSemesterById,
  createSemester,
  updateSemester,
  deleteSemester,
} = require('../controllers/semesterController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/', protect, getSemesters);
router.get('/:id', protect, getSemesterById);
router.post('/', protect, adminOnly, createSemester);
router.put('/:id', protect, adminOnly, updateSemester);
router.delete('/:id', protect, adminOnly, deleteSemester);

module.exports = router;
