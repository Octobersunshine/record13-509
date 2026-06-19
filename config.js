module.exports = {
  port: 3000,
  target: 'https://api.example.com',
  changeOrigin: true,
  logLevel: 'info',
  pathRewrite: {},
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
