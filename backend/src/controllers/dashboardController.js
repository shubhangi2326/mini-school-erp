const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

const getStats = async (req, res) => {
  try {
    if (req.user.role === 'STUDENT') {
      const attendance = await Attendance.find({ student: req.user.id })
        .populate('class', 'name')
        .sort({ date: -1 });
      
      const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
      const totalCount = attendance.length;
      
      return res.json({
        isStudent: true,
        attendanceHistory: attendance,
        stats: {
          present: presentCount,
          total: totalCount
        }
      });
    }

    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalTeachers = await User.countDocuments({ role: 'TEACHER' });
    const totalClasses = await Class.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });

    const presentCount = todayAttendance.filter(a => a.status === 'PRESENT').length;
    const totalCount = todayAttendance.length;

    // Calculate class-wise overall attendance
    const allAttendance = await Attendance.find().populate('class', 'name');
    const classStats = {};
    allAttendance.forEach(a => {
      if (!a.class) return;
      const cName = a.class.name;
      if (!classStats[cName]) classStats[cName] = { present: 0, total: 0 };
      classStats[cName].total += 1;
      if (a.status === 'PRESENT') classStats[cName].present += 1;
    });

    const classWiseAttendance = Object.keys(classStats).map(cName => ({
      name: cName,
      percentage: Math.round((classStats[cName].present / classStats[cName].total) * 100)
    }));

    res.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      todayAttendance: {
        present: presentCount,
        totalMarked: totalCount
      },
      classWiseAttendance
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getStats };
