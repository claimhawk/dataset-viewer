/**
 * Records query value object - represents query parameters for records endpoint.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

/** Query parameters for records endpoint */
export interface RecordsQuery {
  generator: string;
  dataset: string;
  offset?: number;
  limit?: number;
  taskTypes?: string;
  search?: string;
  file?: 'data' | 'train' | 'val';
}
