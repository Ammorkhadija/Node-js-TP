const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Image = require('./models/Image');

const storage = multer.memoryStorage(); // Store files in memory

const Upload = multer({ storage: storage });




function start(req, res) {
    res.sendFile(path.join(__dirname, 'client',  'app','src','app', 'index', 'index.component.html'));
}

function uploadPage(req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }
    res.sendFile(path.join(__dirname, 'client',  'app','src','app', 'upload', 'upload.component.html'));
}

async function upload(req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    upload.single('file')(req, res, async (err) => {
        if (err) {
            res.status(500).send("File upload failed");
            return;
        }

        // Save uploaded image to MongoDB
        const newImage = new Image({
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            data: req.file.buffer, // Use file buffer instead of file path
        });

        try {
            await newImage.save();
            req.session.lastUploadedFile = newImage.filename;
            res.redirect('/profile');
        } catch (error) {
            console.error(error);
            res.status(500).send("Failed to save image to database");
        }
    });
}

// Function to find all images in the database
async function find(req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    try {
        const images = await Image.find({}, 'filename'); // Retrieve only filenames
        let fileList = '<ul>';
        images.forEach(image => {
            fileList += `<li><a href="/images/${image.filename}" target="_blank">${image.filename}</a></li>`;
        });
        fileList += '</ul>';
        res.send(fileList);
    } catch (error) {
        console.error('Error finding images:', error);
        res.status(500).send('Internal server error');
    }
}



async function show(req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    try {
        // Find the latest uploaded image
        const latestImage = await Image.findOne().sort({ _id: -1 });

        if (!latestImage) {
            res.status(404).send("No image uploaded yet");
            return;
        }

        res.setHeader('Content-Type', 'image/png'); // Adjust content type as per your file type
        res.sendFile(latestImage.path); // Send the latest image
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).send("Error serving image");
    }
}

function loginPage(req, res) {
    res.sendFile(path.join(__dirname, 'client', 'app','src','app', 'login', 'login.component.html'));
}

const User = require('./models/User');

async function login(req, res) {
    const { username, password } = req.body;
    try {
        // Find user by username and password
        const user = await User.findOne({ username, password }).exec();
        if (user) {
            req.session.userId = user._id;
            res.redirect('/profile');
        } else {
            res.status(401).send("Invalid username or password");
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send("Internal server error");
    }
}


function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).send("Failed to logout");
            return;
        }
        res.redirect('/start');
    });
}

function profilePage(req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }
    res.sendFile(path.join(__dirname, 'client', 'app','src','app', 'profile', 'profile.component.html'));
}
async function register(req, res) {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Create a new user
        const newUser = new User({ username, password });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}
module.exports = {
    start,
    register,
    uploadPage,
    upload,
    find,
    show,
    loginPage,
    login,
    logout,
    profilePage
};
