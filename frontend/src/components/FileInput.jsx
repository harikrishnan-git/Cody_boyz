import React, { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";

export default function FileInput({ onExtractComplete }) {
  const [file, setFile] = useState();
  const [text, setText] = useState(""); //stores final prescription as text
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const changeFile = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };
  const readFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const worker = await createWorker("eng", 1, {
        logger: (m) => console.log(m),
      });

      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();

      // Process the extracted text
      const medicineNames = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !line.match(/^[0-9.]+$/)) // Remove lines that are just numbers
        .filter(line => line.length > 3); // Remove very short lines
      
      if (medicineNames.length === 0) {
        setError('No medicine names found in the image. Please ensure the image is clear and contains medicine names.');
        return;
      }

      setText(text);

      // Pass the medicine names to the parent component
      onExtractComplete(medicineNames);
    } catch (err) {
      setError('Error processing the image. Please try again with a clearer image.');
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    console.log(text);
  }, [text]);
  return (
    <div className="max-w-sm w-full">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Or upload a prescription
        </h3>
        <form className="space-y-4">
          <div>
            <label className="block">
              <span className="sr-only">Choose prescription image</span>
              <input
                type="file"
                accept="image/*"
                onChange={changeFile}
                disabled={isProcessing}
                className="block w-full text-sm text-gray-500
                  file:me-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  file:disabled:opacity-50 file:disabled:pointer-events-none
                  dark:text-neutral-500
                  dark:file:bg-blue-500
                  dark:hover:file:bg-blue-400"
              />
            </label>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={readFile}
            disabled={isProcessing || !file}
            className="w-full text-white bg-blue-700 hover:bg-blue-800 
              focus:ring-4 focus:ring-blue-300 font-medium rounded-lg 
              text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 
              focus:outline-none dark:focus:ring-blue-800
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Image...
              </>
            ) : (
              'Scan Prescription'
            )}
          </button>
        </form>

        {text && !error && !isProcessing && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900">Extracted Text:</h4>
            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
              {text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
