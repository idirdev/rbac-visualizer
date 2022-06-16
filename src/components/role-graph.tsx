"use client";

import type { Role } from "@/lib/types";
import type { RBACEngine } from "@/lib/rbac-engine";
import { cn } from "@/lib/utils";

interface HierarchyNode {
  id: string;
  name: string;
  children: string[];
  depth: number;
}

interface Props {
  roles: Role[];
  hierarchy: HierarchyNode[];
  engine: RBACEngine;
}

export function RoleGraph({ roles, hierarchy, engine }: Props) {
  const roleMap = new Map(roles.map((r) => [r.id, r]));
  const maxDepth = Math.max(...hierarchy.map((h) => h.depth));

  // Group by depth
  const byDepth: Map<number, HierarchyNode[]> = new Map();
  for (const node of hierarchy) {
    const arr = byDepth.get(node.depth) || [];
    arr.push(node);
    byDepth.set(node.depth, arr);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-8">
        {Array.from({ length: maxDepth + 1 }, (_, depth) => {
          const nodes = byDepth.get(depth) || [];
          return (
            <div key={depth} className="flex items-center gap-6">
              {nodes.map((node) => {
                const role = roleMap.get(node.id);
                if (!role) return null;
                const effectivePerms = engine.getEffectivePermissions(node.id);

                return (
                  <div key={node.id} className="flex flex-col items-center gap-2">
                    {/* Connection lines to parents */}
                    {role.inherits && role.inherits.length > 0 && (
                      <div className="text-xs text-zinc-600 mb-1">
                        inherits from{" "}
                        {role.inherits
                          .map((p) => roleMap.get(p)?.name || p)
                          .join(", ")}
                      </div>
                    )}

                    {/* Role card */}
                    <div
                      className={cn(
                        "relative w-56 rounded-xl border p-4",
                        "bg-surface-card border-border hover:border-zinc-600 transition-colors"
                      )}
                    >
                      <div
                        className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
                        style={{ backgroundColor: role.color }}
                      />
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <h3 className="text-sm font-semibold text-white">
                          {role.name}
                        </h3>
                        {role.isSystem && (
                          <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1 rounded ml-auto">
                            SYS
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mb-3">{role.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                        <span>{role.permissions.length} direct</span>
                        <span>{effectivePerms.size} effective</span>
                        {role.inherits && (
                          <span>{role.inherits.length} parent(s)</span>
                        )}
                      </div>
                    </div>

                    {/* Arrow down */}
                    {node.children.length > 0 && (
                      <div className="flex flex-col items-center">
                        <div className="w-px h-4 bg-zinc-700" />
                        <div className="w-2 h-2 border-b border-r border-zinc-700 rotate-45 -mt-1" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-zinc-500 border-t border-border pt-4">
        <span>Roles inherit all permissions from their parent roles</span>
        <span>·</span>
        <span>Higher depth = more permissions</span>
      </div>
    </div>
  );
}
