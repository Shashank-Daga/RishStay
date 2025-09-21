require("dotenv").config();
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");

connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  "https://rish-stay-jqwrxrvo7-shashank-dagas-projects.vercel.app", // Vercel frontend
  "http://localhost:3000", // local dev
  "https://rishstay.onrender.com" // production frontend domain
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Available Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/property", require("./routes/property"));
app.use("/api/message", require("./routes/message"));
app.use("/api/favorites", require("./routes/favorites"));

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
