const express = require('express');
const router = express.Router();
const { getEntries, getEntry, createEntry, updateEntry, deleteEntry, uploadJournalImage } = require('../controllers/journalController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getEntries);
router.get('/:id', getEntry);
router.post('/', createEntry);
router.post('/upload-image', uploadJournalImage);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

module.exports = router;
