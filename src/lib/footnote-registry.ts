export class FootnoteRegistry {
  private footnoteMap = new Map<string, number>();
  private deferredFootnotes = new Set<string>();
  private originallyDeferredFootnotes = new Set<string>();
  private currentNumber = 0;

  register(footnoteId: string, deferred: boolean = false): number {
    if (this.footnoteMap.has(footnoteId)) {
      // Already numbered, return existing number
      return this.footnoteMap.get(footnoteId)!;
    }
    
    if (deferred) {
      // Store as deferred, don't assign number yet
      this.deferredFootnotes.add(footnoteId);
      this.originallyDeferredFootnotes.add(footnoteId);
      return 0; // Will be resolved in FootnotesList processing
    }
    
    // Check if this was previously deferred
    if (this.deferredFootnotes.has(footnoteId)) {
      this.deferredFootnotes.delete(footnoteId);
    }
    
    // Assign actual number
    this.currentNumber++;
    this.footnoteMap.set(footnoteId, this.currentNumber);
    return this.currentNumber;
  }

  getNumber(footnoteId: string): number | undefined {
    return this.footnoteMap.get(footnoteId);
  }

  // Get all originally deferred footnotes and their resolved numbers
  getDeferredMappings(): Array<{ id: string; number: number }> {
    return Array.from(this.originallyDeferredFootnotes).map(id => ({
      id,
      number: this.footnoteMap.get(id) || 0
    })).filter(mapping => mapping.number > 0);
  }

  getAllFootnotes(): Array<{ id: string; number: number }> {
    return Array.from(this.footnoteMap.entries()).map(([id, number]) => ({
      id,
      number,
    }));
  }

  getDeferredFootnotes(): string[] {
    return Array.from(this.deferredFootnotes);
  }

  validateNoDeferredFootnotes(): void {
    if (this.deferredFootnotes.size > 0) {
      const unusedDeferred = Array.from(this.deferredFootnotes).join(', ');
      throw new Error(`Deferred footnotes were never used in article body: ${unusedDeferred}`);
    }
  }

  reset(): void {
    this.footnoteMap.clear();
    this.deferredFootnotes.clear();
    this.originallyDeferredFootnotes.clear();
    this.currentNumber = 0;
  }
}

export const footnoteRegistry = new FootnoteRegistry();