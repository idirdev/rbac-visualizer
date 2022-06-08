"use client";

import type { Role, Permission, MatrixCell } from "@/lib/types";
import type { RBACEngine } from "@/lib/rbac-engine";
import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

interface Props {
  roles: Role[];
  permissions: Permission[];
  matrix: MatrixCell[];
  selectedRole: string | null;
  engine: RBACEngine;
}

export function PermissionMatrix({ roles, permissions, matrix, selectedRole }: Props) {
  const filteredRoles = selectedRole
    ? roles.filter((r) => r.id === selectedRole)
    : roles;

  const grouped = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getCell = (roleId: string, permId: string) =>
    matrix.find((c) => c.roleId === roleId && c.permissionId === permId);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-zinc-500 font-medium w-48 sticky left-0 bg-surface z-10">
              Permission
            </th>
            {filteredRoles.map((role) => (
              <th key={role.id} className="text-center py-3 px-3 min-w-[100px]">
                <div className="flex flex-col items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="text-zinc-300 font-medium">{role.name}</span>
                  <span className="text-[10px] text-zinc-600 font-normal">
                    {role.permissions.length} direct
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([resource, perms]) => (
            <>
              <tr key={resource}>
                <td
                  colSpan={filteredRoles.length + 1}
                  className="pt-4 pb-1 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider"
                >
                  {resource}
                </td>
              </tr>
              {perms.map((perm) => (
                <tr
                  key={perm.id}
                  className="border-b border-border/50 hover:bg-surface-hover/30 transition-colors"
                >
                  <td className="py-2 px-4 sticky left-0 bg-surface z-10">
                    <div className="flex flex-col">
                      <span className="text-zinc-300">{perm.action}</span>
                      <span className="text-[10px] text-zinc-600">{perm.description}</span>
                    </div>
                  </td>
                  {filteredRoles.map((role) => {
                    const cell = getCell(role.id, perm.id);
                    return (
                      <td key={role.id} className="py-2 px-3 text-center">
                        {cell?.granted ? (
                          <div
                            className={cn(
                              "inline-flex items-center justify-center w-7 h-7 rounded-md",
                              cell.inherited
                                ? "bg-zinc-800/50"
                                : "bg-accent/10"
                            )}
                            title={
                              cell.inherited
                                ? `Inherited from ${cell.source}`
                                : "Direct permission"
                            }
                          >
                            {cell.inherited ? (
                              <Minus className="w-3 h-3 text-zinc-500" />
                            ) : (
                              <Check
                                className="w-4 h-4"
                                style={{ color: role.color }}
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-800">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
