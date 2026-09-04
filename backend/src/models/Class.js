const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
