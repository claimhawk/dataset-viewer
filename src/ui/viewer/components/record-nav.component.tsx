/**
 * Record navigation component - prev/next buttons with counter.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

'use client';

import { Button } from '@/ui/primitives/components/button.component';

interface RecordNavProps {
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function RecordNav({
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  isLoading = false
}: RecordNavProps): JSX.Element {
  const canPrev = currentIndex > 0 && !isLoading;
  const canNext = currentIndex < totalCount - 1 && !isLoading;
  const displayIndex = totalCount > 0 ? currentIndex + 1 : 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous record"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      <span className="text-sm text-zinc-400 min-w-32 text-center">
        {isLoading ? (
          'Loading...'
        ) : totalCount > 0 ? (
          <>
            Record <span className="text-zinc-100">{displayIndex.toLocaleString()}</span> of{' '}
            <span className="text-zinc-100">{totalCount.toLocaleString()}</span>
          </>
        ) : (
          'No records'
        )}
      </span>

      <Button
        variant="secondary"
        size="sm"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next record"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}
