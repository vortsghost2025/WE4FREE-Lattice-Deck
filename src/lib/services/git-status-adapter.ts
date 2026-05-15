import { execSync } from 'child_process';

export interface GitStatusResult {
  branch: string;
  ahead: number;
  behind: number;
  modified: number;
  untracked: number;
  staged: number;
  conflicted: number;
  stashed: number;
  isClean: boolean;
  hasDiverged: boolean;
}

export interface GitStatusAdapterOptions {
  repoPath?: string;
  fallbackOnError?: boolean;
}

const DEFAULT_OPTIONS: GitStatusAdapterOptions = {
  repoPath: process.cwd(),
  fallbackOnError: true,
};

export function parseGitBranch(output: string): { branch: string; ahead: number; behind: number } {
  const branchLine = output.split('\n').find(l => l.startsWith('## '));
  if (!branchLine) return { branch: 'HEAD', ahead: 0, behind: 0 };

  const match = branchLine.match(/^## (\S+)(?:\.\.\.(\S+))?(?:\s+\[(ahead (\d+))?(?:, )?(behind (\d+))?\])?/);
  if (!match) return { branch: branchLine.slice(4).split('...')[0] || 'HEAD', ahead: 0, behind: 0 };

  return {
    branch: match[1] || 'HEAD',
    ahead: match[4] ? parseInt(match[4], 10) : 0,
    behind: match[6] ? parseInt(match[6], 10) : 0,
  };
}

export function parseGitPorcelain(output: string): { modified: number; untracked: number; staged: number; conflicted: number } {
  let modified = 0;
  let untracked = 0;
  let staged = 0;
  let conflicted = 0;

  for (const line of output.split('\n')) {
    if (!line || line.length < 2) continue;
    const x = line[0];
    const y = line[1];

    if (x === 'U' || y === 'U' || x === 'A' && y === 'A' || x === 'D' && y === 'D') {
      conflicted++;
    } else {
      if (x === '?' || (x === '?' && y === '?')) {
        untracked++;
      } else {
        if (x !== ' ' && x !== '?') staged++;
        if (y !== ' ' && y !== '?') modified++;
      }
    }
  }

  return { modified, untracked, staged, conflicted };
}

export function parseStashCount(output: string): number {
  const trimmed = output.trim();
  if (!trimmed) return 0;
  return trimmed.split('\n').filter(Boolean).length;
}

export function readGitStatus(options?: GitStatusAdapterOptions): GitStatusResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const branchOutput = execSync('git status --porcelain=v2 --branch', {
      encoding: 'utf-8',
      timeout: 5000,
      cwd: opts.repoPath,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const porcelainOutput = execSync('git status --porcelain', {
      encoding: 'utf-8',
      timeout: 5000,
      cwd: opts.repoPath,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stashed = 0;
    try {
      const stashOutput = execSync('git stash list', {
        encoding: 'utf-8',
        timeout: 3000,
        cwd: opts.repoPath,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      stashed = parseStashCount(stashOutput);
    } catch {
      stashed = 0;
    }

    const { branch, ahead, behind } = parseGitBranch(branchOutput);
    const { modified, untracked, staged, conflicted } = parseGitPorcelain(porcelainOutput);

    return {
      branch,
      ahead,
      behind,
      modified,
      untracked,
      staged,
      conflicted,
      stashed,
      isClean: modified === 0 && untracked === 0 && staged === 0 && conflicted === 0,
      hasDiverged: ahead > 0 && behind > 0,
    };
  } catch (err) {
    if (opts.fallbackOnError) {
      return {
        branch: 'unknown',
        ahead: 0,
        behind: 0,
        modified: 0,
        untracked: 0,
        staged: 0,
        conflicted: 0,
        stashed: 0,
        isClean: true,
        hasDiverged: false,
      };
    }
    throw err;
  }
}
