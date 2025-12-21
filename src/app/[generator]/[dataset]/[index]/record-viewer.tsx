/**
 * Record viewer client component - handles navigation and display.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImageViewer } from '@/ui/viewer/components/image-viewer.component';
import { RecordDetails } from '@/ui/viewer/components/record-details.component';
import { RecordNavUrl } from './record-nav-url';
import { Input } from '@/ui/primitives/components/input.component';
import { parseToolCall } from '@/domain/datasets/value-objects/tool-call.value-object';
import type { DataRecord } from '@/domain/datasets/models/record.model';
import type { Dataset } from '@/domain/datasets/models/dataset.model';
import type { ToolCall } from '@/domain/datasets/value-objects/tool-call.value-object';

interface RecordViewerProps {
  generator: string;
  dataset: string;
  datasetInfo: Dataset;
  currentIndex: number;
  totalCount: number;
  record: DataRecord | null;
  initialFilter?: string[];
}

export function RecordViewer({
  generator,
  dataset,
  datasetInfo,
  currentIndex,
  totalCount,
  record,
  initialFilter
}: RecordViewerProps): React.ReactElement {
  const router = useRouter();
  const [jumpValue, setJumpValue] = useState('');

  // Client-side task type filter state - initialized from URL or all active
  // If initialFilter is empty or has invalid types, default to all
  const [activeTaskTypes, setActiveTaskTypes] = useState<Set<string>>(() => {
    if (!initialFilter || initialFilter.length === 0) {
      return new Set(datasetInfo.taskTypes);
    }
    // Filter to only valid task types that exist in this dataset
    const validTypes = initialFilter.filter(t => datasetInfo.taskTypes.includes(t));
    // If no valid types remain, default to all
    return validTypes.length > 0 ? new Set(validTypes) : new Set(datasetInfo.taskTypes);
  });

  // Check if all task types are active
  const allActive = activeTaskTypes.size === datasetInfo.taskTypes.length;
  const noneActive = activeTaskTypes.size === 0;

  // Check if current record's task type is filtered out
  const currentTaskType = record?.metadata?.task_type;
  const isFilteredOut = currentTaskType && !activeTaskTypes.has(currentTaskType);

  // Parse tool call from record
  const toolCall: ToolCall | null = useMemo(() => {
    if (!record) return null;
    const gptConv = record.conversations.find(c => c.from === 'gpt');
    if (!gptConv) return null;
    return parseToolCall(gptConv.value);
  }, [record]);

  // Store active task types in URL to persist across navigation
  const buildUrlWithFilters = useCallback((index: number): string => {
    if (allActive || activeTaskTypes.size === 0) {
      return `/${generator}/${dataset}/${index}`;
    }
    const params = new URLSearchParams();
    params.set('filter', Array.from(activeTaskTypes).join(','));
    return `/${generator}/${dataset}/${index}?${params.toString()}`;
  }, [generator, dataset, activeTaskTypes, allActive]);

  // Track if we're currently navigating
  const [isNavigating, setIsNavigating] = useState(false);

  // Navigate to next/prev record matching the filter
  const navigateFiltered = useCallback(async (direction: 'next' | 'prev'): Promise<void> => {
    if (isNavigating) return;

    // If all types selected or none filtered, just go to adjacent index
    if (allActive || activeTaskTypes.size === 0) {
      const nextIdx = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      if (nextIdx >= 0 && nextIdx < totalCount) {
        router.push(buildUrlWithFilters(nextIdx));
      }
      return;
    }

    // Otherwise, call API to find next matching record
    setIsNavigating(true);
    try {
      const params = new URLSearchParams({
        generator,
        dataset,
        currentIndex: currentIndex.toString(),
        direction,
        filter: Array.from(activeTaskTypes).join(',')
      });

      const response = await fetch(`/api/navigate?${params.toString()}`);
      const data = await response.json();

      if (data.index !== null) {
        router.push(buildUrlWithFilters(data.index));
      }
    } finally {
      setIsNavigating(false);
    }
  }, [isNavigating, allActive, activeTaskTypes, currentIndex, totalCount, generator, dataset, router, buildUrlWithFilters]);

  // Navigation handlers
  const handlePrev = useCallback((): void => {
    navigateFiltered('prev');
  }, [navigateFiltered]);

  const handleNext = useCallback((): void => {
    navigateFiltered('next');
  }, [navigateFiltered]);

  // Helper to update URL with new filter
  const updateUrlWithFilter = useCallback((newTypes: Set<string>): void => {
    const allSelected = newTypes.size === datasetInfo.taskTypes.length;
    if (allSelected || newTypes.size === 0) {
      router.replace(`/${generator}/${dataset}/${currentIndex}`, { scroll: false });
    } else {
      const params = new URLSearchParams();
      params.set('filter', Array.from(newTypes).join(','));
      router.replace(`/${generator}/${dataset}/${currentIndex}?${params.toString()}`, { scroll: false });
    }
  }, [router, generator, dataset, currentIndex, datasetInfo.taskTypes.length]);

  // Filter handlers - update both state and URL
  const handleTaskTypeToggle = useCallback((taskType: string): void => {
    setActiveTaskTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskType)) {
        newSet.delete(taskType);
      } else {
        newSet.add(taskType);
      }
      updateUrlWithFilter(newSet);
      return newSet;
    });
  }, [updateUrlWithFilter]);

  const handleSelectAll = useCallback((): void => {
    const allTypes = new Set(datasetInfo.taskTypes);
    setActiveTaskTypes(allTypes);
    updateUrlWithFilter(allTypes);
  }, [datasetInfo.taskTypes, updateUrlWithFilter]);

  const handleSelectNone = useCallback((): void => {
    const emptySet = new Set<string>();
    setActiveTaskTypes(emptySet);
    updateUrlWithFilter(emptySet);
  }, [updateUrlWithFilter]);

  const handleClearFilters = useCallback((): void => {
    const allTypes = new Set(datasetInfo.taskTypes);
    setActiveTaskTypes(allTypes);
    updateUrlWithFilter(allTypes);
  }, [datasetInfo.taskTypes, updateUrlWithFilter]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Build image URL
  const imageSrc = record
    ? `/api/image/${generator}/${dataset}/${record.image}`
    : null;

  // Get image size, tolerance, and real coords from metadata
  const imageSize = record?.metadata?.image_size as [number, number] | undefined;
  const tolerance = record?.metadata?.tolerance as [number, number] | undefined;
  const realCoords = record?.metadata?.real_coords as [number, number] | undefined;

  const displayName = generator.replace('-generator', '');

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Top Bar */}
      <header className="h-12 border-b border-zinc-800 flex items-center px-4 gap-3 shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/" className="text-zinc-400 hover:text-zinc-200 text-sm">
            Home
          </Link>
          <span className="text-zinc-600">/</span>
          <Link
            href={`/${generator}`}
            className="text-zinc-400 hover:text-zinc-200 text-sm"
          >
            {displayName}
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-100 text-sm font-medium">
            {datasetInfo.researcher}
          </span>
        </div>

        {/* Clear Filters */}
        {!allActive && (
          <button
            onClick={handleClearFilters}
            className="text-xs px-2 py-1 ml-4 text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded"
            title="Clear filters"
          >
            Clear filters ✕
          </button>
        )}

        {/* Jump to Index */}
        <div>
          <Input
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            placeholder="Go to #"
            className="w-20 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const idx = parseInt(jumpValue, 10);
                if (!isNaN(idx) && idx >= 0 && idx < totalCount) {
                  router.push(buildUrlWithFilters(idx));
                  setJumpValue('');
                }
              }
            }}
          />
        </div>

        <div className="flex-1" />

        <RecordNavUrl
          currentIndex={currentIndex}
          totalCount={totalCount}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </header>

      {/* Task Type Subheader */}
      {datasetInfo.taskTypes.length > 0 && (
        <div className="h-10 border-b border-zinc-800 flex items-center px-4 gap-2 shrink-0 bg-zinc-900/50 overflow-x-auto">
          <button
            onClick={handleSelectAll}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              allActive
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            All
          </button>
          <button
            onClick={handleSelectNone}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              noneActive
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            None
          </button>
          <span className="text-zinc-600 mx-1">|</span>
          {datasetInfo.taskTypes.map((taskType) => (
            <button
              key={taskType}
              onClick={() => handleTaskTypeToggle(taskType)}
              className={`text-xs px-2 py-1 rounded transition-colors whitespace-nowrap ${
                activeTaskTypes.has(taskType)
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
              }`}
            >
              {taskType}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Image Panel */}
        <div className="flex-1 p-4 flex flex-col">
          {isFilteredOut ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8 bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="text-zinc-400 text-lg mb-2">Task Type Filtered Out</div>
                <div className="text-zinc-500 text-sm mb-4">
                  This record&apos;s task type <span className="text-blue-400 font-medium">{currentTaskType}</span> is not in your current filter.
                </div>
                <button
                  onClick={() => handleTaskTypeToggle(currentTaskType as string)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                >
                  Enable {currentTaskType}
                </button>
              </div>
            </div>
          ) : (
            <ImageViewer
              imageSrc={imageSrc}
              toolCall={toolCall}
              imageSize={imageSize}
              tolerance={tolerance}
              realCoords={realCoords}
            />
          )}
        </div>

        {/* Details Panel */}
        <RecordDetails
          record={record}
          toolCall={toolCall}
        />
      </main>
    </div>
  );
}
