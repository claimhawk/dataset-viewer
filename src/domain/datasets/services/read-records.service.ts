/**
 * Read records service - reads records from dataset JSONL files.
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
 * Read a single record by line index (0-based).
 * Does not iterate the whole file - stops after finding the record.
 */
export async function readRecordByIndex(
  _generator: string,
  dataset: string,
  index: number,
  file: 'data' | 'train' | 'val' = 'data'
): Promise<DataRecord | null> {
  const datasetPath = getDatasetPath(dataset);
  const filePath = path.join(datasetPath, `${file}.jsonl`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;

    if (lineNum === index) {
      rl.close();
      fileStream.destroy();
      try {
        return JSON.parse(line) as DataRecord;
      } catch {
        return null;
      }
    }
    lineNum++;
  }

  return null;
}

/**
 * Find the next or previous record index matching the task type filter.
 * Returns null if no matching record is found.
 */
export async function findFilteredRecordIndex(
  _generator: string,
  dataset: string,
  currentIndex: number,
  direction: 'next' | 'prev',
  taskTypes: Set<string>,
  file: 'data' | 'train' | 'val' = 'data'
): Promise<number | null> {
  const datasetPath = getDatasetPath(dataset);
  const filePath = path.join(datasetPath, `${file}.jsonl`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  // For 'prev', we need to collect all matching indices before currentIndex
  // For 'next', we can stop as soon as we find one after currentIndex
  const matchingIndicesBefore: number[] = [];
  let lineNum = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    let record: DataRecord;
    try {
      record = JSON.parse(line) as DataRecord;
    } catch {
      lineNum++;
      continue;
    }

    const recordTaskType = record.metadata?.task_type;
    const matches = taskTypes.size === 0 || taskTypes.has(recordTaskType);

    if (matches) {
      if (direction === 'next' && lineNum > currentIndex) {
        rl.close();
        fileStream.destroy();
        return lineNum;
      }
      if (direction === 'prev' && lineNum < currentIndex) {
        matchingIndicesBefore.push(lineNum);
      }
    }

    lineNum++;
  }

  if (direction === 'prev' && matchingIndicesBefore.length > 0) {
    return matchingIndicesBefore[matchingIndicesBefore.length - 1];
  }

  return null;
}

/**
 * Read records from a dataset JSONL file with filtering.
 * Use sparingly - iterates the file for filtering/search.
 */
export async function readRecords(
  query: RecordsQuery
): Promise<{ records: DataRecord[]; total: number }> {
  const datasetPath = getDatasetPath(query.dataset);
  const fileName = `${query.file ?? 'data'}.jsonl`;
  const filePath = path.join(datasetPath, fileName);

  if (!fs.existsSync(filePath)) {
    return { records: [], total: 0 };
  }

  const offset = query.offset ?? 0;
  const limit = query.limit ?? 20;
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
