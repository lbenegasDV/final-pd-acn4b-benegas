const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../utils/validate');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getReservas,
  getReservaById,
  createReserva,
  updateReserva,
  deleteReserva
} = require('../controllers/reservasController');

const router = express.Router();

// LISTAR (público)
router.get('/', getReservas);

// DETALLE POR ID (público) - mínimo obligatorio del final
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('ID inválido')],
  validate,
  getReservaById
);

// CREAR (protegido)
router.post(
  '/',
  authMiddleware,
  [
    body('fecha').notEmpty().withMessage('La fecha es obligatoria'),
    body('hora').notEmpty().withMessage('La hora es obligatoria'),
    // salaId opcional, salaNombre opcional, pero al menos uno se valida en controller
    body('notas').optional().isString()
  ],
  validate,
  createReserva
);

// EDITAR (protegido)
router.put(
  '/:id',
  authMiddleware,
  [
    param('id').notEmpty().withMessage('ID inválido'),
    body('fecha').optional().isString(),
    body('hora').optional().isString(),
    body('salaId').optional().isString(),
    body('salaNombre').optional().isString(),
    body('notas').optional().isString()
  ],
  validate,
  updateReserva
);

// ELIMINAR (protegido)
router.delete(
  '/:id',
  authMiddleware,
  [param('id').notEmpty().withMessage('ID inválido')],
  validate,
  deleteReserva
);

module.exports = router;
