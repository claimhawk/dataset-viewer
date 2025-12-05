/**
 * Record viewer page - displays a specific record from a dataset.
 *
 * URL: /[generator]/[dataset]/[index]?filter=task1,task2
 * Task type filtering persists in URL.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import { notFound } from 'next/navigation';
import { listGeneratorDatasets } from '@/domain/datasets/services/scan-generators.service';
import { readRecordByIndex } from '@/domain/datasets/services/read-records.service';
import { RecordViewer } from './record-viewer';

interface RecordPageProps {
  params: Promise<{
    generator: string;
    dataset: string;
    index: string;
  }>;
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default async function RecordPage({
  params,
  searchParams
}: RecordPageProps): Promise<React.ReactElement> {
  const { generator, dataset, index: indexStr } = await params;
  const { filter } = await searchParams;

  const index = parseInt(indexStr, 10);
  if (isNaN(index) || index < 0) {
    notFound();
  }

  // Get dataset info (includes cached record count)
  const datasets = listGeneratorDatasets(generator);
  const datasetInfo = datasets.find(d => d.name === dataset);
  if (!datasetInfo) {
    notFound();
  }

  // Index out of range
  if (index >= datasetInfo.recordCount) {
    notFound();
  }

  // Parse filter from URL - if not present, all task types are active
  const initialFilter = filter ? filter.split(',') : undefined;

  // Fetch just this one record by line number
  const record = await readRecordByIndex(generator, dataset, index);

  return (
    <RecordViewer
      generator={generator}
      dataset={dataset}
      datasetInfo={datasetInfo}
      currentIndex={index}
      totalCount={datasetInfo.recordCount}
      record={record}
      initialFilter={initialFilter}
    />
  );
}
