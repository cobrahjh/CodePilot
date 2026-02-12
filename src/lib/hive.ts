import type {
  HiveRawState,
  HiveState,
  HiveAgent,
  HiveTask,
  HiveFileLock,
} from '@/types';

export const HIVE_BASE_URL = process.env.HIVE_URL || 'http://localhost:8700';

export async function fetchHive(path: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${HIVE_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

export function formatRelativeTime(ts: number | string): string {
  const date = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

/**
 * Normalize the raw Hivemind /api/state response into a flat UI-friendly shape.
 * Deduplicates agents by name (keeps the most recently seen entry).
 */
export function normalizeHiveState(raw: HiveRawState): HiveState {
  // --- Agents: merge discovered + manual, deduplicate by name ---
  const agentsByName = new Map<string, HiveAgent>();

  for (const [key, a] of Object.entries(raw.agents?.discovered ?? {})) {
    const existing = agentsByName.get(a.name);
    if (!existing || a.lastSeen > existing.lastSeen) {
      agentsByName.set(a.name, {
        id: key,
        name: a.name,
        type: a.type,
        host: a.host,
        url: a.url,
        status: a.status,
        lastSeen: a.lastSeen,
      });
    }
  }

  for (const [key, a] of Object.entries(raw.agents?.manual ?? {})) {
    const existing = agentsByName.get(a.name);
    if (!existing || (a.registeredAt ?? 0) > existing.lastSeen) {
      agentsByName.set(a.name, {
        id: key,
        name: a.name,
        type: a.type,
        host: '',
        url: a.url,
        status: a.status,
        lastSeen: a.registeredAt ?? Date.now(),
        capabilities: a.capabilities,
      });
    }
  }

  const agents = Array.from(agentsByName.values()).sort((a, b) => {
    if (a.status === b.status) return b.lastSeen - a.lastSeen;
    return a.status === 'online' ? -1 : 1;
  });

  // --- Tasks: merge pending + claimed + completed ---
  const tasks: HiveTask[] = [];

  for (const t of raw.tasks?.pending ?? []) {
    tasks.push({
      id: t.id,
      description: t.task,
      status: 'pending',
      priority: t.priority,
      addedAt: t.addedAt,
    });
  }

  for (const [taskId, info] of Object.entries(raw.tasks?.claimed ?? {})) {
    const claimInfo = info as { agent?: string; task?: string; priority?: string; claimedAt?: number };
    tasks.push({
      id: taskId,
      description: claimInfo.task ?? taskId,
      status: 'in_progress',
      priority: (claimInfo.priority as HiveTask['priority']) ?? 'normal',
      assignedTo: claimInfo.agent,
    });
  }

  for (const t of raw.tasks?.completed ?? []) {
    tasks.push({
      id: t.id,
      description: t.result || t.id,
      status: 'completed',
      priority: 'normal',
      assignedTo: t.agent,
      completedAt: t.completedAt,
      result: t.result,
    });
  }

  // --- Locks ---
  const locks: HiveFileLock[] = Object.entries(raw.locks ?? {}).map(
    ([file, lock]) => ({
      file,
      owner: lock.owner,
      acquiredAt: lock.acquiredAt,
      ttl: lock.ttl,
    })
  );

  // --- Decisions from context.recentDecisions ---
  const decisions = raw.context?.recentDecisions ?? [];

  // --- Activity ---
  const activity = raw.activity ?? [];

  return { agents, tasks, locks, decisions, activity };
}
