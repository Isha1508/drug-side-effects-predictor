# Data Directory

This directory contains training data and cached responses.

## Structure

```
data/
├── raw/              # Raw datasets (SIDER, etc.)
├── processed/        # Processed/cleaned data
└── cache/            # API response cache
    ├── drug_lookup/
    └── molecular_structure/
```

## Required Datasets

### SIDER Dataset

Download from: http://sideeffects.embl.de/download/

**Files needed:**
- `meddra_all_se.tsv`: Drug-side effect associations
- `meddra_all_indications.tsv`: Drug-indication associations

**Processing:**
1. Extract drug identifiers
2. Match with ChEMBL/PubChem to get SMILES
3. Create drug-SMILES mapping
4. Create multi-label target matrix

### ChEMBL Database

Access via: https://www.ebi.ac.uk/chembl/

**Usage:**
- Query via ChEMBL webresource client (included in requirements)
- Extract SMILES for drugs
- Match with SIDER drug identifiers

## Data Processing Pipeline

See `notebooks/train_model.ipynb` for data processing steps.

## Cache

API responses are cached in `cache/` subdirectories:
- Cache TTL: 24 hours (configurable)
- Automatically managed by lookup modules
- Can be cleared manually if needed

## Privacy & Ethics

- No patient data stored
- Only public research datasets used
- All data sources properly cited
- Follows academic research guidelines



