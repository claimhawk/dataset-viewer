/**
 * Read records service - reads and filters records from dataset JSONL files.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { getDatasetPath } from '@/libs/paths/generators-path.lib';
import type { DataRecord } from '../models/record.model';
import type { RecordsQuery } from '../value-objects/records-query.value-object';

/**
 * Read records from a dataset JSONL file with filtering.
 */
export async function readRecords(
  query: RecordsQuery
): Promise<{ records: DataRecord[]; total: number }> {
  const datasetPath = getDatasetPath(query.generator, query.dataset);
  const fileName = `${query.file ?? 'data'}.jsonl`;
  const filePath = path.join(datasetPath, fileName);

  if (!fs.existsSync(filePath)) {
    return { records: [], total: 0 };
  }

  const offset = query.offset ?? 0;
  const limit = query.limit ?? 1;
  const taskTypesFilter = query.taskTypes
    ? new Set(query.taskTypes.split(','))
    : null;
  const searchLower = query.search?.toLowerCase();

  const records: DataRecord[] = [];
  let total = 0;
  let currentIndex = 0;

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    let record: DataRecord;
    try {
      record = JSON.parse(line) as DataRecord;
    } catch {
      continue;
    }

    // Apply task type filter
    if (taskTypesFilter && !taskTypesFilter.has(record.metadata?.task_type)) {
      continue;
    }

    // Apply search filter
    if (searchLower) {
      const searchTarget = JSON.stringify(record).toLowerCase();
      if (!searchTarget.includes(searchLower)) {
        continue;
      }
    }

    total++;

    // Collect records in range
    if (currentIndex >= offset && records.length < limit) {
      records.push(record);
    }

    currentIndex++;
  }

  return { records, total };
}
