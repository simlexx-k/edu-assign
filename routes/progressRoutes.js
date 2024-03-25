const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const { requireRole } = require('./middleware/roleMiddleware');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const router = express.Router();

// Route for displaying student's progress
router.get('/my-progress', isAuthenticated, requireRole('student'), async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.session.userId })
      .populate('assignmentId')
      .lean();
    const grades = submissions.map(submission => {
      // Attempt to parse the grade as a number, if not possible, return null
      const parsedGrade = parseFloat(submission.grade);
      return isNaN(parsedGrade) ? null : parsedGrade;
    }).filter(grade => grade !== null); // Filter out any null values that resulted from non-numeric grades
    if (grades.length === 0) {
      console.log('No valid numeric grades available for student progress chart.');
    }
    console.log('Student progress data fetched successfully');
    res.render('student-progress', { submissions, grades });
  } catch (error) {
    console.error('Error fetching student progress:', error.message);
    console.error(error.stack);
    res.status(500).send('Server error fetching student progress');
  }
});

// Route for displaying class progress (teacher's view)
router.get('/class-progress', isAuthenticated, requireRole('teacher'), async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacherId: req.session.userId })
      .lean();
    const submissions = await Submission.find()
      .populate({
        path: 'assignmentId',
        match: { teacherId: req.session.userId }
      })
      .lean();
    console.log('Class progress data fetched successfully');

    // Calculate average grades without modifying the original submissions
    const averageGrades = assignments.map(assignment => {
      const relevantSubmissions = submissions.filter(submission => submission.assignmentId && submission.assignmentId._id.equals(assignment._id));
      const grades = relevantSubmissions.map(submission => parseFloat(submission.grade)).filter(grade => !isNaN(grade));
      const averageGrade = grades.length > 0 ? grades.reduce((acc, curr) => acc + curr, 0) / grades.length : 0;
      return { assignmentId: assignment._id, averageGrade };
    });

    res.render('class-progress', { assignments, submissions, averageGrades });
  } catch (error) {
    console.error('Error fetching class progress:', error.message);
    console.error(error.stack);
    res.status(500).send('Server error fetching class progress');
  }
});

module.exports = router;