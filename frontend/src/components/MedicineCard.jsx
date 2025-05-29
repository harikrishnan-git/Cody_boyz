import { useState, useEffect } from "react";

export default function MedicineCard({ name, genericName, composition, matchScore }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [medicineDetails, setMedicineDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [extendedDetails, setExtendedDetails] = useState(null);
  
  const API_KEY = "AIzaSyC-kHqVod9pv12xiAh1AiqYJuTHA5IN4Ug";
  const CX = "010586c89b5a64ce2";
  const RXNAV_API = "https://rxnav.nlm.nih.gov/REST";

  const fetchExtendedDetails = async (drugName) => {
    try {
      // Search for RxNorm ID
      const response = await fetch(`${RXNAV_API}/drugs?name=${encodeURIComponent(drugName)}`);
      const data = await response.json();
      
      if (data.drugGroup?.conceptGroup) {
        const conceptGroup = data.drugGroup.conceptGroup.find(g => g.conceptProperties);
        if (conceptGroup?.conceptProperties?.[0]) {
          const rxcui = conceptGroup.conceptProperties[0].rxcui;
          
          // Fetch detailed information using RxCUI
          const detailsResponse = await fetch(`${RXNAV_API}/rxcui/${rxcui}/allrelated`);
          const detailsData = await detailsResponse.json();

          // Fetch NDC properties for additional details
          const ndcResponse = await fetch(`${RXNAV_API}/rxcui/${rxcui}/ndcs`);
          const ndcData = await ndcResponse.json();

          return {
            rxcui,
            details: detailsData,
            ndc: ndcData
          };
        }
      }
    } catch (error) {
      console.error("Error fetching extended details:", error);
    }
    return null;
  };

  const fetchMedicineDetails = async () => {
    if (!showDetails || medicineDetails) return;
    
    setDetailsLoading(true);
    try {
      // More specific and targeted queries for better results
      const searchQueries = [
        {
          type: 'uses',
          query: `${genericName} medicine "uses" "indications" medical treatment site:drugs.com OR site:medlineplus.gov`
        },
        {
          type: 'dosage',
          query: `${genericName} "recommended dosage" "how to take" "administration" site:drugs.com OR site:mayoclinic.org`
        },
        {
          type: 'sideEffects',
          query: `${genericName} "common side effects" "adverse effects" "warnings" site:drugs.com OR site:webmd.com`
        },
        {
          type: 'interactions',
          query: `${genericName} "drug interactions" "contraindications" site:drugs.com OR site:medlineplus.gov`
        }
      ];

      const results = {};
      for (const { type, query } of searchQueries) {
        const response = await fetch(
          `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${API_KEY}&cx=${CX}`
        );
        const data = await response.json();
        
        if (data.items) {
          const relevantItem = data.items.find(item => 
            (item.link.includes('drugs.com') || 
             item.link.includes('mayoclinic.org') ||
             item.link.includes('medlineplus.gov') ||
             item.link.includes('webmd.com')) &&
            item.snippet?.length > 100
          );
          
          if (relevantItem) {
            // Clean up and format the snippet
            let snippet = relevantItem.snippet;
            snippet = snippet.replace(/\.\.\./g, '. ');
            snippet = snippet.replace(/\s+/g, ' ').trim();
            results[type] = {
              text: snippet,
              source: relevantItem.link,
              title: relevantItem.title
            };
          }
        }
      }

      setMedicineDetails(results);
    } catch (error) {
      console.error("Error fetching medicine details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (showDetails) {
      fetchMedicineDetails();
    }
  }, [showDetails]);

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
          <div className="mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 overflow-hidden">
              <div className="p-4 border-b border-blue-200 bg-white/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-blue-900">Medical Information</h4>
                  {detailsLoading && (
                    <div className="flex items-center text-blue-600">
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-medium">Fetching details...</span>
                    </div>
                  )}
                </div>
              </div>

              {!detailsLoading && medicineDetails && (
                <div className="divide-y divide-blue-200">
                  {/* Chemical Information */}
                  <div className="p-4 bg-white/80">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-blue-900 mb-1">Chemical Composition</h5>
                        <p className="text-sm text-blue-700">{composition}</p>
                      </div>
                    </div>
                  </div>

                  {/* Uses Section */}
                  {medicineDetails.uses && (
                    <div className="p-4 bg-white/80">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-blue-900 mb-1">Uses & Indications</h5>
                          <p className="text-sm text-blue-700">{medicineDetails.uses.text}</p>
                          <a 
                            href={medicineDetails.uses.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            Source: {new URL(medicineDetails.uses.source).hostname.replace('www.', '')}
                            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dosage Section */}
                  {medicineDetails.dosage && (
                    <div className="p-4 bg-white/80">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-blue-900 mb-1">Recommended Dosage</h5>
                          <p className="text-sm text-blue-700">{medicineDetails.dosage.text}</p>
                          <a 
                            href={medicineDetails.dosage.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            Source: {new URL(medicineDetails.dosage.source).hostname.replace('www.', '')}
                            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Side Effects Section */}
                  {medicineDetails.sideEffects && (
                    <div className="p-4 bg-white/80">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-blue-900 mb-1">Side Effects & Warnings</h5>
                          <p className="text-sm text-blue-700">{medicineDetails.sideEffects.text}</p>
                          <a 
                            href={medicineDetails.sideEffects.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            Source: {new URL(medicineDetails.sideEffects.source).hostname.replace('www.', '')}
                            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Drug Interactions Section */}
                  {medicineDetails.interactions && (
                    <div className="p-4 bg-white/80">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-blue-900 mb-1">Drug Interactions</h5>
                          <p className="text-sm text-blue-700">{medicineDetails.interactions.text}</p>
                          <a 
                            href={medicineDetails.interactions.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            Source: {new URL(medicineDetails.interactions.source).hostname.replace('www.', '')}
                            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="p-4 bg-yellow-50/50">
                    <p className="text-xs text-yellow-800">
                      ⚠️ Medical Disclaimer: This information is for educational purposes only and is not intended as medical advice. 
                      Always consult your healthcare provider for proper medical guidance.
                    </p>
                  </div>
                </div>
              )}
            </div>
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
