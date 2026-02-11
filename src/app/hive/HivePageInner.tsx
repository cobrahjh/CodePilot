"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowReloadHorizontalIcon } from "@hugeicons/core-free-icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useHive } from "@/hooks/useHive";
import { OverviewPanel } from "@/components/hive/OverviewPanel";
import { AgentsView } from "@/components/hive/AgentsView";
import { TaskQueue } from "@/components/hive/TaskQueue";
import { ActivityFeed } from "@/components/hive/ActivityFeed";
import { FileLocksView } from "@/components/hive/FileLocksView";

type HiveTab = "overview" | "agents" | "tasks" | "activity" | "locks";

export function HivePageInner() {
  const { state, health, connected, loading, error, refetch, addTask } = useHive();
  const [tab, setTab] = useState<HiveTab>("overview");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-6 pt-4 pb-0">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Hive Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Multi-agent coordination command center
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            disabled={loading}
            className="h-8 w-8"
          >
            <HugeiconsIcon
              icon={ArrowReloadHorizontalIcon}
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        {/* Error Banner */}
        {error && !connected && (
          <div className="mb-3 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as HiveTab)}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="locks">File Locks</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {tab === "overview" && (
          <OverviewPanel state={state} health={health} connected={connected} />
        )}
        {tab === "agents" && <AgentsView agents={state?.agents ?? []} />}
        {tab === "tasks" && (
          <TaskQueue tasks={state?.tasks ?? []} onAddTask={addTask} />
        )}
        {tab === "activity" && (
          <ActivityFeed
            decisions={state?.decisions ?? []}
            activity={state?.activity ?? []}
          />
        )}
        {tab === "locks" && <FileLocksView locks={state?.locks ?? []} />}
      </div>
    </div>
  );
}
