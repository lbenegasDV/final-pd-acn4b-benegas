const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { DB_FILE } = require('../config/config');

let dbInstance = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  // Habilitar FK
  await dbInstance.exec('PRAGMA foreign_keys = ON;');

  return dbInstance;
}

module.exports = { getDB };
