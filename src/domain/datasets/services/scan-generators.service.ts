/**
 * Scan datasets service - lists all datasets from Modal volume.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import fs from 'fs';
import path from 'path';
import { getDatasetsRoot, getDatasetPath } from '@/libs/paths/generators-path.lib';
import { getNamingDelimiter, expertToGenerator } from '@/libs/config/adapters-config.lib';
import type { Generator } from '../models/generator.model';
import type { Dataset, DatasetConfig } from '../models/dataset.model';

/**
 * Parse dataset folder name to extract components.
 * Format: {expert}--{researcher}--{timestamp}
 */
function parseDatasetName(folderName: string): {
  expert: string;
  researcher: string;
  timestamp: string;
} | null {
  const delimiter = getNamingDelimiter();

  // Try new format: expert--researcher--timestamp
  const parts = folderName.split(delimiter);
  if (parts.length >= 3) {
    return {
      expert: parts[0],
      researcher: parts[1],
      timestamp: parts.slice(2).join(delimiter)
    };
  }

  // Fallback to legacy format: expert-researcher-timestamp (single dash)
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
 * Scan data.jsonl to extract unique task types from metadata.
 * Fallback when config.json doesn't exist.
 */
function scanTaskTypesFromJsonl(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    const taskTypes = new Set<string>();

    for (const line of lines) {
      try {
        const record = JSON.parse(line);
        if (record.metadata?.task_type) {
          taskTypes.add(record.metadata.task_type);
        }
      } catch {
        // Skip malformed lines
      }
    }

    return Array.from(taskTypes).sort();
  } catch {
    return [];
  }
}

/**
 * List all datasets grouped by expert.
 * Returns Generator[] where each Generator represents an expert with its datasets.
 */
export function listGenerators(): Generator[] {
  const datasetsRoot = getDatasetsRoot();

  if (!fs.existsSync(datasetsRoot)) {
    console.error(`Datasets root not found: ${datasetsRoot}`);
    return [];
  }

  const entries = fs.readdirSync(datasetsRoot, { withFileTypes: true });

  // Group datasets by expert
  const expertMap = new Map<string, Dataset[]>();

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      continue;
    }

    const parsed = parseDatasetName(entry.name);
    if (!parsed) {
      continue;
    }

    const datasetPath = getDatasetPath(entry.name);
    const config = readDatasetConfig(datasetPath);
    const dataJsonlPath = path.join(datasetPath, 'data.jsonl');

    // Get task types from config, or scan jsonl as fallback
    let taskTypes = config?.task_types
      ?? (config?.task_counts ? Object.keys(config.task_counts) : []);

    // Fallback: scan data.jsonl for task types if config doesn't have them
    if (taskTypes.length === 0) {
      taskTypes = scanTaskTypesFromJsonl(dataJsonlPath);
    }

    // Count records from data.jsonl
    const recordCount = countJsonlLines(dataJsonlPath);

    const dataset: Dataset = {
      name: entry.name,
      generator: expertToGenerator(parsed.expert),
      expert: parsed.expert,
      researcher: parsed.researcher,
      timestamp: parsed.timestamp,
      taskTypes,
      recordCount
    };

    // Group by expert
    const existing = expertMap.get(parsed.expert) || [];
    existing.push(dataset);
    expertMap.set(parsed.expert, existing);
  }

  // Convert to Generator array
  const generators: Generator[] = [];
  for (const [expertName, datasets] of expertMap) {
    // Sort datasets by timestamp descending (newest first)
    datasets.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    generators.push({
      name: expertToGenerator(expertName),
      datasets
    });
  }

  // Sort by generator name
  generators.sort((a, b) => a.name.localeCompare(b.name));

  return generators;
}

/**
 * List datasets for a specific expert/generator.
 */
export function listGeneratorDatasets(generatorName: string): Dataset[] {
  const allGenerators = listGenerators();
  const generator = allGenerators.find(g => g.name === generatorName);
  return generator?.datasets || [];
}
