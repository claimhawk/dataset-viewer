# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dataset Viewer is a Next.js web application for browsing and inspecting CUDAG training datasets. It provides a visual interface for viewing screenshots with tool call annotations, filtering by task type, and searching records.

## Commands

```bash
# Development
npm run dev          # Start dev server (auto-kills port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check

# Pre-commit
npm run precommit      # Check staged files
npm run precommit:all  # Check all tracked files
```

## Architecture

### Directory Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── domain/           # Domain layer (DDD-style)
│   └── datasets/
│       ├── models/        # Entity types (Generator, Dataset, DataRecord)
│       ├── services/      # Business logic (scan-generators, read-records)
│       └── value-objects/ # Value types (RecordsQuery, ToolCall)
├── libs/             # Infrastructure utilities
│   ├── config/       # adapters.yaml parsing
│   ├── coordinates/  # RU coordinate conversion
│   └── paths/        # Path resolution to generators
└── ui/               # React components
    ├── primitives/   # Reusable base components (Button, Select, Input)
    └── viewer/       # Feature-specific components (ImageViewer, RecordNav)
```

### URL Routing

The app uses Next.js App Router with URL-based state management:

```
/                                    # Landing - list all generators
/[generator]                         # Generator - list datasets
/[generator]/[dataset]               # Redirects to record 0
/[generator]/[dataset]/[index]       # Record viewer at specific index
```

Query parameters for filtering:
- `?taskTypes=click,type` - filter by task types (comma-separated)
- `?search=foo` - search within records

Example URLs:
- `/desktop-generator` - view desktop generator datasets
- `/desktop-generator/expert--researcher--20250101_120000/42?search=button` - view record 42 with search

### Data Flow

1. **Startup**: App reads `config/adapters.yaml` from repo root to get dataset naming conventions
2. **Discovery**: `scan-generators.service.ts` walks `projects/generators/*/datasets/` to find generators and datasets
3. **Loading**: `read-records.service.ts` reads `data.jsonl` files and parses training records
4. **API**: Next.js API routes expose `/api/datasets`, `/api/records`, and `/api/image/[...path]`
5. **UI**: URL-based navigation with keyboard shortcuts (←/→ for prev/next record)

### Key Concepts

- **Generators**: Projects that create training datasets (e.g., desktop-generator, chart-screen-generator)
- **Datasets**: Named collections with format `{expert}--{researcher}--{timestamp}`
- **Records**: Individual training examples with image path, conversation turns, and metadata
- **Tool Calls**: Actions in `<tool_call>` XML format parsed from GPT responses

### Coordinate System

Coordinates use RU (Resolution Units) normalized to [0, 1000]:
- Conversion: `normalized = (pixel / image_dimension) * 1000`
- Real pixel coords stored in `metadata.real_coords`
- Image viewer converts RU back to pixels for overlay rendering

### Configuration

The app reads `config/adapters.yaml` from the repo root (two directories up from project). This file defines:
- Expert-to-generator mappings
- Dataset naming conventions (delimiter, timestamp format)
- Expert labels and descriptions

## Code Quality

See [CODE_QUALITY.md](./CODE_QUALITY.md) for detailed standards.

Key requirements:
- TypeScript strict mode
- Maximum cyclomatic complexity: 10
- Maximum function length: 50 lines
- Functional components only (React)
- Copyright header required: `// Copyright (c) 2025 Tylt LLC. All Rights Reserved.`

### Import Aliases

Use `@/*` for imports from `src/`:
```typescript
import { Button } from '@/ui/primitives/components/Button';
import { scanGenerators } from '@/domain/datasets/services/scan-generators.service';
```

## Git Commits

**DO NOT CO-AUTHOR COMMITS** - only use the GitHub user's name when committing. Do not add co-author trailers or attribute commits to AI assistants.
