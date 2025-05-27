import { useState } from "react";
import "./App.css";
import SearchBar from "./components/SearchBar";
import MedicineCard from "./components/MedicineCard";
import { medicineData } from "./data/medicines";
import FileInput from "./components/FileInput";

function App() {
  const [searchResults, setSearchResults] = useState(null);

  const convertFile = () => {};

  const handleSearch = (query) => {
    // Simple case-insensitive search
    const results = Object.entries(medicineData).find(([name]) =>
      name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results ? { name: results[0], ...results[1] } : null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="text-primary">Medi</span>
              <span className="text-secondary">Wise</span>
            </h1>
            <p className="text-gray-600">Generic Medicine Finder</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Find Affordable Generic Alternatives
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              Enter the name of your branded medicine to discover cost-effective
              generic options
            </p>
          </div>

          <SearchBar onSearch={handleSearch} />
          <FileInput />

          {searchResults && (
            <div className="w-full mt-8">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {searchResults.name}
                </h2>
                <p className="text-lg text-gray-600 mt-2">
                  Salt Composition: {searchResults.salt}
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Generic Alternatives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.alternatives.map((med, index) => (
                  <MedicineCard key={index} {...med} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
