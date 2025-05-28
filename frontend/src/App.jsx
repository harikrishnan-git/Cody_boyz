import { useState } from "react";
import "./App.css";
import SearchBar from "./components/SearchBar";
import MedicineCard from "./components/MedicineCard";
import FileInput from "./components/FileInput";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setSearchResults(data);
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
      const results = [];
      for (const name of medicineNames) {
        const response = await fetch(
          `http://localhost:8000/medicines/search/${encodeURIComponent(name.trim())}`
        );
        if (!response.ok) {
          continue; // Skip failed searches
        }
        const data = await response.json();
        if (data && data.length > 0) {
          results.push(...data);
        }
      }
      setSearchResults(results);
      if (results.length === 0) {
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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Medicine Search
        </h1>

        <div className="flex flex-col items-center gap-8 mb-8">
          <SearchBar onSearch={handleSearch} />
          <div className="text-center text-gray-600">- OR -</div>
          <FileInput onExtractComplete={handlePrescriptionText} />
        </div>

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {searchResults.length > 0
                ? "Processing more medicines..."
                : "Searching for medicines..."}
            </p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 mb-4">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((medicine, index) => (
            <MedicineCard
              key={`${medicine.id}-${index}`}
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
    </div>
  );
}

export default App;
