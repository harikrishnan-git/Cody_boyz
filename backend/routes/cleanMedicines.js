// server.js or routes/cleanMedicines.js
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: './.env' });
const router = express.Router();
//process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI("AIzaSyBYW8x6WXj5FJSi4N6Qur6It0z02EF6vw0");
console.log(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/api/clean-medicines", async (req, res) => {
  const { text } = req.body;

  if (!text || text.length < 3) {
    return res.status(400).json({ error: "Invalid or empty OCR text" });
  }

  const prompt = `
You are a medical assistant. Extract the brand medicine names in lower case from the following OCR text. 
Ignore dosages, units like mg/ml, symbols, numbers, and instructions. Return only a JSON array of clean medicine names.

OCR Text:
${text}

Format:
["Medicine Name 1", "Medicine Name 2", ...]
`;

  try {
    const result = await model.generateContent(prompt);
  const rawText = await result.response.text();

  console.log("Raw Gemini Response:", rawText);

  // Clean the Markdown formatting
  const cleaned = rawText.replace(/```json|```|\n/g, '').trim();

  const medicines = JSON.parse(cleaned);
  const backendResponse = await axios.post("http://your-fastapi-domain/medicines/search-multiple", medicines);

    res.json({
      medicines,
      searchResults: backendResponse.data
    });
  
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Failed to clean medicine names" });
  }
});

export default router;
