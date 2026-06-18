import { motion } from 'framer-motion';
import { User, FlaskConical } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function ModeToggle() {
  const { mode, setMode } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl p-1 flex gap-1"
    >
      <motion.button
        onClick={() => setMode('patient')}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
          mode === 'patient'
            ? 'bg-medical-blue text-white shadow-lg'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <User className="w-4 h-4" />
        Patient
      </motion.button>
      <motion.button
        onClick={() => setMode('research')}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
          mode === 'research'
            ? 'bg-medical-blue text-white shadow-lg'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FlaskConical className="w-4 h-4" />
        Research
      </motion.button>
    </motion.div>
  );
}
