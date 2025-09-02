const express = require('express');
const Property = require('../models/Property');
const User = require('../models/User');
const router = express.Router();
const { validationResult, body } = require('express-validator');
var fetchuser = require('../middleware/fetchuser');


// Route 1: Create a property: POST "/api/property/create". Login required.
router.post('/create', fetchuser, [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('location.address').notEmpty().withMessage('Address is required'),
    body('location.city').notEmpty().withMessage('City is required'),
    body('location.state').notEmpty().withMessage('State is required'),
    body('location.zipCode').notEmpty().withMessage('Zip code is required'),
    body('propertyType').isIn(['apartment', 'studio']).withMessage('Invalid property type'),
    body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be >= 0'),
    body('bathrooms').isFloat({ min: 0 }).withMessage('Bathrooms must be >= 0'),
    body('area').isFloat({ min: 0 }).withMessage('Area must be > 0'),
    body('maxGuests').isInt({ min: 1 }).withMessage('Max guests must be >= 1'),
    body('guestType').isIn(['Family', 'Bachelors', 'Girls', 'Boys']).withMessage('Invalid guest type')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const property = new Property({
            ...req.body,
            landlord: req.user.id
        });
        const savedProperty = await property.save();
        res.json({ success: true, property: savedProperty });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 2: Get all properties: GET "/api/property/all". No login required.
router.get('/all', async (req, res) => {
    try {
        const { city, propertyType, minPrice, maxPrice, bedrooms, guests, guestType } = req.query;

        let query = {};

        if (city) query['location.city'] = new RegExp(city, 'i');
        if (propertyType) query.propertyType = propertyType;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (bedrooms) query.bedrooms = parseInt(bedrooms);
        if (guests) query.maxGuests = { $gte: parseInt(guests) };
        if (guestType) query.guestType = guestType;

        const properties = await Property.find(query).sort({ createdAt: -1 });
        res.json({ success: true, properties });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Route 3: Get properties owned by logged-in user: GET "/api/property/myproperties". Login required.
router.get('/myproperties', fetchuser, async (req, res) => {
    try {
        const properties = await Property.find({ landlord: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, properties });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, error: "Internal Server Error"});
    }
});

// Route 4: Get single property by ID: GET "/api/property/:id". No login required.
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('landlord', 'name email phoneNo');
        if (!property) {
            return res.status(404).json({ error: "Property not found" });
        }
        res.json({success: true, property});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 5: Update a property: PUT "/api/property/update/:id". Login required.
router.put('/update/:id', fetchuser, [
    body('title', 'Title is required').optional().notEmpty(),
    body('description', 'Description is required').optional().notEmpty(),
    body('price', 'Price must be a positive number').optional().isNumeric().isFloat({ min: 0 }),
    body('bedrooms', 'Bedrooms must be a non-negative number').optional().isNumeric().isInt({ min: 0 }),
    body('bathrooms', 'Bathrooms must be a non-negative number').optional().isNumeric().isInt({ min: 0 }),
    body('area', 'Area must be a positive number').optional().isNumeric().isFloat({ min: 0 }),
    body('maxGuests', 'Max guests must be at least 1').optional().isNumeric().isInt({ min: 1 }),
    body('guestType').optional().isIn(['Family', 'Bachelors', 'Girls', 'Boys']).withMessage('Invalid guest type')
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        let property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, error: "Property not found" });
        }

        if (property.landlord.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: "Not authorized to update this property" });
        }

        property = await Property.findByIdAndUpdate(
            req.params.id,
            { $set: req.body, updatedAt: Date.now() },
            { new: true }
        );

        res.json({ success: true, property });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 6: Delete a property: DELETE "/api/property/delete/:id". Login required.
router.delete('/delete/:id', fetchuser, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, error: "Property not found" });
        }

        if (property.landlord.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: "Not authorized to delete this property" });
        }

        await Property.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Property deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

// Route 7: Toggle property availability: PUT "/api/property/toggle-availability/:id". Login required.
router.put('/toggle-availability/:id', fetchuser, async (req, res) => {
    try {
        let property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, error: "Property not found" });
        }

        if (property.landlord.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: "Not authorized to update this property" });
        }

        property.isAvailable = !property.isAvailable;
        await property.save();

        res.json({ success: true, property });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

module.exports = router;
