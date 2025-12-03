/**
 * Tool call value object - represents a parsed tool call from GPT response.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

/** Parsed tool call from GPT response */
export interface ToolCall {
  name: string;
  arguments: ToolCallArguments;
}

/** Tool call arguments */
export interface ToolCallArguments {
  action: string;
  coordinate?: [number, number];
  text?: string;
  keys?: string[];
  pixels?: number;
  time?: number;
  status?: string;
}

/** Action labels for human-readable display */
const ACTION_LABELS: Record<string, string> = {
  left_click: 'Left Click',
  right_click: 'Right Click',
  double_click: 'Double Click',
  middle_click: 'Middle Click',
  triple_click: 'Triple Click',
  mouse_move: 'Mouse Move',
  left_click_drag: 'Click & Drag',
  scroll: 'Scroll',
  hscroll: 'H-Scroll',
  key: 'Key Press',
  type: 'Type Text',
  wait: 'Wait',
  terminate: 'Terminate',
  answer: 'Answer',
  ocr: 'OCR'
};

/** Action colors - distinct for each action type */
export const ACTION_COLORS: Record<string, string> = {
  left_click: '#ef4444',      // Red
  double_click: '#f97316',    // Orange
  triple_click: '#f59e0b',    // Amber
  right_click: '#8b5cf6',     // Purple
  middle_click: '#ec4899',    // Pink
  mouse_move: '#3b82f6',      // Blue
  left_click_drag: '#14b8a6', // Teal
  scroll: '#22c55e',          // Green
  hscroll: '#84cc16',         // Lime
  type: '#06b6d4',            // Cyan
  key: '#6366f1',             // Indigo
  wait: '#78716c',            // Stone
  terminate: '#dc2626',       // Red-600
  answer: '#0ea5e9',          // Sky
  ocr: '#a855f7',             // Purple
};

const DEFAULT_ACTION_COLOR = '#9ca3af'; // Gray-400

/**
 * Get the color for an action type.
 */
export function getActionColor(action: string): string {
  return ACTION_COLORS[action] ?? DEFAULT_ACTION_COLOR;
}

/** Actions that use coordinates */
const COORDINATE_ACTIONS = new Set([
  'left_click',
  'right_click',
  'double_click',
  'middle_click',
  'triple_click',
  'mouse_move',
  'left_click_drag',
  'scroll',
  'hscroll'
]);

/**
 * Parse tool call from GPT response value.
 * Extracts JSON from <tool_call>...</tool_call> tags.
 */
export function parseToolCall(gptValue: string): ToolCall | null {
  const match = gptValue.match(/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[1]) as ToolCall;
  } catch {
    return null;
  }
}

/**
 * Extract the human prompt from conversation value.
 * Strips the <image> tag prefix if present.
 */
export function extractPrompt(humanValue: string): string {
  return humanValue.replace(/^<image>\s*\n?/, '').trim();
}

/**
 * Get a human-readable action label.
 */
export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

/**
 * Check if an action uses coordinates.
 */
export function actionUsesCoordinates(action: string): boolean {
  return COORDINATE_ACTIONS.has(action);
}
