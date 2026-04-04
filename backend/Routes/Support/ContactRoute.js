const express = require('express');
const { submitContactForm } = require('../../Controller/Support/ContactController.js');

const router = express.Router();

router.post('/', submitContactForm);

module.exports = router;