const router = require('express').Router()
const { getAllModules, getModuleById, createModule, updateModule, deleteModule } = require('../../Controller/Module Management/ModuleController')

router.route('/').get(getAllModules).post(createModule)
router.route('/:id').get(getModuleById).put(updateModule).delete(deleteModule)

module.exports = router
