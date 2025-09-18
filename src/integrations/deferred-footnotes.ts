import type { AstroIntegration } from 'astro';
import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { parse, type HTMLElement } from 'node-html-parser';

export default function deferredFootnotesIntegration(): AstroIntegration {
  return {
    name: 'deferred-footnotes',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        console.log('🔧 Processing deferred footnotes for production build...');
        
        // Process all HTML files in the dist directory
        await processHtmlFiles(dir.pathname);
        
        console.log('✅ Deferred footnotes processed successfully');
      },
      'astro:server:start': async ({ address }) => {
        console.log('🔧 Dev server started with deferred footnotes integration');
        console.log('ℹ️  Note: In dev mode, deferred footnotes show as 0 (this is expected)');
        console.log('ℹ️  Deferred footnotes are resolved during the build process');
        console.log('ℹ️  Run `bun run build` to see the final resolved footnotes');
      },
    },
  };
}

async function processHtmlFiles(distPath: string): Promise<void> {
  const htmlFiles = await findHtmlFiles(distPath);
  
  for (const filePath of htmlFiles) {
    await processHtmlFile(filePath);
  }
}

async function findHtmlFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      const subFiles = await findHtmlFiles(fullPath);
      files.push(...subFiles);
    } else if (extname(entry) === '.html') {
      files.push(fullPath);
    }
  }
  
  return files;
}

function processHtmlString(html: string): string {
  const root = parse(html);
  
  // Find all deferred footnote references
  const deferredRefs = root.querySelectorAll('a[data-deferred="true"]');
  
  if (deferredRefs.length === 0) {
    return html; // No deferred footnotes to process
  }
  
  // Build a mapping of footnote IDs to their resolved numbers
  const footnoteMapping = new Map<string, string>();
  
  // Find all non-deferred footnote references to get the resolved numbers
  const normalRefs = root.querySelectorAll('a[data-deferred="false"]');
  normalRefs.forEach((ref: HTMLElement) => {
    const id = ref.getAttribute('data-footnote-id');
    const number = ref.textContent?.trim();
    if (id && number) {
      footnoteMapping.set(id, number);
    }
  });
  
  // Update deferred footnote references
  let updated = false;
  deferredRefs.forEach((ref: HTMLElement) => {
    const id = ref.getAttribute('data-footnote-id');
    if (id && footnoteMapping.has(id)) {
      const resolvedNumber = footnoteMapping.get(id)!;
      ref.textContent = resolvedNumber;
      updated = true;
      console.log(`  📍 Dev: Fixed deferred footnote ${id}: 0 → ${resolvedNumber}`);
    }
  });
  
  return root.toString();
}

async function processHtmlFile(filePath: string): Promise<void> {
  const html = await readFile(filePath, 'utf-8');
  const processedHtml = processHtmlString(html);
  
  if (processedHtml !== html) {
    await writeFile(filePath, processedHtml);
    console.log(`  ✅ Updated ${filePath}`);
  }
}