import { fetchHive } from '@/lib/hive';

export async function GET() {
  try {
    const res = await fetchHive('/api/state');
    if (!res.ok) {
      return Response.json({ error: 'Hivemind unavailable' }, { status: 502 });
    }
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reach Hivemind';
    return Response.json({ error: message }, { status: 502 });
  }
}
