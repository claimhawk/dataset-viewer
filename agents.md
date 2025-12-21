# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚡ FIRST: Read system.md

**Before doing anything else**, read and execute the startup actions in [`system.md`](./system.md).

That file contains:
- **REQUIRED** background processes you must start immediately
- Git workflow rules (fetch & rebase, never pull)
- Inter-agent communication protocol
- Your role and identity as an autonomous agent

**Do not skip this step.**

---

## Project Overview

Dataset Viewer is a Next.js web application for browsing and inspecting CUDAG training datasets. It provides a visual interface for viewing screenshots with tool call annotations, filtering by task type, and searching records.

## Subagent Execution Model (REQUIRED)

All AI assistants **must decompose complex tasks into explicit sub-tasks** and assign each sub-task to an isolated **subagent**. This is mandatory to:

* Prevent uncontrolled context growth
* Ensure deterministic, auditable reasoning
* Preserve repository-wide clarity and focus
* Enforce separation of concerns

### Subagent Requirements

Every non-trivial request (multi-step, multi-file, or multi-decision) must:

1. **Produce a task plan**

   * Break the task into atomic sub-tasks
   * Each sub-task must correspond to a subagent
   * Each subagent must have a clear contract: inputs, outputs, constraints

2. **Run subagents independently**

   * Subagents do not share context except the explicit inputs passed to them
   * Subagents must not add new unrelated context
   * Only the orchestrator (main agent) sees the entire plan

3. **Return a composed final output**

   * The orchestrator integrates the subagents' outputs
   * No subagent should assume global repository state
   * Subagent contamination of context is forbidden

### Subagent Execution Style

Subagents must:

* Operate statelessly
* Use only their given inputs
* Produce minimal, strictly-scoped outputs
* Never rewrite or infer beyond their assigned scope

The orchestrator must:

* Keep reasoning steps isolated
* Avoid long-context carryover
* Enforce strict task boundaries

**If a task does not use subagents for its sub-tasks, it is considered invalid and must be re-executed using the subagent protocol.**

## Three-Step Implementation Protocol (MANDATORY)

All coding tasks must follow a strict three-stage workflow to ensure traceability, clarity of thought, and separation of reasoning, planning, and execution.

### 1. Research Phase → `./.claude/research/<file>`

This file contains all initial thinking, exploration, reasoning, alternatives considered, risks, constraints, and relevant contextual evaluation.

* This stage is for raw cognitive work
* No code allowed
* Subagents may be used to analyze sub-problems
* Output must be structured and comprehensive

### 2. Planning Phase → `./.claude/plans/<file>`

This file contains the **implementation plan only**.

* No code allowed
* Must list steps, modules, functions, structures, data flows, edge cases, test strategies
* Subagents must be used to design and validate individual parts of the plan
* The plan must be deterministic and complete

### 3. Implementation Progress Log → `./.claude/implementation/progress.md`

This file is your "life update" journal for the maintainer.

* Every commit-sized action must be logged
* Summaries of what was done, blockers, decisions
* Subagent invocations must be recorded as separate, timestamped entries

**Coding may only begin after these three steps are complete.**

## Commands

```bash
# Modal Deployment (production)
modal deploy modal/app.py     # Deploy to Modal
modal serve modal/app.py      # Run locally for testing

# Local Development (deprecated - use Modal)
npm run dev          # Start dev server (auto-kills port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check

# Pre-commit
npm run precommit      # Check staged files
npm run precommit:all  # Check all tracked files
```

## Modal Deployment

The app runs on Modal with auto wake/sleep. It reads datasets from the `claimhawk-lora-training` volume.

**Access URL**: `https://claimhawk--dataset-viewer-web.modal.run`

**Volume Mount**: `/datasets` → `claimhawk-lora-training` volume
**Dataset Path**: `/datasets/training-data/datasets/{expert}--{researcher}--{timestamp}/`

The app automatically:
- Wakes on request (~15-30s cold start)
- Sleeps after 5 minutes of inactivity
- Reloads volume data on startup

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

1. **Startup**: Volume is mounted at `/datasets`, naming delimiter is hardcoded
2. **Discovery**: `scan-generators.service.ts` scans `/datasets/training-data/datasets/` for flat dataset directories
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

Configuration is embedded in the app for Modal deployment:
- Dataset root: `/datasets/training-data/datasets` (Modal volume mount)
- Naming delimiter: `--` (hardcoded in `adapters-config.lib.ts`)
- Expert names are extracted from dataset folder names (e.g., `calendar--mike--20251202` → expert: `calendar`)

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
