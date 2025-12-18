/**
 * Adapters config library - embedded configuration for Modal deployment.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

/**
 * Dataset naming delimiter.
 * Format: {expert}--{researcher}--{timestamp}
 */
const NAMING_DELIMITER = '--';

/**
 * Get the dataset naming delimiter.
 */
export function getNamingDelimiter(): string {
  return NAMING_DELIMITER;
}

/**
 * Map expert names to generator names.
 * Expert name is derived from dataset folder, generator adds "-generator" suffix.
 */
export function expertToGenerator(expertName: string): string {
  return `${expertName}-generator`;
}
