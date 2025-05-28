import sqlite3
from typing import List, Dict, Optional

class MedicineDB:
    def __init__(self, db_path: str = 'medicines.db'):
        self.db_path = db_path

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def search_medicines(self, query: str) -> List[Dict]:
        """Search medicines by name or composition"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Make search case-insensitive and handle spaces
        search_query = f"%{query.lower().replace(' ', '')}%"
        
        cursor.execute('''
            SELECT * FROM medicines 
            WHERE LOWER(REPLACE(name, ' ', '')) LIKE ? 
            OR LOWER(REPLACE(combined_composition, ' ', '')) LIKE ? 
            OR LOWER(REPLACE(matched_generic, ' ', '')) LIKE ?
        ''', (search_query, search_query, search_query))
        
        columns = [description[0] for description in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return results

    def get_generic_alternative(self, medicine_name: str) -> Optional[Dict]:
        """Get generic alternative for a specific medicine"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        search_query = f"%{medicine_name.lower().replace(' ', '')}%"
        
        cursor.execute('''
            SELECT * FROM medicines 
            WHERE LOWER(REPLACE(name, ' ', '')) LIKE ?
        ''', (search_query,))
        
        columns = [description[0] for description in cursor.description]
        row = cursor.fetchone()
        
        conn.close()
        
        if row:
            return dict(zip(columns, row))
        return None

    def get_all_medicines(self) -> List[Dict]:
        """Get all medicines from the database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM medicines')
        
        columns = [description[0] for description in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return results

    def insert_medicine(self, name: str, composition: str, generic_name: str, match_score: float) -> bool:
        """Insert a new medicine into the database"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Check if medicine already exists
            cursor.execute('SELECT id FROM medicines WHERE LOWER(name) = LOWER(?)', (name,))
            if cursor.fetchone():
                return False  # Medicine already exists
            
            cursor.execute('''
                INSERT INTO medicines (name, combined_composition, matched_generic, match_score)
                VALUES (?, ?, ?, ?)
            ''', (name, composition, generic_name, match_score))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error inserting medicine: {str(e)}")
            return False
