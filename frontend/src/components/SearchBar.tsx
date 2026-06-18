import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

const COMMON_DRUGS = [
  "aspirin", "ibuprofen", "metformin", "paracetamol", "acetaminophen",
  "amoxicillin", "atorvastatin", "lisinopril", "omeprazole", "metoprolol",
  "amlodipine", "albuterol", "gabapentin", "sertraline", "fluoxetine",
  "levothyroxine", "prednisone", "azithromycin", "ciprofloxacin", "warfarin",
];

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      setSuggestions(COMMON_DRUGS.filter((n) => n.startsWith(query.toLowerCase())));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSubmit = (value?: string) => {
    const q = value || query;
    if (q.trim()) {
      onSearch(q.trim());
      setSuggestions([]);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className={`relative flex items-center rounded-2xl transition-all duration-500 ${
          focused ? "glow-border-focus bg-card/80" : "glass-card"
        }`}
      >
        <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Search for a drug (e.g., Aspirin, Ibuprofen, Metformin)"
          className="w-full pl-12 pr-20 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-14 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => handleSubmit()}
          className="absolute right-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </motion.div>

      <AnimatePresence>
        {focused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-50"
          >
            {suggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => {
                  setQuery(s.charAt(0).toUpperCase() + s.slice(1));
                  handleSubmit(s);
                }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm capitalize hover:bg-muted/50 text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
