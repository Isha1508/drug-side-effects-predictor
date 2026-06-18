# ML Pipeline Implementation Order

## Phase 1: Data Collection & Preparation (Week 1-2)

### Step 1.1: Download SIDER Dataset
- Download SIDER 4.1 dataset (side effects and indications)
- Extract drug-side effect associations
- Standardize drug identifiers (ChEMBL IDs, PubChem CIDs)

### Step 1.2: Fetch ChEMBL Data
- Query ChEMBL for drug molecules
- Extract SMILES strings
- Match with SIDER drug identifiers
- Handle missing SMILES (use PubChem as fallback)

### Step 1.3: Data Cleaning
- Remove duplicates
- Handle missing values
- Standardize side-effect names (use MedDRA ontology if available)
- Create drug-SMILES mapping table

**Deliverable:** Clean dataset with drug_id, SMILES, side_effect_labels

## Phase 2: Feature Engineering (Week 2-3)

### Step 2.1: SMILES Validation
- Validate all SMILES using RDKit
- Canonicalize SMILES
- Remove invalid entries
- Log validation statistics

### Step 2.2: Generate Molecular Fingerprints
- ECFP4 fingerprints (2048 bits, radius=2)
- Morgan fingerprints (2048 bits, radius=2)
- Compare both, select best performing
- Save fingerprint generation function

### Step 2.3: Physicochemical Descriptors (Optional)
- Molecular weight
- LogP
- Number of rotatable bonds
- H-bond donors/acceptors
- TPSA (Topological Polar Surface Area)

### Step 2.4: Create Multi-Label Target Matrix
- One-hot encode side effects
- Filter side effects with < N occurrences (e.g., N=10)
- Create binary matrix: drugs × side effects
- Calculate class distribution

**Deliverable:** Feature matrix (X) and target matrix (Y)

## Phase 3: Model Development (Week 3-4)

### Step 3.1: Train-Test Split
- Stratified split (80-20) maintaining side-effect distribution
- Set random seed for reproducibility
- Save split indices

### Step 3.2: Baseline Model: Logistic Regression
- Multi-label Logistic Regression (OneVsRest)
- Hyperparameter tuning (C parameter)
- Cross-validation (5-fold)
- Evaluate: Hamming loss, F1-score (micro/macro)

### Step 3.3: XGBoost Model (Optional)
- Multi-label XGBoost
- Hyperparameter tuning
- Compare with baseline
- Select best model

### Step 3.4: Model Evaluation
- Calculate metrics per side-effect class
- Identify poorly predicted classes
- Analyze confusion matrices
- Document model limitations

**Deliverable:** Trained model(s) with evaluation metrics

## Phase 4: Model Persistence & Inference (Week 4-5)

### Step 4.1: Save Model Artifacts
- Save trained model (joblib/pickle)
- Save feature scaler (if used)
- Save label encoder (side-effect names)
- Create model metadata JSON

### Step 4.2: Inference Pipeline
- Drug name → SMILES lookup
- SMILES → Fingerprint conversion
- Model prediction
- Confidence score calculation
- Label decoding

### Step 4.3: Batch Testing
- Test on held-out test set
- Validate inference speed
- Check memory usage
- Optimize if needed

**Deliverable:** Working inference pipeline

## Phase 5: Explainability (Week 5-6)

### Step 5.1: SHAP Integration
- Install and configure SHAP
- Create SHAP explainer (TreeExplainer for XGBoost, LinearExplainer for LR)
- Calculate SHAP values for sample predictions

### Step 5.2: Global Feature Importance
- Calculate mean absolute SHAP values
- Identify top important features
- Visualize feature importance plot
- Save global importance data

### Step 5.3: Local Explanations
- Calculate SHAP values for individual predictions
- Map important fingerprint bits to molecular substructures
- Highlight substructures in molecule visualization
- Create explanation visualization

### Step 5.4: Substructure Mapping
- Map ECFP bits to molecular fragments
- Use RDKit to identify substructures
- Create bit-to-substructure mapping
- Visualize highlighted regions

**Deliverable:** SHAP explanation pipeline with visualizations

## Phase 6: Integration & Testing (Week 6-7)

### Step 6.1: API Integration
- Integrate ML pipeline into API
- Add error handling
- Implement caching
- Add logging

### Step 6.2: End-to-End Testing
- Test with real drug names
- Validate all edge cases
- Performance testing
- Security testing

### Step 6.3: Documentation
- Document model assumptions
- Document limitations
- Create user guide
- Write API documentation

**Deliverable:** Fully integrated system

## Phase 7: Refinement & Deployment (Week 7-8)

### Step 7.1: UI Integration
- Connect frontend to API
- Display predictions appropriately
- Add disclaimers
- Implement mode switching (Patient/Research)

### Step 7.2: Final Testing
- User acceptance testing
- Bug fixes
- Performance optimization
- Security review

### Step 7.3: Deployment Preparation
- Create deployment scripts
- Environment configuration
- Monitoring setup
- Backup procedures

**Deliverable:** Production-ready system

## Reproducibility Checklist

- [ ] All random seeds set and documented
- [ ] Data versions tracked
- [ ] Model versions tracked
- [ ] Dependencies pinned (requirements.txt)
- [ ] Environment variables documented
- [ ] Training scripts saved
- [ ] Evaluation metrics logged
- [ ] Assumptions documented
- [ ] Limitations clearly stated

## Model Metadata Template

```json
{
  "model_name": "side_effect_predictor_v1",
  "model_type": "LogisticRegression",
  "training_date": "2024-01-15",
  "training_data": {
    "dataset": "SIDER_4.1",
    "num_drugs": 1430,
    "num_side_effects": 5865,
    "num_features": 2048
  },
  "hyperparameters": {
    "C": 1.0,
    "penalty": "l2",
    "solver": "lbfgs"
  },
  "performance": {
    "hamming_loss": 0.023,
    "f1_micro": 0.78,
    "f1_macro": 0.65
  },
  "random_seed": 42,
  "feature_type": "ECFP4_2048",
  "limitations": [
    "Trained on limited dataset",
    "May not generalize to novel drug classes",
    "Not validated for clinical use"
  ]
}
```



