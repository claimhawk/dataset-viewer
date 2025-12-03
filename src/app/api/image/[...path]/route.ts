/**
 * API route: GET /api/image/[...path]
 *
 * Serves images from dataset directories.
 * Path format: /api/image/{generator}/{dataset}/{image_path}
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getGeneratorsPath } from '@/libs/paths/generators-path.lib';

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const pathParts = (await params).path;

  if (pathParts.length < 3) {
    return NextResponse.json(
      { error: 'Invalid path format' },
      { status: 400 }
    );
  }

  const [generator, dataset, ...imageParts] = pathParts;
  const imagePath = imageParts.join('/');

  // Construct full path
  const fullPath = path.join(
    getGeneratorsPath(),
    generator,
    'datasets',
    dataset,
    imagePath
  );

  // Security: Ensure path is within generators directory
  const generatorsPath = getGeneratorsPath();
  const resolvedPath = path.resolve(fullPath);
  if (!resolvedPath.startsWith(generatorsPath)) {
    return NextResponse.json(
      { error: 'Invalid path' },
      { status: 403 }
    );
  }

  // Check file exists
  if (!fs.existsSync(resolvedPath)) {
    return NextResponse.json(
      { error: 'Image not found' },
      { status: 404 }
    );
  }

  // Read file and determine content type
  const buffer = fs.readFileSync(resolvedPath);
  const ext = path.extname(resolvedPath).toLowerCase();

  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };

  const contentType = contentTypes[ext] ?? 'application/octet-stream';

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
