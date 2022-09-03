import { describe, it, expect } from 'vitest';
import { diffConfigs } from '../../src/lib/diff';

describe('RBAC diff', () => {
  it('detects added role', () => {
    const before = { viewer: { permissions: ['read'] } };
    const after = { viewer: { permissions: ['read'] }, admin: { permissions: ['read', 'write'] } };
    const diffs = diffConfigs(before, after);
    expect(diffs).toContainEqual(expect.objectContaining({ type: 'added', role: 'admin' }));
  });

  it('detects removed role', () => {
    const before = { viewer: { permissions: ['read'] }, old: { permissions: ['x'] } };
    const after = { viewer: { permissions: ['read'] } };
    const diffs = diffConfigs(before, after);
    expect(diffs).toContainEqual(expect.objectContaining({ type: 'removed', role: 'old' }));
  });

  it('detects added permissions', () => {
    const before = { editor: { permissions: ['read'] } };
    const after = { editor: { permissions: ['read', 'write'] } };
    const diffs = diffConfigs(before, after);
    expect(diffs[0].type).toBe('modified');
    expect(diffs[0].details).toContain('+permissions');
    expect(diffs[0].details).toContain('write');
  });

  it('detects removed permissions', () => {
    const before = { editor: { permissions: ['read', 'write', 'delete'] } };
    const after = { editor: { permissions: ['read', 'write'] } };
    const diffs = diffConfigs(before, after);
    expect(diffs[0].details).toContain('-permissions');
    expect(diffs[0].details).toContain('delete');
  });

  it('returns empty for identical configs', () => {
    const config = { viewer: { permissions: ['read'] } };
    expect(diffConfigs(config, config)).toHaveLength(0);
  });
});
