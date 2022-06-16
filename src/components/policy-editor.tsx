"use client";

import type { Policy, Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Shield, AlertTriangle } from "lucide-react";

interface Props {
  policies: Policy[];
  roles: Role[];
}

export function PolicyEditor({ policies, roles }: Props) {
  const roleMap = new Map(roles.map((r) => [r.id, r]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-medium text-zinc-400">
            {policies.length} policies defined
          </h3>
        </div>
        <button className="px-3 py-1.5 bg-accent/10 text-accent text-xs rounded-lg hover:bg-accent/20 transition-colors">
          + Add Policy
        </button>
      </div>

      {policies.map((policy) => (
        <div
          key={policy.id}
          className={cn(
            "rounded-xl border p-5",
            "bg-surface-card border-border hover:border-zinc-600 transition-colors"
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  policy.effect === "allow"
                    ? "bg-emerald-500/10"
                    : "bg-red-500/10"
                )}
              >
                {policy.effect === "allow" ? (
                  <Shield className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{policy.name}</h3>
                <p className="text-xs text-zinc-500">{policy.description}</p>
              </div>
            </div>
            <span
              className={cn(
                "text-[10px] px-2 py-1 rounded-full font-medium",
                policy.effect === "allow"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {policy.effect.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-zinc-600 mb-1.5 font-medium">Applies to</p>
              <div className="flex flex-wrap gap-1">
                {policy.roles.map((roleId) => {
                  const role = roleMap.get(roleId);
                  return (
                    <span
                      key={roleId}
                      className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300"
                      style={{ borderLeft: `2px solid ${role?.color || "#666"}` }}
                    >
                      {role?.name || roleId}
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-zinc-600 mb-1.5 font-medium">Permissions</p>
              <div className="flex flex-wrap gap-1">
                {policy.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-mono"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-zinc-600 mb-1.5 font-medium">Conditions</p>
              {policy.conditions && policy.conditions.length > 0 ? (
                <div className="space-y-1">
                  {policy.conditions.map((cond, i) => (
                    <div key={i} className="font-mono text-zinc-400">
                      <span className="text-zinc-500">{cond.field}</span>{" "}
                      <span className="text-accent">{cond.operator}</span>{" "}
                      <span className="text-emerald-400">
                        {typeof cond.value === "string" ? cond.value : JSON.stringify(cond.value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-zinc-600">No conditions</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
