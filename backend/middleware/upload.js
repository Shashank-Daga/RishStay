const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "rishstay/properties", // folder name in Cloudinary
    allowed_formats: ["jpeg", "png", "jpg", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload;
