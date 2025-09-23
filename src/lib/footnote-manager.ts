import { FootnoteRegistry } from './footnote-registry';
import { render } from 'astro:content';

/**
 * Configuration for footnote references that should be treated as deferred
 */
export interface DeferredFootnoteConfig {
  /** Footnote ID */
  id: string;
  /** Whether this footnote should be deferred (numbered after body content) */
  deferred: boolean;
}

/**
 * A content item that can contain footnotes (MDX content with body property)
 */
export interface FootnoteContent {
  body: string;
}

/**
 * Rendered content with its associated Astro component
 */
export interface RenderedContent<T = any> {
  entry: T;
  Content: any;
}

/**
 * FootnoteManager provides a clean abstraction for managing footnotes across
 * MDX content collections, solving Astro's component execution order issues
 * by pre-registering footnotes from content body text.
 */
export class FootnoteManager {
  private registry: FootnoteRegistry;
  private footnoteRefPattern = /<FootnoteRef\b[^>]*\bid\s*=\s*["']([^"']+)["'][^>]*\/?>/g;

  constructor() {
    this.registry = new FootnoteRegistry();
  }

  /**
   * Register deferred footnotes (typically from page headers)
   * These footnotes appear in the header but get numbered based on their
   * first appearance in the body content.
   */
  registerDeferredFootnotes(footnotes: DeferredFootnoteConfig[]): this {
    footnotes.forEach(({ id, deferred }) => {
      this.registry.register(id, deferred);
    });
    return this;
  }

  /**
   * Pre-register footnotes from content body text using regex parsing.
   * This ensures footnotes are registered in the correct order before
   * any Astro components render.
   */
  preRegisterFromContent(content: FootnoteContent[]): this {
    content.forEach(item => {
      const footnoteMatches = Array.from(item.body.matchAll(this.footnoteRefPattern));
      footnoteMatches.forEach(match => {
        const footnoteId = match[1];
        this.registry.register(footnoteId, false); // Not deferred
      });
    });
    return this;
  }

  /**
   * Render content entries into Astro components while preserving the
   * pre-registered footnote order.
   */
  async renderContent<T extends FootnoteContent>(
    entries: T[]
  ): Promise<RenderedContent<T>[]> {
    const rendered: RenderedContent<T>[] = [];
    
    for (const entry of entries) {
      const { Content } = await render(entry as any);
      rendered.push({ entry, Content });
    }
    
    return rendered;
  }

  /**
   * Get the footnote registry instance for use in components
   */
  getRegistry(): FootnoteRegistry {
    return this.registry;
  }

  /**
   * Create a complete footnote setup for a page with the given content.
   * This is a convenience method that handles the common pattern.
   */
  static async createForPage<T extends FootnoteContent>(config: {
    deferredFootnotes?: DeferredFootnoteConfig[];
    content: T[];
  }): Promise<{
    manager: FootnoteManager;
    registry: FootnoteRegistry;
    renderedContent: RenderedContent<T>[];
  }> {
    const manager = new FootnoteManager();
    
    // Register deferred footnotes first (if any)
    if (config.deferredFootnotes) {
      manager.registerDeferredFootnotes(config.deferredFootnotes);
    }
    
    // Pre-register footnotes from content
    manager.preRegisterFromContent(config.content);
    
    // Render content
    const renderedContent = await manager.renderContent(config.content);
    
    return {
      manager,
      registry: manager.getRegistry(),
      renderedContent
    };
  }
}