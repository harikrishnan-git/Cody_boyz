from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from medicine_db import MedicineDB
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup
import re

app = FastAPI()

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = MedicineDB()

class Medicine(BaseModel):
    name: str
    composition: str
    generic_name: str
    match_score: float

@app.get("/")
async def root():
    return {"message": "Medicine Database API"}

@app.get("/medicines/search/{query}")
async def search_medicines(query: str) -> List[Dict]:
    results = db.search_medicines(query)
    return results

@app.get("/medicines/generic/{medicine_name}")
async def get_generic_alternative(medicine_name: str) -> Dict:
    result = db.get_generic_alternative(medicine_name)
    if not result:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return result

@app.get("/medicines")
async def get_all_medicines() -> List[Dict]:
    return db.get_all_medicines()

async def search_generic_online(medicine_name: str) -> Optional[Dict]:
    """Search for generic alternatives online"""
    try:
        # Search DrugBank or similar medical databases
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Try searching on drugs.com
        search_url = f"https://www.drugs.com/search.php?searchterm={medicine_name}"
        response = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find generic information
        generic_info = soup.find('p', text=re.compile('Generic name:', re.IGNORECASE))
        composition_info = soup.find('p', text=re.compile('Active ingredient:', re.IGNORECASE))
        
        if generic_info or composition_info:
            generic_name = generic_info.text.split(':')[1].strip() if generic_info else ""
            composition = composition_info.text.split(':')[1].strip() if composition_info else ""
            
            if generic_name or composition:
                return {
                    "generic_name": generic_name or medicine_name.lower(),
                    "composition": composition or "Not available",
                    "match_score": 85.0  # Default match score for online results
                }
    except Exception as e:
        print(f"Error searching online: {str(e)}")
    return None

@app.post("/medicines/add")
async def add_medicine(medicine: Medicine) -> Dict:
    success = db.insert_medicine(
        medicine.name,
        medicine.composition,
        medicine.generic_name,
        medicine.match_score
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add medicine")
    return {"message": "Medicine added successfully"}

@app.get("/medicines/find-generic/{medicine_name}")
async def find_generic_medicine(medicine_name: str) -> Dict:
    # First try to find in database
    result = db.get_generic_alternative(medicine_name)
    
    if not result:
        # If not found in database, search online
        online_result = await search_generic_online(medicine_name)
        if online_result:
            # Add to database
            db.insert_medicine(
                name=medicine_name,
                composition=online_result["composition"],
                generic_name=online_result["generic_name"],
                match_score=online_result["match_score"]
            )
            return {
                "name": medicine_name,
                "combined_composition": online_result["composition"],
                "matched_generic": online_result["generic_name"],
                "match_score": online_result["match_score"],
                "source": "online"
            }
        raise HTTPException(status_code=404, detail="Generic alternative not found")
    
    return result
