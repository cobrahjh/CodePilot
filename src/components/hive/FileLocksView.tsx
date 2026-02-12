"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/hive";
import type { HiveFileLock } from "@/types";

interface FileLocksViewProps {
  locks: HiveFileLock[];
}

export function FileLocksView({ locks }: FileLocksViewProps) {
  if (locks.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No file locks active
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {locks.map((lock) => (
        <Card key={lock.file} className="py-3 gap-2">
          <CardContent className="px-4 space-y-2">
            <p className="truncate font-mono text-sm" title={lock.file}>
              {lock.file}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {lock.owner}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(lock.acquiredAt)}
              </span>
            </div>
            {lock.ttl != null && (
              <p className="text-xs text-muted-foreground">
                TTL: {Math.floor(lock.ttl / 1000)}s
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
