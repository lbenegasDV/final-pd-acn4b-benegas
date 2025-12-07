const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join('. ');
    return res.status(400).json({ message: msg });
  }
  next();
}

module.exports = validate;
