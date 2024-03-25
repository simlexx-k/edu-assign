const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true }, // Updated field type to ObjectId referencing 'Subject'
  dueDate: { type: Date, required: true },
  questions: [{ type: String, required: true }],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;