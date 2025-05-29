import sqlite3
from typing import List, Dict, Optional
from fuzzywuzzy import fuzz

class MedicineDB:
    def __init__(self, db_path: str = 'medicines.db'):
        self.db_path = db_path

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def search_medicines(self, query: str) -> List[Dict]:
        """Search medicines by name, composition, or similar compounds. Returns top 10 matches."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Clean up the query and split into potential compounds
        search_terms = query.lower().replace('(', '').replace(')', '').split()
        compounds = [term for term in search_terms if len(term) > 3]  # Filter out short words
        
        results = []
        try:
            # First try exact name match
            name_query = f"%{query.lower().replace(' ', '')}%"
            cursor.execute('''
                SELECT * FROM medicines 
                WHERE LOWER(REPLACE(name, ' ', '')) LIKE ?
            ''', (name_query,))
            
            name_results = cursor.fetchall()
            if name_results:
                columns = [description[0] for description in cursor.description]
                results.extend([dict(zip(columns, row)) for row in name_results])

            # Then search by composition
            for compound in compounds:
                compound_query = f"%{compound}%"
                cursor.execute('''
                    SELECT * FROM medicines 
                    WHERE LOWER(combined_composition) LIKE ?
                    OR LOWER(matched_generic) LIKE ?
                ''', (compound_query, compound_query))
                
                compound_results = cursor.fetchall()
                if compound_results:
                    columns = [description[0] for description in cursor.description]
                    new_results = [dict(zip(columns, row)) for row in compound_results]
                    
                    # Add only unique results
                    for result in new_results:
                        if not any(r['id'] == result['id'] for r in results):
                            results.append(result)

            # Sort results by match score and relevance
            results.sort(key=lambda x: (
                x['match_score'],
                1 if query.lower() in x['name'].lower() else 0
            ), reverse=True)
            
            # Limit to top 10 results
            results = results[:10]

        finally:
            conn.close()
        
        return results

    def get_similar_compounds(self, composition: str) -> List[Dict]:
        """Find medicines with similar chemical compounds"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        compounds = [c.strip().lower() for c in composition.split('   ') if c.strip()]
        results = []
        
        try:
            for compound in compounds:
                # Remove quantities and parentheses for better matching
                base_compound = ''.join([c for c in compound if not (c.isdigit() or c in '()mg/ml%')])
                search_term = f"%{base_compound.strip()}%"
                
                cursor.execute('''
                    SELECT * FROM medicines 
                    WHERE LOWER(combined_composition) LIKE ?
                    OR LOWER(matched_generic) LIKE ?
                ''', (search_term, search_term))
                
                compound_results = cursor.fetchall()
                if compound_results:
                    columns = [description[0] for description in cursor.description]
                    new_results = [dict(zip(columns, row)) for row in compound_results]
                    
                    # Add only unique results
                    for result in new_results:
                        if not any(r['id'] == result['id'] for r in results):
                            results.append(result)
            
            # Sort by match score
            results.sort(key=lambda x: x['match_score'], reverse=True)
            
        finally:
            conn.close()
        
        return results

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
