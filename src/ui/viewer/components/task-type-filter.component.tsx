/**
 * Task type filter component - checkboxes for filtering by task type.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/ui/primitives/components/button.component';
import { Checkbox } from '@/ui/primitives/components/checkbox.component';

interface TaskTypeFilterProps {
  taskTypes: string[];
  activeTypes: Set<string>;
  onChange: (types: Set<string>) => void;
}

export function TaskTypeFilter({
  taskTypes,
  activeTypes,
  onChange
}: TaskTypeFilterProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (taskType: string): void => {
    const newTypes = new Set(activeTypes);
    if (newTypes.has(taskType)) {
      newTypes.delete(taskType);
    } else {
      newTypes.add(taskType);
    }
    onChange(newTypes);
  };

  const handleSelectAll = (): void => {
    onChange(new Set(taskTypes));
  };

  const handleClearAll = (): void => {
    onChange(new Set());
  };

  const activeCount = activeTypes.size;
  const totalCount = taskTypes.length;

  if (taskTypes.length === 0) {
    return <div />;
  }

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1"
      >
        <span>Tasks</span>
        {activeCount > 0 && activeCount < totalCount && (
          <span className="bg-blue-600 text-white text-xs px-1.5 rounded-full">
            {activeCount}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isExpanded && (
        <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 min-w-48 p-3">
          <div className="flex gap-2 mb-2 pb-2 border-b border-zinc-700">
            <Button variant="ghost" size="sm" onClick={handleSelectAll}>
              All
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              None
            </Button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {taskTypes.map((taskType) => (
              <Checkbox
                key={taskType}
                label={taskType}
                checked={activeTypes.has(taskType)}
                onChange={() => handleToggle(taskType)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
