const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Class = require('../models/Class');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    const mapped = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      subject: u.subject
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, role, phone, subject } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, passwordHash, role: role || 'TEACHER', phone, subject
    });
    
    if (req.body.classId) {
      await Class.updateMany({ teacher: user._id }, { teacher: null });
      await Class.findByIdAndUpdate(req.body.classId, { teacher: user._id });
    }
    
    res.status(201).json({
      id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, subject: user.subject
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, subject, password } = req.body;
  try {
    const data = { name, email, phone, subject };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(id, data, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (req.body.classId) {
      await Class.updateMany({ teacher: user._id }, { teacher: null });
      await Class.findByIdAndUpdate(req.body.classId, { teacher: user._id });
    }
    
    res.json({
      id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, subject: user.subject
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
