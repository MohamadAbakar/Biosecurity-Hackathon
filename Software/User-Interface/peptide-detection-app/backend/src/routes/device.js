const router = require('express').Router();
const ctrl = require('../controllers/deviceController');
const { authenticate } = require('../middleware/auth');

router.post('/connect',      authenticate, ctrl.connect);
router.post('/disconnect',   authenticate, ctrl.disconnect);
router.get('/status',        authenticate, ctrl.getStatus);
router.post('/command',      authenticate, ctrl.sendCommand);

module.exports = router;
