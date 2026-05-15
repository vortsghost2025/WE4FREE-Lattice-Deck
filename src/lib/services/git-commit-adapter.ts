import { execSync } from 'child_process';
import type { TimelineEventContract } from '@/lib/contracts/types';
import type { EventType } from '@/lib/types';

export interface GitCommitRaw {
  hash: string;
  shortHash: string;
  author: string;
  date: string;
  subject: string;
  body: string;
  refNames: string;
}

export interface GitCommitAdapterOptions {
  maxCommits?: number;
  repoPath?: string;
  fallbackOnError?: boolean;
}

const DEFAULT_OPTIONS: GitCommitAdapterOptions = {
  maxCommits: 20,
  repoPath: process.cwd(),
  fallbackOnError: true,
};

export function parseGitLog(output: string): GitCommitRaw[] {
  if (!output || !output.trim()) return [];
  return output
    .split('---COMMIT---')
    .filter(Boolean)
    .map((block) => {
      const lines = block.trim().split('\n');
      return {
        hash: lines[0] || '',
        shortHash: lines[0]?.substring(0, 7) || '',
        author: lines[1] || '',
        date: lines[2] || '',
        subject: lines[3] || '',
        body: lines.slice(4).join('\n').trim(),
        refNames: '',
      };
    })
    .filter((c) => c.hash && /^[0-9a-f]{7,}$/i.test(c.hash));
}

const SUBJECT_PATTERN = /^(feat|fix|refactor|docs|test|chore|ci|wip|perf|style|build|revert)(\(.+\))?:\s*(.+)$/i;

export function inferEventType(subject: string): EventType {
  const lower = subject.toLowerCase();
  if (/^revert|^undo|^rollback/i.test(lower)) return 'UNDO';
  if (/^fix|^bug|^repair/i.test(lower)) return 'REPAIR';
  if (/^refuse|^regress|^break|^fail/i.test(lower)) return 'REGRESSION';
  if (/^feat|^add|^progress|^implement/i.test(lower)) return 'PROGRESSION';
  if (/^refactor|^dedup|^clean/i.test(lower)) return 'DUPLICATION';
  if (/^sync|^reconcile|^merge|^align/i.test(lower)) return 'RECONCILIATION';
  if (/^ci|^infra|^build|^deploy|^chore/i.test(lower)) return 'INFRASTRUCTURE';
  return 'PROGRESSION';
}

export function inferLaneId(
  subject: string,
  body: string,
): string {
  const combined = `${subject} ${body}`.toLowerCase();
  if (/\barchivist\b/.test(combined)) return 'archivist';
  if (/\blibrary\b/.test(combined)) return 'library';
  if (/\bswarmmind\b|\bswarm\b/.test(combined)) return 'swarmmind';
  if (/\bkernel\b/.test(combined)) return 'kernel';
  if (/\bcontrol.?plane\b|\bcoordinator\b|\brig\b/.test(combined)) return 'control-plane';
  return 'kernel';
}

export function inferClassification(subject: string): 'autonomous' | 'operator' {
  const lower = subject.toLowerCase();
  if (/\bmanual\b|\boperator\b|\bwip\b/.test(lower)) return 'operator';
  if (/^feat|^fix|^refactor|^test|^ci|^chore|^docs/i.test(lower)) return 'autonomous';
  return 'operator';
}

export function transformCommitToTimelineEvent(
  commit: GitCommitRaw,
): TimelineEventContract {
  const eventType = inferEventType(commit.subject);
  const laneId = inferLaneId(commit.subject, commit.body);
  const classification = inferClassification(commit.subject);

  return {
    id: `git-${commit.shortHash}`,
    timestamp: commit.date,
    laneId: laneId as any,
    surfaceId: 'headless',
    type: eventType,
    title: commit.subject,
    description: commit.body || commit.subject,
    artifactPath: null,
    gitRef: commit.shortHash,
    attribution: commit.author,
    classification,
  };
}

export function readGitLog(options?: GitCommitAdapterOptions): GitCommitRaw[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const format = '%H%n%an%n%aI%n%s%n%b---COMMIT---';
    const cmd = `git -C "${opts.repoPath}" log --max-count=${opts.maxCommits} --format="${format}"`;
    const output = execSync(cmd, {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return parseGitLog(output);
  } catch (err) {
    if (opts.fallbackOnError) {
      return [];
    }
    throw err;
  }
}

export function getGitTimelineEvents(
  options?: GitCommitAdapterOptions,
): TimelineEventContract[] {
  const commits = readGitLog(options);
  return commits.map(transformCommitToTimelineEvent);
}
