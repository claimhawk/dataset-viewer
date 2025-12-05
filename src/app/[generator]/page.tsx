/**
 * Generator page - displays datasets for a specific generator.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listGeneratorDatasets } from '@/domain/datasets/services/scan-generators.service';

interface GeneratorPageProps {
  params: Promise<{ generator: string }>;
}

function formatTimestamp(timestamp: string): string {
  if (timestamp.length >= 15) {
    const date = timestamp.slice(0, 8);
    const time = timestamp.slice(9, 13);
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} ${time.slice(0, 2)}:${time.slice(2, 4)}`;
  }
  return timestamp;
}

export default async function GeneratorPage({
  params
}: GeneratorPageProps): Promise<React.ReactElement> {
  const { generator } = await params;
  const datasets = listGeneratorDatasets(generator);

  if (datasets.length === 0) {
    notFound();
  }

  const displayName = generator.replace('-generator', '');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="h-14 border-b border-zinc-800 flex items-center px-6 gap-4">
        <Link href="/" className="text-zinc-400 hover:text-zinc-200">
          Dataset Viewer
        </Link>
        <span className="text-zinc-600">/</span>
        <h1 className="text-lg font-semibold">{displayName}</h1>
      </header>

      <main className="p-6">
        <h2 className="text-xl font-medium mb-6">
          Datasets ({datasets.length})
        </h2>

        <div className="grid gap-3">
          {datasets.map((dataset) => (
            <Link
              key={dataset.name}
              href={`/${generator}/${dataset.name}`}
              className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{dataset.researcher}</div>
                <div className="text-sm text-zinc-500 mt-1">
                  {formatTimestamp(dataset.timestamp)}
                </div>
                {dataset.taskTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dataset.taskTypes.map((type) => (
                      <span
                        key={type}
                        className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-400"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-medium">
                  {dataset.recordCount.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500">records</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
