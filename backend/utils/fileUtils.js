const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

async function readJSON(fileName) {
  const filePath = path.join(dataDir, fileName);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    // Si el archivo está vacío, devolvemos []
    if (!data.trim()) {
      return [];
    }
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Si no existe el archivo, lo creamos vacío
      await fs.writeFile(filePath, '[]');
      return [];
    }
    throw err;
  }
}

async function writeJSON(fileName, content) {
  const filePath = path.join(dataDir, fileName);
  const json = JSON.stringify(content, null, 2);
  await fs.writeFile(filePath, json);
}

module.exports = {
  readJSON,
  writeJSON
};
