interface RoleConfig {
  permissions: string[];
  inherits?: string[];
}

interface DiffEntry {
  type: 'added' | 'removed' | 'modified';
  role: string;
  details: string;
}

export function diffConfigs(
  before: Record<string, RoleConfig>,
  after: Record<string, RoleConfig>
): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  const allRoles = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const role of allRoles) {
    const b = before[role];
    const a = after[role];

    if (!b && a) {
      diffs.push({ type: 'added', role, details: `New role with permissions: ${a.permissions.join(', ')}` });
      continue;
    }

    if (b && !a) {
      diffs.push({ type: 'removed', role, details: 'Role removed' });
      continue;
    }

    if (b && a) {
      const addedPerms = a.permissions.filter((p) => !b.permissions.includes(p));
      const removedPerms = b.permissions.filter((p) => !a.permissions.includes(p));
      const addedInherits = (a.inherits || []).filter((p) => !(b.inherits || []).includes(p));
      const removedInherits = (b.inherits || []).filter((p) => !(a.inherits || []).includes(p));

      const changes: string[] = [];
      if (addedPerms.length) changes.push(`+permissions: ${addedPerms.join(', ')}`);
      if (removedPerms.length) changes.push(`-permissions: ${removedPerms.join(', ')}`);
      if (addedInherits.length) changes.push(`+inherits: ${addedInherits.join(', ')}`);
      if (removedInherits.length) changes.push(`-inherits: ${removedInherits.join(', ')}`);

      if (changes.length > 0) {
        diffs.push({ type: 'modified', role, details: changes.join('; ') });
      }
    }
  }

  return diffs;
}
