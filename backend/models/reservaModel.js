const { getDB } = require('../utils/db');

async function listAll() {
  const db = await getDB();
  return db.all(`
    SELECT r.*, u.nombre as nombreUsuario, u.email as emailUsuario
    FROM reservas r
    JOIN usuarios u ON u.id = r.usuarioId
    ORDER BY datetime(r.createdAt) DESC
  `);
}

async function findById(id) {
  const db = await getDB();
  return db.get(`
    SELECT r.*, u.nombre as nombreUsuario, u.email as emailUsuario
    FROM reservas r
    JOIN usuarios u ON u.id = r.usuarioId
    WHERE r.id = ?
  `, [id]);
}

async function create(reserva) {
  const db = await getDB();
  await db.run(
    `INSERT INTO reservas
     (id, usuarioId, salaId, salaNombre, fecha, hora, notas, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reserva.id,
      reserva.usuarioId,
      reserva.salaId || null,
      reserva.salaNombre,
      reserva.fecha,
      reserva.hora,
      reserva.notas || '',
      reserva.createdAt
    ]
  );
  return findById(reserva.id);
}

async function update(id, usuarioId, changes) {
  const db = await getDB();

  const existing = await db.get(`SELECT * FROM reservas WHERE id = ?`, [id]);
  if (!existing) return null;
  if (existing.usuarioId !== usuarioId) {
    const err = new Error('No tenés permiso para editar esta reserva');
    err.status = 403;
    throw err;
  }

  const updated = {
    salaId: changes.salaId ?? existing.salaId,
    salaNombre: changes.salaNombre ?? existing.salaNombre,
    fecha: changes.fecha ?? existing.fecha,
    hora: changes.hora ?? existing.hora,
    notas: changes.notas ?? existing.notas,
    updatedAt: new Date().toISOString()
  };

  await db.run(
    `UPDATE reservas
     SET salaId = ?, salaNombre = ?, fecha = ?, hora = ?, notas = ?, updatedAt = ?
     WHERE id = ?`,
    [
      updated.salaId,
      updated.salaNombre,
      updated.fecha,
      updated.hora,
      updated.notas,
      updated.updatedAt,
      id
    ]
  );

  return findById(id);
}

async function remove(id, usuarioId) {
  const db = await getDB();

  const existing = await db.get(`SELECT * FROM reservas WHERE id = ?`, [id]);
  if (!existing) return { deleted: false, notFound: true };
  if (existing.usuarioId !== usuarioId) {
    const err = new Error('No tenés permiso para eliminar esta reserva');
    err.status = 403;
    throw err;
  }

  await db.run(`DELETE FROM reservas WHERE id = ?`, [id]);
  return { deleted: true };
}

module.exports = {
  listAll,
  findById,
  create,
  update,
  remove
};
