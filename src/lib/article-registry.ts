// Import all article components once - single source of truth
import GettingStarted from '../components/articles/GettingStarted.astro';
import AdvancedTechniques from '../components/articles/AdvancedTechniques.astro';
import BuildingComponents from '../components/articles/BuildingComponents.astro';

// Complete article components map - all components available everywhere
export const articleComponents = {
  'getting-started': GettingStarted,
  'advanced-techniques': AdvancedTechniques,
  'building-components': BuildingComponents,
} as const;

// Export the type for article keys (derived from the actual map)
export type ArticleKey = keyof typeof articleComponents;

// Article keys array for reference (derived from the map)
export const articleKeys = Object.keys(articleComponents) as ArticleKey[];
