const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const { validate } = require('../middleware/validation');

const registerSchema = Joi.object({
  username:   Joi.string().trim().min(3).max(100).required(),
  email:      Joi.string().email().required(),
  password:   Joi.string().min(8).required(),
  first_name: Joi.string().trim().max(100).optional(),
  last_name:  Joi.string().trim().max(100).optional(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const issueToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const register = [
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const existing = await User.findByEmail(req.body.email);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      const user  = await User.create(req.body);
      const token = issueToken(user);
      res.status(201).json({ success: true, token, user });
    } catch (err) {
      next(err);
    }
  }
];

const login = [
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const user = await User.findByEmail(req.body.email);
      if (!user || !(await User.verifyPassword(req.body.password, user.password_hash))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      await User.updateLastLogin(user.id);
      const token = issueToken(user);
      const { password_hash, ...safeUser } = user;
      res.json({ success: true, token, user: safeUser });
    } catch (err) {
      next(err);
    }
  }
];

const me = (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { register, login, me };
