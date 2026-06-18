import { motion } from "framer-motion";
import { Pill, Database, BookOpen } from "lucide-react";
import type { Drug } from "@/types/drug";

interface DrugInfoCardProps {
  drug: Drug;
}

export default function DrugInfoCard({ drug }: DrugInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card-hover p-6"
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Pill className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold gradient-text">{drug.name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="pill-tag-primary">
              <Database className="w-3 h-3 mr-1" />
              {drug.drugId}
            </span>
            <span className="pill-tag-accent">
              <BookOpen className="w-3 h-3 mr-1" />
              {drug.source}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Approved Uses
        </h3>
        <div className="flex flex-wrap gap-2">
          {drug.approvedUses.map((use) => (
            <span key={use} className="pill-tag-secondary">{use}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
