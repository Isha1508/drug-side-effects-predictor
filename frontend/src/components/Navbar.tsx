import { motion } from "framer-motion";
import { Pill, FlaskConical, User } from "lucide-react";
import type { AppMode } from "@/types/drug";

interface NavbarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export default function Navbar({ mode, onModeChange }: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 glass-card border-b border-border/30 backdrop-blur-2xl"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Pill className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-bold gradient-text">MedExplain</span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/50">
          <button
            onClick={() => onModeChange("patient")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              mode === "patient"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Patient
          </button>
          <button
            onClick={() => onModeChange("research")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              mode === "research"
                ? "bg-accent text-accent-foreground shadow-lg shadow-accent/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Research
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
