/**
 * Select component - reusable dropdown select.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

'use client';

import { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  options,
  placeholder,
  className = '',
  ...props
}: SelectProps): React.ReactElement {
  const baseStyles = 'bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <select className={`${baseStyles} ${className}`} {...props}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
