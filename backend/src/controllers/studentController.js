const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getStudents = async (req, res) => {
  const { classId } = req.query;
  try {
    const filter = { role: 'STUDENT' };
    if (classId) filter.class = classId;
    const students = await User.find(filter).populate('class', 'name');
    
    const mapped = students.map(s => ({
      id: s._id,
      name: s.name,
      email: s.email,
      rollNumber: s.rollNumber,
      guardianContact: s.guardianContact,
      classId: s.class ? s.class._id : null,
      class: s.class ? { name: s.class.name } : null
    }));
    
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createStudent = async (req, res) => {
  const { name, email, password, rollNumber, guardianContact, classId } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const student = await User.create({
      name, email, passwordHash, role: 'STUDENT', rollNumber, guardianContact, class: classId
    });
    res.status(201).json({ id: student._id, name: student.name, email: student.email, rollNumber: student.rollNumber, guardianContact: student.guardianContact, classId: student.class });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.rollNumber) {
      return res.status(409).json({ error: `Roll number ${req.body.rollNumber} already exists. Please use a different roll number.` });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, rollNumber, guardianContact, classId } = req.body;
  try {
    const data = { name, email, rollNumber, guardianContact, class: classId };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }
    const student = await User.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );
    res.json({ id: student._id, name: student.name, email: student.email, rollNumber: student.rollNumber, guardianContact: student.guardianContact, classId: student.class });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.rollNumber) {
      return res.status(409).json({ error: `Roll number ${req.body.rollNumber} already exists. Please use a different roll number.` });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent };
