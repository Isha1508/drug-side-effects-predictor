# System Limitations & Ethical Considerations

## Scientific Limitations

### 1. Model Limitations

**Training Data Scope:**
- Model trained on limited dataset (SIDER + ChEMBL)
- May not generalize to novel drug classes or structures
- Training data may have biases or gaps

**Prediction Accuracy:**
- Side-effect predictions are probabilistic tendencies only
- Not validated against clinical trial data
- Confidence scores are model outputs, not clinical probabilities

**Feature Representation:**
- ECFP/Morgan fingerprints capture molecular patterns but may miss:
  - Complex 3D interactions
  - Metabolic pathways
  - Drug-drug interactions
  - Individual patient factors

### 2. Data Limitations

**Database Coverage:**
- Not all drugs available in all databases
- Some drugs may have incomplete metadata
- Database updates may lag behind new drug approvals

**SMILES Availability:**
- Some drugs may not have SMILES strings available
- Stereochemistry may be ambiguous
- Tautomeric forms may not be represented

**Side-Effect Labeling:**
- Side effects may be inconsistently labeled
- Rare side effects may have insufficient training data
- Severity information not included

### 3. Technical Limitations

**Explainability:**
- SHAP explanations are approximations
- Substructure mapping may not always be accurate
- Feature importance may not reflect biological mechanisms

**Performance:**
- Model inference time increases with molecule size
- Very large molecules may cause memory issues
- API rate limits may affect external database queries

## Ethical Considerations

### 1. Not for Clinical Use

**Critical Restrictions:**
- ❌ **DO NOT** use for medical decision-making
- ❌ **DO NOT** replace professional medical consultation
- ❌ **DO NOT** use predictions to diagnose or treat conditions
- ❌ **DO NOT** use for drug selection or dosing decisions

**Intended Use:**
- ✅ Educational purposes
- ✅ Research and academic projects
- ✅ Understanding molecular structure relationships
- ✅ Learning about explainable AI in healthcare

### 2. Patient Safety

**Disclaimers:**
- All outputs include prominent disclaimers
- Clinical information clearly labeled as database-sourced
- ML predictions clearly labeled as research-oriented
- No medical advice provided

**Data Privacy:**
- No patient data collected or stored
- Drug lookups are stateless
- No personal health information processed

### 3. Academic Integrity

**Transparency:**
- All assumptions documented
- Model limitations clearly stated
- Data sources cited
- Reproducibility ensured through version control

**Honesty:**
- No claims of clinical validation
- No overstatement of model capabilities
- Clear distinction between database facts and ML predictions

## Known Edge Cases

See `docs/EDGE_CASES.md` for comprehensive edge case handling.

## Recommendations for Academic Defense

### 1. Clearly State Limitations

In your viva/presentation:
- Explicitly state this is a research/educational tool
- Acknowledge model limitations
- Discuss data quality and coverage
- Explain why clinical validation is not included

### 2. Emphasize Ethical Design

- Show prominent disclaimers in UI
- Explain separation of database facts vs ML predictions
- Discuss why ML is only used for side-effect tendencies
- Demonstrate safety-first approach

### 3. Highlight Technical Contributions

- Feature engineering approach
- Explainability implementation
- Integration of multiple data sources
- Clean architecture and code quality

### 4. Discuss Future Improvements

- Larger training datasets
- More sophisticated models (GNNs)
- Clinical validation studies
- Integration with electronic health records (with proper safeguards)

## Compliance Notes

### Regulatory Considerations

- **FDA/Medical Device Regulations**: This system is NOT a medical device
- **HIPAA**: No patient data processed (not applicable)
- **GDPR**: No personal data collected
- **Academic Ethics**: Follows educational/research use guidelines

### Data Sources

- **RxNorm**: Public domain, maintained by NLM
- **PubChem**: Public domain, maintained by NIH
- **SIDER**: Public research dataset
- **ChEMBL**: Public research database

All data sources are publicly available for research use.

## Conclusion

This system is designed with safety and academic integrity as top priorities. All limitations are documented, and the system explicitly avoids making clinical claims. It serves as an educational tool demonstrating the application of ML to molecular structure analysis while maintaining ethical boundaries.



