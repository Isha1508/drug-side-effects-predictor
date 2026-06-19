import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import type { SideEffectPredictions } from '../types';
import { useAppStore } from '../store/useAppStore';
import SideEffectPill3D from './SideEffectPill3D';
import { getSideEffectDescription } from '../lib/sideEffectDescriptions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SideEffectsVisualization({ predictions }: { predictions: SideEffectPredictions }) {
  const { mode } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!predictions.predictions || predictions.predictions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400"
      >
        No side-effect predictions available.
      </motion.div>
    );
  }

  // Group by tendency for patient mode
  const groupedByTendency = {
    high: predictions.predictions.filter(p => p.tendency === 'high'),
    moderate: predictions.predictions.filter(p => p.tendency === 'moderate'),
    low: predictions.predictions.filter(p => p.tendency === 'low'),
  };

  // Prepare data for research mode chart
  const chartData = mode === 'research'
    ? predictions.predictions
        .sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0))
        .slice(0, 15)
        .map(p => ({
          name: p.side_effect.length > 30 ? p.side_effect.substring(0, 30) + '...' : p.side_effect,
          fullName: p.side_effect,
          score: p.confidence_score || 0,
        }))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card rounded-2xl p-8 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-medical-blue" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Side-Effect Predictions
        </h2>
      </div>

      {mode === 'patient' ? (
        // Patient Mode: Grouped by tendency with 3D pills
        <div className="space-y-8">
          {/* High Tendency */}
          {groupedByTendency.high.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-risk-high" />
                <h3 className="text-xl font-semibold text-risk-high">High Tendency</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedByTendency.high.map((pred, idx) => (
                  <SideEffectPill3D
                    key={idx}
                    sideEffect={pred.side_effect}
                    tendency="high"
                    index={idx}
                    description={pred.description ?? getSideEffectDescription(pred.side_effect)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Moderate Tendency */}
          {groupedByTendency.moderate.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-risk-moderate" />
                <h3 className="text-xl font-semibold text-risk-moderate">Moderate Tendency</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedByTendency.moderate.map((pred, idx) => (
                  <SideEffectPill3D
                    key={idx}
                    sideEffect={pred.side_effect}
                    tendency="moderate"
                    index={idx + groupedByTendency.high.length}
                    description={pred.description ?? getSideEffectDescription(pred.side_effect)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Low Tendency */}
          {groupedByTendency.low.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-risk-low" />
                <h3 className="text-xl font-semibold text-risk-low">Low Tendency</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedByTendency.low.slice(0, 5).map((pred, idx) => (
                  <SideEffectPill3D
                    key={idx}
                    sideEffect={pred.side_effect}
                    tendency="low"
                    index={idx + groupedByTendency.high.length + groupedByTendency.moderate.length}
                    description={pred.description ?? getSideEffectDescription(pred.side_effect)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        // Research Mode: Chart with confidence scores
        <div className="space-y-6">
          {chartData.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                Top Side Effects by Confidence Score
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Confidence Score', angle: -90, position: 'insideLeft' }}
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                              {payload[0].payload.fullName}
                            </p>
                            <p className="text-medical-blue font-semibold">
                              Score: {Number(payload[0].value).toFixed(3)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => {
                      const color = entry.score > 0.7 ? '#EF4444' : entry.score > 0.4 ? '#F59E0B' : '#10B981';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed Table with Side Effect Descriptions */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Side Effect</th>
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">What it means</th>
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Confidence Score</th>
                </tr>
              </thead>
              <tbody>
                {predictions.predictions
                  .sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0))
                  .map((pred, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{pred.side_effect}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm hidden sm:table-cell max-w-md">
                        {pred.description ?? getSideEffectDescription(pred.side_effect)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-medical-blue">
                        {(pred.confidence_score || 0).toFixed(3)}
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Model Info */}
          {predictions.model_info && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4"
            >
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Model Information</h4>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <p><span className="font-semibold">Model:</span> {predictions.model_info.model_name}</p>
                <p><span className="font-semibold">Version:</span> {predictions.model_info.version}</p>
                {predictions.model_info.training_date && (
                  <p><span className="font-semibold">Training Date:</span> {predictions.model_info.training_date}</p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
