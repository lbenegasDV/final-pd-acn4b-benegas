const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/config');
const UserModel = require('../models/userModel');

async function register(req, res, next) {
  try {
    const { nombre, email, password } = req.body;

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: randomUUID(),
      nombre,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    const created = await UserModel.create(newUser);

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: created
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
