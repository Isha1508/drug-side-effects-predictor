# Edge Cases & Failure Modes

## 1. Drug Name Resolution

### Case: Ambiguous Drug Names
**Problem:** Multiple drugs with similar names (e.g., "Aspirin" vs "Aspirin Plus")
**Solution:** 
- Return list of candidates with confidence scores
- Allow user to select specific drug
- Default to most common/standardized name

### Case: Drug Not Found in Databases
**Problem:** Drug name doesn't match any database entry
**Solution:**
- Return clear error message
- Suggest similar drug names (fuzzy matching)
- Log for manual review

### Case: Drug Without SMILES
**Problem:** Drug exists but molecular structure unavailable
**Solution:**
- Return available metadata
- Skip ML prediction with clear message
- Suggest alternative lookup methods

## 2. Molecular Structure Issues

### Case: Invalid SMILES
**Problem:** SMILES string is malformed or invalid
**Solution:**
- Validate SMILES before processing
- Attempt to sanitize using RDKit
- Return error if unsalvageable

### Case: Very Large Molecules
**Problem:** Extremely large molecules cause memory issues
**Solution:**
- Set maximum atom limit (e.g., 500 atoms)
- Return warning for large molecules
- Use simplified representation if needed

### Case: Stereochemistry Ambiguity
**Problem:** SMILES doesn't specify stereochemistry
**Solution:**
- Use canonical SMILES
- Note ambiguity in response
- Predict based on most common stereoisomer

## 3. ML Model Failures

### Case: Out-of-Distribution Molecules
**Problem:** Molecule very different from training data
**Solution:**
- Calculate similarity to training set
- Return low confidence scores
- Add warning about extrapolation

### Case: Model Not Loaded
**Problem:** Model file missing or corrupted
**Solution:**
- Graceful fallback to simpler model
- Clear error message
- Logging for debugging

### Case: Prediction Timeout
**Problem:** Model inference takes too long
**Solution:**
- Set timeout (e.g., 30 seconds)
- Return partial results if available
- Cache results for repeated queries

## 4. API Integration Failures

### Case: External API Down
**Problem:** RxNorm/DrugBank/PubChem unavailable
**Solution:**
- Use cached data if available
- Return cached data with timestamp
- Clear error message about data staleness

### Case: Rate Limiting
**Problem:** External API rate limits exceeded
**Solution:**
- Implement request queuing
- Use cached responses
- Return error with retry suggestion

### Case: Network Timeout
**Problem:** Network request times out
**Solution:**
- Retry with exponential backoff (max 3 retries)
- Use alternative data source if available
- Return error with suggestion to retry

## 5. SHAP Explanation Issues

### Case: SHAP Calculation Fails
**Problem:** SHAP values cannot be computed
**Solution:**
- Fallback to feature importance
- Return simplified explanation
- Log error for debugging

### Case: No Significant Features
**Problem:** All features have near-zero importance
**Solution:**
- Return message about low confidence
- Suggest molecule may be novel
- Provide global feature importance instead

### Case: Substructure Mapping Fails
**Problem:** Cannot map fingerprint bits to substructures
**Solution:**
- Return feature indices only
- Provide general molecular descriptors
- Note limitation in response

## 6. Data Quality Issues

### Case: Inconsistent Side-Effect Labels
**Problem:** Training data has inconsistent labeling
**Solution:**
- Use standardized side-effect ontology
- Normalize labels during preprocessing
- Document normalization rules

### Case: Missing Training Data
**Problem:** Insufficient data for certain side effects
**Solution:**
- Use class balancing techniques
- Set minimum support threshold
- Return "insufficient data" for rare side effects

## 7. User Input Validation

### Case: Empty Input
**Problem:** User submits empty drug name
**Solution:**
- Validate on frontend and backend
- Return clear validation error
- Provide input examples

### Case: Special Characters/Injection Attempts
**Problem:** Malicious input
**Solution:**
- Sanitize all inputs
- Use parameterized queries
- Log suspicious patterns

### Case: Extremely Long Input
**Problem:** Very long drug name (potential DoS)
**Solution:**
- Set maximum length (e.g., 200 characters)
- Truncate with warning
- Validate input format

## 8. Performance Issues

### Case: High Concurrent Load
**Problem:** Many simultaneous requests
**Solution:**
- Implement request queuing
- Use async processing where possible
- Cache frequently accessed drugs
- Scale horizontally if needed

### Case: Large Response Payload
**Problem:** Response too large (e.g., many side effects)
**Solution:**
- Paginate results
- Limit to top N predictions
- Compress responses
- Use streaming for large data

## 9. Ethical & Safety Edge Cases

### Case: High-Confidence Wrong Prediction
**Problem:** Model predicts with high confidence but is wrong
**Solution:**
- Always include disclaimer
- Show confidence intervals
- Provide database-sourced alternatives
- Log for model improvement

### Case: Sensitive Drug Categories
**Problem:** Controlled substances or experimental drugs
**Solution:**
- Add appropriate warnings
- Follow legal restrictions
- Document data sources clearly

## 10. Reproducibility Issues

### Case: Non-Deterministic Results
**Problem:** Different results on different runs
**Solution:**
- Set random seeds everywhere
- Document all random states
- Version control model files
- Include reproducibility checklist

## Mitigation Strategies

1. **Comprehensive Logging**: Log all edge cases for analysis
2. **Graceful Degradation**: Always return partial results when possible
3. **Clear Error Messages**: User-friendly error messages with suggestions
4. **Caching**: Cache external API responses to reduce failures
5. **Validation**: Validate inputs at multiple layers
6. **Monitoring**: Monitor API health and model performance
7. **Documentation**: Document all assumptions and limitations



