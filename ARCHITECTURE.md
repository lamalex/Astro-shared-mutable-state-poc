# Footnote System Architecture

This document describes the reliable abstraction designed for managing footnotes across MDX content collections in Astro.

## Problem Solved

The original approach had an **execution order issue**: Astro components execute in unpredictable order, causing FootnotesList to render before FootnoteRef components had registered their footnotes, resulting in empty footnote sections.

## Solution: Pre-Registration Architecture

We solve this by **pre-registering footnotes from content body text** using regex parsing, ensuring footnotes are registered before any component renders.

## Core Components

### 1. FootnoteManager (`src/lib/footnote-manager.ts`)

**Central orchestrator** for footnote management:

```typescript
// Usage example
const { registry, renderedContent } = await FootnoteManager.createForPage({
  deferredFootnotes: [
    { id: 'OPENCODE_001', deferred: true }
  ],
  content: [...articles, ...additionalContent]
});
```

**Key Features:**
- Pre-registers footnotes via regex: `/<FootnoteRef\b[^>]*\bid\s*=\s*["']([^"']+)["'][^>]*\/?>/g`
- Handles deferred footnotes (header references numbered after body)
- Renders content collections to Astro components
- Ensures execution order independence

### 2. ContentUtils (`src/lib/content-utils.ts`)

**Content collection utilities**:

```typescript
// Get articles in specific order
const { articles, additionalContent } = await ContentUtils.createArticlePage({
  articleOrder: ['advanced-techniques', 'building-components', 'getting-started'],
  additionalContent: [
    { collection: 'animals', slug: 'frogs' }
  ]
});
```

### 3. FootnotePageLayout (`src/components/FootnotePageLayout.astro`)

**Reusable page layout** with theme support:

```astro
<FootnotePageLayout
  registry={registry}
  articles={renderedArticles}
  additionalContent={renderedAdditionalContent}
  title="Page Title"
  theme="red"
>
  <Fragment slot="header">Custom header content</Fragment>
  <Fragment slot="navigation">Nav links</Fragment>
</FootnotePageLayout>
```

## Usage Pattern

### Simple Page Setup

```astro
---
import { FootnoteManager } from '../lib/footnote-manager';
import { ContentUtils } from '../lib/content-utils';
import FootnotePageLayout from '../components/FootnotePageLayout.astro';

// 1. Get content
const { articles, additionalContent } = await ContentUtils.createArticlePage({
  articleOrder: 'by-order'  // or specific array
});

// 2. Setup footnotes
const { registry, renderedContent } = await FootnoteManager.createForPage({
  deferredFootnotes: [
    { id: 'HEADER_FOOTNOTE', deferred: true }
  ],
  content: [...articles, ...additionalContent]
});

// 3. Split rendered content
const renderedArticles = renderedContent.slice(0, articles.length);
const renderedAdditional = renderedContent.slice(articles.length);
---

<FootnotePageLayout
  registry={registry}
  articles={renderedArticles}
  additionalContent={renderedAdditional}
  title="My Page"
>
  <!-- Custom content in slots -->
</FootnotePageLayout>
```

## Benefits

### ✅ **Reliability**
- **Execution order independent** - footnotes always registered before rendering
- **Consistent numbering** - based on content order, not component execution
- **Build-time validation** - catches missing footnotes early

### ✅ **Developer Experience**
- **Simple API** - `FootnoteManager.createForPage()` handles complexity
- **Reusable layouts** - common patterns abstracted away
- **Type safety** - TypeScript interfaces for all components
- **Theme support** - easy visual customization

### ✅ **Maintainability**
- **Single responsibility** - each class has clear purpose
- **Easy testing** - pure functions with predictable inputs/outputs
- **Extensible** - easy to add new content types or footnote behaviors

## Migration Benefits

**Before (Custom Registry):**
- 45+ lines of complex footnote setup per page
- Manual component management
- Execution order issues
- Duplicated styling code

**After (New Architecture):**
- ~15 lines of simple configuration per page
- Automated content and footnote management
- No execution order issues
- Shared layout with theme support

## Files Structure

```
src/
├── lib/
│   ├── footnote-manager.ts      # Core orchestration
│   ├── footnote-registry.ts     # Registry implementation
│   └── content-utils.ts         # Content collection helpers
├── components/
│   ├── FootnotePageLayout.astro # Reusable page layout
│   ├── FootnotesList.astro      # Footnotes rendering
│   └── FootnoteRef.astro        # Individual footnote references
└── pages/
    ├── index.astro              # Example usage (default theme)
    └── advanced.astro           # Example usage (red theme)
```

This architecture transforms the original "regex hack" into a **production-ready, maintainable solution** that solves the fundamental Astro execution order problem while providing excellent developer experience.