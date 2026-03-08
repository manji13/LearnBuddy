const router = require('express').Router()
const { getAllSemesters, getSemesterById, createSemester, updateSemester, deleteSemester } = require('../../Controller/Module Management/SemesterController')

router.route('/').get(getAllSemesters).post(createSemester)
router.route('/:id').get(getSemesterById).put(updateSemester).delete(deleteSemester)

module.exports = router
