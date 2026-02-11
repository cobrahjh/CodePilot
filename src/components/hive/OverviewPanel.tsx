"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HiveState, HiveHealthResponse } from "@/types";

interface OverviewPanelProps {
  state: HiveState | null;
  health: HiveHealthResponse | null;
  connected: boolean;
}

export function OverviewPanel({ state, health, connected }: OverviewPanelProps) {
  const agentCount = state?.agents?.length ?? health?.agentCount ?? 0;
  const activeTasks = state?.tasks?.filter((t) => t.status !== "completed").length ?? 0;
  const lockCount = state?.locks?.length ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Connection Status */}
      <Card className="py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {connected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </span>
            <Badge variant={connected ? "secondary" : "destructive"}>
              {connected ? "Online" : "Offline"}
            </Badge>
          </div>
          {health?.uptime != null && (
            <p className="mt-1 text-xs text-muted-foreground">
              Uptime: {Math.floor(health.uptime / 60)}m
            </p>
          )}
        </CardContent>
      </Card>

      {/* Agent Count */}
      <Card className="py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{agentCount}</p>
          <p className="text-xs text-muted-foreground">
            {state?.agents?.filter((a) => a.status === "online").length ?? 0} online
          </p>
        </CardContent>
      </Card>

      {/* Active Tasks */}
      <Card className="py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{activeTasks}</p>
          <p className="text-xs text-muted-foreground">
            {state?.tasks?.filter((t) => t.status === "in_progress").length ?? 0} in progress
          </p>
        </CardContent>
      </Card>

      {/* File Locks */}
      <Card className="py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            File Locks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{lockCount}</p>
          <p className="text-xs text-muted-foreground">
            {lockCount === 1 ? "1 file locked" : `${lockCount} files locked`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
