require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const routes = require('./src/routes');
const User = require('./src/models/User');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000', 'https://mini-school-erp.vercel.app'],
  credentials: true
}));
app.use(express.json());

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@school.com' });
    if (!adminExists) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@school.com',
        passwordHash,
        role: 'ADMIN',
        phone: '1234567890'
      });
      console.log('Admin user seeded successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('Connected to MongoDB Atlas');
    await seedAdmin();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API is running!' });
});

app.use('/api', routes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(console.error);
}

module.exports = app;
