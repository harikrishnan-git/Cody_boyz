import pandas as pd

# Simulated larger output dataset
sample_data = [
    {"name": "Dolo 650", "combined_composition": "paracetamol", "matched_generic": "paracetamol", "match_score": 100},
    {"name": "Azithral 500", "combined_composition": "azithromycin", "matched_generic": "azithromycin", "match_score": 100},
    {"name": "Calpol Plus", "combined_composition": "paracetamol caffeine", "matched_generic": "paracetamol", "match_score": 88},
    {"name": "Zerodol P", "combined_composition": "aceclofenac paracetamol", "matched_generic": "aceclofenac", "match_score": 90},
    {"name": "Crocin Cold", "combined_composition": "paracetamol phenylephrine", "matched_generic": "paracetamol", "match_score": 85},
    {"name": "Augmentin", "combined_composition": "amoxicillin clavulanic acid", "matched_generic": "amoxicillin", "match_score": 87},
    {"name": "Taxim-O", "combined_composition": "cefixime", "matched_generic": "cefixime", "match_score": 100},
    {"name": "Monocef", "combined_composition": "ceftriaxone", "matched_generic": "ceftriaxone", "match_score": 100},
    {"name": "Erythrocin", "combined_composition": "erythromycin", "matched_generic": "erythromycin", "match_score": 100},
    {"name": "Combiflam", "combined_composition": "ibuprofen paracetamol", "matched_generic": "ibuprofen", "match_score": 89},
    {"name": "Meftal Spas", "combined_composition": "mefenamic acid dicyclomine", "matched_generic": "mefenamic acid", "match_score": 92},
    {"name": "Flexon", "combined_composition": "ibuprofen paracetamol", "matched_generic": "paracetamol", "match_score": 88},
    {"name": "Ciplox", "combined_composition": "ciprofloxacin", "matched_generic": "ciprofloxacin", "match_score": 100},
    {"name": "Oflox", "combined_composition": "ofloxacin", "matched_generic": "ofloxacin", "match_score": 100},
    {"name": "Levoflox", "combined_composition": "levofloxacin", "matched_generic": "levofloxacin", "match_score": 100},
    {"name": "Pantocid", "combined_composition": "pantoprazole", "matched_generic": "pantoprazole", "match_score": 100},
    {"name": "Omez", "combined_composition": "omeprazole", "matched_generic": "omeprazole", "match_score": 100},
    {"name": "Domstal", "combined_composition": "domperidone", "matched_generic": "domperidone", "match_score": 100},
    {"name": "Rantac", "combined_composition": "ranitidine", "matched_generic": "ranitidine", "match_score": 100},
    {"name": "Lariago", "combined_composition": "chloroquine", "matched_generic": "chloroquine", "match_score": 100},
]

# Create DataFrame
sample_df = pd.DataFrame(sample_data)

# Save to CSV
output_path = "sample_branded_to_generic_matches.csv"
sample_df.to_csv(output_path, index=False)

output_path
