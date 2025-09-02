const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'rs';

// Route 1: Create a user using: POST "/api/auth/createUser". No login required.
router.post('/createUser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('phoneNo', 'Enter a valid phone number').isLength({ min: 10, max: 10 }),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
    body('role').isIn(['landlord', 'tenant']).withMessage('Invalid role'),
], async (req, res) => {
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { name, phoneNo, email, password, role } = req.body;

        // Check whether the user with this email exists already
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success: false, error: "Sorry a user with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create a new user
        user = await User.create({
            name: req.body.name,
            phoneNo: req.body.phoneNo,
            email: req.body.email,
            password: secPass,
            role
        });

        const data = {
            user: {
                id: user.id
            }
        };
        const authtoken = jwt.sign(data, JWT_SECRET);

        res.json({ success: true, authtoken, user: { id: user.id, name: user.name, email: user.email, phoneNo: user.phoneNo, role: user.role } });

    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

// Route 2: Authenticate a user using: POST "/api/auth/login". No login required.
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success: false, error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ success: true, authtoken, user: { id: user.id, name: user.name, email: user.email, phoneNo: user.phoneNo, role: user.role } });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

// Route 3: Get loggedin User details using: POST "/api/auth/getuser". Login required.
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

module.exports = router;
