const router = require('express').Router();
const {
  getAllPeptides,
  getPeptideById,
  createPeptide,
  updatePeptide,
  deletePeptide
} = require('../controllers/peptideController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/',    authenticate, getAllPeptides);
router.get('/:id', authenticate, getPeptideById);
router.post('/',   authenticate, requireAdmin, createPeptide);
router.put('/:id', authenticate, requireAdmin, updatePeptide);
router.delete('/:id', authenticate, requireAdmin, deletePeptide);

module.exports = router;
