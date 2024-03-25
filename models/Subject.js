const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

subjectSchema.pre('save', function(next) {
  console.log(`Saving subject: ${this.name}`);
  next();
});

subjectSchema.post('save', function(doc, next) {
  console.log(`Subject saved: ${doc.name}`);
  next();
});

subjectSchema.post('remove', function(doc, next) {
  console.log(`Subject removed: ${doc.name}`);
  next();
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;