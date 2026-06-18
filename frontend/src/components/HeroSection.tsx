import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Search, Pill, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { drugAPI } from '../services/api';
import toast from 'react-hot-toast';
import FloatingParticles from './FloatingParticles';
import ModeToggle from './ModeToggle';
import ThemeToggle from './ThemeToggle';

export default function HeroSection() {
  const [searchValue, setSearchValue] = useState('');
  const { setDrugData, setLoading, setError, setSearchQuery, mode } = useAppStore();

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      toast.error('Please enter a drug name');
      return;
    }

    setSearchQuery(searchValue.trim());
    setLoading(true);
    setError(null);

    try {
      const data = await drugAPI.getDrugInfo(searchValue.trim(), mode);
      setDrugData(data);
      toast.success(`Found information for ${data.drug_info.standard_name}`);
    } catch (error: unknown) {
      // Error message is now properly extracted in the API service
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch drug information. Please check the drug name and try again.';
      
      setError(errorMessage);
      setDrugData(null);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      {/* Header with theme and mode toggles */}
      <div className="absolute top-4 right-4 flex gap-3 z-50">
        <ModeToggle />
        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Pill className="w-12 h-12 text-medical-blue" />
            </motion.div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gradient">
              Medicine Explanation System
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mt-4 max-w-3xl mx-auto">
            Educational Research Tool - Not for Clinical Use
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
            Explore molecular structures, side-effect predictions, and AI-powered explanations
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          onSubmit={handleSearch}
          className="max-w-3xl mx-auto"
        >
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card rounded-2xl p-2 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-medical-blue" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
                    placeholder="Enter drug name (e.g., Paracetamol, Aspirin, Ibuprofen)"
                    className="w-full pl-14 pr-4 py-4 text-lg bg-transparent border-none outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-medical text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Search
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.form>

        {/* Floating Particles Background */}
        <FloatingParticles />

        {/* Disclaimers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 max-w-4xl mx-auto space-y-4"
        >
          <div className="glass-card rounded-xl p-4 border-l-4 border-yellow-500">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ CLINICAL INFORMATION DISCLAIMER
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              This information is sourced from authoritative medical databases and is for educational purposes only. Always consult healthcare professionals for medical decisions.
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 border-l-4 border-orange-500">
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">
              ⚠️ RESEARCH MODEL DISCLAIMER
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Side-effect predictions are based on molecular structure analysis using a research-oriented machine learning model. They indicate potential tendencies only and are NOT validated for clinical use. Do NOT use for medical decision-making.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
