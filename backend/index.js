const express = require('express');
const cors = require('cors');

const { PORT } = require('./config/config');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const reservasRoutes = require('./routes/reservasRoutes');
const salasRoutes = require('./routes/salasRoutes');

const { initDb } = require('./utils/initDb');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(logger);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/salas', salasRoutes);

// Health
app.get('/', (req, res) => {
  res.json({ message: 'API SQLite de Coworking funcionando' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Error handler (siempre al final)
app.use(errorHandler);

// Levantar servidor solo después de inicializar DB
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error inicializando la base de datos:', err);
    process.exit(1);
  });
