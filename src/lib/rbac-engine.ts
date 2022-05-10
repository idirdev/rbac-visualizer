import type { Role, Permission, RBACConfig, MatrixCell } from "./types";

export class RBACEngine {
  private roles: Map<string, Role>;
  private permissions: Map<string, Permission>;

  constructor(config: RBACConfig) {
    this.roles = new Map(config.roles.map((r) => [r.id, r]));
    this.permissions = new Map(config.permissions.map((p) => [p.id, p]));
  }

  /**
   * Get all effective permissions for a role, including inherited ones.
   */
  getEffectivePermissions(roleId: string, visited = new Set<string>()): Set<string> {
    if (visited.has(roleId)) return new Set();
    visited.add(roleId);

    const role = this.roles.get(roleId);
    if (!role) return new Set();

    const perms = new Set(role.permissions);

    if (role.inherits) {
      for (const parentId of role.inherits) {
        const parentPerms = this.getEffectivePermissions(parentId, visited);
        parentPerms.forEach((p) => perms.add(p));
      }
    }

    return perms;
  }

  /**
   * Check if a role has a specific permission (directly or inherited).
   */
  hasPermission(roleId: string, permissionId: string): boolean {
    return this.getEffectivePermissions(roleId).has(permissionId);
  }

  /**
   * Get the source of a permission (direct or which parent role).
   */
  getPermissionSource(roleId: string, permissionId: string): string | null {
    const role = this.roles.get(roleId);
    if (!role) return null;

    if (role.permissions.includes(permissionId)) return roleId;

    if (role.inherits) {
      for (const parentId of role.inherits) {
        const source = this.getPermissionSource(parentId, permissionId);
        if (source) return source;
      }
    }

    return null;
  }

  /**
   * Build the full permission matrix for all roles.
   */
  buildMatrix(): MatrixCell[] {
    const cells: MatrixCell[] = [];

    for (const [roleId, role] of this.roles) {
      const effective = this.getEffectivePermissions(roleId);

      for (const [permId] of this.permissions) {
        const granted = effective.has(permId);
        const isDirect = role.permissions.includes(permId);
        const source = granted ? this.getPermissionSource(roleId, permId) : undefined;

        cells.push({
          roleId,
          permissionId: permId,
          granted,
          inherited: granted && !isDirect,
          source: source || undefined,
        });
      }
    }

    return cells;
  }

  /**
   * Get role hierarchy as a tree structure.
   */
  getHierarchy(): { id: string; name: string; children: string[]; depth: number }[] {
    const result: { id: string; name: string; children: string[]; depth: number }[] = [];

    const getDepth = (roleId: string, visited = new Set<string>()): number => {
      if (visited.has(roleId)) return 0;
      visited.add(roleId);
      const role = this.roles.get(roleId);
      if (!role?.inherits?.length) return 0;
      return 1 + Math.max(...role.inherits.map((p) => getDepth(p, visited)));
    };

    for (const [id, role] of this.roles) {
      const children = [...this.roles.values()]
        .filter((r) => r.inherits?.includes(id))
        .map((r) => r.id);

      result.push({
        id,
        name: role.name,
        children,
        depth: getDepth(id),
      });
    }

    return result.sort((a, b) => a.depth - b.depth);
  }

  /**
   * Validate the RBAC config for circular inheritance, missing references, etc.
   */
  validate(): string[] {
    const errors: string[] = [];

    for (const [id, role] of this.roles) {
      if (role.inherits) {
        for (const parentId of role.inherits) {
          if (!this.roles.has(parentId)) {
            errors.push(`Role "${id}" inherits from unknown role "${parentId}"`);
          }
        }
      }

      for (const permId of role.permissions) {
        if (!this.permissions.has(permId)) {
          errors.push(`Role "${id}" references unknown permission "${permId}"`);
        }
      }

      // Check circular inheritance
      const visited = new Set<string>();
      const checkCircular = (rid: string): boolean => {
        if (visited.has(rid)) return true;
        visited.add(rid);
        const r = this.roles.get(rid);
        return r?.inherits?.some((p) => checkCircular(p)) || false;
      };
      if (checkCircular(id)) {
        errors.push(`Circular inheritance detected involving role "${id}"`);
      }
    }

    return errors;
  }
}
