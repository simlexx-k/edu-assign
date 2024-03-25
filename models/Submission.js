const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ type: String, required: true }],
  submissionDate: { type: Date, default: Date.now },
  grade: { type: String, required: false }, // Optional field for grade
  feedback: { type: String, required: false } // Optional field for feedback
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;