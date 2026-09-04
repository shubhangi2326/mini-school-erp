const Attendance = require('../models/Attendance');

const markAttendance = async (req, res) => {
  const { classId, date, records } = req.body;
  try {
    const parsedDate = new Date(date);
    
    const upserts = records.map(record => {
      return Attendance.findOneAndUpdate(
        { date: parsedDate, student: record.studentId },
        { status: record.status, class: classId, student: record.studentId, date: parsedDate },
        { upsert: true, new: true }
      );
    });

    await Promise.all(upserts);
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAttendanceHistory = async (req, res) => {
  const { classId, studentId, date } = req.query;
  try {
    const filters = {};
    if (classId) filters.class = classId;
    if (studentId) filters.student = studentId;
    if (date) filters.date = new Date(date);

    const history = await Attendance.find(filters)
      .populate('student', 'name rollNumber')
      .populate('class', 'name')
      .sort({ date: -1 });
      
    const mapped = history.map(h => ({
      id: h._id,
      date: h.date,
      status: h.status,
      studentId: h.student ? h.student._id : null,
      classId: h.class ? h.class._id : null,
      student: h.student ? { name: h.student.name, rollNumber: h.student.rollNumber } : null,
      class: h.class ? { name: h.class.name } : null
    }));
      
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { markAttendance, getAttendanceHistory };
