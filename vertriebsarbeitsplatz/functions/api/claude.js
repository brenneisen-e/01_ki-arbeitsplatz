// Cloudflare Pages Function: POST /api/claude
// Nimmt { messages: [...] } oder { prompt: "..." } entgegen und proxied den
// Request an die Anthropic Messages-API. Der ANTHROPIC_API_KEY wird als
// Pages-Secret hinterlegt und bleibt serverseitig.

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY secret fehlt im Cloudflare Pages Projekt.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const messages = Array.isArray(body.messages) && body.messages.length > 0
    ? body.messages
    : body.prompt
      ? [{ role: 'user', content: String(body.prompt) }]
      : null;

  if (!messages) {
    return new Response(JSON.stringify({ error: 'messages oder prompt erforderlich.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const payload = {
    model: body.model || 'claude-sonnet-4-6',
    max_tokens: body.max_tokens || 1024,
    system: body.system || 'Du bist der KI-Vertriebsassistent einer Bank. Antworte präzise, sachlich, in deutscher Sprache. Verwende deutsche Zahlen- und Datumsformate.',
    messages,
  };

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || 'Anthropic-API-Fehler', raw: data }), {
        status: res.status,
        headers: { 'content-type': 'application/json' },
      });
    }

    const text = Array.isArray(data.content)
      ? data.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
      : '';

    return new Response(
      JSON.stringify({
        text,
        model: data.model,
        usage: data.usage,
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err?.message || err) }),
      { status: 502, headers: { 'content-type': 'application/json' } }
    );
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}
