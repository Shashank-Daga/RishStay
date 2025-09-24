require("dotenv").config({ path: "../.env" });
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");

connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  "https://rish-stay-shashank-dagas-projects.vercel.app",
  "http://localhost:3000",
  "https://rishstay.onrender.com",
  // Add any other Vercel preview URLs if needed
  /^https:\/\/.*\.vercel\.app$/ // Allow all Vercel preview URLs
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check regex patterns
    if (allowedOrigins.some(pattern => pattern instanceof RegExp && pattern.test(origin))) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Health check endpoint (helps with cold starts)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Available Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/property", require("./routes/property"));
app.use("/api/message", require("./routes/message"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/reviews", require("./routes/reviews"));

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
