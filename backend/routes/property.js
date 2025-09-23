const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const upload = require("../middleware/upload"); // multer middleware for parsing multipart/form-data
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");
const cloudinary = require("../config/cloudinary");

// -------------------- Helper for Validation --------------------
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return true;
  }
  return false;
};

// Allowed fields for property update
const allowedUpdateFields = [
  "title", "description", "price", "location", "propertyType", "bedrooms",
  "bathrooms", "area", "maxGuests", "guestType", "amenities", "rules",
  "availability"
];

// -------------------- ROUTES --------------------

// Route 1: Create a property (POST /api/property/create) – Login required
router.post(
  "/create",
  fetchuser,
  upload.array("images", 10), // accept up to 10 images
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be positive"),
    body("location.address").notEmpty().withMessage("Address is required"),
    body("location.city").notEmpty().withMessage("City is required"),
    body("location.state").notEmpty().withMessage("State is required"),
    body("location.zipCode").notEmpty().withMessage("Zip code is required"),
    body("propertyType").isIn(["apartment", "studio"]).withMessage("Invalid property type"),
    body("bedrooms").isInt({ min: 0 }),
    body("bathrooms").isFloat({ min: 0 }),
    body("area").isFloat({ min: 0 }),
    body("maxGuests").isInt({ min: 1 }),
    body("guestType").isIn(["Family", "Bachelors", "Girls", "Boys"]),
  ],
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
      let images = [];

      // Handle file uploads if files are provided
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "rishstay/properties",
          });
          images.push({ url: result.secure_url, public_id: result.public_id });
        }
      }

      // If no files uploaded but images provided in request body, use those
      if (images.length === 0 && req.body.images) {
        const providedImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        images = providedImages.map(img => ({
          url: img.url,
          public_id: img.public_id
        }));
      }

      const property = new Property({
        ...req.body,
        landlord: req.user.id,
        images: images,
      });

      const savedProperty = await property.save();
      res.json({ success: true, data: savedProperty });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);

// Route 2: Get all properties (GET /api/property/all) – No login required
router.get("/all", async (req, res) => {
  try {
    const { address, propertyType, minPrice, maxPrice, bedrooms, guests, guestType, page, limit } = req.query;

    let query = {};

    if (address) query["location.address"] = new RegExp(address.trim(), "i");
    if (propertyType) query.propertyType = propertyType;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms) };
    if (guests) query.maxGuests = { $gte: parseInt(guests) };
    if (guestType) query.guestType = guestType;

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 20;

    const properties = await Property.find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    res.json({ success: true, data: properties });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Route 3: Get logged-in user's properties (GET /api/property/myproperties) – Login required
router.get("/myproperties", fetchuser, async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: properties });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Route 4: Get single property by ID (GET /api/property/:id) – No login required
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("landlord", "name email phoneNo");
    if (!property) return res.status(404).json({ success: false, error: "Property not found" });
    res.json({ success: true, data: property });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Route 5: Update a property (PUT /api/property/update/:id) – Login required
router.put(
  "/update/:id",
  fetchuser,
  upload.array("images", 10),
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
      let property = await Property.findById(req.params.id);
      if (!property) return res.status(404).json({ success: false, error: "Property not found" });
      if (property.landlord.toString() !== req.user.id)
        return res.status(403).json({ success: false, error: "Not authorized" });

      const updates = {};

      // ✅ Handle JSON fields
      if (req.body.availability) {
        try {
          updates.availability =
            typeof req.body.availability === "string" ? JSON.parse(req.body.availability) : req.body.availability;
        } catch {}
      }
      if (req.body.location) {
        try {
          updates.location =
            typeof req.body.location === "string" ? JSON.parse(req.body.location) : req.body.location;
        } catch {}
      }

      // ✅ Arrays
      if (req.body["amenities[]"]) {
        updates.amenities = Array.isArray(req.body["amenities[]"]) ? req.body["amenities[]"] : [req.body["amenities[]"]];
      }
      if (req.body["rules[]"]) {
        updates.rules = Array.isArray(req.body["rules[]"]) ? req.body["rules[]"] : [req.body["rules[]"]];
      }

      // ✅ Simple fields
      for (let key of allowedUpdateFields) {
        if (req.body[key] !== undefined && !["availability", "location", "amenities", "rules"].includes(key)) {
          updates[key] = req.body[key];
        }
      }

      // ✅ Replace images if new ones uploaded
      if (req.files && req.files.length > 0) {
        // Delete old images
        for (const img of property.images) {
          await cloudinary.uploader.destroy(img.public_id);
        }

        const uploads = [];
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "rishstay/properties",
          });
          uploads.push({ url: result.secure_url, public_id: result.public_id });
        }
        updates.images = uploads;
      }

      property = await Property.findByIdAndUpdate(
        req.params.id,
        { $set: { ...updates, updatedAt: Date.now() } },
        { new: true }
      );

      res.json({ success: true, data: property });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);

// Route 6: Delete a property (DELETE /api/property/delete/:id) – Login required
router.delete("/delete/:id", fetchuser, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: "Property not found" });
    if (property.landlord.toString() !== req.user.id)
      return res.status(403).json({ success: false, error: "Not authorized" });

    // Delete images from Cloudinary
    for (const img of property.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Route 7: Toggle property availability (PUT /api/property/toggle-availability/:id) – Login required
router.put("/toggle-availability/:id", fetchuser, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: "Property not found" });
    if (property.landlord.toString() !== req.user.id)
      return res.status(403).json({ success: false, error: "Not authorized" });

    property.availability.isAvailable = !property.availability.isAvailable;
    await property.save();

    res.json({ success: true, data: property });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
