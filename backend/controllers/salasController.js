const SalaModel = require('../models/salaModel');

async function getSalas(req, res, next) {
  try {
    const salas = await SalaModel.list();
    res.json(salas);
  } catch (err) {
    next(err);
  }
}

async function getSalaById(req, res, next) {
  try {
    const sala = await SalaModel.findById(req.params.id);
    if (!sala) return res.status(404).json({ message: 'Sala no encontrada' });
    res.json(sala);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSalas, getSalaById };
