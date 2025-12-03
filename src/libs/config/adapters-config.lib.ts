/**
 * Adapters config library - loads adapters.yaml configuration.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import fs from 'fs';
import { parse } from 'yaml';
import { getAdaptersConfigPath } from '@/libs/paths/generators-path.lib';

interface ExpertConfig {
  label: number;
  description: string;
  generator: string | null;
}

interface AdaptersConfig {
  experts: Record<string, ExpertConfig>;
  naming: {
    expert_pattern: string;
    delimiter: string;
    timestamp_format: string;
  };
}

let cachedConfig: AdaptersConfig | null = null;

/**
 * Load and parse adapters.yaml config.
 */
export function loadAdaptersConfig(): AdaptersConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = getAdaptersConfigPath();
  const content = fs.readFileSync(configPath, 'utf-8');
  cachedConfig = parse(content) as AdaptersConfig;
  return cachedConfig;
}

/**
 * Get mapping of expert names to their generator names.
 */
export function getExpertGeneratorMap(): Map<string, string> {
  const config = loadAdaptersConfig();
  const map = new Map<string, string>();

  for (const [expertName, expertConfig] of Object.entries(config.experts)) {
    if (expertConfig.generator) {
      map.set(expertName, expertConfig.generator);
    }
  }

  return map;
}

/**
 * Get list of unique generator names that have datasets.
 */
export function getGeneratorNames(): string[] {
  const config = loadAdaptersConfig();
  const generators = new Set<string>();

  for (const expertConfig of Object.values(config.experts)) {
    if (expertConfig.generator) {
      generators.add(expertConfig.generator);
    }
  }

  return Array.from(generators).sort();
}

/**
 * Get the dataset naming delimiter (typically "--").
 */
export function getNamingDelimiter(): string {
  const config = loadAdaptersConfig();
  return config.naming?.delimiter ?? '--';
}
