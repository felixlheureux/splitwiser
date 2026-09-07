export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Proxy API and health requests to the production API worker
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/v1/') || url.pathname === '/health') {
      const apiPath = url.pathname.startsWith('/v1/')
        ? '/api/' + url.pathname.slice(4)
        : url.pathname;
      const targetUrl = new URL(apiPath + url.search, 'https://splitwiser-api-production.felix-451.workers.dev');

      const proxyReq = new Request(targetUrl, new Request(request, {
        redirect: 'manual',
      }));

      proxyReq.headers.set('X-Forwarded-Host', url.host);
      proxyReq.headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

      return fetch(proxyReq);
    }

    // Serve static frontend PWA assets from Pages (with SPA fallback for client routes)
    const assetRes = await env.ASSETS.fetch(request);
    if (assetRes.status === 404 && !url.pathname.includes('.')) {
      return env.ASSETS.fetch(new URL('/', request.url));
    }
    return assetRes;
  },
};
