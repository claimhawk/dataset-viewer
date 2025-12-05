/**
 * Navigate API - finds next/prev record matching task type filter.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import { NextRequest, NextResponse } from 'next/server';
import { findFilteredRecordIndex } from '@/domain/datasets/services/read-records.service';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const generator = searchParams.get('generator');
  const dataset = searchParams.get('dataset');
  const currentIndexStr = searchParams.get('currentIndex');
  const direction = searchParams.get('direction') as 'next' | 'prev';
  const filterStr = searchParams.get('filter');

  if (!generator || !dataset || !currentIndexStr || !direction) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const currentIndex = parseInt(currentIndexStr, 10);
  if (isNaN(currentIndex)) {
    return NextResponse.json({ error: 'Invalid currentIndex' }, { status: 400 });
  }

  // Parse filter - empty string or missing means all types (no filtering)
  const taskTypes = filterStr
    ? new Set(filterStr.split(',').filter(Boolean))
    : new Set<string>();

  const nextIndex = await findFilteredRecordIndex(
    generator,
    dataset,
    currentIndex,
    direction,
    taskTypes
  );

  return NextResponse.json({ index: nextIndex });
}
