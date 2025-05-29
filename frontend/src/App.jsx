import { useState } from "react";
import "./App.css";
import SearchBar from "./components/SearchBar";
import MedicineCard from "./components/MedicineCard";
import FileInput from "./components/FileInput";

function App() {
  const [exactMatches, setExactMatches] = useState([]);
  const [similarCompounds, setSimilarCompounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gotany, setGotany] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/medicines/search/${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data = await response.json();
      setExactMatches(data.exact_matches);
      setSimilarCompounds(data.similar_compounds);
    } catch (err) {
      setError("Failed to fetch results. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionText = async (medicineNames) => {
    setLoading(true);
    setError(null);
    try {
      if (gotany === false) return;
      const exactResults = [];
      const similarResults = [];

      for (const name of medicineNames) {
        const response = await fetch(
          `http://localhost:8000/medicines/search/${encodeURIComponent(
            name.trim()
          )}`
        );
        if (!response.ok) {
          continue;
        }
        const data = await response.json();
        if (data.exact_matches.length > 0) {
          exactResults.push(...data.exact_matches);
        }
        if (data.similar_compounds.length > 0) {
          similarResults.push(...data.similar_compounds);
        }
      }

      setExactMatches(exactResults);
      setSimilarCompounds(similarResults);

      if (exactResults.length === 0 && similarResults.length === 0) {
        setError("No medicines found in the prescription.");
      }
    } catch (err) {
      setError("Failed to process prescription. Please try again.");
      console.error("Prescription processing error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-primary/90 to-secondary/90 text-white py-12 px-4 mb-8">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Generic Medicine Finder
          </h1>
          <p className="text-center text-white/90 text-lg max-w-2xl mx-auto">
            Find affordable generic alternatives to your prescribed medicines
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pb-12">
        <div className="flex flex-col items-center gap-8 mb-12">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6">
            <SearchBar onSearch={handleSearch} />
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <FileInput
              onExtractComplete={handlePrescriptionText}
              setGotany={setGotany}
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Searching for medicines...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600 mb-8 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Exact Matches Section */}
        {exactMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Exact Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exactMatches.map((medicine, index) => (
                <MedicineCard
                  key={`exact-${medicine.id}-${index}`}
                  name={medicine.name}
                  manufacturer="Generic"
                  price="Contact pharmacy"
                  genericName={medicine.matched_generic}
                  composition={medicine.combined_composition}
                  matchScore={medicine.match_score}
                />
              ))}
            </div>
          </div>
        )}

        {/* Similar Compounds Section */}
        {similarCompounds.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Similar Alternatives
              <span className="ml-2 text-sm text-gray-500 font-normal">
                (Based on chemical composition)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarCompounds.map((medicine, index) => (
                <MedicineCard
                  key={`similar-${medicine.id}-${index}`}
                  name={medicine.name}
                  manufacturer="Generic"
                  price="Contact pharmacy"
                  genericName={medicine.matched_generic}
                  composition={medicine.combined_composition}
                  matchScore={medicine.match_score}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
