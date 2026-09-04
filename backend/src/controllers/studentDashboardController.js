const User = require('../models/User');
const Attendance = require('../models/Attendance');

const getProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('class', 'name');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    res.json({
      name: student.name,
      rollNumber: student.rollNumber || '-',
      class: student.class ? student.class.name : '-',
      email: student.email,
      guardianContact: student.guardianContact || '-'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAttendanceStats = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user.id });
    
    const totalDays = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

    res.json({
      totalDays,
      present,
      absent,
      percentage
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user.id })
      .populate('class', 'name')
      .sort({ date: -1 });
    
    const mapped = records.map(r => ({
      id: r._id,
      date: r.date,
      class: r.class ? r.class.name : '-',
      status: r.status
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getProfile, getAttendanceStats, getAttendanceHistory };
