/**
 * Dataset model - represents a training dataset.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

/** Dataset metadata */
export interface Dataset {
  name: string;
  generator: string;
  expert: string;
  researcher: string;
  timestamp: string;
  taskTypes: string[];
  recordCount: number;
}

/** Dataset config from config.json */
export interface DatasetConfig {
  name_prefix?: string;
  seed?: number;
  task_counts?: Record<string, number>;
  train_split?: number;
  task_distributions?: Record<string, Record<string, number>>;
  generated_at?: string;
}
