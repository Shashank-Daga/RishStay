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
  "availability", "rooms", "youtubeUrl", "googleMapsUrl"
];

// -------------------- ROUTES --------------------

// Route 1: Create a property (POST /api/property/create) – Login required
// Replace the create route in property.js with this fixed version:

router.post(
  "/create",
  fetchuser,
  upload.array("images", 10),
  async (req, res) => {
    console.log("=== PROPERTY CREATE REQUEST ===");
    console.log("User ID:", req.user.id);
    console.log("Files received:", req.files?.length || 0);
    console.log("Body keys:", Object.keys(req.body));

    // Log the first file to see its structure
    if (req.files && req.files.length > 0) {
      console.log("First file structure:", JSON.stringify(req.files[0], null, 2));
    }

    try {
      // Parse propertyData from JSON string
      let propertyData;
      try {
        propertyData = JSON.parse(req.body.propertyData);
        console.log("Parsed propertyData:", propertyData);
      } catch (error) {
        console.error("JSON parse error:", error);
        return res.status(400).json({ success: false, error: "Invalid property data format" });
      }

      // Validate required fields
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

      // Validate rooms
      if (propertyData.rooms && propertyData.rooms.length > 0) {
        for (const room of propertyData.rooms) {
          if (!room.roomName || room.roomName.trim() === '') {
            return res.status(400).json({ success: false, error: "Room name is required" });
          }
          if (room.rent < 0) {
            return res.status(400).json({ success: false, error: "Room rent cannot be negative" });
          }
          if (room.size < 0) {
            return res.status(400).json({ success: false, error: "Room size cannot be negative" });
          }
        }
      }

      // Filter rooms to match frontend (rent >= 0, size >= 0, roomName present)
      const filteredRooms = (propertyData.rooms || []).filter(room =>
        room.roomName && room.roomName.trim() !== '' && room.rent >= 0 && room.size >= 0
      );

      // Validate images
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, error: "At least one image is required" });
      }

      console.log(`Processing ${req.files.length} uploaded files...`);

      // ✅ FIX: Handle different possible structures from multer-storage-cloudinary
      const uploads = req.files.map((file, index) => {
        console.log(`Processing file ${index + 1}:`, {
          path: file.path,
          filename: file.filename,
          fieldname: file.fieldname,
          keys: Object.keys(file)
        });

        // Try different possible locations for URL and public_id
        let url = file.path || file.url || file.secure_url;
        let public_id = file.filename || file.public_id;

        // If still not found, check if it's in a nested cloudinary object
        if (!url && file.cloudinary) {
          url = file.cloudinary.secure_url || file.cloudinary.url;
          public_id = file.cloudinary.public_id;
        }

        if (!url || !public_id) {
          console.error(`Invalid file structure for file ${index + 1}:`, file);
          throw new Error(`Failed to get image URL or public_id from uploaded file ${index + 1}`);
        }

        return { url, public_id };
      });

      console.log("Processed uploads:", uploads);

      // Create property with uploaded images
      const property = new Property({
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        propertyType: propertyData.propertyType,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        area: propertyData.area,
        maxGuests: propertyData.maxGuests,
        guestType: propertyData.guestType,
        location: propertyData.location,
        amenities: propertyData.amenities || [],
        rules: propertyData.rules || [],
        availability: propertyData.availability || { isAvailable: true },
        rooms: filteredRooms,
        landlord: req.user.id,
        images: uploads,
        youtubeUrl: propertyData.youtubeUrl || "",
        googleMapsUrl: propertyData.googleMapsUrl || "",
      });

      const savedProperty = await property.save();
      console.log("Property saved successfully:", savedProperty._id);

      res.json({ success: true, data: savedProperty });
    } catch (error) {
      console.error("Create property error:", error);
      
      // Clean up uploaded files on error
      if (req.files && req.files.length > 0) {
        console.log("Cleaning up uploaded files due to error...");
        for (const file of req.files) {
          try {
            const public_id = file.filename || file.public_id || (file.cloudinary && file.cloudinary.public_id);
            if (public_id) {
              await cloudinary.uploader.destroy(public_id);
              console.log(`Cleaned up: ${public_id}`);
            }
          } catch (cleanupError) {
            console.error("Failed to cleanup file:", cleanupError);
          }
        }
      }

      res.status(500).json({
        success: false,
        error: error.message || "Internal Server Error",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

// Route 2: Get all properties (GET /api/property/all) – No login required
router.get("/all", async (req, res) => {
  try {
    const { address, propertyType, minPrice, maxPrice, bedrooms, guests, guestType, page, limit } = req.query;

    let query = {};

    if (address) query["location.address"] = new RegExp(address.trim(), "i");
    if (propertyType) {
      query.propertyType = propertyType;
    }
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route 3: Get logged-in user's properties (GET /api/property/myproperties) – Login required
router.get("/myproperties", fetchuser, async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: properties });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route 4: Toggle property availability (PUT /api/property/toggle-availability/:id) – Login required
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route 5: Update a property (PUT /api/property/update/:id) – Login required
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

      // Handle different form data structures
      if (req.body.propertyData) {
        // Format from addpropertyform.tsx (create/edit combined)
        try {
          const propertyData = JSON.parse(req.body.propertyData);
          console.log("Parsed propertyData:", propertyData);

          updates.title = propertyData.title;
          updates.description = propertyData.description;
          updates.price = propertyData.price;
          updates.propertyType = propertyData.propertyType;
          updates.bedrooms = propertyData.bedrooms;
          updates.bathrooms = propertyData.bathrooms;
          updates.area = propertyData.area;
          updates.maxGuests = propertyData.maxGuests;
          updates.guestType = propertyData.guestType;
          updates.location = propertyData.location;
          updates.amenities = propertyData.amenities || [];
          updates.rules = propertyData.rules || [];
          updates.availability = propertyData.availability || { isAvailable: true };
          // Process rooms with tenant validation
          const processedRooms = (propertyData.rooms || []).map(room => {
            const processedRoom = { ...room };

            if (room.status === "booked") {
              // Validate tenant fields for booked rooms
              if (!room.tenant || !room.tenant.profession || !room.tenant.foodPreference) {
                throw new Error("Tenant profession, and food preference are required for booked rooms");
              }
              if (!["Vegetarian", "Non-Vegetarian", "Eggetarian"].includes(room.tenant.foodPreference)) {
                throw new Error("Invalid food preference for tenant");
              }
            } else if (room.status === "available") {
              // Remove tenant data for available rooms
              processedRoom.tenant = undefined;
            }

            return processedRoom;
          });

          updates.rooms = processedRooms;
          updates.youtubeUrl = propertyData.youtubeUrl || "";
          updates.googleMapsUrl = propertyData.googleMapsUrl || "";
        } catch (error) {
          console.error("Error parsing propertyData:", error);
          return res.status(400).json({ success: false, error: "Invalid property data format" });
        }
      } else {
        // Format from page.tsx edit form (individual FormData fields)

        // Simple string/number fields
        if (req.body.title !== undefined) updates.title = req.body.title;
        if (req.body.description !== undefined) updates.description = req.body.description;
        if (req.body.price !== undefined) updates.price = parseFloat(req.body.price);
        if (req.body.propertyType !== undefined) updates.propertyType = req.body.propertyType;
        if (req.body.bedrooms !== undefined) updates.bedrooms = parseInt(req.body.bedrooms);
        if (req.body.bathrooms !== undefined) updates.bathrooms = parseFloat(req.body.bathrooms);
        if (req.body.area !== undefined) updates.area = parseFloat(req.body.area);
        if (req.body.maxGuests !== undefined) updates.maxGuests = parseInt(req.body.maxGuests);
        if (req.body.guestType !== undefined) updates.guestType = req.body.guestType;

        // JSON fields
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

        // Arrays - handle both formats
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

        // Rooms update
        if (req.body.rooms) {
          try {
            const roomsData = typeof req.body.rooms === "string" ? JSON.parse(req.body.rooms) : req.body.rooms;
            
            // Validate rooms
            for (const room of roomsData) {
              if (!room.roomName || room.roomName.trim() === '') {
                throw new Error("Room name is required");
              }
              if (room.rent < 0) {
                throw new Error("Room rent cannot be negative");
              }
              if (room.size < 0) {
                throw new Error("Room size cannot be negative");
              }
              if (room.status === "booked") {
                // Validate tenant fields for booked rooms
                if (!room.tenant || !room.tenant.profession || !room.tenant.foodPreference) {
                  throw new Error("Tenant profession and food preference are required for booked rooms");
                }
                if (!["Vegetarian", "Non-Vegetarian", "Eggetarian"].includes(room.tenant.foodPreference)) {
                  throw new Error("Invalid food preference for tenant");
                }
              } else if (room.status === "available") {
                // Remove tenant data for available rooms
                room.tenant = undefined;
              }
            }

            updates.rooms = roomsData;
          } catch (error) {
            console.error("Error parsing or validating rooms:", error);
            return res.status(400).json({ success: false, error: error.message || "Invalid rooms data" });
          }
        }

        // String fields
        if (req.body.youtubeUrl !== undefined) updates.youtubeUrl = req.body.youtubeUrl;
        if (req.body.googleMapsUrl !== undefined) updates.googleMapsUrl = req.body.googleMapsUrl;
      }

      // Handle images
      let finalImages = [...property.images];

      // Delete specified images
      if (req.body.deleteImages) {
        const imagesToDelete = Array.isArray(req.body.deleteImages)
          ? req.body.deleteImages
          : [req.body.deleteImages];

        console.log("Deleting images:", imagesToDelete);

        for (const publicId of imagesToDelete) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted from Cloudinary: ${publicId}`);
          } catch (error) {
            console.error(`Failed to delete from Cloudinary: ${publicId}`, error);
          }
        }

        finalImages = finalImages.filter(img => !imagesToDelete.includes(img.public_id));
      }

      // Keep specified images (if provided)
      if (req.body.keepImages) {
        const imagesToKeep = Array.isArray(req.body.keepImages)
          ? req.body.keepImages
          : [req.body.keepImages];

        console.log("Keeping images count:", imagesToKeep.length);

        const parsedKeepImages = imagesToKeep.map(img =>
          typeof img === 'string' ? JSON.parse(img) : img
        );

        finalImages = parsedKeepImages;
      }

      // ✅ FIX: Handle new image uploads (already uploaded by multer)
      if (req.files && req.files.length > 0) {
        console.log(`Processing ${req.files.length} new uploaded files...`);

        const newUploads = req.files.map(file => ({
          url: file.path, // CloudinaryStorage puts the URL in file.path
          public_id: file.filename // CloudinaryStorage puts public_id in file.filename
        }));

        console.log("New uploads:", newUploads);
        finalImages = [...finalImages, ...newUploads];
      }

      // Update images if any image operations occurred
      if (req.body.deleteImages || req.body.keepImages || (req.files && req.files.length > 0)) {
        updates.images = finalImages;
        console.log(`Final image count: ${finalImages.length}`);
      }

      // Perform update
      property = await Property.findByIdAndUpdate(
        req.params.id,
        { $set: { ...updates, updatedAt: Date.now() } },
        { new: true }
      );

      console.log("Property updated successfully");
      res.json({ success: true, data: property });
    } catch (error) {
      console.error("Update property error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal Server Error",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route 7: Get single property by ID (GET /api/property/:id) – No login required
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("landlord", "name email phoneNo");
    if (!property) return res.status(404).json({ success: false, error: "Property not found" });
    res.json({ success: true, data: property });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
