const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const upload = require("../middleware/upload");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");
const cloudinary = require("../config/cloudinary");

// Helper for Validation
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

// Route 1: Create a property (POST /api/property/create) — Login required
router.post(
  "/create",
  fetchuser,
  upload.array("images", 10),
  async (req, res) => {
    console.log("=== PROPERTY CREATE REQUEST ===");
    console.log("User ID:", req.user.id);
    console.log("Files received:", req.files?.length || 0);
    console.log("Body keys:", Object.keys(req.body));
    console.log("PropertyData:", req.body.propertyData);

    try {
      // ✅ Parse propertyData from JSON string
      let propertyData;
      try {
        propertyData = JSON.parse(req.body.propertyData);
        console.log("Parsed propertyData:", propertyData);
      } catch (error) {
        console.error("JSON parse error:", error);
        return res.status(400).json({ success: false, error: "Invalid property data format" });
      }

      // ✅ Validate required fields
      const requiredFields = [
        "title", "description", "price", "propertyType", "bedrooms",
        "bathrooms", "area", "maxGuests", "guestType", "location"
      ];

      for (const field of requiredFields) {
        if (!propertyData[field]) {
          return res.status(400).json({ success: false, error: `${field} is required` });
        }
      }

      // Validate location fields
      const locationFields = ["address", "city", "state", "zipCode"];
      for (const field of locationFields) {
        if (!propertyData.location[field]) {
          return res.status(400).json({ success: false, error: `Location ${field} is required` });
        }
      }

      // Validate property type
      if (!["apartment", "studio"].includes(propertyData.propertyType)) {
        return res.status(400).json({ success: false, error: "Invalid property type" });
      }

      // Validate guest type
      if (!["Family", "Bachelors", "Girls", "Boys"].includes(propertyData.guestType)) {
        return res.status(400).json({ success: false, error: "Invalid guest type" });
      }

      // Validate numeric fields
      if (propertyData.price <= 0) {
        return res.status(400).json({ success: false, error: "Price must be positive" });
      }
      if (propertyData.bedrooms < 0) {
        return res.status(400).json({ success: false, error: "Bedrooms cannot be negative" });
      }
      if (propertyData.bathrooms < 0) {
        return res.status(400).json({ success: false, error: "Bathrooms cannot be negative" });
      }
      if (propertyData.area <= 0) {
        return res.status(400).json({ success: false, error: "Area must be positive" });
      }
      if (propertyData.maxGuests < 1) {
        return res.status(400).json({ success: false, error: "Max guests must be at least 1" });
      }

      // ✅ FIXED: Only handle actual file uploads, ignore any image data in propertyData
      const uploads = [];
      if (req.files && req.files.length > 0) {
        console.log(`Uploading ${req.files.length} files to Cloudinary...`);
        for (const file of req.files) {
          console.log(`Uploading file: ${file.originalname}`);
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "rishstay/properties",
          });
          uploads.push({ url: result.secure_url, public_id: result.public_id });
          console.log(`Uploaded: ${result.public_id}`);
        }
      } else {
        return res.status(400).json({ success: false, error: "At least one image is required" });
      }

      const property = new Property({
        ...propertyData,
        landlord: req.user.id,
        images: uploads, // ✅ Only use uploaded files
      });

      const savedProperty = await property.save();
      console.log("Property saved successfully:", savedProperty._id);
      
      res.json({ success: true, data: savedProperty });
    } catch (error) {
      console.error("Create property error:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);

// Route 2: Get all properties (GET /api/property/all) — No login required
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

// Route 3: Get logged-in user's properties (GET /api/property/myproperties) — Login required
router.get("/myproperties", fetchuser, async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: properties });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Route 4: Get single property by ID (GET /api/property/:id) — No login required
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

// Route 5: Update a property (PUT /api/property/update/:id) — Login required
router.put(
  "/update/:id",
  fetchuser,
  upload.array("images", 10),
  async (req, res) => {
    console.log("=== PROPERTY UPDATE REQUEST ===");
    console.log("Property ID:", req.params.id);
    console.log("User ID:", req.user.id);
    console.log("Files received:", req.files?.length || 0);
    console.log("Body keys:", Object.keys(req.body));

    try {
      let property = await Property.findById(req.params.id);
      if (!property) return res.status(404).json({ success: false, error: "Property not found" });
      if (property.landlord.toString() !== req.user.id)
        return res.status(403).json({ success: false, error: "Not authorized" });

      const updates = {};

      // ✅ Handle propertyData if it exists (from add property form structure)
      if (req.body.propertyData) {
        try {
          const propertyData = JSON.parse(req.body.propertyData);
          console.log("Parsed propertyData:", propertyData);

          // Map propertyData fields to updates
          const fieldMappings = {
            title: 'title',
            description: 'description',
            price: 'price',
            propertyType: 'propertyType',
            bedrooms: 'bedrooms',
            bathrooms: 'bathrooms',
            area: 'area',
            maxGuests: 'maxGuests',
            guestType: 'guestType',
            location: 'location',
            amenities: 'amenities',
            rules: 'rules',
            availability: 'availability'
          };

          for (const [key, field] of Object.entries(fieldMappings)) {
            if (propertyData[key] !== undefined) {
              updates[field] = propertyData[key];
            }
          }
        } catch (error) {
          console.error("Error parsing propertyData:", error);
          return res.status(400).json({ success: false, error: "Invalid property data format" });
        }
      } else {
        // ✅ Handle individual FormData fields (from edit property form structure)
        
        // Handle JSON fields
        if (req.body.availability) {
          try {
            updates.availability = typeof req.body.availability === "string" 
              ? JSON.parse(req.body.availability) 
              : req.body.availability;
          } catch (error) {
            console.error("Error parsing availability:", error);
          }
        }
        
        if (req.body.location) {
          try {
            updates.location = typeof req.body.location === "string" 
              ? JSON.parse(req.body.location) 
              : req.body.location;
          } catch (error) {
            console.error("Error parsing location:", error);
          }
        }

        // Handle arrays
        if (req.body.amenities) {
          updates.amenities = Array.isArray(req.body.amenities) ? req.body.amenities : [req.body.amenities];
        } else if (req.body["amenities[]"]) {
          updates.amenities = Array.isArray(req.body["amenities[]"]) ? req.body["amenities[]"] : [req.body["amenities[]"]];
        }

        if (req.body.rules) {
          updates.rules = Array.isArray(req.body.rules) ? req.body.rules : [req.body.rules];
        } else if (req.body["rules[]"]) {
          updates.rules = Array.isArray(req.body["rules[]"]) ? req.body["rules[]"] : [req.body["rules[]"]];
        }

        // Handle simple fields
        for (let key of allowedUpdateFields) {
          if (req.body[key] !== undefined && !["availability", "location", "amenities", "rules"].includes(key)) {
            updates[key] = req.body[key];
          }
        }
      }

      // ✅ Handle images properly - avoid duplicates
      let finalImages = [...property.images]; // Start with existing images

      // Handle images to delete
      if (req.body.deleteImages) {
        const imagesToDelete = Array.isArray(req.body.deleteImages)
          ? req.body.deleteImages
          : [req.body.deleteImages];

        console.log("Deleting images:", imagesToDelete);

        // Delete from Cloudinary
        for (const publicId of imagesToDelete) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted from Cloudinary: ${publicId}`);
          } catch (error) {
            console.error(`Failed to delete from Cloudinary: ${publicId}`, error);
          }
        }

        // Remove from current images array
        finalImages = finalImages.filter(img => !imagesToDelete.includes(img.public_id));
      }

      // Handle images to keep (override if specified)
      if (req.body.keepImages) {
        const imagesToKeep = Array.isArray(req.body.keepImages)
          ? req.body.keepImages
          : [req.body.keepImages];

        console.log("Keeping images:", imagesToKeep.length);

        // Parse if it's JSON string
        const parsedKeepImages = imagesToKeep.map(img =>
          typeof img === 'string' ? JSON.parse(img) : img
        );

        finalImages = parsedKeepImages;
      }

      // ✅ Handle new image uploads - ONLY upload actual files
      if (req.files && req.files.length > 0) {
        console.log(`Uploading ${req.files.length} new files...`);
        const newUploads = [];
        
        for (const file of req.files) {
          console.log(`Uploading new file: ${file.originalname}`);
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "rishstay/properties",
          });
          newUploads.push({ url: result.secure_url, public_id: result.public_id });
          console.log(`New upload: ${result.public_id}`);
        }
        
        // Add new uploads to existing images
        finalImages = [...finalImages, ...newUploads];
      }

      // Only update images if there were image-related operations
      if (req.body.deleteImages || req.body.keepImages || (req.files && req.files.length > 0)) {
        updates.images = finalImages;
        console.log(`Final image count: ${finalImages.length}`);
      }

      property = await Property.findByIdAndUpdate(
        req.params.id,
        { $set: { ...updates, updatedAt: Date.now() } },
        { new: true }
      );

      console.log("Property updated successfully");
      res.json({ success: true, data: property });
    } catch (error) {
      console.error("Update property error:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);

// Route 6: Delete a property (DELETE /api/property/delete/:id) — Login required
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

// Route 7: Toggle property availability (PUT /api/property/toggle-availability/:id) — Login required
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
