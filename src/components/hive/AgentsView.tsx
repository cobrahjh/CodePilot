"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/hive";
import type { HiveAgent } from "@/types";

interface AgentsViewProps {
  agents: HiveAgent[];
}

const TYPE_STYLES: Record<string, string> = {
  coordinator: "bg-purple-500/10 text-purple-500",
  orchestrator: "bg-blue-500/10 text-blue-500",
  agent: "bg-green-500/10 text-green-500",
  service: "bg-sky-500/10 text-sky-500",
  relay: "bg-orange-500/10 text-orange-500",
  llm: "bg-yellow-500/10 text-yellow-600",
  registry: "bg-teal-500/10 text-teal-500",
  "mcp-bridge": "bg-indigo-500/10 text-indigo-500",
  daemon: "bg-pink-500/10 text-pink-500",
};

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
          <CardContent className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={TYPE_STYLES[agent.type] ?? "bg-gray-500/10 text-gray-500"}
              >
                {agent.type}
              </Badge>
              {agent.capabilities?.map((cap) => (
                <Badge key={cap} variant="outline" className="text-[10px]">
                  {cap}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground truncate" title={agent.url}>
              {agent.url}
            </p>
            <p className="text-xs text-muted-foreground">
              Last seen: {formatRelativeTime(agent.lastSeen)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
