"use client";

import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Shield, GitBranch, FileText } from "lucide-react";

type View = "matrix" | "graph" | "policies";

interface SidebarProps {
  roles: Role[];
  selectedRole: string | null;
  onSelectRole: (id: string | null) => void;
  view: View;
  onChangeView: (view: View) => void;
}

export function Sidebar({ roles, selectedRole, onSelectRole, view, onChangeView }: SidebarProps) {
  const views: { id: View; label: string; icon: typeof Shield }[] = [
    { id: "matrix", label: "Permission Matrix", icon: Shield },
    { id: "graph", label: "Role Hierarchy", icon: GitBranch },
    { id: "policies", label: "Policies", icon: FileText },
  ];

  return (
    <aside className="w-60 border-r border-border bg-surface-card flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">RBAC Visualizer</h1>
            <p className="text-xs text-zinc-500">Role-based access control</p>
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {views.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChangeView(id)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              view === id
                ? "bg-accent/10 text-accent"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-surface-hover"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <p className="text-xs text-zinc-500 font-medium mb-2 px-3">ROLES</p>
        <div className="space-y-1">
          <button
            onClick={() => onSelectRole(null)}
            className={cn(
              "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
              selectedRole === null
                ? "bg-surface-hover text-white"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            All Roles
          </button>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={cn(
                "w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors",
                selectedRole === role.id
                  ? "bg-surface-hover text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: role.color }}
              />
              {role.name}
              {role.isSystem && (
                <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded ml-auto">
                  SYSTEM
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
