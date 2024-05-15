const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: String,
    path: String // Adjust this as per your file storage configuration
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
