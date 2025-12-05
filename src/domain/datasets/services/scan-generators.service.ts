/**
 * Scan generators service - lists all generators and their datasets.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import fs from 'fs';
import path from 'path';
import { getGeneratorsPath, getGeneratorDatasetsPath } from '@/libs/paths/generators-path.lib';
import { getNamingDelimiter } from '@/libs/config/adapters-config.lib';
import type { Generator } from '../models/generator.model';
import type { Dataset, DatasetConfig } from '../models/dataset.model';

/**
 * Parse dataset folder name to extract components.
 * Handles both "--" delimiter (new) and "-" delimiter (legacy).
 */
function parseDatasetName(folderName: string): {
  expert: string;
  researcher: string;
  timestamp: string;
} | null {
  const delimiter = getNamingDelimiter();

  // Try new format first: expert--researcher--timestamp
  const newParts = folderName.split(delimiter);
  if (newParts.length >= 3) {
    return {
      expert: newParts[0],
      researcher: newParts[1],
      timestamp: newParts.slice(2).join(delimiter)
    };
  }

  // Fallback to legacy format: expert-researcher-timestamp (single dash)
  // Find the timestamp at the end (YYYYMMDD_HHMMSS pattern)
  const timestampMatch = folderName.match(/_?(\d{8}_\d{6})$/);
  if (timestampMatch) {
    const timestamp = timestampMatch[1];
    const prefix = folderName.slice(0, -timestampMatch[0].length);
    const lastDash = prefix.lastIndexOf('-');

    if (lastDash > 0) {
      return {
        expert: prefix.slice(0, lastDash),
        researcher: prefix.slice(lastDash + 1),
        timestamp
      };
    }
  }

  return null;
}

/**
 * Read dataset config.json file.
 */
function readDatasetConfig(datasetPath: string): DatasetConfig | null {
  const configPath = path.join(datasetPath, 'config.json');
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as DatasetConfig;
  } catch {
    return null;
  }
}

/**
 * Count lines in a JSONL file.
 */
function countJsonlLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').filter(line => line.trim()).length;
  } catch {
    return 0;
  }
}

/**
 * List all datasets for a specific generator.
 */
export function listGeneratorDatasets(generatorName: string): Dataset[] {
  const datasetsPath = getGeneratorDatasetsPath(generatorName);

  if (!fs.existsSync(datasetsPath)) {
    return [];
  }

  const entries = fs.readdirSync(datasetsPath, { withFileTypes: true });
  const datasets: Dataset[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      continue;
    }

    const parsed = parseDatasetName(entry.name);
    if (!parsed) {
      continue;
    }

    const datasetPath = path.join(datasetsPath, entry.name);
    const config = readDatasetConfig(datasetPath);

    // Get task types from config (supports both task_types array and task_counts object)
    const taskTypes = config?.task_types
      ?? (config?.task_counts ? Object.keys(config.task_counts) : []);

    // Count records from data.jsonl
    const dataJsonlPath = path.join(datasetPath, 'data.jsonl');
    const recordCount = countJsonlLines(dataJsonlPath);

    datasets.push({
      name: entry.name,
      generator: generatorName,
      expert: parsed.expert,
      researcher: parsed.researcher,
      timestamp: parsed.timestamp,
      taskTypes,
      recordCount
    });
  }

  // Sort by timestamp descending (newest first)
  datasets.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return datasets;
}

/**
 * List all generators that have datasets.
 */
export function listGenerators(): Generator[] {
  const generatorsPath = getGeneratorsPath();

  if (!fs.existsSync(generatorsPath)) {
    return [];
  }

  const entries = fs.readdirSync(generatorsPath, { withFileTypes: true });
  const generators: Generator[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      continue;
    }

    // Check if this generator has a datasets folder
    const datasetsPath = path.join(generatorsPath, entry.name, 'datasets');
    if (!fs.existsSync(datasetsPath)) {
      continue;
    }

    const datasets = listGeneratorDatasets(entry.name);
    if (datasets.length > 0) {
      generators.push({
        name: entry.name,
        datasets
      });
    }
  }

  // Sort by generator name
  generators.sort((a, b) => a.name.localeCompare(b.name));

  return generators;
}
