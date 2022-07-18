import { describe, it, expect } from 'vitest';

describe('RBAC engine', () => {
  it('resolves direct permission', () => {
    const engine = createEngine({
      roles: { admin: { permissions: ['read', 'write', 'delete'] } },
    });
    expect(engine.hasPermission('admin', 'write')).toBe(true);
  });

  it('resolves inherited permission', () => {
    const engine = createEngine({
      roles: {
        viewer: { permissions: ['read'] },
        editor: { inherits: ['viewer'], permissions: ['write'] },
      },
    });
    expect(engine.hasPermission('editor', 'read')).toBe(true);
    expect(engine.hasPermission('editor', 'write')).toBe(true);
  });

  it('rejects unauthorized permission', () => {
    const engine = createEngine({
      roles: { viewer: { permissions: ['read'] } },
    });
    expect(engine.hasPermission('viewer', 'delete')).toBe(false);
  });

  it('resolves deep inheritance chain', () => {
    const engine = createEngine({
      roles: {
        base: { permissions: ['read'] },
        mid: { inherits: ['base'], permissions: ['write'] },
        top: { inherits: ['mid'], permissions: ['admin'] },
      },
    });
    expect(engine.hasPermission('top', 'read')).toBe(true);
    expect(engine.hasPermission('top', 'write')).toBe(true);
    expect(engine.hasPermission('top', 'admin')).toBe(true);
  });

  it('lists all permissions for role', () => {
    const engine = createEngine({
      roles: {
        viewer: { permissions: ['read'] },
        editor: { inherits: ['viewer'], permissions: ['write'] },
      },
    });
    const perms = engine.getAllPermissions('editor');
    expect(perms).toContain('read');
    expect(perms).toContain('write');
  });

  it('handles unknown role', () => {
    const engine = createEngine({ roles: {} });
    expect(engine.hasPermission('unknown', 'read')).toBe(false);
  });
});

function createEngine(config: any) {
  return {
    hasPermission(role: string, perm: string): boolean {
      const perms = this.getAllPermissions(role);
      return perms.includes(perm);
    },
    getAllPermissions(role: string): string[] {
      const r = config.roles[role];
      if (!r) return [];
      const inherited = (r.inherits || []).flatMap((p: string) => this.getAllPermissions(p));
      return [...new Set([...inherited, ...(r.permissions || [])])];
    },
  };
}
