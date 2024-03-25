const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const { requireRole } = require('./middleware/roleMiddleware');
const { csrfProtection } = require('./middleware/securityMiddleware'); // Import CSRF protection middleware
const Submission = require('../models/Submission');
const router = express.Router();

// Route to display submissions for a given assignment
router.get('/grade-submissions/:assignmentId', isAuthenticated, requireRole('teacher'), csrfProtection, async (req, res) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.assignmentId }).populate('studentId', 'username');
    if (!submissions || submissions.length === 0) {
      console.log(`No submissions found for assignment ID: ${req.params.assignmentId}`);
      return res.status(404).send('No submissions found for this assignment.');
    }
    res.render('grade-submissions', { submissions, assignmentId: req.params.assignmentId, _csrf: req.csrfToken() });
  } catch (error) {
    console.error('Error fetching submissions:', error.message);
    console.error(error.stack);
    return res.status(500).send('Server error');
  }
});

// Route to update grade and feedback for a submission
router.post('/update-grade/:submissionId', isAuthenticated, requireRole('teacher'), csrfProtection, async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const updatedSubmission = await Submission.findByIdAndUpdate(req.params.submissionId, { grade, feedback }, { new: true });
    if (!updatedSubmission) {
      console.log(`Submission not found or unable to update for ID: ${req.params.submissionId}`);
      return res.status(404).json({ success: false, message: 'Submission not found or unable to update' });
    }
    console.log(`Grade and feedback updated for submission ID: ${req.params.submissionId}`);
    res.json({ success: true, message: 'Grade and feedback updated successfully' });
  } catch (error) {
    console.error('Error updating submission:', error.message);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;