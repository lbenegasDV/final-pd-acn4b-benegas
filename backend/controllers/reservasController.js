const { randomUUID } = require('crypto');
const ReservaModel = require('../models/reservaModel');
const SalaModel = require('../models/salaModel');


function normalizeToStep(timeHHMM, step = 15) {
  if (!timeHHMM) return null;
  const [h, m] = timeHHMM.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;

  const total = h * 60 + m;
  const rounded = Math.round(total / step) * step;

  const hh = String(Math.floor(rounded / 60)).padStart(2, '0');
  const mm = String(rounded % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

async function getReservas(req, res, next) {
  try {
    const reservas = await ReservaModel.listAll();
    res.json(reservas);
  } catch (err) {
    next(err);
  }
}

async function getReservaById(req, res, next) {
  try {
    const reserva = await ReservaModel.findById(req.params.id);
    if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json(reserva);
  } catch (err) {
    next(err);
  }
}

async function createReserva(req, res, next) {
  try {
    const { fecha, hora, salaId, salaNombre, notas } = req.body;

    // Validaciones mínimas
    if (!fecha || !hora) {
      return res.status(400).json({ message: 'Fecha y hora son obligatorias' });
    }

    let finalSalaId = salaId || null;
    let finalSalaNombre = salaNombre;

    // Si envían salaId, validamos y tomamos su nombre real
    if (salaId) {
      const sala = await SalaModel.findById(salaId);
      if (!sala) return res.status(400).json({ message: 'Sala inválida' });
      finalSalaNombre = sala.nombre;
      finalSalaId = sala.id;
    }

    if (!finalSalaNombre) {
      return res.status(400).json({ message: 'La sala es obligatoria' });
    }

    // Normalizamos hora al grid de 15 min (igual que el frontend)
    const normalizedHora = normalizeToStep(hora, 15);
    if (!normalizedHora) {
      return res.status(400).json({ message: 'Hora inválida' });
    }

    // =========================
    // ✅ Chequeo de colisión
    // =========================
    const reservas = await ReservaModel.listAll();

    const targetSalaNombre = String(finalSalaNombre).trim().toLowerCase();

    const conflict = reservas.find((r) => {
      if (!r?.fecha || !r?.hora) return false;
      if (r.fecha !== fecha) return false;

      const rHoraNorm = normalizeToStep(r.hora, 15);
      if (rHoraNorm !== normalizedHora) return false;

      // Caso A: comparación por salaId cuando existe en ambos
      if (finalSalaId && r.salaId && String(r.salaId) === String(finalSalaId)) {
        return true;
      }

      // Caso B: fallback por nombre (compatibilidad con reservas viejas sin salaId)
      const rNom = String(r.salaNombre || '').trim().toLowerCase();
      if (!r.salaId && rNom && rNom === targetSalaNombre) {
        return true;
      }

      // Caso C: si no hay salaId pero ambos tienen nombre igual (modo manual)
      if (!finalSalaId && rNom && rNom === targetSalaNombre) {
        return true;
      }

      return false;
    });

    if (conflict) {
      return res.status(409).json({
        message: 'Conflicto de reserva: la sala ya está ocupada en ese horario.',
        conflict: {
          fecha,
          hora: normalizedHora,
          salaId: finalSalaId,
          salaNombre: finalSalaNombre
        }
      });
    }

    const nueva = {
      id: randomUUID(),
      usuarioId: req.user.id,
      salaId: finalSalaId,
      salaNombre: finalSalaNombre,
      fecha,
      // ✅ Recomendado: guardar normalizada para consistencia total
      hora: normalizedHora,
      notas: notas || '',
      createdAt: new Date().toISOString()
    };

    const created = await ReservaModel.create(nueva);

    res.status(201).json({
      message: 'Reserva creada correctamente',
      reserva: created
    });
  } catch (err) {
    next(err);
  }
}


async function updateReserva(req, res, next) {
  try {
    const { fecha, hora, salaId, salaNombre, notas } = req.body;

    let changes = { fecha, hora, notas };

    let finalSalaId = salaId || null;
    let finalSalaNombre = salaNombre;

    if (salaId) {
      const sala = await SalaModel.findById(salaId);
      if (!sala) return res.status(400).json({ message: 'Sala inválida' });
      finalSalaId = sala.id;
      finalSalaNombre = sala.nombre;
      changes.salaId = sala.id;
      changes.salaNombre = sala.nombre;
    } else if (salaNombre) {
      finalSalaId = null;
      finalSalaNombre = salaNombre;
      changes.salaId = null;
      changes.salaNombre = salaNombre;
    }

    // Si actualizan hora, normalizamos
    if (hora) {
      const normalizedHora = normalizeToStep(hora, 15);
      if (!normalizedHora) {
        return res.status(400).json({ message: 'Hora inválida' });
      }
      changes.hora = normalizedHora;
    }

    // =========================
    // ✅ Chequeo de colisión en update
    // Solo si vienen fecha y hora (o si el cambio las afecta)
    // =========================
    const willCheckFecha = Boolean(fecha);
    const willCheckHora = Boolean(changes.hora);

    if (willCheckFecha && willCheckHora && finalSalaNombre) {
      const reservas = await ReservaModel.listAll();

      const targetSalaNombre = String(finalSalaNombre).trim().toLowerCase();
      const targetHora = changes.hora;

      const conflict = reservas.find((r) => {
        if (!r?.id || !r?.fecha || !r?.hora) return false;
        if (String(r.id) === String(req.params.id)) return false; // excluir la actual
        if (r.fecha !== fecha) return false;

        const rHoraNorm = normalizeToStep(r.hora, 15);
        if (rHoraNorm !== targetHora) return false;

        if (finalSalaId && r.salaId && String(r.salaId) === String(finalSalaId)) {
          return true;
        }

        const rNom = String(r.salaNombre || '').trim().toLowerCase();

        if (!r.salaId && rNom && rNom === targetSalaNombre) {
          return true;
        }

        if (!finalSalaId && rNom && rNom === targetSalaNombre) {
          return true;
        }

        return false;
      });

      if (conflict) {
        return res.status(409).json({
          message: 'Conflicto de reserva: la sala ya está ocupada en ese horario.',
          conflict: {
            fecha,
            hora: targetHora,
            salaId: finalSalaId,
            salaNombre: finalSalaNombre
          }
        });
      }
    }

    const updated = await ReservaModel.update(
      req.params.id,
      req.user.id,
      changes
    );

    if (!updated) return res.status(404).json({ message: 'Reserva no encontrada' });

    res.json({
      message: 'Reserva actualizada correctamente',
      reserva: updated
    });
  } catch (err) {
    next(err);
  }
}


async function deleteReserva(req, res, next) {
  try {
    const result = await ReservaModel.remove(req.params.id, req.user.id);

    if (result.notFound) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json({ message: 'Reserva eliminada correctamente' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReservas,
  getReservaById,
  createReserva,
  updateReserva,
  deleteReserva
};
