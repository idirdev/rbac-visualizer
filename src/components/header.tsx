"use client";

import { AlertTriangle } from "lucide-react";

interface HeaderProps {
  view: string;
  roleCount: number;
  permissionCount: number;
  policyCount: number;
  errors: string[];
}

const viewTitles: Record<string, string> = {
  matrix: "Permission Matrix",
  graph: "Role Hierarchy",
  policies: "Policy Editor",
};

export function Header({ view, roleCount, permissionCount, policyCount, errors }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-surface-card flex items-center justify-between px-6">
      <div>
        <h2 className="text-sm font-semibold text-white">{viewTitles[view]}</h2>
      </div>
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span>{roleCount} roles</span>
        <span>{permissionCount} permissions</span>
        <span>{policyCount} policies</span>
        {errors.length > 0 && (
          <span className="flex items-center gap-1 text-amber-500">
            <AlertTriangle className="w-3 h-3" />
            {errors.length} issue{errors.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </header>
  );
}
