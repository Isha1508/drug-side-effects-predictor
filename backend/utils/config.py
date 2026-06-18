"""
Configuration settings for the application.
Loads from environment variables with sensible defaults.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 5000))
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# External API Configuration
PUBCHEM_BASE_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
DRUGBANK_BASE_URL = "https://api.drugbankplus.com/v1"  # Note: May require API key
RXNORM_BASE_URL = "https://rxnav.nlm.nih.gov/REST"

# Data Paths
DATA_DIR = os.getenv("DATA_DIR", "data")
MODELS_DIR = os.getenv("MODELS_DIR", "models")
CACHE_DIR = os.getenv("CACHE_DIR", "data/cache")

# ML Configuration
MODEL_NAME = os.getenv("MODEL_NAME", "side_effect_predictor_v1")
FINGERPRINT_TYPE = os.getenv("FINGERPRINT_TYPE", "ECFP4")  # ECFP4 or Morgan
FINGERPRINT_SIZE = int(os.getenv("FINGERPRINT_SIZE", 2048))
FINGERPRINT_RADIUS = int(os.getenv("FINGERPRINT_RADIUS", 2))

# SHAP Configuration
SHAP_SAMPLE_SIZE = int(os.getenv("SHAP_SAMPLE_SIZE", 100))  # For background dataset

# Caching
CACHE_TTL = int(os.getenv("CACHE_TTL", 86400))  # 24 hours in seconds

# Safety & Disclaimers
DISCLAIMER_CLINICAL = (
    "⚠️ DISCLAIMER: This information is sourced from authoritative medical databases "
    "and is for educational purposes only. Always consult healthcare professionals "
    "for medical decisions."
)

DISCLAIMER_ML = (
    "⚠️ RESEARCH MODEL: These predictions are based on molecular structure analysis "
    "using a research-oriented machine learning model. They indicate potential "
    "tendencies only and are NOT validated for clinical use. Do NOT use for "
    "medical decision-making."
)

# Create necessary directories
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)



