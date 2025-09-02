const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const Property = require('../models/Property');
const router = express.Router();
const { validationResult, body } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');

// Route 1: Send a message/inquiry: POST "/api/message/send". Login required.
router.post('/send', fetchuser, [
    body('propertyId', 'Property ID is required').isMongoId(),
    body('subject', 'Subject is required').notEmpty(),
    body('message', 'Message is required').notEmpty(),
    body('inquiryType').optional().isIn(['general', 'viewing', 'application', 'availability']),
    body('preferredDate').optional().isISO8601(),
    body('phone').optional().isMobilePhone()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { propertyId, subject, message, inquiryType, preferredDate, phone } = req.body;

        // Find the property to get the landlord
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, error: "Property not found" });
        }

        // Create the message
        const newMessage = await Message.create({
            sender: req.user.id,
            recipient: property.landlord,
            property: propertyId,
            subject,
            message,
            inquiryType: inquiryType || 'general',
            preferredDate,
            phone
        });

        res.json({ success: true, message: newMessage });

    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

// Route 2: Get messages for current user: GET "/api/message/my-messages". Login required.
router.get('/my-messages', fetchuser, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id },
                { recipient: req.user.id }
            ]
        })
        .populate('sender', 'name email')
        .populate('recipient', 'name email')
        .populate('property', 'title location')
        .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

// Route 3: Get messages for a specific property: GET "/api/message/property/:propertyId". Login required.
router.get('/property/:propertyId', fetchuser, async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        if (!property) {
            return res.status(404).json({ error: "Property not found" });
        }

        // Only landlord or sender can view messages for this property
        if (property.landlord.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to view messages for this property" });
        }

        const messages = await Message.find({ property: req.params.propertyId })
            .populate('sender', 'name email phoneNo')
            .populate('recipient', 'name email phoneNo')
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

// Route 4: Mark message as read: PUT "/api/message/mark-read/:messageId". Login required.
router.put('/mark-read/:messageId', fetchuser, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            return res.status(404).json({ success: false, error: "Message not found" });
        }

        // Only recipient can mark as read
        if (message.recipient.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: "Not authorized to mark this message as read" });
        }

        message.status = 'read';
        await message.save();

        res.json({ success: true, message });

    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

// Route 5: Delete a message: DELETE "/api/message/delete/:messageId". Login required.
router.delete('/delete/:messageId', fetchuser, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            return res.status(404).json({ success: false, error: "Message not found" });
        }

        // Only sender or recipient can delete
        if (message.sender.toString() !== req.user.id && message.recipient.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: "Not authorized to delete this message" });
        }

        await Message.findByIdAndDelete(req.params.messageId);
        res.json({ success: true, message: "Message deleted successfully" });

    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

module.exports = router;
