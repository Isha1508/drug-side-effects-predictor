import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import type { Explanation, MolecularStructure } from '../types';
import { useAppStore } from '../store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SHAPExplanationsProps {
  explanation: Explanation;
  structure: MolecularStructure;
}

export default function SHAPExplanations({ explanation, structure }: SHAPExplanationsProps) {
  const { mode } = useAppStore();
  const [expanded, setExpanded] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  if (mode !== 'research') {
    return null;
  }

  if (!explanation.local_explanation && !explanation.highlighted_substructures) {
    return null;
  }

  const featureContributions = explanation.local_explanation?.feature_contributions || [];
  const substructures = explanation.highlighted_substructures || [];

  // Prepare chart data
  const chartData = featureContributions
    .slice(0, 15)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .map(feature => ({
      name: feature.feature.length > 25 ? feature.feature.substring(0, 25) + '...' : feature.feature,
      fullName: feature.feature,
      contribution: feature.contribution,
      absContribution: Math.abs(feature.contribution),
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card rounded-2xl p-8 shadow-xl"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-6"
      >
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-medical-blue" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Model Explanation (SHAP)
          </h2>
        </div>
        {expanded ? (
          <ChevronUp className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        ) : (
          <ChevronDown className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 overflow-hidden"
          >
            {/* Feature Contributions Chart */}
            {chartData.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Top Feature Contributions
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      label={{ value: 'Contribution', position: 'insideBottom', offset: -10 }}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                {data.fullName}
                              </p>
                              <p className="text-medical-blue font-semibold">
                                Contribution: {data.contribution.toFixed(4)}
                              </p>
                              {data.substructure_match && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Fragment: {data.substructure_match}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="contribution" radius={[0, 8, 8, 0]}>
                      {chartData.map((entry, index) => {
                        const color = entry.contribution > 0 ? '#10B981' : '#EF4444';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Highlighted Substructures */}
            {substructures.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Important Molecular Substructures
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {substructures.slice(0, 5).map((sub, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card rounded-lg p-4 border-l-4 border-medical-blue"
                      onMouseEnter={() => setSelectedFeature(sub.smiles_fragment)}
                      onMouseLeave={() => setSelectedFeature(null)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <code className="text-sm font-mono text-medical-blue bg-medical-blue/10 px-2 py-1 rounded">
                            {sub.smiles_fragment}
                          </code>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            {sub.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            Importance
                          </div>
                          <div className="text-lg font-bold text-medical-blue">
                            {(sub.importance * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Model Info */}
            {explanation.local_explanation?.base_value !== undefined && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Explanation Details
                </h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p>
                    <span className="font-semibold">Base Value:</span>{' '}
                    {explanation.local_explanation.base_value.toFixed(4)}
                  </p>
                  {explanation.local_explanation.prediction !== undefined && (
                    <p>
                      <span className="font-semibold">Prediction:</span>{' '}
                      {explanation.local_explanation.prediction.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Feature Contributions Table */}
            {featureContributions.length > 0 && (
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  All Feature Contributions
                </h3>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="pb-2 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Feature
                        </th>
                        <th className="pb-2 px-4 font-semibold text-slate-700 dark:text-slate-300 text-right">
                          Contribution
                        </th>
                        <th className="pb-2 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Substructure
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {featureContributions.slice(0, 20).map((feature, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <td className="py-2 px-4 text-slate-700 dark:text-slate-300">
                            {feature.feature}
                          </td>
                          <td
                            className={`py-2 px-4 text-right font-mono ${
                              feature.contribution > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {feature.contribution.toFixed(4)}
                          </td>
                          <td className="py-2 px-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {feature.substructure_match || '-'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
