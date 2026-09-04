const express = require('express');
const router = express.Router();

const { login } = require('../controllers/authController');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { getClasses, createClass, updateClass, deleteClass } = require('../controllers/classController');
const { getStudents, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { markAttendance, getAttendanceHistory } = require('../controllers/attendanceController');
const { getStats } = require('../controllers/dashboardController');
const { getProfile, getAttendanceStats, getAttendanceHistory: getStudentAttendanceHistory } = require('../controllers/studentDashboardController');

const auth = require('../middlewares/auth');

// Auth
router.post('/auth/login', login);

// Users (Teachers/Admins)
router.get('/users', auth(['ADMIN']), getUsers);
router.post('/users', auth(['ADMIN']), createUser);
router.put('/users/:id', auth(['ADMIN']), updateUser);
router.delete('/users/:id', auth(['ADMIN']), deleteUser);

// Classes
router.get('/classes', auth(['ADMIN', 'TEACHER']), getClasses);
router.post('/classes', auth(['ADMIN']), createClass);
router.put('/classes/:id', auth(['ADMIN']), updateClass);
router.delete('/classes/:id', auth(['ADMIN']), deleteClass);

// Students
router.get('/students', auth(['ADMIN', 'TEACHER']), getStudents);
router.post('/students', auth(['ADMIN']), createStudent);
router.put('/students/:id', auth(['ADMIN']), updateStudent);
router.delete('/students/:id', auth(['ADMIN']), deleteStudent);

// Attendance
router.post('/attendance', auth(['TEACHER', 'ADMIN']), markAttendance);
router.get('/attendance/history', auth(['ADMIN', 'TEACHER', 'STUDENT']), getAttendanceHistory);

// Dashboard
router.get('/dashboard/stats', auth(['ADMIN', 'TEACHER', 'STUDENT']), getStats);

// Student Dashboard specific
router.get('/student/profile', auth(['STUDENT']), getProfile);
router.get('/student/attendance/stats', auth(['STUDENT']), getAttendanceStats);
router.get('/student/attendance', auth(['STUDENT']), getStudentAttendanceHistory);

module.exports = router;
