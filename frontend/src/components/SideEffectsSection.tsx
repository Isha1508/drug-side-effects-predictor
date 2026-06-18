import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import type { Drug, AppMode, SideEffect } from "@/types/drug";

const tendencyConfig = {
  high: { icon: AlertTriangle, label: "High Risk", className: "tendency-high", barColor: "bg-[hsl(0,84%,60%)]" },
  moderate: { icon: AlertCircle, label: "Moderate", className: "tendency-moderate", barColor: "bg-[hsl(38,92%,50%)]" },
  low: { icon: CheckCircle, label: "Low Risk", className: "tendency-low", barColor: "bg-[hsl(142,71%,45%)]" },
};

function PatientCard({ effect, index }: { effect: SideEffect; index: number }) {
  const config = tendencyConfig[effect.tendency];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card-hover p-4 group cursor-default"
    >
      <div className="flex items-start gap-3">
        <div className={`pill-tag ${config.className} flex-shrink-0`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm">{effect.name}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {effect.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ResearchTable({ effects }: { effects: SideEffect[] }) {
  const sorted = [...effects].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="glass-card p-5">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Confidence Scores
        </h4>
        <div className="space-y-3">
          {sorted.map((effect, i) => {
            const config = tendencyConfig[effect.tendency];
            return (
              <motion.div
                key={effect.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs font-medium text-foreground w-40 truncate">
                  {effect.name}
                </span>
                <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${effect.confidence * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                    className={`h-full ${config.barColor} rounded-full opacity-80`}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                  {(effect.confidence * 100).toFixed(0)}%
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Side Effect</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Tendency</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((effect, i) => {
              const config = tendencyConfig[effect.tendency];
              return (
                <motion.tr
                  key={effect.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/10 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4 text-sm text-foreground">{effect.name}</td>
                  <td className="p-4">
                    <span className={`pill-tag text-xs ${config.className}`}>{config.label}</span>
                  </td>
                  <td className="p-4 text-right font-mono text-sm text-muted-foreground">
                    {(effect.confidence * 100).toFixed(1)}%
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SideEffectsSectionProps {
  drug: Drug;
  mode: AppMode;
}

export default function SideEffectsSection({ drug, mode }: SideEffectsSectionProps) {
  const grouped = {
    high: drug.sideEffects.filter((e) => e.tendency === "high"),
    moderate: drug.sideEffects.filter((e) => e.tendency === "moderate"),
    low: drug.sideEffects.filter((e) => e.tendency === "low"),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-xl font-bold gradient-text mb-6">
        Side Effect Predictions
      </h3>

      {mode === "patient" ? (
        <div className="space-y-6">
          {(["high", "moderate", "low"] as const).map((level) =>
            grouped[level].length > 0 ? (
              <div key={level}>
                <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 pill-tag ${tendencyConfig[level].className} w-fit`}>
                  {tendencyConfig[level].label} ({grouped[level].length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grouped[level].map((effect, i) => (
                    <PatientCard key={effect.name} effect={effect} index={i} />
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      ) : (
        <ResearchTable effects={drug.sideEffects} />
      )}
    </motion.div>
  );
}
