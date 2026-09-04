const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT'], required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }
}, { timestamps: true });

attendanceSchema.index({ date: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
