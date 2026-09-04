const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const routes = require('../src/routes');
const User = require('../src/models/User');

process.env.JWT_SECRET = 'test_secret';

const app = express();
app.use(express.json());
app.use('/api', routes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const passwordHash = await bcrypt.hash('password123', 10);
  await User.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    passwordHash,
    role: 'ADMIN'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth API', () => {
  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'admin@test.com');
  });

  it('should fail with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrong' });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });
});
