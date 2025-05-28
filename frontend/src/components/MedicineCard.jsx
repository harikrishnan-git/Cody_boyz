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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
      <div className="mt-2 text-gray-600">
        <p><span className="font-medium">Generic Name:</span> {genericName}</p>
        <p><span className="font-medium">Composition:</span> {composition}</p>
        <p><span className="font-medium">Match Score:</span> {matchScore}%</p>
        
        <div className="mt-4 flex justify-between items-center">
          <button 
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          <button 
            className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors" 
            onClick={handleClick}
          >
            {loading ? "Searching..." : "Find Generic"}
          </button>
        </div>

        {showDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">Medicine Details</h4>
            <p>This medicine matches {matchScore}% with its generic counterpart.</p>
            <p>You can save money by asking your pharmacist for the generic version: <strong>{genericName}</strong></p>
          </div>
        )}

        {links.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Where to buy generic version:</h4>
            {links.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                {item.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
