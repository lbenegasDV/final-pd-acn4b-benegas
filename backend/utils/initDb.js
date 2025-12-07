const { getDB } = require('./db');

async function initDb() {
  const db = await getDB();

  // Tablas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS salas (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL UNIQUE,
      capacidad INTEGER NOT NULL,
      ubicacion TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS reservas (
      id TEXT PRIMARY KEY,
      usuarioId TEXT NOT NULL,
      salaId TEXT,
      salaNombre TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      notas TEXT DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT,
      FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (salaId) REFERENCES salas(id) ON DELETE SET NULL
    );
  `);

  // Seed de salas si está vacío
  const row = await db.get(`SELECT COUNT(*) as count FROM salas;`);
  if (row.count === 0) {
    const salasSeed = [
      { id: 'sala-azul', nombre: 'Sala Azul', capacidad: 6, ubicacion: 'Piso 1 - Sector A' },
      { id: 'sala-verde', nombre: 'Sala Verde', capacidad: 4, ubicacion: 'Piso 1 - Sector B' },
      { id: 'sala-roja', nombre: 'Sala Roja', capacidad: 10, ubicacion: 'Piso 2 - Sector Reuniones' },
      { id: 'sala-focus', nombre: 'Focus Room', capacidad: 2, ubicacion: 'Piso 2 - Cabinas' }
    ];

    const stmt = await db.prepare(
      `INSERT INTO salas (id, nombre, capacidad, ubicacion) VALUES (?, ?, ?, ?)`
    );

    try {
      for (const s of salasSeed) {
        await stmt.run(s.id, s.nombre, s.capacidad, s.ubicacion);
      }
    } finally {
      await stmt.finalize();
    }
  }
}

module.exports = { initDb };
