import { describe, it, expect } from 'vitest';
import {
  parseGitLog,
  inferEventType,
  inferLaneId,
  inferClassification,
  transformCommitToTimelineEvent,
  getGitTimelineEvents,
} from '../../src/lib/services/git-commit-adapter';
import type { GitCommitRaw } from '../../src/lib/services/git-commit-adapter';
import type { TimelineEventContract } from '../../src/lib/contracts/types';

describe('git-commit-adapter', () => {
  describe('parseGitLog', () => {
    it('parses git log output into GitCommitRaw array', () => {
      const output = [
        'abc1234567890def',
        'Sean',
        '2026-05-14T10:00:00+00:00',
        'feat(briefing): add git-commit adapter',
        'This commit adds the git-commit adapter.',
        '---COMMIT---',
        'def4567890abc123',
        'Agent',
        '2026-05-14T09:00:00+00:00',
        'fix: repair timeline merge',
        '',
        '---COMMIT---',
      ].join('\n');

      const commits = parseGitLog(output);
      expect(commits).toHaveLength(2);
      expect(commits[0].hash).toBe('abc1234567890def');
      expect(commits[0].shortHash).toBe('abc1234');
      expect(commits[0].author).toBe('Sean');
      expect(commits[0].date).toBe('2026-05-14T10:00:00+00:00');
      expect(commits[0].subject).toBe('feat(briefing): add git-commit adapter');
      expect(commits[0].body).toBe('This commit adds the git-commit adapter.');
    });

    it('returns empty array for empty input', () => {
      expect(parseGitLog('')).toEqual([]);
      expect(parseGitLog('   ')).toEqual([]);
    });

    it('filters out empty commit blocks', () => {
      const output = '---COMMIT-----COMMIT---';
      expect(parseGitLog(output)).toEqual([]);
    });
  });

  describe('inferEventType', () => {
    it('maps fix/bug/repair/revert subjects to REPAIR', () => {
      expect(inferEventType('fix: resolve crash')).toBe('REPAIR');
      expect(inferEventType('bug: null pointer')).toBe('REPAIR');
      expect(inferEventType('repair: fix corruption')).toBe('REPAIR');
    });

    it('maps feat/add/progress subjects to PROGRESSION', () => {
      expect(inferEventType('feat: add new feature')).toBe('PROGRESSION');
      expect(inferEventType('add: new component')).toBe('PROGRESSION');
      expect(inferEventType('implement: streaming')).toBe('PROGRESSION');
    });

    it('maps refactor/dedup/clean subjects to DUPLICATION', () => {
      expect(inferEventType('refactor: extract utils')).toBe('DUPLICATION');
      expect(inferEventType('dedup: remove copies')).toBe('DUPLICATION');
    });

    it('maps sync/reconcile/merge subjects to RECONCILIATION', () => {
      expect(inferEventType('sync: align states')).toBe('RECONCILIATION');
      expect(inferEventType('merge: combine branches')).toBe('RECONCILIATION');
    });

    it('maps ci/infra/build/chore subjects to INFRASTRUCTURE', () => {
      expect(inferEventType('ci: add workflow')).toBe('INFRASTRUCTURE');
      expect(inferEventType('chore: update deps')).toBe('INFRASTRUCTURE');
      expect(inferEventType('build: fix bundling')).toBe('INFRASTRUCTURE');
    });

    it('maps revert/undo/rollback subjects to UNDO', () => {
      expect(inferEventType('revert: bad commit')).toBe('UNDO');
      expect(inferEventType('undo: rollback change')).toBe('UNDO');
    });

    it('defaults to PROGRESSION for unknown patterns', () => {
      expect(inferEventType('random message')).toBe('PROGRESSION');
    });
  });

  describe('inferLaneId', () => {
    it('detects archivist from subject/body', () => {
      expect(inferLaneId('feat(archivist): add compact', '')).toBe('archivist');
      expect(inferLaneId('update logic', 'archivist lane change')).toBe('archivist');
    });

    it('detects library from subject/body', () => {
      expect(inferLaneId('fix(library): graph scope', '')).toBe('library');
    });

    it('detects swarmmind/swarm from subject/body', () => {
      expect(inferLaneId('feat(swarmmind): loop iteration', '')).toBe('swarmmind');
      expect(inferLaneId('swarm check', '')).toBe('swarmmind');
    });

    it('detects kernel from subject/body', () => {
      expect(inferLaneId('feat(kernel): health signal', '')).toBe('kernel');
    });

    it('detects control-plane/coordinator/rig from subject/body', () => {
      expect(inferLaneId('feat(control-plane): coordination', '')).toBe('control-plane');
      expect(inferLaneId('rig update', '')).toBe('control-plane');
    });

    it('defaults to kernel when no lane keyword found', () => {
      expect(inferLaneId('update README', '')).toBe('kernel');
    });
  });

  describe('inferClassification', () => {
    it('classifies conventional commits as autonomous', () => {
      expect(inferClassification('feat: add feature')).toBe('autonomous');
      expect(inferClassification('fix: repair bug')).toBe('autonomous');
      expect(inferClassification('refactor: clean up')).toBe('autonomous');
      expect(inferClassification('test: add tests')).toBe('autonomous');
    });

    it('classifies wip/manual/operator as operator', () => {
      expect(inferClassification('wip: work in progress')).toBe('operator');
      expect(inferClassification('manual edit')).toBe('operator');
    });

    it('defaults to operator for non-conventional messages', () => {
      expect(inferClassification('random message')).toBe('operator');
    });
  });

  describe('transformCommitToTimelineEvent', () => {
    it('transforms a GitCommitRaw into a TimelineEventContract', () => {
      const commit: GitCommitRaw = {
        hash: 'f5cac6212345678abcdef',
        shortHash: 'f5cac62',
        author: 'Sean',
        date: '2026-05-14T10:00:00+00:00',
        subject: 'feat(context): update memory bank',
        body: 'Updated context.md with latest SHA.',
        refNames: '',
      };

      const event = transformCommitToTimelineEvent(commit);

      expect(event.id).toBe('git-f5cac62');
      expect(event.timestamp).toBe('2026-05-14T10:00:00+00:00');
      expect(event.type).toBe('PROGRESSION');
      expect(event.title).toBe('feat(context): update memory bank');
      expect(event.laneId).toBe('kernel');
      expect(event.gitRef).toBe('f5cac62');
      expect(event.attribution).toBe('Sean');
      expect(event.classification).toBe('autonomous');
    });

    it('falls back to subject for description when body is empty', () => {
      const commit: GitCommitRaw = {
        hash: 'abc1234567',
        shortHash: 'abc1234',
        author: 'Agent',
        date: '2026-05-14T08:00:00Z',
        subject: 'fix: repair crash',
        body: '',
        refNames: '',
      };

      const event = transformCommitToTimelineEvent(commit);
      expect(event.description).toBe('fix: repair crash');
    });
  });

  describe('getGitTimelineEvents (integration)', () => {
    it('returns TimelineEventContract array from real git repo', () => {
      const events = getGitTimelineEvents({
        repoPath: process.cwd(),
        maxCommits: 5,
        fallbackOnError: true,
      });

      expect(Array.isArray(events)).toBe(true);
      if (events.length > 0) {
        const e = events[0] as TimelineEventContract;
        expect(e).toHaveProperty('id');
        expect(e).toHaveProperty('timestamp');
        expect(e).toHaveProperty('type');
        expect(e).toHaveProperty('title');
        expect(e).toHaveProperty('laneId');
        expect(e).toHaveProperty('classification');
        expect(e.id).toMatch(/^git-/);
        expect(e.gitRef).toBeTruthy();
      }
    });

    it('returns empty array on invalid repo path when fallbackOnError is true', () => {
      const events = getGitTimelineEvents({
        repoPath: '/nonexistent/path',
        fallbackOnError: true,
      });
      expect(events).toEqual([]);
    });

    it('throws on invalid repo path when fallbackOnError is false', () => {
      expect(() =>
        getGitTimelineEvents({
          repoPath: '/nonexistent/path',
          fallbackOnError: false,
        }),
      ).toThrow();
    });
  });
});
