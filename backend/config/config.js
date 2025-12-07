module.exports = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'clave_super_secreta_cambiar_en_produccion',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '2h',
  DB_FILE: process.env.DB_FILE || './database.sqlite'
};
