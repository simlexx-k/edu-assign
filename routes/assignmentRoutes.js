const express = require('express');
const { requireRole } = require('./middleware/roleMiddleware');
const { csrfProtection } = require('./middleware/securityMiddleware'); // Import CSRF protection middleware
const Assignment = require('../models/Assignment');
const router = express.Router();

router.get('/create-assignment', csrfProtection, requireRole('teacher'), (req, res) => {
  res.render('create-assignment', { _csrf: req.csrfToken() });
});

router.post('/create-assignment', csrfProtection, requireRole('teacher'), async (req, res) => {
  try {
    const { subject, dueDate, questions } = req.body;
    if (typeof questions !== 'string') {
      throw new Error('Questions must be a string.');
    }
    const questionsArray = questions.split('\n').map(question => question.trim()).filter(question => question.length > 0);
    if (questionsArray.length === 0) {
      throw new Error('At least one question is required.');
    }
    const teacherId = req.session.userId;
    const newAssignment = new Assignment({ subject, dueDate, questions: questionsArray, teacherId });
    await newAssignment.save();
    console.log('Assignment created successfully');
    res.redirect('/');
  } catch (error) {
    console.error('Error creating assignment:', error);
    console.error(error.stack);
    res.status(500).send(error.message);
  }
});

module.exports = router;