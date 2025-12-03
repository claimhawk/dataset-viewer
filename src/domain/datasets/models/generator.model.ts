/**
 * Generator model - represents a dataset generator project.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import type { Dataset } from './dataset.model';

/** Generator with its associated datasets */
export interface Generator {
  name: string;
  datasets: Dataset[];
}
