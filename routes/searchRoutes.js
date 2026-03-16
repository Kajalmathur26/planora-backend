const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { globalSearch } = require('../controllers/searchController');

router.use(authenticate);
router.get('/', globalSearch);

module.exports = router;
