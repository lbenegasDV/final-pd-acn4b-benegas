const { getDB } = require('../utils/db');

async function findByEmail(email) {
  const db = await getDB();
  return db.get(`SELECT * FROM usuarios WHERE email = ?`, [email]);
}

async function findById(id) {
  const db = await getDB();
  return db.get(`SELECT id, nombre, email, createdAt FROM usuarios WHERE id = ?`, [id]);
}

async function create(user) {
  const db = await getDB();
  await db.run(
    `INSERT INTO usuarios (id, nombre, email, password, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [user.id, user.nombre, user.email, user.password, user.createdAt]
  );
  return findById(user.id);
}

module.exports = {
  findByEmail,
  findById,
  create
};
