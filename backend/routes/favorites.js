const express = require('express');
const router = express.Router();
const User = require('../models/User');
const fetchuser = require('../middleware/fetchuser'); // auth middleware
const { body, validationResult, param } = require('express-validator');

// Helper: validation errors
const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return true;
    }
    return false;
};

// -----------------------
// PUT /api/user/:id/favorites — Replace entire favorites array
// -----------------------
const validateFavoritesArray = [
    body('favorites')
        .isArray({ min: 0 })
        .withMessage('Favorites must be an array of property IDs')
        .custom((arr) => arr.every(id => /^[0-9a-fA-F]{24}$/.test(id)))
        .withMessage('All favorites must be valid MongoDB ObjectIDs'),
];

router.put('/:id/favorites', fetchuser, validateFavoritesArray, async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    const { id } = req.params;
    const { favorites } = req.body;

    if (req.user.id !== id) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { favorites },
            { new: true }
        ).populate('favorites');

        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        res.json({ success: true, favorites: user.favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// -----------------------
// POST /api/user/:id/favorites/add — Add single property to favorites
// -----------------------
router.post(
    '/:id/favorites/add',
    fetchuser,
    [body('propertyId').isMongoId().withMessage('Invalid property ID')],
    async (req, res) => {
        if (handleValidationErrors(req, res)) return;

        const { id } = req.params;
        const { propertyId } = req.body;

        if (req.user.id !== id) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        try {
            const user = await User.findById(id);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            if (!user.favorites.includes(propertyId)) {
                user.favorites.push(propertyId);
                await user.save();
            }

            await user.populate('favorites');
            res.json({ success: true, favorites: user.favorites });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    }
);

// -----------------------
// DELETE /api/user/:id/favorites/remove/:propertyId — Remove single property
// -----------------------
router.delete(
    '/:id/favorites/remove/:propertyId',
    fetchuser,
    [param('propertyId').isMongoId().withMessage('Invalid property ID')],
    async (req, res) => {
        if (handleValidationErrors(req, res)) return;

        const { id, propertyId } = req.params;

        if (req.user.id !== id) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        try {
            const user = await User.findById(id);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            user.favorites = user.favorites.filter(fav => fav.toString() !== propertyId);
            await user.save();

            await user.populate('favorites');
            res.json({ success: true, favorites: user.favorites });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    }
);

// -----------------------
// GET /api/user/:id/favorites — Get favorites with optional pagination
// -----------------------
router.get('/:id/favorites', fetchuser, async (req, res) => {
    const { id } = req.params;

    if (req.user.id !== id) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const user = await User.findById(id).populate({
            path: 'favorites',
            options: { skip, limit, sort: { createdAt: -1 } },
        });

        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        res.json({
            success: true,
            favorites: user.favorites,
            pagination: { page, limit },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
