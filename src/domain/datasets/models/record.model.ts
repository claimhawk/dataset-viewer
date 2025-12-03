/**
 * Record model - represents a training record from JSONL.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

/** Training record from JSONL */
export interface DataRecord {
  id: string;
  image: string;
  conversations: Conversation[];
  metadata: RecordMetadata;
}

/** Conversation turn in a record */
export interface Conversation {
  from: 'human' | 'gpt';
  value: string;
}

/** Record metadata */
export interface RecordMetadata {
  task_type: string;
  real_coords?: [number, number];
  image_size?: [number, number];
  [key: string]: unknown;
}

/** Test record from test.json */
export interface TestRecord {
  test_id: string;
  screenshot: string;
  prompt: string;
  expected_action: {
    name: string;
    arguments: Record<string, unknown>;
  };
  tolerance: [number, number];
  metadata: RecordMetadata;
}
