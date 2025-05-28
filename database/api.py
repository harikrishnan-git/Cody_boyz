from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from medicine_db import MedicineDB
from typing import List, Dict, Optional

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
