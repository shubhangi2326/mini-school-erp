require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const routes = require('./src/routes');
const User = require('./src/models/User');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

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

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB Atlas');
  seedAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
