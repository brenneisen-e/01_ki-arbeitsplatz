/**
 * Cloudflare Pages Function — Proxy für rxresu.me API
 * Umgeht CORS-Beschränkungen durch serverseitigen Fetch.
 *
 * Pfad-Mapping:
 *   /api/rxresume/resumes/import  →  https://rxresu.me/api/openapi/resumes/import
 *   /api/rxresume/resumes/:id/pdf →  https://rxresu.me/api/openapi/resumes/:id/pdf
 */

const RXRESUME_BASE = 'https://rxresu.me/api/openapi';
const API_KEY = 'uEsOtWYyUGGtKgwItLRGnfrAnKtBWnJpfCyKNyoHQBCCUQaDyzeLefgNyNgukpUB';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequest(context) {
    const { request, params } = context;

    // CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
    }

    // Build target URL
    const segments = Array.isArray(params.path) ? params.path : (params.path ? [params.path] : []);
    const targetUrl = `${RXRESUME_BASE}/${segments.join('/')}`;

    // Read body for mutating methods
    let body = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        body = await request.text();
    }

    let upstream;
    try {
        upstream = await fetch(targetUrl, {
            method: request.method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
            body,
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Proxy fetch failed', detail: String(err) }), {
            status: 502,
            headers: { ...CORS, 'Content-Type': 'application/json' },
        });
    }

    const text = await upstream.text();

    return new Response(text, {
        status: upstream.status,
        headers: {
            ...CORS,
            'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        },
    });
}
