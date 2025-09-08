const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

if (!process.env.JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET is not set in environment variables. Using fallback secret.");
}
const JWT_SECRET = process.env.JWT_SECRET || "fallbackSecret";

/**
 * ROUTE 1: Register user
 * POST /api/auth/createUser
 * Public
 */
router.post('/createUser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('phoneNo', 'Enter a valid phone number').isMobilePhone(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
    body('role').isIn(['landlord', 'tenant']).withMessage('Invalid role'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { name, phoneNo, email, password, role } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({ success: false, error: "User with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        user = await User.create({ name, phoneNo, email, password: secPass, role });

        const data = { user: { id: user.id } };
        const authtoken = jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            success: true,
            data: {
                authtoken,
                user: { id: user.id, name: user.name, email: user.email, phoneNo: user.phoneNo, role: user.role }
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

/**
 * ROUTE 2: Login user
 * POST /api/auth/login
 * Public
 */
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const data = { user: { id: user.id } };
        const authtoken = jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            success: true,
            data: {
                authtoken,
                user: { id: user.id, name: user.name, email: user.email, phoneNo: user.phoneNo, role: user.role }
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

/**
 * ROUTE 3: Get logged-in user
 * POST /api/auth/getuser
 * Private
 */
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id; 
        console.log("Decoded token user:", req.user);
        const user = await User.findById(userId).select("-password");
        console.log("DB user:", user);
        res.json({ success: true, data: user });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

/**
 * ROUTE 4: Update user profile
 * PUT /api/auth/updateuser
 * Private
 */
router.put('/updateuser', fetchuser, [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('phoneNo', 'Enter a valid phone number').isMobilePhone(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const userId = req.user.id;
        const { name, phoneNo, email } = req.body;

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(409).json({ success: false, error: "Email already in use by another user" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, phoneNo, email },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

module.exports = router;
