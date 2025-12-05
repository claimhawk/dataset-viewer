/**
 * Search field component - text input with debounce.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/ui/primitives/components/input.component';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

function SearchIcon(): React.ReactElement {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search records...',
  debounceMs = 300
}: SearchFieldProps): React.ReactElement {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedOnChange = useCallback(
    (newValue: string) => {
      const timeoutId = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
      return () => clearTimeout(timeoutId);
    },
    [onChange, debounceMs]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = (): void => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative">
      <Input
        icon={<SearchIcon />}
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-48 pr-8"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
