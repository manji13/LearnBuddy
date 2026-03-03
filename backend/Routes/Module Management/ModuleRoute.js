const express = require('express');
const router = express.Router();
const {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} = require('../controllers/moduleController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/', protect, getModules);
router.get('/:id', protect, getModuleById);
router.post('/', protect, adminOnly, createModule);
router.put('/:id', protect, adminOnly, updateModule);
router.delete('/:id', protect, adminOnly, deleteModule);

module.exports = router;
