// models/User.js

const mongoose = require('mongoose');

// Define the schema for the user data
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

// Create a model using the schema
const User = mongoose.model('User', userSchema);

module.exports = User;