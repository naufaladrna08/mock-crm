const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Create contact
router.post('/', contactController.createContact);

// List contacts with pagination and sorting
router.get('/', contactController.listContacts);

// Get contact detail
router.get('/:contact_id', contactController.getContactDetail);

// Get contact overview
router.get('/:contact_id/overview', contactController.getContactOverview);

// Get contact timeline
router.get('/:contact_id/timeline', contactController.getContactTimeline);

// Update contact
router.put('/:contact_id', contactController.updateContact);

// Delete contact
router.delete('/:contact_id', contactController.deleteContact);

router.get('/:contact_id/call', contactController.getContactCalls);

// Get contact emails
router.get('/:contact_id/email', contactController.getContactEmails);

// Get contact meetings
router.get('/:contact_id/meeting', contactController.getContactMeetings);

// Get contact tasks
router.get('/:contact_id/tasks', contactController.getContactTasks);

// Get contact activities
router.get('/:contact_id/activity', contactController.getContactActivities);

// Get contact timeline
router.get('/:contact_id/timeline', contactController.getContactTimeline);

// Get contact task
router.get('/:contact_id/task/:task_id', contactController.getContactTaskById);

module.exports = router;