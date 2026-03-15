"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="relative group"
    >
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted group-focus-within:text-accent transition-colors duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search dinosaurs..."
        className="w-full pl-11 pr-11 py-3 rounded-card bg-white font-body text-sm text-text-primary placeholder:text-text-muted/70 border border-border-default shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 focus:shadow-md transition-all duration-200"
        aria-label="Search dinosaurs"
      />
      {value && (
        <button
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-text-muted/10 text-text-secondary hover:bg-accent/10 hover:text-accent transition-all duration-150"
          aria-label="Clear search"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
