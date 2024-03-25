const express = require('express');
const Subject = require('../models/Subject');
const { requireRole } = require('./middleware/roleMiddleware');
const { csrfProtection } = require('./middleware/securityMiddleware'); // Import CSRF protection middleware
const router = express.Router();

// Display form for adding new subjects
router.get('/subjects/new', csrfProtection, requireRole('teacher'), (req, res) => {
  res.render('add-subject', { _csrf: req.csrfToken() }); // Pass CSRF token to the view
});

// Handle subject creation
router.post('/subjects', csrfProtection, requireRole('teacher'), async (req, res) => {
  try {
    const { name } = req.body;
    const teacherId = req.session.userId;
    await Subject.create({ name, teacherId });
    console.log(`New subject created: ${name} by teacher ID: ${teacherId}`);
    res.redirect('/subjects');
  } catch (error) {
    console.error('Error creating subject:', error);
    console.error(error.stack);
    res.status(500).send(error.message);
  }
});

// Display subjects with edit and delete options
router.get('/subjects', csrfProtection, requireRole('teacher'), async (req, res) => {
  try {
    const subjects = await Subject.find({ teacherId: req.session.userId });
    res.render('manage-subjects', { subjects, _csrf: req.csrfToken() }); // Pass CSRF token to the view
  } catch (error) {
    console.error('Error fetching subjects:', error);
    console.error(error.stack);
    res.status(500).send(error.message);
  }
});

// Handle subject deletion
router.post('/subjects/delete/:id', csrfProtection, requireRole('teacher'), async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    console.log(`Subject with ID: ${req.params.id} deleted successfully.`);
    res.redirect('/subjects');
  } catch (error) {
    console.error('Error deleting subject:', error);
    console.error(error.stack);
    res.status(500).send(error.message);
  }
});

// Handle subject edits (Optional implementation can follow similar pattern to delete)

module.exports = router;