/**
 * Checkbox component - reusable checkbox with label.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

'use client';

import { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Checkbox({
  label,
  className = '',
  ...props
}: CheckboxProps): JSX.Element {
  return (
    <label className={`flex items-center gap-2 text-sm text-zinc-300 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
        {...props}
      />
      {label}
    </label>
  );
}
