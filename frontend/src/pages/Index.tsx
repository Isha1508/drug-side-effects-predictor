import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import DrugInfoCard from "@/components/DrugInfoCard";
import MolecularViewer from "@/components/MolecularViewer";
import SideEffectsSection from "@/components/SideEffectsSection";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ParticleBackground from "@/components/ParticleBackground";
import { drugAPI } from "@/services/api";
import type { Drug, AppMode } from "@/types/drug";
import type { CompleteDrugData } from "@/types";
import { getSideEffectDescription } from "@/lib/sideEffectDescriptions";

// Maps backend CompleteDrugData → Lovable's Drug type
function mapToDrug(data: CompleteDrugData): Drug {
  const info = data.drug_info;
  const structure = data.structure;
  const predictions = data.side_effect_predictions;

  // Map atoms
  const atoms = (structure["3d_coordinates"]?.atoms || []).map((a) => ({
    id: a.index,
    element: a.element,
    x: a.x,
    y: a.y,
    z: a.z,
  }));

  // Map bonds — parse order safely
  const bonds = (structure["3d_coordinates"]?.bonds || []).map((b) => ({
    atom1: b.begin,
    atom2: b.end,
    order: typeof b.order === "string" ? parseFloat(b.order) || 1 : b.order,
  }));

  // Map side effects
  const sideEffects = (predictions?.predictions || []).map((p) => ({
    name: p.side_effect,
    tendency: (p.tendency || "low") as "high" | "moderate" | "low",
    confidence: p.confidence_score ?? (p.tendency === "high" ? 0.8 : p.tendency === "moderate" ? 0.5 : 0.2),
    description: p.description || getSideEffectDescription(p.side_effect),
  }));

  // Map approved uses
  const approvedUses = (info.approved_uses || []).map((u) => u.indication || "See official prescribing information");

  return {
    name: info.standard_name,
    drugId: info.drug_id || "N/A",
    source: info.metadata?.source || "N/A",
    approvedUses: approvedUses.length > 0 ? approvedUses : ["See official prescribing information"],
    smiles: structure.smiles || "",
    inchiKey: structure.inchi_key || "N/A",
    atoms,
    bonds,
    sideEffects,
  };
}


export default function Index() {
  const [mode, setMode] = useState<AppMode>("patient");
  const [drug, setDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    setSearched(true);
    setDrug(null);

    try {
      const data = await drugAPI.getDrugInfo(query.trim(), mode);
      const mapped = mapToDrug(data);
      setDrug(mapped);
      toast.success(`Found drug: ${mapped.name}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Drug not found. Please try another name.";
      toast.error(message);
      setDrug(null);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar mode={mode} onModeChange={setMode} />

      {/* Hero */}
      <section className="relative overflow-hidden py-10 md:py-14">
        <ParticleBackground />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black gradient-text-accent mb-4 leading-tight"
          >
            Medicine Explained
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto"
          >
            Understand your medications through AI-powered analysis and 3D molecular visualization
          </motion.p>
          <SearchBar onSearch={handleSearch} />

          {/* Disclaimers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 max-w-2xl mx-auto space-y-2"
          >
            <p className="text-xs text-muted-foreground border border-yellow-500/30 rounded-lg px-4 py-2 bg-yellow-500/5">
              ⚠️ Educational tool only — not for clinical use. Always consult a healthcare professional.
            </p>
            <p className="text-xs text-muted-foreground border border-orange-500/30 rounded-lg px-4 py-2 bg-orange-500/5">
              ⚠️ Side-effect predictions are research-oriented ML estimates, not validated for clinical decisions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading && <LoadingSkeleton key="skeleton" />}

        {!loading && drug && (
          <motion.div
            key={drug.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 pb-20 max-w-5xl space-y-8"
          >
            <DrugInfoCard drug={drug} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MolecularViewer drug={drug} />
              <div className="lg:col-span-1">
                <SideEffectsSection drug={drug} mode={mode} />
              </div>
            </div>
          </motion.div>
        )}

        {!loading && !drug && searched && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto px-4 py-20 text-center"
          >
            <p className="text-muted-foreground">
              No results found. Please check the drug name and try again.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
