/**
 * Input component - reusable text input with optional icon.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({
  className = '',
  icon,
  ...props
}: InputProps): React.ReactElement {
  const baseStyles = 'bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  if (icon) {
    return (
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500">
          {icon}
        </span>
        <input
          className={`${baseStyles} pl-8 ${className}`}
          {...props}
        />
      </div>
    );
  }

  return (
    <input className={`${baseStyles} ${className}`} {...props} />
  );
}
