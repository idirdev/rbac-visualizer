"use client";

import { useState, useMemo } from "react";
import { sampleConfig } from "@/lib/sample-data";
import { RBACEngine } from "@/lib/rbac-engine";
import { Sidebar } from "@/components/sidebar";
import { PermissionMatrix } from "@/components/permission-matrix";
import { RoleGraph } from "@/components/role-graph";
import { PolicyEditor } from "@/components/policy-editor";
import { Header } from "@/components/header";

type View = "matrix" | "graph" | "policies";

export default function Home() {
  const [view, setView] = useState<View>("matrix");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [config] = useState(sampleConfig);

  const engine = useMemo(() => new RBACEngine(config), [config]);
  const matrix = useMemo(() => engine.buildMatrix(), [engine]);
  const hierarchy = useMemo(() => engine.getHierarchy(), [engine]);
  const errors = useMemo(() => engine.validate(), [engine]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        roles={config.roles}
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
        view={view}
        onChangeView={setView}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          view={view}
          roleCount={config.roles.length}
          permissionCount={config.permissions.length}
          policyCount={config.policies.length}
          errors={errors}
        />
        <div className="flex-1 overflow-auto p-6">
          {view === "matrix" && (
            <PermissionMatrix
              roles={config.roles}
              permissions={config.permissions}
              matrix={matrix}
              selectedRole={selectedRole}
              engine={engine}
            />
          )}
          {view === "graph" && (
            <RoleGraph roles={config.roles} hierarchy={hierarchy} engine={engine} />
          )}
          {view === "policies" && (
            <PolicyEditor policies={config.policies} roles={config.roles} />
          )}
        </div>
      </main>
    </div>
  );
}
