const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

// Create lead
router.post('/', leadController.createLead);

// List leads with pagination and sorting
router.get('/', leadController.listLeads);

// Get lead detail
router.get('/:lead_id', leadController.getLeadDetail);

// Update lead
router.put('/:lead_id', leadController.updateLead);

// Delete lead
router.delete('/:lead_id', leadController.deleteLead);

module.exports = router;