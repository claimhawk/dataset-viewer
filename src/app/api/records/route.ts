/**
 * API route: GET /api/records
 *
 * Returns filtered and paginated records from a dataset.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import { NextRequest, NextResponse } from 'next/server';
import { readRecords } from '@/domain/datasets/services/read-records.service';
import type { RecordsQuery } from '@/domain/datasets/value-objects/records-query.value-object';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const generator = searchParams.get('generator');
  const dataset = searchParams.get('dataset');

  if (!generator || !dataset) {
    return NextResponse.json(
      { error: 'generator and dataset parameters required' },
      { status: 400 }
    );
  }

  const query: RecordsQuery = {
    generator,
    dataset,
    offset: parseInt(searchParams.get('offset') ?? '0', 10),
    limit: parseInt(searchParams.get('limit') ?? '1', 10),
    taskTypes: searchParams.get('taskTypes') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    file: (searchParams.get('file') as 'data' | 'train' | 'val') ?? undefined
  };

  const result = await readRecords(query);

  return NextResponse.json({
    records: result.records,
    total: result.total,
    offset: query.offset,
    limit: query.limit
  });
}
