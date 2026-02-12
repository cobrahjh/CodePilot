import { fetchHive, normalizeHiveState } from '@/lib/hive';

export async function GET() {
  try {
    const res = await fetchHive('/api/state');
    if (!res.ok) {
      return Response.json({ error: 'Hivemind unavailable' }, { status: 502 });
    }
    const raw = await res.json();
    const normalized = normalizeHiveState(raw);
    return Response.json(normalized);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reach Hivemind';
    return Response.json({ error: message }, { status: 502 });
  }
}
