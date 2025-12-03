# JavaScript/TypeScript Code Quality Guidelines

This document defines **non-negotiable guardrails** for JavaScript and TypeScript code in this project. The goal is to make the codebase:

* Easy to understand on first read
* Easy to change without fear
* Hard to break accidentally

Assume many engineers will cycle through this project. Your job when writing code is to be a **good ancestor**.

---

## 1. Core Philosophy

1. **Correctness first**

   * A small correct solution beats a clever incomplete one.
   * We prefer obvious, boring code over "smart" tricks.

2. **Functional at the core**

   * Data in → data out, with minimal side effects.
   * Side effects are isolated at the edges (I/O, network, UI).

3. **Strict typing**

   * TypeScript strict mode is mandatory.
   * All public interfaces are fully typed.
   * Type errors are treated as build failures.

4. **Low lexical and structural complexity**

   * Small functions, shallow nesting, short modules.
   * No "god functions", no "god objects".

5. **Idiomatic JavaScript/TypeScript**

   * Use the common patterns the community expects.
   * Avoid re-implementing standard library features.

6. **Consistency over preference**

   * Follow project conventions even if you disagree with them.
   * If you want to change a convention, propose it; don't fork it.

---

## 2. Language Subset and Style

### 2.1 Required TypeScript configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true
  }
}
```

### 2.2 Allowed language features

* ES2020+ features
* async/await for asynchronous code
* Destructuring where it improves clarity
* Template literals for string interpolation
* Optional chaining (?.) and nullish coalescing (??)

### 2.3 Discouraged / forbidden patterns

* `any` type (use `unknown` and narrow)
* Type assertions (`as`) unless absolutely necessary
* Non-null assertions (`!`) without justification
* `var` declarations (use `const` or `let`)
* Implicit type coercion
* Deep inheritance hierarchies
* Monkey-patching prototypes

---

## 3. Functional Paradigms

We are not writing pure functional JavaScript, but we lean that way to keep code predictable.

### 3.1 Design

* Prefer:

  * Small, pure functions that transform data.
  * Functions that receive all their inputs via parameters.
  * Immutable data patterns (spread operators, Object.freeze).

* Avoid:

  * Functions that implicitly read from or write to global state.
  * Functions that both compute and perform I/O.

### 3.2 Side-effect boundaries

* Centralize side effects in clearly named layers:

  * `api/` or `services/` for network calls
  * `hooks/` for React side effects
  * `utils/` for pure transformations

---

## 4. Strict Typing

Static typing is mandatory, not optional.

### 4.1 Requirements

* All function parameters and return types must be explicit
* All component props must have TypeScript interfaces
* Avoid `any` - use `unknown` and type guards instead
* Use discriminated unions for complex state

### 4.2 Type design rules

* Prefer:

  * Narrow, precise types
  * Branded types for IDs and special strings
  * Readonly arrays and objects where appropriate

* Avoid:

  * `any`, `object`, or massive union types
  * Type assertions that bypass the type system

---

## 5. Low Lexical and Structural Complexity

### 5.1 Function complexity limits

Per function:

* Maximum cyclomatic complexity: 10
* Maximum nesting depth (if/for/while/try): 3 levels
* Maximum function length: 50 lines
* Maximum number of parameters: 5

### 5.2 File complexity limits

Per file:

* Maximum file length: ~400 lines (soft limit)
* One component per file (React)
* Co-locate related code

### 5.3 Component complexity (React)

* Maximum JSX nesting: 4 levels
* Extract complex logic to custom hooks
* Extract complex rendering to sub-components

---

## 6. Idiomatic Patterns

### 6.1 Naming

* Components: PascalCase
* Functions and variables: camelCase
* Constants: UPPER_SNAKE_CASE
* Types and interfaces: PascalCase
* Files: kebab-case or PascalCase for components

### 6.2 React patterns

* Functional components only (no class components)
* Custom hooks for reusable logic
* Controlled components over uncontrolled
* Avoid inline functions in JSX where performance matters

### 6.3 Error handling

* Use try/catch for async operations
* Provide meaningful error messages
* Never silently swallow errors

---

## 7. Pre-Build Quality Pipeline

Every commit must pass these checks:

### 7.1 Code formatting

* Use Prettier with project configuration
* Format on save

### 7.2 Linting

* ESLint with strict configuration
* No disabled rules without justification
* Treat warnings as errors in CI

### 7.3 Type checking

* `tsc --noEmit` must pass with zero errors
* No `@ts-ignore` without linked issue

### 7.4 Testing

* Jest or Vitest for unit tests
* React Testing Library for component tests
* Minimum coverage thresholds enforced

### 7.5 Pre-commit workflow

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run test        # Jest/Vitest
npm run build       # Production build
```

---

## 8. Code Review Standards

### 8.1 Reviewer checklist

* Correctness: Does it do what it claims?
* Simplicity: Could this be simpler?
* Types: Are types precise and minimal?
* Tests: Are there tests for new behavior?
* Accessibility: Does it meet a11y requirements?

### 8.2 Reviewer authority

* Push back on unnecessary complexity
* Require tests for non-trivial changes
* "It works" is not sufficient justification

---

## 9. Cultural Rules

* No unreviewed "quick hacks"
* Prefer "make it simple first" over "optimize prematurely"
* Write code your future self can understand
* When unsure, choose the simpler option
