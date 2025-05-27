import { useState } from "react";
export default function MedicineCard({ name, manufacturer, price }) {
  const [links,setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_KEY = "AIzaSyC-kHqVod9pv12xiAh1AiqYJuTHA5IN4Ug";
  const CX = "010586c89b5a64ce2";
  const handleClick = async () => {
    setLoading(true);
    try {
      const query = encodeURIComponent(`${name} site:amazon.in OR site:1mg.com`);
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
        <p>Manufacturer: {manufacturer}</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-2xl font-bold text-primary">₹{price}</span>
          <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors" onClick = {handleClick}>
            {loading? "Searching...":"Learn More"}
          </button>
          <div>
                {links.length > 0 && (
                <div className="mt-4 space-y-2">
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
      </div>
    </div>
  );
}
