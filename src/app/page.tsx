/**
 * Dataset Viewer main page.
 *
 * Displays training datasets with filtering, search, and image annotation.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { DatasetSelector } from '@/ui/viewer/components/dataset-selector.component';
import { TaskTypeFilter } from '@/ui/viewer/components/task-type-filter.component';
import { SearchField } from '@/ui/viewer/components/search-field.component';
import { RecordNav } from '@/ui/viewer/components/record-nav.component';
import { ImageViewer } from '@/ui/viewer/components/image-viewer.component';
import { RecordDetails } from '@/ui/viewer/components/record-details.component';
import { parseToolCall } from '@/domain/datasets/value-objects/tool-call.value-object';
import type { Generator } from '@/domain/datasets/models/generator.model';
import type { DataRecord } from '@/domain/datasets/models/record.model';
import type { ToolCall } from '@/domain/datasets/value-objects/tool-call.value-object';

interface DatasetsResponse {
  generators: Generator[];
}

interface RecordsResponse {
  records: DataRecord[];
  total: number;
}

export default function DatasetViewerPage(): JSX.Element {
  // Dataset selection state
  const [generators, setGenerators] = useState<Generator[]>([]);
  const [selectedGenerator, setSelectedGenerator] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');

  // Filter state
  const [taskTypes, setTaskTypes] = useState<string[]>([]);
  const [activeTaskTypes, setActiveTaskTypes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Record state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [record, setRecord] = useState<DataRecord | null>(null);
  const [toolCall, setToolCall] = useState<ToolCall | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch generators on mount
  useEffect(() => {
    fetchGenerators();
  }, []);

  const fetchGenerators = async (): Promise<void> => {
    try {
      const res = await fetch('/api/datasets');
      const data: DatasetsResponse = await res.json();
      setGenerators(data.generators);
    } catch (error) {
      console.error('Failed to fetch generators:', error);
    }
  };

  // Fetch record when selection changes
  const fetchRecord = useCallback(async (): Promise<void> => {
    if (!selectedGenerator || !selectedDataset) {
      setRecord(null);
      setToolCall(null);
      setTotalCount(0);
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        generator: selectedGenerator,
        dataset: selectedDataset,
        offset: currentIndex.toString(),
        limit: '1'
      });

      if (activeTaskTypes.size > 0 && activeTaskTypes.size < taskTypes.length) {
        params.set('taskTypes', Array.from(activeTaskTypes).join(','));
      }

      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const res = await fetch(`/api/records?${params}`);
      const data: RecordsResponse = await res.json();

      setTotalCount(data.total);

      if (data.records.length > 0) {
        const rec = data.records[0];
        setRecord(rec);

        // Parse tool call from GPT response
        const gptConv = rec.conversations.find(c => c.from === 'gpt');
        if (gptConv) {
          setToolCall(parseToolCall(gptConv.value));
        } else {
          setToolCall(null);
        }
      } else {
        setRecord(null);
        setToolCall(null);
      }
    } catch (error) {
      console.error('Failed to fetch record:', error);
      setRecord(null);
      setToolCall(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedGenerator,
    selectedDataset,
    currentIndex,
    activeTaskTypes,
    taskTypes.length,
    searchQuery
  ]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  // Handle generator change
  const handleGeneratorChange = (generator: string): void => {
    setSelectedGenerator(generator);
    setSelectedDataset('');
    setTaskTypes([]);
    setActiveTaskTypes(new Set());
    setCurrentIndex(0);
  };

  // Handle dataset change
  const handleDatasetChange = (dataset: string): void => {
    setSelectedDataset(dataset);
    setCurrentIndex(0);

    // Get task types from selected dataset
    const gen = generators.find(g => g.name === selectedGenerator);
    const ds = gen?.datasets.find(d => d.name === dataset);
    if (ds) {
      setTaskTypes(ds.taskTypes);
      setActiveTaskTypes(new Set(ds.taskTypes));
    }
  };

  // Handle filter changes
  const handleTaskTypesChange = (types: Set<string>): void => {
    setActiveTaskTypes(types);
    setCurrentIndex(0);
  };

  const handleSearchChange = (query: string): void => {
    setSearchQuery(query);
    setCurrentIndex(0);
  };

  // Navigation handlers
  const handlePrev = useCallback((): void => {
    setCurrentIndex(i => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback((): void => {
    setCurrentIndex(i => Math.min(totalCount - 1, i + 1));
  }, [totalCount]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Build image URL
  const imageSrc = record
    ? `/api/image/${selectedGenerator}/${selectedDataset}/${record.image}`
    : null;

  // Get image size from metadata if available
  const imageSize = record?.metadata?.image_size as [number, number] | undefined;

  // Get tolerance from metadata if available
  const tolerance = record?.metadata?.tolerance as [number, number] | undefined;

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Top Bar */}
      <header className="h-14 border-b border-zinc-800 flex items-center px-4 gap-4 shrink-0">
        <h1 className="text-lg font-semibold text-zinc-100 mr-2">
          Dataset Viewer
        </h1>

        <DatasetSelector
          generators={generators}
          selectedGenerator={selectedGenerator}
          selectedDataset={selectedDataset}
          onGeneratorChange={handleGeneratorChange}
          onDatasetChange={handleDatasetChange}
        />

        <TaskTypeFilter
          taskTypes={taskTypes}
          activeTypes={activeTaskTypes}
          onChange={handleTaskTypesChange}
        />

        <SearchField
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <div className="flex-1" />

        <RecordNav
          currentIndex={currentIndex}
          totalCount={totalCount}
          onPrev={handlePrev}
          onNext={handleNext}
          isLoading={isLoading}
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Image Panel */}
        <div className="flex-1 p-4 flex flex-col">
          <ImageViewer
            imageSrc={imageSrc}
            toolCall={toolCall}
            imageSize={imageSize}
            tolerance={tolerance}
          />
        </div>

        {/* Details Panel */}
        <RecordDetails
          record={record}
          toolCall={toolCall}
        />
      </main>
    </div>
  );
}
