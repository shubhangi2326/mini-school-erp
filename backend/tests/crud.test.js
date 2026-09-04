const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const routes = require('../src/routes');
const User = require('../src/models/User');

process.env.JWT_SECRET = 'test_secret';

const app = express();
app.use(express.json());
app.use('/api', routes);

let mongoServer;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@crud.com',
    passwordHash: 'hash',
    role: 'ADMIN'
  });

  adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('CRUD Operations API', () => {
  it('should create a teacher', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Teacher 1', email: 'teacher1@test.com', password: 'pass', role: 'TEACHER', subject: 'Math' });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('email', 'teacher1@test.com');
  });

  it('should get teachers', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should create a class', async () => {
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '10th Grade' });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', '10th Grade');
  });
});
