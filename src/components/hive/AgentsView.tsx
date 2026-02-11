"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/hive";
import type { HiveAgent } from "@/types";

interface AgentsViewProps {
  agents: HiveAgent[];
}

export function AgentsView({ agents }: AgentsViewProps) {
  if (agents.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No agents connected
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <Card key={agent.id} className="py-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  {agent.status === "online" && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                      agent.status === "online" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </span>
                <Badge
                  variant={agent.status === "online" ? "secondary" : "outline"}
                  className="text-[10px]"
                >
                  {agent.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {agent.currentTask ? (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.currentTask}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Idle</p>
            )}
            <p className="text-xs text-muted-foreground">
              Last seen: {formatRelativeTime(agent.lastSeen)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
