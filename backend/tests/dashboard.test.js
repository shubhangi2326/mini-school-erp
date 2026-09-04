const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const routes = require('../src/routes');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');
const Class = require('../src/models/Class');

process.env.JWT_SECRET = 'test_secret';

const app = express();
app.use(express.json());
app.use('/api', routes);

let mongoServer;
let studentToken;
let studentId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const passwordHash = await bcrypt.hash('student123', 10);
  const student = await User.create({
    name: 'Test Student',
    email: 'student@test.com',
    passwordHash,
    role: 'STUDENT',
    rollNumber: 'S101'
  });
  studentId = student._id;

  studentToken = jwt.sign({ id: student._id, role: student.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

  const classObj = await Class.create({ name: '10th Grade' });

  // Add attendance records
  await Attendance.create({
    student: student._id,
    class: classObj._id,
    date: new Date('2023-10-01'),
    status: 'PRESENT'
  });
  await Attendance.create({
    student: student._id,
    class: classObj._id,
    date: new Date('2023-10-02'),
    status: 'ABSENT'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Student Dashboard API', () => {
  it('should get student profile', async () => {
    const res = await request(app)
      .get('/api/student/profile')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Test Student');
    expect(res.body).toHaveProperty('rollNumber', 'S101');
  });

  it('should get student attendance stats', async () => {
    const res = await request(app)
      .get('/api/student/attendance/stats')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.totalDays).toEqual(2);
    expect(res.body.present).toEqual(1);
    expect(res.body.absent).toEqual(1);
    expect(res.body.percentage).toEqual(50);
  });
});
