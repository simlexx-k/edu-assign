const express = require('express');
const PDFDocument = require('pdfkit');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { requireRole } = require('./middleware/roleMiddleware');

const router = express.Router();

router.get('/reports/student-progress/:studentId', requireRole('teacher'), async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await User.findById(studentId);
    if (!student) {
      console.log('Student not found for ID:', studentId);
      return res.status(404).send('Student not found');
    }
    const submissions = await Submission.find({ studentId }).populate('assignmentId');
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${student.username}-progress-report.pdf`);
    doc.pipe(res);
    doc.fontSize(25).text(`${student.username}'s Progress Report`, { underline: true });
    doc.fontSize(15).moveDown();
    submissions.forEach(submission => {
      const { assignmentId, grade, feedback } = submission;
      doc.text(`Subject: ${assignmentId.subject}, Grade: ${grade}, Feedback: ${feedback}`, {
        paragraphGap: 5,
        indent: 20,
        align: 'left',
        lineGap: 2,
      }).moveDown();
    });
    doc.end();
  } catch (error) {
    console.error('Error generating student progress report:', error);
    console.error(error.stack);
    res.status(500).send('Failed to generate report');
  }
});

router.get('/reports/class-progress', requireRole('teacher'), async (req, res) => {
  try {
    const teacherId = req.session.userId;
    const assignments = await Assignment.find({ teacherId }).lean();
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=class-progress-report.pdf');
    doc.pipe(res);
    doc.fontSize(25).text('Class Progress Report', { underline: true });
    doc.fontSize(15).moveDown();
    for (const assignment of assignments) {
      const submissions = await Submission.find({ assignmentId: assignment._id }).lean();
      const averageGrade = submissions.reduce((acc, curr) => acc + parseFloat(curr.grade || 0), 0) / (submissions.length || 1);
      doc.text(`Subject: ${assignment.subject}, Average Grade: ${averageGrade.toFixed(2)}`, {
        paragraphGap: 5,
        indent: 20,
        align: 'left',
        lineGap: 2,
      }).moveDown();
    }
    doc.end();
  } catch (error) {
    console.error('Error generating class progress report:', error);
    console.error(error.stack);
    res.status(500).send('Failed to generate report');
  }
});

module.exports = router;