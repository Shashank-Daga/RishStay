const express = require('express');
const Property = require('../models/Property');
const User = require('../models/User');
const router = express.Router();
const { validationResult, body } = require('express-validator');
var fetchuser = require('../middleware/fetchuser');


// Route 1: Create a property: POST "/api/property/create". Login required.
router.post('/create', fetchuser, [
    body('title', 'Title is required').notEmpty(),
    body('description', 'Description is required').notEmpty(),
    body('price', 'Price must be a positive number').isNumeric().isFloat({ min: 0 }),
    body('location.address', 'Address is required').notEmpty(),
    body('location.city', 'City is required').notEmpty(),
    body('location.state', 'State is required').notEmpty(),
    body('location.zipCode', 'Zip code is required').notEmpty(),
    body('propertyType', 'Property type is required').isIn(['apartment', 'house', 'villa', 'condo', 'studio']),
    body('bedrooms', 'Bedrooms must be a non-negative number').isNumeric().isInt({ min: 0 }),
    body('bathrooms', 'Bathrooms must be a non-negative number').isNumeric().isInt({ min: 0 }),
    body('area', 'Area must be a positive number').isNumeric().isFloat({ min: 0 }),
    body('maxGuests', 'Max guests must be at least 1').isNumeric().isInt({ min: 1 }),
    body('guestType'),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const {
            title, description, price, location, propertyType,
            amenities, bedrooms, bathrooms, area, maxGuests, guestType, rules
        } = req.body;

        const property = await Property.create({
            title,
            description,
            price,
            location,
            propertyType,
            amenities: amenities || [],
            bedrooms,
            bathrooms,
            area,
            maxGuests,
            guestType,
            rules: rules || [],
            owner: req.user.id,
            images: req.body.images || []
        });

        success = true;
        res.json({ success, property });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 2: Get all properties: GET "/api/property/all". No login required.
router.get('/all', async (req, res) => {
    try {
        const { city, propertyType, minPrice, maxPrice, bedrooms, guests, guestType } = req.query;
        
        let query = { isAvailable: true };
        
        if (city) query['location.city'] = new RegExp(city, 'i');
        if (propertyType) query.propertyType = propertyType;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice);
            if (maxPrice) query.price.$lte = parseInt(maxPrice);
        }
        if (bedrooms) query.bedrooms = parseInt(bedrooms);
        if (guests) query.maxGuests = { $gte: parseInt(guests) };
        if (guestType) query.guestType = guestType;

        const properties = await Property.find(query).populate('owner', 'name email phoneNo');
        res.json(properties);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 3: Get properties owned by logged-in user: GET "/api/property/myproperties". Login required.
router.get('/myproperties', fetchuser, async (req, res) => {
    try {
        const properties = await Property.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(properties);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 4: Get single property by ID: GET "/api/property/:id". No login required.
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('owner', 'name email phoneNo');
        if (!property) {
            return res.status(404).json({ error: "Property not found" });
        }
        res.json(property);
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
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success, error: "Property not found" });
        }

        if (property.owner.toString() !== req.user.id) {
            return res.status(401).json({ success, error: "Not authorized to update this property" });
        }

        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );

        success = true;
        res.json({ success, property: updatedProperty });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 6: Delete a property: DELETE "/api/property/delete/:id". Login required.
router.delete('/delete/:id', fetchuser, async (req, res) => {
    let success = false;
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success, error: "Property not found" });
        }

        if (property.owner.toString() !== req.user.id) {
            return res.status(401).json({ success, error: "Not authorized to delete this property" });
        }

        await Property.findByIdAndDelete(req.params.id);
        success = true;
        res.json({ success, message: "Property deleted successfully" });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 7: Toggle property availability: PUT "/api/property/toggle-availability/:id". Login required.
router.put('/toggle-availability/:id', fetchuser, async (req, res) => {
    let success = false;
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success, error: "Property not found" });
        }

        if (property.owner.toString() !== req.user.id) {
            return res.status(401).json({ success, error: "Not authorized to update this property" });
        }

        property.isAvailable = !property.isAvailable;
        property.updatedAt = Date.now();
        await property.save();

        success = true;
        res.json({ success, property });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
