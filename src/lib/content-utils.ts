import { getCollection, getEntry } from 'astro:content';
import type { FootnoteContent } from './footnote-manager';

/**
 * Article content with ordering information
 */
export interface ArticleContent extends FootnoteContent {
  data: {
    id: string;
    title: string;
    order?: number;
  };
}

/**
 * Content ordering strategies
 */
export type OrderingStrategy = 'by-order' | 'by-ids' | 'custom';

/**
 * Utility functions for working with Astro content collections
 * in the context of footnote management
 */
export class ContentUtils {
  /**
   * Get and sort articles by their order field
   */
  static async getOrderedArticles(): Promise<ArticleContent[]> {
    const articles = await getCollection('articles');
    return articles.sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  }

  /**
   * Get articles in a specific order by IDs
   */
  static async getArticlesByIds(ids: string[]): Promise<ArticleContent[]> {
    const allArticles = await getCollection('articles');
    const articleMap = new Map(allArticles.map(article => [article.data.id, article]));
    
    return ids.map(id => {
      const article = articleMap.get(id);
      if (!article) {
        throw new Error(`Article with ID "${id}" not found`);
      }
      return article;
    });
  }

  /**
   * Get a single content entry with error handling
   */
  static async getContentEntry<T extends FootnoteContent>(
    collection: 'articles' | 'animals' | 'footnotes', 
    slug: string
  ): Promise<T> {
    const entry = await getEntry(collection as any, slug);
    if (!entry) {
      throw new Error(`Entry "${slug}" not found in collection "${collection}"`);
    }
    return entry as T;
  }

  /**
   * Create a standardized content setup for pages with articles
   */
  static async createArticlePage(config: {
    articleOrder?: string[] | 'by-order';
    additionalContent?: Array<{
      collection: 'articles' | 'animals' | 'footnotes';
      slug: string;
    }>;
  } = {}) {
    // Get articles
    const articles = config.articleOrder === 'by-order' || !config.articleOrder
      ? await this.getOrderedArticles()
      : await this.getArticlesByIds(config.articleOrder);

    // Get additional content if specified
    const additionalContent: FootnoteContent[] = [];
    if (config.additionalContent) {
      for (const { collection, slug } of config.additionalContent) {
        const content = await this.getContentEntry(collection, slug);
        additionalContent.push(content);
      }
    }

    return {
      articles,
      additionalContent,
      allContent: [...articles, ...additionalContent]
    };
  }
}