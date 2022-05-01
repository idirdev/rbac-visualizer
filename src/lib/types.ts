export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  inherits?: string[];
  permissions: string[];
  isSystem?: boolean;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  roles: string[];
  permissions: string[];
  conditions?: PolicyCondition[];
  effect: "allow" | "deny";
}

export interface PolicyCondition {
  field: string;
  operator: "eq" | "neq" | "in" | "contains" | "gt" | "lt";
  value: string | string[] | number;
}

export interface RBACConfig {
  roles: Role[];
  permissions: Permission[];
  policies: Policy[];
}

export interface MatrixCell {
  roleId: string;
  permissionId: string;
  granted: boolean;
  inherited: boolean;
  source?: string;
}
