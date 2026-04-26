const router = require('express').Router();
const {
  startAnalysisSession,
  stopAnalysisSession,
  getAnalysisSessions,
  getSessionDetails
} = require('../controllers/analysisController');
const { authenticate } = require('../middleware/auth');

// GET /api/analysis?page=1&limit=10&status=running
router.get('/', authenticate, getAnalysisSessions);

// POST /api/analysis/sessions/start
router.post('/sessions/start', authenticate, startAnalysisSession);

// PUT /api/analysis/sessions/:sessionId/stop
router.put('/sessions/:sessionId/stop', authenticate, stopAnalysisSession);

// GET /api/analysis/sessions/:sessionId
router.get('/sessions/:sessionId', authenticate, getSessionDetails);

module.exports = router;
