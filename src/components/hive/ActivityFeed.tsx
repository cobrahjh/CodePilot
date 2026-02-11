"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelativeTime } from "@/lib/hive";
import type { HiveDecision, HiveActivity } from "@/types";

interface ActivityFeedProps {
  decisions: HiveDecision[];
  activity: HiveActivity[];
}

interface TimelineEntry {
  kind: "decision" | "activity";
  agent: string;
  message: string;
  detail?: string;
  timestamp: string;
}

export function ActivityFeed({ decisions, activity }: ActivityFeedProps) {
  const entries: TimelineEntry[] = [
    ...decisions.map(
      (d): TimelineEntry => ({
        kind: "decision",
        agent: d.agent,
        message: d.what,
        detail: d.why,
        timestamp: d.timestamp,
      })
    ),
    ...activity.map(
      (a): TimelineEntry => ({
        kind: "activity",
        agent: a.agent,
        message: a.action,
        detail: a.details,
        timestamp: a.timestamp,
      })
    ),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (entries.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No activity yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="space-y-3 pr-2">
        {entries.map((entry, i) => (
          <div key={`${entry.timestamp}-${i}`} className="flex gap-3 rounded-lg border p-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
              {entry.kind === "decision" ? "D" : "A"}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {entry.agent}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(entry.timestamp)}
                </span>
              </div>
              <p className="text-sm">{entry.message}</p>
              {entry.detail && (
                <p className="text-xs text-muted-foreground">{entry.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
