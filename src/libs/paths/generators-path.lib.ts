/**
 * Generators path library - path utilities for locating datasets.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import path from 'path';

/**
 * Get the repository root path.
 * Walks up from current directory to find the root.
 */
export function getRepoRoot(): string {
  // In Next.js, process.cwd() is the project root
  // We need to go up to the repo root (projects/dataset-viewer -> repo root)
  return path.resolve(process.cwd(), '..', '..');
}

/**
 * Get path to adapters.yaml config file.
 */
export function getAdaptersConfigPath(): string {
  return path.join(getRepoRoot(), 'config', 'adapters.yaml');
}

/**
 * Get path to generators directory.
 */
export function getGeneratorsPath(): string {
  return path.join(getRepoRoot(), 'projects', 'generators');
}

/**
 * Get path to a specific generator's datasets directory.
 */
export function getGeneratorDatasetsPath(generatorName: string): string {
  return path.join(getGeneratorsPath(), generatorName, 'datasets');
}

/**
 * Get path to a specific dataset directory.
 */
export function getDatasetPath(
  generatorName: string,
  datasetName: string
): string {
  return path.join(getGeneratorDatasetsPath(generatorName), datasetName);
}

/**
 * Get path to an image within a dataset.
 */
export function getImagePath(
  generatorName: string,
  datasetName: string,
  imagePath: string
): string {
  return path.join(getDatasetPath(generatorName, datasetName), imagePath);
}
