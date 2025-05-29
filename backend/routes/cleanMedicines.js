// server.js or routes/cleanMedicines.js
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: "./.env" });
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/api/clean-medicines", async (req, res) => {
  const { text } = req.body;

  if (!text || text.length < 3) {
    return res.status(400).json({ error: "Invalid or empty OCR text" });
  }

  // Log the incoming OCR text for debugging
  console.log("Received OCR Text:", text);

  // Basic OCR text cleanup
  const cleanedText = text
    .replace(/\r\n|\r|\n/g, " ") // Replace line breaks with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace

  console.log("Cleaned OCR Text:", cleanedText);

  const prompt = `
You are a medical prescription analyzer. Extract ONLY the medicine names from this prescription text.
The text comes from OCR and may contain noise, formatting artifacts, and misspellings.

Rules:
1. Extract medicine names even if they have typos or are slightly malformed
2. Ignore dosages, units (like mg/ml), symbols, numbers, and instructions
3. Clean up common OCR errors (like '9p' should be 'Syp' for Syrup)
4. Return ONLY a JSON array of medicine names in lowercase
5. Remove any non-medicine text like dates, patient info, doctor info, etc.

Here are some examples:

Input: "9p coLpoL (2505) mL QeH x 3d"
Output: ["calpol"]

Input: "Tab. DOLO 650mg TDS"
Output: ["dolo"]

Input: "Syp OSLON 5ml BD"
Output: ["oslon"]

OCR Text:
${cleanedText}

Format your response EXACTLY like this:
["medicine1", "medicine2"]

Remember to convert everything to lowercase and clean up any OCR artifacts.
`;

  try {
    const result = await model.generateContent(prompt);
    const rawText = await result.response.text();
    console.log("Raw Gemini Response:", rawText);

    // Clean the Markdown formatting and handle potential JSON parsing errors
    try {
      const cleaned = rawText.replace(/```json|```|\n/g, "").trim();
      const medicines = JSON.parse(cleaned);

      if (!Array.isArray(medicines) || medicines.length === 0) {
        throw new Error("No valid medicine names found in the prescription");
      }

      // Search each medicine individually as the FastAPI endpoint expects
      const searchResults = [];
      for (const medicine of medicines) {
        try {
          const response = await axios.get(
            `http://localhost:8000/medicines/search/${encodeURIComponent(
              medicine
            )}`
          );
          if (response.data && response.data.exact_matches) {
            searchResults.push(...response.data.exact_matches);
          }
        } catch (searchErr) {
          console.error(`Error searching for medicine ${medicine}:`, searchErr);
          // Continue with other medicines even if one fails
        }
      }

      // Return both the extracted medicine names and search results
      res.json({
        medicines,
        searchResults,
        success: true,
      });
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr);
      res.status(400).json({
        error: "Failed to parse medicine names from the AI response",
        details: parseErr.message,
        success: false,
      });
    }
  } catch (geminiErr) {
    console.error("Gemini Error:", geminiErr);
    res.status(500).json({
      error: "Failed to extract medicine names from the prescription",
      details: geminiErr.message,
      success: false,
    });
  }
});

export default router;
