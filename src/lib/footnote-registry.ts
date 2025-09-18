export class FootnoteRegistry {
  private footnoteMap = new Map<string, number>();
  private currentNumber = 0;

  register(footnoteId: string): number {
    if (this.footnoteMap.has(footnoteId)) {
      return this.footnoteMap.get(footnoteId)!;
    }
    
    this.currentNumber++;
    this.footnoteMap.set(footnoteId, this.currentNumber);
    return this.currentNumber;
  }

  getNumber(footnoteId: string): number | undefined {
    return this.footnoteMap.get(footnoteId);
  }

  getAllFootnotes(): Array<{ id: string; number: number }> {
    return Array.from(this.footnoteMap.entries()).map(([id, number]) => ({
      id,
      number,
    }));
  }

  reset(): void {
    this.footnoteMap.clear();
    this.currentNumber = 0;
  }
}

export const footnoteRegistry = new FootnoteRegistry();