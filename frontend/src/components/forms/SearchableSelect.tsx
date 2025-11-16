import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchableSelectProps {
  label?: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  errorText?: string;
  disabled?: boolean;
  isLoading?: boolean;
  maxHeight?: string;
  darkMode?: boolean;
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Digite para buscar...',
  errorText,
  disabled = false,
  isLoading = false,
  maxHeight = '300px',
  darkMode = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current selected label
  const selectedLabel = options.find((opt) => opt.value === value)?.label || '';

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (!isOpen) {
      return;
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          return;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          return;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            onChange(filteredOptions[highlightedIndex].value);
            setIsOpen(false);
            setSearchTerm('');
          }
          return;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchTerm('');
          return;
        default:
          return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, highlightedIndex, filteredOptions, onChange]);

  // Reset highlighted index when search term changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  const bgClass = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  const borderClass = errorText
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : darkMode
      ? 'border-gray-700 focus:border-blue-500 focus:ring-blue-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  return (
    <div ref={containerRef} className="w-full">
      {label && (
        <label
          className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || isLoading}
          className={`w-full px-3 py-2 text-left border rounded-lg transition-colors flex items-center justify-between ${bgClass} ${borderClass} ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <span className={selectedLabel ? '' : 'text-gray-500'}>
            {selectedLabel || placeholder}
          </span>
          {isLoading ? (
            <div className="animate-spin">
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <svg
              className={`w-4 h-4 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
        </button>

        {/* Clear button */}
        {selectedLabel && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearchTerm('');
            }}
            className={`absolute right-10 top-2.5 text-gray-400 hover:text-gray-600 ${
              darkMode ? 'hover:text-gray-300' : ''
            }`}
            title="Limpar seleção"
          >
            ✕
          </button>
        )}

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={`absolute top-full left-0 right-0 mt-2 border rounded-lg shadow-lg z-50 ${bgClass} border-gray-300`}
              style={{ maxHeight, overflow: 'auto' }}
            >
              {/* Search input */}
              <div className="sticky top-0 p-2 border-b border-gray-200">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-3 py-2 border rounded outline-none transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>

              {/* Options list */}
              {filteredOptions.length > 0 ? (
                <ul className="py-1">
                  {filteredOptions.map((option, index) => (
                    <motion.li
                      key={option.value}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onChange(option.value);
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                        className={`w-full text-left px-3 py-2 transition-colors ${
                          index === highlightedIndex
                            ? darkMode
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-900'
                            : darkMode
                              ? 'hover:bg-gray-700 text-gray-100'
                              : 'hover:bg-gray-100 text-gray-900'
                        } ${
                          option.value === value
                            ? darkMode
                              ? 'bg-blue-700 text-white font-semibold'
                              : 'bg-blue-50 text-blue-900 font-semibold'
                            : ''
                        }`}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        {option.label}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div
                  className={`px-3 py-4 text-center text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Nenhum resultado encontrado
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      {errorText && (
        <p className="mt-2 text-sm text-red-500">{errorText}</p>
      )}
    </div>
  );
}
