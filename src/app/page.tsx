/**
 * Landing page - displays list of generators with their datasets.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import Link from 'next/link';
import { listGenerators } from '@/domain/datasets/services/scan-generators.service';

export default function HomePage(): React.ReactElement {
  const generators = listGenerators();

  // Calculate totals
  const totalDatasets = generators.reduce((sum, g) => sum + g.datasets.length, 0);
  const totalRecords = generators.reduce(
    (sum, g) => sum + g.datasets.reduce((s, d) => s + d.recordCount, 0),
    0
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="h-12 border-b border-zinc-800 flex items-center px-4">
        <h1 className="text-base font-semibold">Dataset Viewer</h1>
        <span className="ml-4 text-xs text-zinc-500">
          {generators.length} generators · {totalDatasets} datasets · {totalRecords.toLocaleString()} records
        </span>
      </header>

      <main className="p-4">
        {generators.length === 0 ? (
          <p className="text-zinc-400">No generators found with datasets.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {generators.map((generator) => {
              const totalRecs = generator.datasets.reduce((s, d) => s + d.recordCount, 0);
              return (
                <Link
                  key={generator.name}
                  href={`/${generator.name}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="text-sm font-medium text-blue-400">
                    {generator.name.replace('-generator', '')}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {generator.datasets.length} dataset{generator.datasets.length !== 1 ? 's' : ''}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-zinc-200 tabular-nums">
                    {totalRecs.toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-600">records</div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
