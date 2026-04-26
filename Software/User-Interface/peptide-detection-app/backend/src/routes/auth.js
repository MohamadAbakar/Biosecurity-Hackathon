const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        authenticate, me);
router.get('/profile',   authenticate, me);  // alias used by frontend

module.exports = router;
