import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Loader2, AlertCircle } from 'lucide-react';
import DrugInfoCard from './DrugInfoCard';
import MolecularViewer from './MolecularViewer';
import SideEffectsVisualization from './SideEffectsVisualization';
import SHAPExplanations from './SHAPExplanations';

export default function DrugResults() {
  const { drugData, loading, error, searchQuery } = useAppStore();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 px-4"
      >
        <Loader2 className="w-16 h-16 text-medical-blue animate-spin mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Fetching information for <span className="font-semibold">{searchQuery}</span>...
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <div className="glass-card rounded-2xl p-8 border-l-4 border-red-500">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Loading Drug Information
              </h3>
              <p className="text-slate-700 dark:text-slate-300">{error}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!drugData) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={drugData.drug_info.drug_id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-8"
      >
        {/* Drug Information Card */}
        <DrugInfoCard drugInfo={drugData.drug_info} />

        {/* Molecular Structure Section - key forces remount so 3D viewer shows correct molecule per drug */}
        {drugData.structure && drugData.structure.smiles && (
          <MolecularViewer
            key={drugData.structure.smiles ?? drugData.drug_info.drug_id}
            structure={drugData.structure}
          />
        )}

        {/* Side Effects Predictions */}
        {drugData.side_effect_predictions && !drugData.side_effect_predictions.error && (
          <SideEffectsVisualization predictions={drugData.side_effect_predictions} />
        )}

        {/* SHAP Explanations (Research Mode) */}
        {drugData.explanations && !drugData.explanations.error && (
          <SHAPExplanations explanation={drugData.explanations} structure={drugData.structure} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
