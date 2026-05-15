import { describe, it, expect } from 'vitest';
import { validateProvenance, assertProvenance, ProvenanceError } from '@/lib/services/provenance-validator';
import type { Provenance } from '@/lib/contracts/briefing';

const validProvenance: Provenance = {
  agentId: 'we4free-briefing-agent-v1',
  agentVersion: '1.1.0',
  model: null,
  generatedAt: new Date().toISOString(),
  sourceHashes: {},
  confidence: 9,
  notes: null,
};

describe('validateProvenance', () => {
  it('accepts valid provenance', () => {
    const result = validateProvenance(validProvenance);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects null input', () => {
    const result = validateProvenance(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('missing or not an object');
  });

  it('rejects undefined input', () => {
    const result = validateProvenance(undefined);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('missing or not an object');
  });

  it('rejects empty object', () => {
    const result = validateProvenance({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  it('rejects missing agentId', () => {
    const { agentId: _, ...noId } = validProvenance;
    const result = validateProvenance(noId);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('agentId'))).toBe(true);
  });

  it('rejects empty string agentId', () => {
    const result = validateProvenance({ ...validProvenance, agentId: '  ' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('agentId'))).toBe(true);
  });

  it('rejects invalid ISO date', () => {
    const result = validateProvenance({ ...validProvenance, generatedAt: 'not-a-date' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('generatedAt'))).toBe(true);
  });

  it('rejects confidence out of range (0)', () => {
    const result = validateProvenance({ ...validProvenance, confidence: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('confidence'))).toBe(true);
  });

  it('rejects confidence out of range (11)', () => {
    const result = validateProvenance({ ...validProvenance, confidence: 11 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('confidence'))).toBe(true);
  });

  it('rejects non-integer confidence', () => {
    const result = validateProvenance({ ...validProvenance, confidence: 7.5 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('confidence'))).toBe(true);
  });

  it('rejects array sourceHashes', () => {
    const result = validateProvenance({ ...validProvenance, sourceHashes: [] as unknown as Record<string, string> });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('sourceHashes'))).toBe(true);
  });

  it('accepts model as string', () => {
    const result = validateProvenance({ ...validProvenance, model: 'gpt-4' });
    expect(result.valid).toBe(true);
  });

  it('accepts model as null', () => {
    const result = validateProvenance({ ...validProvenance, model: null });
    expect(result.valid).toBe(true);
  });

  it('rejects model as number', () => {
    const result = validateProvenance({ ...validProvenance, model: 42 as unknown as string });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('model'))).toBe(true);
  });

  it('warns on low confidence', () => {
    const result = validateProvenance({ ...validProvenance, confidence: 3 });
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.includes('low confidence'))).toBe(true);
  });

  it('warns on non-kebab-case agentId', () => {
    const result = validateProvenance({ ...validProvenance, agentId: 'MyAgent_V2' });
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.includes('kebab-case'))).toBe(true);
  });

  it('includes context in error messages', () => {
    const result = validateProvenance(null, 'test-context');
    expect(result.errors[0]).toContain('test-context');
  });
});

describe('assertProvenance', () => {
  it('does not throw for valid provenance', () => {
    expect(() => assertProvenance(validProvenance)).not.toThrow();
  });

  it('throws ProvenanceError for invalid provenance', () => {
    expect(() => assertProvenance(null)).toThrow(ProvenanceError);
  });

  it('ProvenanceError has errors array', () => {
    try {
      assertProvenance(null);
    } catch (e) {
      expect(e).toBeInstanceOf(ProvenanceError);
      expect((e as ProvenanceError).errors.length).toBeGreaterThan(0);
      expect((e as ProvenanceError).context).toBe('response');
    }
  });
});
