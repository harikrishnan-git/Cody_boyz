import sqlite3
import pandas as pd
import os

def setup_database():
    try:
        # Create a database connection
        conn = sqlite3.connect('medicines.db')
        cursor = conn.cursor()

        # Drop the existing table if it exists
        cursor.execute('DROP TABLE IF EXISTS medicines')

        # Create the medicines table
        cursor.execute('''
        CREATE TABLE medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            combined_composition TEXT NOT NULL,
            matched_generic TEXT NOT NULL,
            match_score REAL NOT NULL
        )
        ''')

        # Import data from both CSV files
        csv_files = ['high_confidence_matches.csv', 'sample_branded_to_generic_matches.csv']
        total_records = 0
        
        for csv_path in csv_files:
            if os.path.exists(csv_path):
                print(f"\nProcessing CSV file: {csv_path}")
                # Read the CSV file
                df = pd.read_csv(csv_path)
                
                # Convert match_score to numeric, removing any % signs if present
                df['match_score'] = pd.to_numeric(df['match_score'].astype(str).str.replace('%', ''), errors='coerce')
                
                # Insert the data row by row
                for _, row in df.iterrows():
                    cursor.execute('''
                    INSERT INTO medicines (name, combined_composition, matched_generic, match_score)
                    VALUES (?, ?, ?, ?)
                    ''', (row['name'], row['combined_composition'], row['matched_generic'], row['match_score']))
                
                total_records += len(df)
                print(f"Imported {len(df)} records from {csv_path}")
            else:
                print(f"CSV file not found: {csv_path}")
        
        conn.commit()
        print("\nDatabase setup complete!")
        
        # Verify the data
        cursor.execute('SELECT COUNT(*) FROM medicines')
        count = cursor.fetchone()[0]
        print(f"\nTotal records in database: {count}")
        print(f"Successfully imported {total_records} records from {len(csv_files)} files")
        
        # Print a few sample records
        print("\nSample records:")
        cursor.execute('SELECT * FROM medicines LIMIT 3')
        samples = cursor.fetchall()
        for sample in samples:
            print(sample)
        
    except Exception as e:
        print(f"Error setting up database: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    setup_database()
