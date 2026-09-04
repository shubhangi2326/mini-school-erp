const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'TEACHER', 'STUDENT'], default: 'TEACHER' },
  
  // Teacher/Admin specific fields
  phone: { type: String },
  subject: { type: String },
  
  // Student specific fields
  rollNumber: { type: String, unique: true, sparse: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  guardianContact: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
