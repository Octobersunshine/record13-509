module.exports = {
  port: 3000,
  target: 'https://api.example.com',
  changeOrigin: true,
  logLevel: 'info',
  pathRewrite: {},
  intranet: {
    enabled: true,
    ipRanges: [
      /^127\./,
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^localhost$/i
    ],
    paths: [
      '/health',
      '/api/internal',
      '/local'
    ],
    hosts: []
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.host}${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Response] ${req.method} ${req.url} - ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
};
