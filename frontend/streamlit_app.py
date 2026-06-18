"""
Streamlit frontend for Medicine Explanation System.
Provides both Patient Mode and Research Mode interfaces.
"""

import streamlit as st
import requests
import json
import base64
from typing import Dict, Optional



# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"

# You can also set this via environment variable
import os
if os.getenv("API_BASE_URL"):
    API_BASE_URL = os.getenv("API_BASE_URL")

# Page configuration
st.set_page_config(
    page_title="Medicine Explanation System",
    page_icon="💊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for disclaimers
st.markdown("""
<style>
/* Global background */
.main {
    background: radial-gradient(circle at top, #0f172a, #020617);
    color: #e2e8f0;
}

/* Titles */
h1, h2, h3 {
    color: #f8fafc;
}

/* Buttons */
.stButton > button {
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: white;
    border-radius: 12px;
    padding: 0.6rem 1.4rem;
    border: none;
    font-weight: 600;
    transition: all 0.2s ease;
}

.stButton > button:hover {
    transform: scale(1.02);
    box-shadow: 0 0 12px #3b82f6;
}

/* Input */
.stTextInput input {
    background-color: #0f172a;
    border: 1px solid #334155;
    border-radius: 12px;
    color: white;
}

/* Cards */
.card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid #1e293b;
    padding: 1.2rem;
    border-radius: 18px;
    margin-top: 1rem;
}

/* Disclaimer */
.disclaimer {
    background: rgba(255, 255, 255, 0.03);
    border-left: 4px solid #06b6d4;
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.95rem;
}
</style>
""", unsafe_allow_html=True)



def display_disclaimer(disclaimer_type: str = "both"):
    """Display safety disclaimers."""
    if disclaimer_type in ["both", "clinical"]:
        st.markdown("""
        <div class="disclaimer">
            <strong>⚠️ CLINICAL INFORMATION DISCLAIMER:</strong><br>
            This information is sourced from authoritative medical databases and is for 
            educational purposes only. Always consult healthcare professionals for medical decisions.
        </div>
        """, unsafe_allow_html=True)
    
    if disclaimer_type in ["both", "ml"]:
        st.markdown("""
        <div class="disclaimer">
            <strong>⚠️ RESEARCH MODEL DISCLAIMER:</strong><br>
            Side-effect predictions are based on molecular structure analysis using a 
            research-oriented machine learning model. They indicate potential tendencies only 
            and are NOT validated for clinical use. Do NOT use for medical decision-making.
        </div>
        """, unsafe_allow_html=True)


def make_api_request(endpoint: str, method: str = "GET", data: Optional[Dict] = None) -> Optional[Dict]:
    """Make API request with error handling."""
    try:
        url = f"{API_BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url, params=data, timeout=30)
        else:
            response = requests.post(url, json=data, timeout=30)
        
        response.raise_for_status()
        return response.json()
    
    except requests.exceptions.ConnectionError:
        st.error("❌ Cannot connect to API. Please ensure the backend server is running.")
        return None
    except requests.exceptions.Timeout:
        st.error("❌ Request timed out. Please try again.")
        return None
    except requests.exceptions.HTTPError as e:
        error_data = {}
        try:
            error_data = response.json()
        except:
            pass
        
        error_msg = error_data.get("message", str(e))
        st.error(f"❌ API Error: {error_msg}")
        return None
    except Exception as e:
        st.error(f"❌ Unexpected error: {str(e)}")
        return None


def display_molecule_2d(svg_b64: str):
    """Display 2D molecular structure."""
    if svg_b64:
        svg_bytes = base64.b64decode(svg_b64)
        st.image(svg_bytes, use_container_width=True)
    else:
        st.info("2D structure visualization not available")


def display_side_effects_patient_mode(predictions: list):
    """Display side effects in patient-friendly format."""
    if not predictions:
        st.info("No side-effect predictions available.")
        return
    
    st.subheader("Potential Side-Effect Tendencies")
    
    # Group by tendency
    high = [p for p in predictions if p.get("tendency") == "high"]
    moderate = [p for p in predictions if p.get("tendency") == "moderate"]
    low = [p for p in predictions if p.get("tendency") == "low"]
    
    if high:
        st.markdown("### 🔴 High Tendency")
        for pred in high:
            st.write(f"- **{pred['side_effect']}**")
    
    if moderate:
        st.markdown("### 🟡 Moderate Tendency")
        for pred in moderate:
            st.write(f"- **{pred['side_effect']}**")
    
    if low:
        st.markdown("### 🟢 Low Tendency")
        for pred in low[:5]:  # Show top 5 low tendency
            st.write(f"- **{pred['side_effect']}**")


def display_side_effects_research_mode(predictions: list, model_info: Dict):
    """Display side effects in research mode with confidence scores."""
    if not predictions:
        st.info("No side-effect predictions available.")
        return
    
    st.subheader("Side-Effect Predictions (Research Mode)")
    
    # Display model info
    with st.expander("Model Information"):
        st.json(model_info)
    
    # Create table
    import pandas as pd
    df = pd.DataFrame(predictions)
    df.columns = ["Side Effect", "Confidence Score"]
    df["Confidence Score"] = df["Confidence Score"].apply(lambda x: f"{x:.3f}")
    st.dataframe(df, use_container_width=True)
    
    # Bar chart
    st.bar_chart(df.set_index("Side Effect")["Confidence Score"].astype(float))


def display_explanations(explanation_data: Dict):
    """Display SHAP explanations."""
    st.subheader("Model Explanation (SHAP)")
    
    if explanation_data.get("error"):
        st.error(f"Explanation error: {explanation_data['error']}")
        return
    
    # Local explanation
    local = explanation_data.get("local_explanation", {})
    if local:
        st.markdown("### Local Feature Contributions")
        
        contributions = local.get("feature_contributions", [])[:10]
        if contributions:
            import pandas as pd
            contrib_df = pd.DataFrame(contributions)
            st.dataframe(contrib_df, use_container_width=True)
            
            # Highlight substructures
            substructures = explanation_data.get("highlighted_substructures", [])
            if substructures:
                st.markdown("### Important Molecular Substructures")
                for sub in substructures[:5]:
                    st.write(f"- **{sub['smiles_fragment']}**: {sub['description']}")

def display_molecule_3d(smiles: str):
    import streamlit as st
    import plotly.graph_objects as go
    from rdkit import Chem
    from rdkit.Chem import AllChem

    # --- Build molecule ---
    mol = Chem.MolFromSmiles(smiles)
    mol = Chem.AddHs(mol)

    # Generate 3D coordinates
    AllChem.EmbedMolecule(mol, AllChem.ETKDG())
    AllChem.UFFOptimizeMolecule(mol)

    conf = mol.GetConformer()

    # --- Atom data ---
    xs, ys, zs, colors, labels = [], [], [], [], []

    color_map = {
        "C": "#9CA3AF",  # gray
        "O": "#EF4444",  # red
        "N": "#3B82F6",  # blue
        "S": "#FACC15",  # yellow
        "H": "#F8FAFC",  # white
        "Cl": "#22C55E", # green
        "F": "#10B981",
        "Br": "#A855F7",
        "I": "#7C3AED"
    }

    for atom in mol.GetAtoms():
        idx = atom.GetIdx()
        pos = conf.GetAtomPosition(idx)
        symbol = atom.GetSymbol()

        xs.append(pos.x)
        ys.append(pos.y)
        zs.append(pos.z)
        colors.append(color_map.get(symbol, "#E5E7EB"))
        labels.append(symbol)

    # --- Bond data ---
    bond_x, bond_y, bond_z = [], [], []

    for bond in mol.GetBonds():
        i = bond.GetBeginAtomIdx()
        j = bond.GetEndAtomIdx()

        p1 = conf.GetAtomPosition(i)
        p2 = conf.GetAtomPosition(j)

        bond_x += [p1.x, p2.x, None]
        bond_y += [p1.y, p2.y, None]
        bond_z += [p1.z, p2.z, None]

    # --- Plotly figure ---
    fig = go.Figure()

    # Bonds
    fig.add_trace(go.Scatter3d(
        x=bond_x,
        y=bond_y,
        z=bond_z,
        mode='lines',
        line=dict(color="#CBD5E1", width=4),
        hoverinfo='none'
    ))

    # Atoms
    fig.add_trace(go.Scatter3d(
        x=xs,
        y=ys,
        z=zs,
        mode='markers+text',
        marker=dict(
            size=8,
            color=colors,
            line=dict(color="black", width=1)
        ),
        text=labels,
        textposition="top center"
    ))

    # Layout styling
    fig.update_layout(
        height=520,
        margin=dict(l=0, r=0, t=30, b=0),
        paper_bgcolor="#020617",
        plot_bgcolor="#020617",
        scene=dict(
            bgcolor="#020617",
            xaxis=dict(visible=False),
            yaxis=dict(visible=False),
            zaxis=dict(visible=False),
            camera=dict(
                eye=dict(x=1.5, y=1.5, z=1.5)
            )
        ),
        font=dict(color="white"),
        showlegend=False
    )

    st.plotly_chart(fig, use_container_width=True)


# Main App
def main():
    st.title("💊 Medicine Explanation System")
    st.markdown("**Educational Research Tool - Not for Clinical Use**")
    
    # Sidebar
    with st.sidebar:
        st.header("Settings")
        mode = st.radio(
            "Display Mode",
            ["Patient Mode", "Research Mode"],
            help="Patient Mode: Simple language, no raw scores. Research Mode: Detailed with confidence scores."
        )
        
        st.markdown("---")
        st.markdown("### About")
        st.info("""
        This system provides:
        1. Drug information from authoritative databases
        2. Molecular structure visualization
        3. Research-oriented side-effect predictions
        4. Explainable AI insights
        """)
    
    # Display disclaimers
    display_disclaimer("both")
    
    # Drug input
    st.header("Drug Information Lookup")
    drug_name = st.text_input(
        "Enter Drug Name",
        placeholder="e.g., Paracetamol, Aspirin, Ibuprofen",
        help="Enter the common or brand name of the drug"
    )
    
    if st.button("🔍 Lookup Drug", type="primary"):
        if not drug_name:
            st.warning("Please enter a drug name.")
        else:
            with st.spinner("Fetching drug information..."):
                # Get complete info
                result = make_api_request(
                    "/drug/info",
                    method="GET",
                    data={"name": drug_name, "mode": mode.lower().replace(" mode", "")}
                )
                
                if result and not result.get("error"):
                    # Display drug info
                    drug_info = result.get("drug_info", {})
                    structure = result.get("structure", {})
                    predictions = result.get("side_effect_predictions", {})
                    explanations = result.get("explanations", {})
                    
                    # Drug Information Section
                    st.markdown("<div class='card'>", unsafe_allow_html=True)
                    st.header("📋 Drug Information")
                    # your content
                    st.markdown("</div>", unsafe_allow_html=True)

                    col1, col2 = st.columns(2)
                    
                    with col1:
                        st.markdown(f"**Standard Name:** {drug_info.get('standard_name', 'N/A')}")
                        st.markdown(f"**Drug ID:** {drug_info.get('drug_id', 'N/A')}")
                        st.markdown(f"**Source:** {drug_info.get('metadata', {}).get('source', 'N/A')}")
                    
                    with col2:
                        approved_uses = drug_info.get("approved_uses", [])
                        if approved_uses:
                            st.markdown("**Approved Uses (Database-Sourced):**")
                            for use in approved_uses:
                                st.write(f"- {use.get('indication', 'N/A')}")
                    
                    # Molecular Structure Section
                    st.markdown("<div class='card'>", unsafe_allow_html=True)
                    st.header("🧬Molecular Structure")

                    smiles = (
                        structure.get("smiles")
                        or drug_info.get("metadata", {}).get("smiles")
                    )
                    st.write("DEBUG SMILES:", smiles)

                    if smiles:
                        display_molecule_3d(smiles)

                        with st.expander("Structure Data"):
                            st.code(f"SMILES: {smiles}")
                            st.code(f"InChI Key: {structure.get('inchi_key', 'N/A')}")
                         
                    else:
                        st.warning("Molecular structure data not available for this drug.")
                    st.markdown("</div>", unsafe_allow_html=True)


if __name__ == "__main__":
    main()

