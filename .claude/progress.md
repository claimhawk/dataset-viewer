# Dataset Viewer - Development Progress

A Next.js web application for browsing and inspecting CUDAG training datasets with visual annotations.

## Development Timeline

| Date | Feature | Work |
|------|---------|------|
| 2025-12-03 | Initial Application | Created Next.js application with dataset browsing infrastructure |
| 2025-12-05 | URL-based Routing | Refactored to App Router with URL state management and filtering |

---

## Feature Categories

### Core Infrastructure (2025-12-03)

**Initial Setup**
- Next.js 16 with React 19 and TypeScript
- ESLint and TypeScript strict mode configuration
- Tailwind CSS v4 for styling
- Domain-driven design (DDD) architecture

**Domain Layer**
- Generator, Dataset, and DataRecord models
- RecordsQuery and ToolCall value objects
- Service layer for scanning generators and reading JSONL records

**Configuration Integration**
- adapters.yaml parsing from repository root
- Dataset naming convention support (-- delimiter)
- Legacy format fallback support (- delimiter)

**File System Services**
- Generator discovery across projects/generators/*/datasets
- Dataset folder parsing (expert--researcher--timestamp format)
- JSONL record counting and parsing
- config.json reading for dataset metadata

**API Routes**
- /api/datasets - List all generators and datasets
- /api/records - Fetch records with filtering
- /api/image/[...path] - Serve dataset images

**UI Components (Primitives)**
- Button, Select, Checkbox, Input components
- Consistent styling with Tailwind primitives

**Viewer Components**
- DatasetSelector - Browse generators and datasets
- ImageViewer - Display screenshots with coordinate overlays
- RecordDetails - Show conversation turns and tool calls
- RecordNav - Navigate between records
- TaskTypeFilter - Filter by task type
- SearchField - Search within records

**Coordinate System**
- RU (Resolution Units) to pixel conversion
- Coordinate overlay rendering on screenshots
- Real coords vs normalized coords handling

### Routing & Navigation (2025-12-05)

**Next.js App Router Migration**
- URL-based state management (no client state)
- Dynamic routes: /[generator]/[dataset]/[index]
- Query parameter filtering (?taskTypes=click,type)
- Search functionality (?search=query)

**Navigation Features**
- Landing page lists all generators
- Generator page lists datasets for that generator
- Dataset page auto-redirects to record 0
- Record viewer with prev/next navigation
- Keyboard shortcuts (← → for navigation)

**Filtered Navigation**
- Task type filtering with multi-select
- Filter preservation in URL
- Search term preservation across navigation
- Next/previous buttons respect active filters

**URL Structure**
```
/                                    # Landing - all generators
/[generator]                         # Generator datasets
/[generator]/[dataset]               # Redirects to first record
/[generator]/[dataset]/[index]       # Record viewer
```

**Query Parameters**
- taskTypes - Comma-separated list for filtering
- search - Search term for content filtering

---

## Technical Architecture

### Directory Structure
```
src/
├── app/              # Next.js App Router pages and API
├── domain/           # DDD business logic
│   └── datasets/
│       ├── models/        # Entities
│       ├── services/      # Business logic
│       └── value-objects/ # Value types
├── libs/             # Infrastructure utilities
│   ├── config/       # adapters.yaml parsing
│   ├── coordinates/  # RU coordinate conversion
│   └── paths/        # Path resolution
└── ui/               # React components
    ├── primitives/   # Reusable components
    └── viewer/       # Feature components
```

### Data Flow
1. App reads config/adapters.yaml for naming conventions
2. scan-generators.service walks projects/generators/*/datasets
3. read-records.service parses data.jsonl files
4. API routes expose data to frontend
5. URL-based navigation with query params for filtering

### Key Technologies
- Next.js 16 (App Router)
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4
- YAML parsing for config

---

## Code Quality Standards

- TypeScript strict mode
- Maximum cyclomatic complexity: 10
- Maximum function length: 50 lines
- ESLint + Prettier enforcement
- Pre-commit hooks for validation
- Copyright headers on all files

---

## Development Commands

```bash
npm run dev              # Start dev server (auto-kills port 3000)
npm run build            # Production build
npm run lint             # ESLint
npm run typecheck        # TypeScript check
npm run precommit        # Check staged files
npm run precommit:all    # Check all files
```

---

## Remaining Work

### Planned Enhancements
- [ ] Test record viewer (test.json files)
- [ ] Bulk dataset comparison
- [ ] Export filtered records
- [ ] Dataset statistics dashboard
- [ ] Performance optimization for large datasets
- [ ] Image caching and lazy loading

### Technical Debt
- [ ] Add unit tests for services
- [ ] Add integration tests for API routes
- [ ] Document coordinate overlay algorithm
- [ ] Add error boundaries for better UX
- [ ] Optimize JSONL parsing for large files

---

## Notes

**Design Decisions:**
- URL-based state management chosen over React state for shareable links and browser history
- Domain-driven design for clear separation of concerns
- File system scanning over database for simplicity
- Dynamic imports kept minimal for performance

**Integration Points:**
- Reads config/adapters.yaml from claimhawk repo root
- Scans projects/generators/*/datasets for data
- Serves images directly from generator datasets
- Parses CUDAG training format (JSONL with conversations)

**Performance Considerations:**
- JSONL files read synchronously (acceptable for current dataset sizes)
- Images served via Next.js API routes (could optimize with static serving)
- No pagination yet (filters reduce dataset size sufficiently)
