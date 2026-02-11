import { fetchHive } from '@/lib/hive';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let previousJson = '';

      function sendEvent(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      async function poll() {
        try {
          const res = await fetchHive('/api/state');
          if (!res.ok) {
            sendEvent('hive:error', { message: 'Hivemind unavailable' });
            return;
          }
          const data = await res.json();
          const json = JSON.stringify(data);
          if (json !== previousJson) {
            previousJson = json;
            sendEvent('hive:state', data);
          }
        } catch {
          sendEvent('hive:error', { message: 'Connection to Hivemind lost' });
        }
      }

      // Initial poll
      poll();

      // Poll every 3 seconds
      const pollInterval = setInterval(poll, 3000);

      // Keepalive every 30 seconds
      const pingInterval = setInterval(() => {
        sendEvent('hive:ping', { time: Date.now() });
      }, 30000);

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(pollInterval);
        clearInterval(pingInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
