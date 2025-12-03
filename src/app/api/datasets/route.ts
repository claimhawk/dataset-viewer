/**
 * API route: GET /api/datasets
 *
 * Returns list of all generators and their datasets.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import { NextResponse } from 'next/server';
import { listGenerators } from '@/domain/datasets/services/scan-generators.service';

export async function GET(): Promise<NextResponse> {
  const generators = listGenerators();
  return NextResponse.json({ generators });
}
