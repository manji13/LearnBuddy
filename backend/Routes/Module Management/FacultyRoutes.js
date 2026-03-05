const router = require('express').Router()
const { getAllFaculties, getFacultyById, createFaculty, updateFaculty, deleteFaculty } = require('../../Controller/Module Management/FacultyController')

router.route('/').get(getAllFaculties).post(createFaculty)
router.route('/:id').get(getFacultyById).put(updateFaculty).delete(deleteFaculty)

module.exports = router
