const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const { requireRole } = require('./middleware/roleMiddleware');
const { csrfProtection } = require('./middleware/securityMiddleware'); // Import CSRF protection middleware
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const router = express.Router();

// Route to display submission form
router.get('/submit-assignment/:assignmentId', isAuthenticated, requireRole('student'), csrfProtection, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      console.log('Assignment not found for ID:', req.params.assignmentId);
      return res.status(404).send('Assignment not found');
    }
    res.render('submit-assignment', { assignment, _csrf: req.csrfToken() });
  } catch (error) {
    console.error('Error fetching assignment:', error.message);
    console.error(error.stack); // Log the entire error stack
    return res.status(500).send('Server error');
  }
});

// Route to handle submission
router.post('/submit-assignment/:assignmentId', isAuthenticated, requireRole('student'), csrfProtection, async (req, res) => {
  try {
    const { answers } = req.body;
    const answersArray = Array.isArray(answers) ? answers : [answers];
    const submission = new Submission({
      assignmentId: req.params.assignmentId,
      studentId: req.session.userId,
      answers: answersArray
    });
    await submission.save();
    console.log('Assignment submitted successfully by student ID:', req.session.userId);
    res.redirect('/my-submissions');
  } catch (error) {
    console.error('Error submitting assignment:', error.message);
    console.error(error.stack); // Log the entire error stack
    return res.status(500).send('Server error');
  }
});

module.exports = router;