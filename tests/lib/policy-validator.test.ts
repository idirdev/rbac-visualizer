import { describe, it, expect } from 'vitest';
import { validatePolicy } from '../../src/lib/policy-validator';

describe('policy validator', () => {
  it('passes valid policy', () => {
    const errors = validatePolicy({
      viewer: { permissions: ['read'] },
      editor: { permissions: ['write'], inherits: ['viewer'] },
    });
    expect(errors).toHaveLength(0);
  });

  it('detects missing parent', () => {
    const errors = validatePolicy({
      editor: { permissions: ['write'], inherits: ['nonexistent'] },
    });
    expect(errors.some((e) => e.type === 'missing_parent')).toBe(true);
  });

  it('detects cycles', () => {
    const errors = validatePolicy({
      a: { permissions: ['x'], inherits: ['b'] },
      b: { permissions: ['y'], inherits: ['a'] },
    });
    expect(errors.some((e) => e.type === 'cycle')).toBe(true);
  });

  it('detects duplicate permissions', () => {
    const errors = validatePolicy({
      admin: { permissions: ['read', 'write', 'read'] },
    });
    expect(errors.some((e) => e.type === 'duplicate_permission')).toBe(true);
  });

  it('detects empty roles', () => {
    const errors = validatePolicy({
      empty: { permissions: [] },
    });
    expect(errors.some((e) => e.type === 'empty_role')).toBe(true);
  });
});
