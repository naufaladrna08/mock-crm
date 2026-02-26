const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController.js');

// List contacts with pagination and sorting
router.get('/related-stats', opportunityController.getRelatedStats);
router.get('/related/:contact_id', opportunityController.getRelatedByContactId);

module.exports = router;