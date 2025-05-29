import React, { useEffect, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import axios from "axios";

export default function FileInput({ onExtractComplete, setGotany }) {
  const isFirst = useRef(true);
  const [file, setFile] = useState();
  const [text, setText] = useState("");
  const [meds, setMedicines] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const changeFile = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setText(""); // Clear previous text when new file is selected
  };

  const callGemini = async (ocrText) => {
    if (!ocrText) {
      setError("No text extracted from the image");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:3000/api/decrypt?msg=${encodeURIComponent(ocrText)}`
      );
      return response.data;
    } catch (error) {
      console.error("Gemini API error:", error.response?.data || error.message);
    }
  };

  const readFile = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // First do OCR
      const worker = await createWorker("eng", 1, {
        logger: (m) => console.log(m),
      });

      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();

      setText(text);
      console.log("OCR Text:", text); // Debug log

      // Then send to backend for processing
      const response = await fetch(
        "http://localhost:3001/api/clean-medicines",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process prescription");
      }

      if (!data.success) {
        throw new Error(data.error || "No medicines found in the prescription");
      }

      if (!data.medicines || data.medicines.length === 0) {
        throw new Error(
          "No medicine names found in the image. Please ensure the image is clear and contains medicine names."
        );
      }
      setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
      console.log("Processed medicines:", data.medicines); // Debug log
    } catch (err) {
      console.error("Processing Error:", err);
      setError(err.message || "Error processing the image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isFirst.current) {
      //Ensure not initial render
      isFirst.current = false;
      return;
    }
    if (!meds || meds.length === 0) return;
    setGotany(true);
    meds.map((data) => {
      if (!data) return;
      onExtractComplete(data);
    });
  }, [meds]);

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div>
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 transition-all cursor-pointer hover:border-primary hover:bg-blue-50/30 group">
              <input
                type="file"
                accept="image/*"
                onChange={changeFile}
                disabled={isProcessing}
                className="hidden"
              />
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400 group-hover:text-primary mb-3 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                  {file ? file.name : "Drop prescription image here"}
                </p>
                <p className="mt-1 text-sm text-gray-500 group-hover:text-gray-600">
                  {isProcessing ? "Processing..." : "or click to browse"}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Supported formats: JPEG, PNG
                </p>
              </div>
            </div>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={readFile}
          disabled={isProcessing || !file}
          className="w-full bg-primary text-white rounded-lg py-3 px-4 font-medium text-sm
            hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed transition-all
            shadow-sm hover:shadow-md"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Scan Prescription"
          )}
        </button>
      </div>

      {text && !error && !isProcessing && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Extracted Medicine Names:
          </h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {meds.map((med, index) => (
              <span key={index}>
                {med}
                {index < meds.length - 1 ? "\n" : ""}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
