const { getDB } = require('../utils/db');

async function list() {
  const db = await getDB();
  return db.all(`SELECT * FROM salas ORDER BY nombre ASC`);
}

async function findById(id) {
  const db = await getDB();
  return db.get(`SELECT * FROM salas WHERE id = ?`, [id]);
}

module.exports = {
  list,
  findById
};
