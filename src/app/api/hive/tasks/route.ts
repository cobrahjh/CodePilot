import { NextRequest } from 'next/server';
import { fetchHive } from '@/lib/hive';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetchHive('/api/tasks/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: body.task,
        priority: body.priority || 'normal',
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errData.error || 'Failed to add task' },
        { status: res.status }
      );
    }
    const data = await res.json();
    return Response.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reach Hivemind';
    return Response.json({ error: message }, { status: 502 });
  }
}
