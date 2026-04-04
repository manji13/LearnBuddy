const router = require('express').Router()
const { getSavedModules, saveModule, unsaveModule } = require('../../Controller/Module Management/SavedmoduleController')

router.route('/').get(getSavedModules).post(saveModule)
router.route('/:moduleId').delete(unsaveModule)

module.exports = router