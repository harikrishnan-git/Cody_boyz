import { useState } from "react";

export default function MedicineCard({ name, genericName, composition, matchScore }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const API_KEY = "AIzaSyC-kHqVod9pv12xiAh1AiqYJuTHA5IN4Ug";
  const CX = "010586c89b5a64ce2";

  const handleClick = async () => {
    setLoading(true);
    try {
      const query = encodeURIComponent(`${genericName} medicine generic price site:1mg.com OR site:netmeds.com`);
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?q=${query}&key=${API_KEY}&cx=${CX}`
      );
      const data = await response.json();

      if (data.items) {
        const resultLinks = data.items.map((item) => ({
          title: item.title,
          link: item.link,
        }));
        setLinks(resultLinks);
      } else {
        setLinks([]);
      }
    } catch (error) {
      console.error("Search API error:", error);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{name}</h3>
        <div className="inline-flex items-center bg-blue-50 px-3 py-1 rounded-full">
          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-blue-700 text-sm font-medium">Match Score: {matchScore}%</span>
        </div>
      </div>
      
      <div className="mt-4 space-y-3 text-gray-600">
        <div>
          <span className="text-sm font-medium text-gray-500">Generic Alternative</span>
          <p className="mt-1 text-base font-medium text-primary">{genericName}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Composition</span>
          <p className="mt-1 text-sm">{composition}</p>
        </div>
        
        <div className="pt-4 flex gap-3">
          <button 
            className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
          <button 
            className="flex-1 bg-secondary text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium shadow-sm hover:shadow-md" 
            onClick={handleClick}
            disabled={loading}
          >
            {loading ? 
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
              : "Find Generic"
            }
          </button>
        </div>

        {showDetails && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">Medicine Details</h4>
            <p className="text-sm text-blue-700 mb-2">This medicine has a {matchScore}% match with its generic counterpart.</p>
            <p className="text-sm text-blue-700">Ask your pharmacist for the generic version: <strong>{genericName}</strong></p>
          </div>
        )}

        {links.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-3">Where to Buy Generic Version</h4>
            <div className="grid gap-2">
              {links.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <span className="flex-1 text-sm text-gray-600 group-hover:text-primary">{item.title}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
