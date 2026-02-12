"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HiveState, HiveHealthResponse } from "@/types";

interface UseHiveReturn {
  state: HiveState | null;
  health: HiveHealthResponse | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  addTask: (task: string, priority?: "low" | "normal" | "high") => Promise<void>;
}

export function useHive(): UseHiveReturn {
  const [state, setState] = useState<HiveState | null>(null);
  const [health, setHealth] = useState<HiveHealthResponse | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stateRes, healthRes] = await Promise.all([
        fetch("/api/hive/state"),
        fetch("/api/hive/health"),
      ]);

      if (stateRes.ok) {
        const stateData = await stateRes.json();
        setState(stateData);
        setConnected(true);
      } else {
        setConnected(false);
        setError("Hivemind unavailable");
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData);
      }
    } catch {
      setConnected(false);
      setError("Failed to connect to Hivemind");
    } finally {
      setLoading(false);
    }
  }, []);

  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const es = new EventSource("/api/hive/events");
    eventSourceRef.current = es;

    es.addEventListener("hive:state", (event) => {
      try {
        const data = JSON.parse(event.data);
        setState(data);
        setConnected(true);
        setError(null);
      } catch {
        // ignore parse errors
      }
    });

    es.addEventListener("hive:error", (event) => {
      try {
        const data = JSON.parse(event.data);
        setError(data.message);
        setConnected(false);
      } catch {
        setError("Connection error");
        setConnected(false);
      }
    });

    es.onerror = () => {
      setConnected(false);
      setError("SSE connection lost");
      es.close();
      // Reconnect after 5 seconds
      reconnectTimerRef.current = setTimeout(connectSSE, 5000);
    };
  }, []);

  useEffect(() => {
    fetchInitial();
    connectSSE();

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [fetchInitial, connectSSE]);

  const refetch = useCallback(() => {
    fetchInitial();
  }, [fetchInitial]);

  const addTask = useCallback(
    async (task: string, priority: "low" | "normal" | "high" = "normal") => {
      const res = await fetch("/api/hive/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, priority }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add task");
      }
      // Refetch to pick up the new task
      await fetchInitial();
    },
    [fetchInitial]
  );

  return { state, health, connected, loading, error, refetch, addTask };
}
