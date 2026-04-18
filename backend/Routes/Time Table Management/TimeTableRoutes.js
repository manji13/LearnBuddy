const express = require('express');
const router = express.Router();
const timeTableController = require('../../Controller/Time Table Management/TimeTableController');

// POST generate new timetable
router.post('/generate', timeTableController.generateTimeTable);

// GET all timetables for a user
router.get('/user/:userId', timeTableController.getUserTimeTables);

// DELETE a timetable
router.delete('/:id', timeTableController.deleteTimeTable);

// PUT update block status (Completed/Pending)
router.put('/:id/block/:blockId', timeTableController.updateBlockStatus);

// DELETE a specific block
router.delete('/:id/block/:blockId', timeTableController.deleteBlock);

// POST recalculate missed days
router.post('/:id/recalculate', timeTableController.recalculateSchedule);

// GET export as ICS
router.get('/:id/export', timeTableController.exportToICS);

// POST AI Bot Schedule Update
router.post('/:id/bot-update', timeTableController.botUpdateSchedule);

module.exports = router;
