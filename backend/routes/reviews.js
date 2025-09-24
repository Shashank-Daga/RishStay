const express = require('express');
const Review = require('../models/Review');
const Property = require('../models/Property');
const User = require('../models/User');
const router = express.Router();
const { validationResult, body } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');

/**
 * ROUTE 1: Get all reviews for home page
 * GET /api/reviews
 * Public
 */
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .limit(6); // Limit to 6 reviews for home page

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

/**
 * ROUTE 2: Get reviews for a specific property
 * GET /api/reviews/property/:propertyId
 * Public
 */
router.get('/property/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const reviews = await Review.find({ propertyId })
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

/**
 * ROUTE 3: Create a new review
 * POST /api/reviews
 * Private - Requires authentication
 */
router.post('/', fetchuser, [
    body('comment', 'Comment is required and must be less than 1000 characters').isLength({ min: 1, max: 1000 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { comment } = req.body;
        const userId = req.user.id;

        // Check if user has already reviewed the platform
        const existingReview = await Review.findOne({ userId });
        if (existingReview) {
            return res.status(400).json({ success: false, error: "You have already reviewed the platform" });
        }

        // Get user details for the review
        const user = await User.findById(userId).select('name role');
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Create the review
        const review = await Review.create({
            userId,
            comment,
            userName: user.name,
            userRole: user.role
        });

        const populatedReview = await Review.findById(review._id)
            .populate('userId', 'name email role');

        res.json({
            success: true,
            data: populatedReview
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

/**
 * ROUTE 4: Update a review
 * PUT /api/reviews/:id
 * Private - Only review owner can update
 */
router.put('/:id', fetchuser, [
    body('comment', 'Comment must be less than 1000 characters').optional().isLength({ max: 1000 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { comment } = req.body;

        // Find the review
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ success: false, error: "Review not found" });
        }

        // Check if user owns the review
        if (review.userId.toString() !== userId) {
            return res.status(403).json({ success: false, error: "Not authorized to update this review" });
        }

        // Update the review
        if (comment !== undefined) review.comment = comment;

        await review.save();

        const updatedReview = await Review.findById(review._id)
            .populate('userId', 'name email role');

        res.json({
            success: true,
            data: updatedReview
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

/**
 * ROUTE 5: Delete a review
 * DELETE /api/reviews/:id
 * Private - Only review owner can delete
 */
router.delete('/:id', fetchuser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find the review
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ success: false, error: "Review not found" });
        }

        // Check if user owns the review
        if (review.userId.toString() !== userId) {
            return res.status(403).json({ success: false, error: "Not authorized to delete this review" });
        }

        await Review.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

module.exports = router;
