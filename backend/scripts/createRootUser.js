require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config/config');

const rootUser = {
  name: 'Root Admin',
  displayName: 'Root Admin',
  username: 'root',
  email: 'root@muawin.com',
  password: 'Root@123', // This will be hashed
  role: 'root',
  zone: 'all',
  branch: 'all',
  registeredModules: ['all']
};

async function createRootUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);

    // console.log('Connected to MongoDB');


    // Check if root user already exists
    const existingRoot = await User.findOne({ username: 'root' });
    if (existingRoot) {
      // console.log('Root user already exists');


      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rootUser.password, salt);

    // Create root user
    const newRootUser = new User({
      ...rootUser,
      password: hashedPassword,
      plainPassword: rootUser.password // Store plain password for reference
    });

    await newRootUser.save();

    // console.log('Root user created successfully');


    // console.log('Username:', rootUser.username);


    // console.log('Password:', rootUser.password);


    // console.log('Email:', rootUser.email);

  } catch (error) {
    // console.error('Error creating root user:', error);

  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createRootUser(); 