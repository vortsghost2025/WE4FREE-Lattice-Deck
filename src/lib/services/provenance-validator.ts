import type { Provenance } from '@/lib/contracts/briefing';

export interface ProvenanceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProvenance(p: unknown, context: string = 'response'): ProvenanceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!p || typeof p !== 'object') {
    return { valid: false, errors: [`${context}: provenance is missing or not an object`], warnings: [] };
  }

  const prov = p as Record<string, unknown>;

  if (typeof prov.agentId !== 'string' || prov.agentId.trim() === '') {
    errors.push(`${context}: provenance.agentId is required and must be a non-empty string`);
  }

  if (typeof prov.agentVersion !== 'string' || prov.agentVersion.trim() === '') {
    errors.push(`${context}: provenance.agentVersion is required and must be a non-empty string`);
  }

  if (prov.model !== null && typeof prov.model !== 'string') {
    errors.push(`${context}: provenance.model must be a string or null`);
  }

  if (typeof prov.generatedAt !== 'string' || isNaN(Date.parse(prov.generatedAt))) {
    errors.push(`${context}: provenance.generatedAt must be a valid ISO 8601 string`);
  }

  if (typeof prov.sourceHashes !== 'object' || prov.sourceHashes === null || Array.isArray(prov.sourceHashes)) {
    errors.push(`${context}: provenance.sourceHashes must be a Record<string, string>`);
  }

  if (typeof prov.confidence !== 'number' || prov.confidence < 1 || prov.confidence > 10 || !Number.isInteger(prov.confidence)) {
    errors.push(`${context}: provenance.confidence must be an integer 1-10`);
  }

  if (prov.notes !== null && typeof prov.notes !== 'string') {
    errors.push(`${context}: provenance.notes must be a string or null`);
  }

  if (typeof prov.agentId === 'string' && prov.agentId.trim() !== '' && !/^[a-z0-9][a-z0-9\-]*/.test(prov.agentId as string)) {
    warnings.push(`${context}: provenance.agentId does not follow kebab-case convention`);
  }

  if (typeof prov.confidence === 'number' && prov.confidence < 5) {
    warnings.push(`${context}: provenance.confidence is below 5 — low confidence output`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function assertProvenance(p: unknown, context: string = 'response'): asserts p is Provenance {
  const result = validateProvenance(p, context);
  if (!result.valid) {
    throw new ProvenanceError(result.errors, context);
  }
}

export class ProvenanceError extends Error {
  public readonly errors: string[];
  public readonly context: string;

  constructor(errors: string[], context: string) {
    super(`Provenance validation failed for ${context}: ${errors.join('; ')}`);
    this.name = 'ProvenanceError';
    this.errors = errors;
    this.context = context;
  }
}
