const express = require('express');
const { getSalas, getSalaById } = require('../controllers/salasController');

const router = express.Router();

router.get('/', getSalas);
router.get('/:id', getSalaById);

module.exports = router;
