/**
 * Dataset path library - path utilities for locating datasets on Modal volume.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import path from 'path';

/**
 * Root path for datasets on Modal volume.
 * Volume is mounted at /datasets, datasets are at /training-data/datasets/
 */
const DATASETS_ROOT = '/datasets/training-data/datasets';

/**
 * Get the root path for all datasets.
 */
export function getDatasetsRoot(): string {
  return DATASETS_ROOT;
}

/**
 * Get path to a specific dataset directory.
 * Datasets are stored flat: {expert}--{researcher}--{timestamp}/
 */
export function getDatasetPath(datasetName: string): string {
  return path.join(DATASETS_ROOT, datasetName);
}

/**
 * Get path to an image within a dataset.
 */
export function getImagePath(datasetName: string, imagePath: string): string {
  return path.join(getDatasetPath(datasetName), imagePath);
}

/**
 * Extract expert name from dataset name.
 * Dataset format: {expert}--{researcher}--{timestamp}
 */
export function extractExpertFromDatasetName(datasetName: string): string {
  const delimiter = '--';
  const parts = datasetName.split(delimiter);
  return parts[0] || datasetName;
}
