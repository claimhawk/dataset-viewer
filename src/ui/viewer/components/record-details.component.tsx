/**
 * Record details component - displays prompt, tool call, and metadata.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

'use client';

import { useState } from 'react';
import type { DataRecord } from '@/domain/datasets/models/record.model';
import type { ToolCall } from '@/domain/datasets/value-objects/tool-call.value-object';
import { extractPrompt, getActionLabel, getActionColor } from '@/domain/datasets/value-objects/tool-call.value-object';

interface RecordDetailsProps {
  record: DataRecord | null;
  toolCall: ToolCall | null;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
      >
        {title}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function formatCoordinate(coord: [number, number]): string {
  return `[${coord[0]}, ${coord[1]}]`;
}

export function RecordDetails({
  record,
  toolCall
}: RecordDetailsProps): JSX.Element {
  if (!record) {
    return (
      <aside className="w-96 border-l border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-500">
        No record selected
      </aside>
    );
  }

  const humanConv = record.conversations.find(c => c.from === 'human');
  const prompt = humanConv ? extractPrompt(humanConv.value) : '';

  return (
    <aside className="w-96 border-l border-zinc-800 bg-zinc-900 overflow-y-auto">
      {/* ID Header */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="text-xs text-zinc-500">Record ID</div>
        <div className="text-sm font-mono text-zinc-100">{record.id}</div>
      </div>

      {/* Prompt */}
      <Section title="Prompt">
        <p className="text-sm text-zinc-300 whitespace-pre-wrap">{prompt}</p>
      </Section>

      {/* Tool Call */}
      <Section title="Tool Call">
        {toolCall ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Action:</span>
              <span
                className="text-sm font-medium"
                style={{ color: getActionColor(toolCall.arguments.action) }}
              >
                {getActionLabel(toolCall.arguments.action)}
              </span>
            </div>
            {toolCall.arguments.coordinate && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Coordinate:</span>
                <span className="text-sm font-mono text-zinc-300">
                  {formatCoordinate(toolCall.arguments.coordinate)}
                </span>
              </div>
            )}
            {toolCall.arguments.text && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Text:</span>
                <span className="text-sm font-mono text-zinc-300">
                  &quot;{toolCall.arguments.text}&quot;
                </span>
              </div>
            )}
            {toolCall.arguments.pixels && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Pixels:</span>
                <span className="text-sm font-mono text-zinc-300">
                  {toolCall.arguments.pixels}
                </span>
              </div>
            )}
            {toolCall.arguments.keys && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Keys:</span>
                <span className="text-sm font-mono text-zinc-300">
                  {toolCall.arguments.keys.join(' + ')}
                </span>
              </div>
            )}
            <div className="mt-2 p-2 bg-zinc-800 rounded text-xs font-mono text-zinc-400 overflow-x-auto">
              <pre>{JSON.stringify(toolCall, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No tool call found</p>
        )}
      </Section>

      {/* Metadata */}
      <Section title="Metadata" defaultOpen={false}>
        <div className="space-y-2">
          {record.metadata.task_type && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Task Type:</span>
              <span className="text-sm text-green-400">{record.metadata.task_type}</span>
            </div>
          )}
          {record.metadata.real_coords && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Pixel Coords:</span>
              <span className="text-sm font-mono text-zinc-300">
                {formatCoordinate(record.metadata.real_coords)}
              </span>
            </div>
          )}
          <div className="mt-2 p-2 bg-zinc-800 rounded text-xs font-mono text-zinc-400 overflow-x-auto">
            <pre>{JSON.stringify(record.metadata, null, 2)}</pre>
          </div>
        </div>
      </Section>
    </aside>
  );
}
