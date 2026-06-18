import { motion } from "framer-motion";

export default function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 max-w-5xl space-y-6"
    >
      {[320, 400, 280].map((h, i) => (
        <div key={i} className="glass-card rounded-xl overflow-hidden">
          <div className="animate-pulse p-6 space-y-4">
            <div className="h-6 bg-muted/40 rounded-lg w-1/3" />
            <div className="h-4 bg-muted/30 rounded-lg w-2/3" />
            <div className="h-4 bg-muted/20 rounded-lg w-1/2" />
            {i === 1 && <div className="h-48 bg-muted/20 rounded-lg" />}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
