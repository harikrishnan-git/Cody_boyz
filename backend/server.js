import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cleanMedicinesRoute from "./routes/cleanMedicines.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use(cleanMedicinesRoute);

// Health check route
app.get("/", (req, res) => {
  res.send("Gemini Medicine Extractor Backend is running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
