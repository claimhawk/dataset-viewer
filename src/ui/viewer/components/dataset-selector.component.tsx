/**
 * Dataset selector component - generator and dataset dropdowns.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

'use client';

import { Select } from '@/ui/primitives/components/select.component';
import type { Generator } from '@/domain/datasets/models/generator.model';
import type { Dataset } from '@/domain/datasets/models/dataset.model';

interface DatasetSelectorProps {
  generators: Generator[];
  selectedGenerator: string;
  selectedDataset: string;
  onGeneratorChange: (generator: string) => void;
  onDatasetChange: (dataset: string) => void;
}

function formatTimestamp(timestamp: string): string {
  if (timestamp.length >= 15) {
    const date = timestamp.slice(0, 8);
    const time = timestamp.slice(9, 13);
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} ${time.slice(0, 2)}:${time.slice(2, 4)}`;
  }
  return timestamp;
}

function formatDatasetLabel(dataset: Dataset): string {
  const timestamp = formatTimestamp(dataset.timestamp);
  return `${dataset.researcher} - ${timestamp} (${dataset.recordCount.toLocaleString()})`;
}

export function DatasetSelector({
  generators,
  selectedGenerator,
  selectedDataset,
  onGeneratorChange,
  onDatasetChange
}: DatasetSelectorProps): JSX.Element {
  const generatorOptions = generators.map(g => ({
    value: g.name,
    label: g.name.replace('-generator', '')
  }));

  const currentGenerator = generators.find(g => g.name === selectedGenerator);
  const datasetOptions = (currentGenerator?.datasets ?? []).map(d => ({
    value: d.name,
    label: formatDatasetLabel(d)
  }));

  return (
    <div className="flex items-center gap-2">
      <Select
        options={generatorOptions}
        value={selectedGenerator}
        onChange={(e) => onGeneratorChange(e.target.value)}
        placeholder="Select generator..."
        className="w-40"
      />
      <Select
        options={datasetOptions}
        value={selectedDataset}
        onChange={(e) => onDatasetChange(e.target.value)}
        placeholder="Select dataset..."
        className="w-64"
        disabled={!selectedGenerator}
      />
    </div>
  );
}
