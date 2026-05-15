import { readFile } from 'fs/promises';
import { join } from 'path';

export interface JournalTaskSummary {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  blockedTasks: number;
  urgentItems: string[];
  lastUpdated: string | null;
}

const JOURNAL_PATH = join(process.cwd(), 'JOURNAL.md');

export async function readJournalState(): Promise<JournalTaskSummary | null> {
  try {
    const content = await readFile(JOURNAL_PATH, 'utf-8');

    const pendingMatches = content.match(/\|\s*\d+\s*\|[^|]*\|\s*pending/gi) || [];
    const completedMatches = content.match(/\|\s*\d+\s*\|[^|]*\|\s*completed/gi) || [];
    const blockedMatches = content.match(/\|\s*\d+\s*\|[^|]*\|\s*blocked/gi) || [];
    const allTaskRows = content.match(/\|\s*\d+\s*\|[^|]*\|/gi) || [];

    const urgentItems: string[] = [];
    const p1Section = content.match(/### P1[\s\S]*?(?=### P2|$)/i);
    if (p1Section) {
      const p1Pending = p1Section[0].match(/\|\s*\d+\s*\|([^|]+)\|\s*pending/gi) || [];
      for (const match of p1Pending) {
        const taskDesc = match.replace(/^\|\s*\d+\s*\|\s*/, '').replace(/\s*\|\s*pending.*$/i, '').trim();
        if (taskDesc) urgentItems.push(taskDesc);
      }
    }

    const lastUpdatedMatch = content.match(/\*\*Created:\*\*\s*(\d{4}-\d{2}-\d{2})/);
    const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1] : null;

    return {
      totalTasks: allTaskRows.length,
      pendingTasks: pendingMatches.length,
      completedTasks: completedMatches.length,
      blockedTasks: blockedMatches.length,
      urgentItems,
      lastUpdated,
    };
  } catch {
    return null;
  }
}
