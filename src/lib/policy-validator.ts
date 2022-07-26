interface RoleConfig {
  permissions: string[];
  inherits?: string[];
}

interface ValidationError {
  type: 'cycle' | 'missing_parent' | 'duplicate_permission' | 'empty_role';
  role: string;
  details: string;
}

export function validatePolicy(roles: Record<string, RoleConfig>): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [name, config] of Object.entries(roles)) {
    if (config.permissions.length === 0 && !config.inherits?.length) {
      errors.push({ type: 'empty_role', role: name, details: 'Role has no permissions and no inheritance' });
    }

    if (config.inherits) {
      for (const parent of config.inherits) {
        if (!roles[parent]) {
          errors.push({ type: 'missing_parent', role: name, details: `Parent role "${parent}" does not exist` });
        }
      }
    }

    const dupes = config.permissions.filter((p, i) => config.permissions.indexOf(p) !== i);
    if (dupes.length > 0) {
      errors.push({ type: 'duplicate_permission', role: name, details: `Duplicate: ${dupes.join(', ')}` });
    }
  }

  const cycles = detectCycles(roles);
  errors.push(...cycles);

  return errors;
}

function detectCycles(roles: Record<string, RoleConfig>): ValidationError[] {
  const errors: ValidationError[] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(role: string, path: string[]): boolean {
    if (inStack.has(role)) {
      errors.push({
        type: 'cycle',
        role,
        details: `Cycle detected: ${[...path, role].join(' -> ')}`,
      });
      return true;
    }
    if (visited.has(role)) return false;

    visited.add(role);
    inStack.add(role);

    for (const parent of roles[role]?.inherits || []) {
      if (dfs(parent, [...path, role])) return true;
    }

    inStack.delete(role);
    return false;
  }

  for (const role of Object.keys(roles)) {
    if (!visited.has(role)) dfs(role, []);
  }

  return errors;
}
