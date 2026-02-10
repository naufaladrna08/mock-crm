const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Create contact
router.post('/', contactController.createContact);

// List contacts with pagination and sorting
router.get('/', contactController.listContacts);

// Get contact detail
router.get('/:contact_id', contactController.getContactDetail);

// Update contact
router.put('/:contact_id', contactController.updateContact);

// Delete contact
router.delete('/:contact_id', contactController.deleteContact);

module.exports = router;