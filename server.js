const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const Image = require('./models/Image');
const app = express();
const port = 8888;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/UserCredentialsDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware for sessions
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // In production, set secure: true for HTTPS
}));

// Middleware for parsing JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'client/app')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'client/uploads/')); // Use absolute path
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Create multer upload middleware
const upload = multer({ storage: storage });

// Handle image upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        // Save the uploaded image to the database
        const newImage = new Image({
            filename: req.file.filename,
            path: req.file.path // Adjust this as per your file storage configuration
        });
        await newImage.save();
        res.redirect('/profile');
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).send("Error uploading image");
    }
});

// Serve images
app.get('/images/:filename', async (req, res) => {
    try {
        const image = await Image.findOne({ filename: req.params.filename });
        if (!image) {
            return res.status(404).send("Image not found");
        }
        res.sendFile(image.path); // Adjust this as per your file storage configuration
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).send("Error serving image");
    }
});
// Route to handle registration requests
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Save the username and password to the database
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

app.get('/register', (req, res) => {
    // Send the register.component.html file as the response
    res.sendFile(path.join(__dirname, 'client/app/src/app/register/register.component.html'));
});
// Import routers
const routes = require('./routes');

// Use routes
app.use('/', routes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});