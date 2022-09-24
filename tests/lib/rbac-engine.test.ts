import { describe, it, expect } from 'vitest';
import { RBACEngine } from '../../src/lib/rbac-engine';
import type { RBACConfig } from '../../src/lib/types';

function makeConfig(roles: Record<string, { permissions: string[]; inherits?: string[] }>): RBACConfig {
  const allPerms = new Set<string>();
  for (const r of Object.values(roles)) {
    r.permissions.forEach((p) => allPerms.add(p));
  }

  return {
    roles: Object.entries(roles).map(([id, r]) => ({
      id,
      name: id,
      description: `${id} role`,
      color: '#888',
      permissions: r.permissions,
      inherits: r.inherits,
    })),
    permissions: [...allPerms].map((p) => ({
      id: p,
      resource: p.split(':')[0] || p,
      action: p.split(':')[1] || p,
      description: p,
    })),
    policies: [],
  };
}

describe('RBAC engine', () => {
  it('resolves direct permission', () => {
    const engine = new RBACEngine(makeConfig({
      admin: { permissions: ['read', 'write', 'delete'] },
    }));
    expect(engine.hasPermission('admin', 'write')).toBe(true);
  });

  it('resolves inherited permission', () => {
    const engine = new RBACEngine(makeConfig({
      viewer: { permissions: ['read'] },
      editor: { inherits: ['viewer'], permissions: ['write'] },
    }));
    expect(engine.hasPermission('editor', 'read')).toBe(true);
    expect(engine.hasPermission('editor', 'write')).toBe(true);
  });

  it('rejects unauthorized permission', () => {
    const engine = new RBACEngine(makeConfig({
      viewer: { permissions: ['read'] },
    }));
    expect(engine.hasPermission('viewer', 'delete')).toBe(false);
  });

  it('resolves deep inheritance chain', () => {
    const engine = new RBACEngine(makeConfig({
      base: { permissions: ['read'] },
      mid: { inherits: ['base'], permissions: ['write'] },
      top: { inherits: ['mid'], permissions: ['admin'] },
    }));
    expect(engine.hasPermission('top', 'read')).toBe(true);
    expect(engine.hasPermission('top', 'write')).toBe(true);
    expect(engine.hasPermission('top', 'admin')).toBe(true);
  });

  it('lists all effective permissions for role', () => {
    const engine = new RBACEngine(makeConfig({
      viewer: { permissions: ['read'] },
      editor: { inherits: ['viewer'], permissions: ['write'] },
    }));
    const perms = engine.getEffectivePermissions('editor');
    expect(perms.has('read')).toBe(true);
    expect(perms.has('write')).toBe(true);
  });

  it('handles unknown role', () => {
    const engine = new RBACEngine(makeConfig({}));
    expect(engine.hasPermission('unknown', 'read')).toBe(false);
  });

  it('identifies permission source', () => {
    const engine = new RBACEngine(makeConfig({
      viewer: { permissions: ['read'] },
      editor: { inherits: ['viewer'], permissions: ['write'] },
    }));
    expect(engine.getPermissionSource('editor', 'read')).toBe('viewer');
    expect(engine.getPermissionSource('editor', 'write')).toBe('editor');
  });

  it('builds permission matrix', () => {
    const engine = new RBACEngine(makeConfig({
      viewer: { permissions: ['read'] },
      admin: { inherits: ['viewer'], permissions: ['write'] },
    }));
    const matrix = engine.buildMatrix();
    expect(matrix.length).toBeGreaterThan(0);
    const adminRead = matrix.find((c) => c.roleId === 'admin' && c.permissionId === 'read');
    expect(adminRead?.granted).toBe(true);
    expect(adminRead?.inherited).toBe(true);
  });

  it('validates config errors', () => {
    const config: RBACConfig = {
      roles: [
        { id: 'a', name: 'a', description: '', color: '#000', permissions: ['x'], inherits: ['missing'] },
      ],
      permissions: [],
      policies: [],
    };
    const engine = new RBACEngine(config);
    const errors = engine.validate();
    expect(errors.length).toBeGreaterThan(0);
  });
});
