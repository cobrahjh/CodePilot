"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { HiveTask } from "@/types";

interface TaskQueueProps {
  tasks: HiveTask[];
  onAddTask: (task: string, priority: "low" | "normal" | "high") => Promise<void>;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-500/10 text-red-500",
  normal: "bg-blue-500/10 text-blue-500",
  low: "bg-gray-500/10 text-gray-500",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  in_progress: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
};

function TaskCard({ task }: { task: HiveTask }) {
  return (
    <Card className="py-3 gap-2">
      <CardContent className="px-4 space-y-2">
        <p className="text-sm line-clamp-3">{task.description}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={PRIORITY_STYLES[task.priority]}>
            {task.priority}
          </Badge>
          <Badge variant="outline" className={STATUS_STYLES[task.status]}>
            {task.status.replace("_", " ")}
          </Badge>
          {task.assignedTo && (
            <Badge variant="secondary" className="text-[10px]">
              {task.assignedTo}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TaskQueue({ tasks, onAddTask }: TaskQueueProps) {
  const [taskInput, setTaskInput] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [submitting, setSubmitting] = useState(false);

  const pending = tasks.filter((t) => t.status === "pending");
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const completed = tasks.filter((t) => t.status === "completed");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!taskInput.trim()) return;
    setSubmitting(true);
    try {
      await onAddTask(taskInput.trim(), priority);
      setTaskInput("");
      setPriority("normal");
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Add Task Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="task-input">New Task</Label>
          <Input
            id="task-input"
            placeholder="Describe the task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={submitting || !taskInput.trim()}>
          {submitting ? "Adding..." : "Add"}
        </Button>
      </form>

      {/* 3-Column Kanban */}
      <div className="grid grid-cols-3 gap-4 min-h-0">
        {/* Pending */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pending ({pending.length})
          </h3>
          <ScrollArea className="h-[calc(100vh-22rem)]">
            <div className="flex flex-col gap-2 pr-2">
              {pending.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">
                  No pending tasks
                </p>
              ) : (
                pending.map((t) => <TaskCard key={t.id} task={t} />)
              )}
            </div>
          </ScrollArea>
        </div>

        {/* In Progress */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            In Progress ({inProgress.length})
          </h3>
          <ScrollArea className="h-[calc(100vh-22rem)]">
            <div className="flex flex-col gap-2 pr-2">
              {inProgress.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">
                  No tasks in progress
                </p>
              ) : (
                inProgress.map((t) => <TaskCard key={t.id} task={t} />)
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Completed */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Completed ({completed.length})
          </h3>
          <ScrollArea className="h-[calc(100vh-22rem)]">
            <div className="flex flex-col gap-2 pr-2">
              {completed.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">
                  No completed tasks
                </p>
              ) : (
                completed.map((t) => <TaskCard key={t.id} task={t} />)
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
