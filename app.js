const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function isIntranetRequest(req) {
  if (!config.intranet || !config.intranet.enabled) {
    return false;
  }

  const { ipRanges = [], paths = [], hosts = [] } = config.intranet;

  const clientIp = req.ip || req.connection.remoteAddress || '';
  const reqHost = req.hostname || '';
  const reqPath = req.path || req.url || '';

  for (const pattern of ipRanges) {
    if (pattern.test(clientIp) || pattern.test(reqHost)) {
      return true;
    }
  }

  for (const host of hosts) {
    if (typeof host === 'string') {
      if (reqHost === host || reqHost.endsWith('.' + host)) {
        return true;
      }
    } else if (host instanceof RegExp) {
      if (host.test(reqHost)) {
        return true;
      }
    }
  }

  for (const pathPattern of paths) {
    if (typeof pathPattern === 'string') {
      if (reqPath === pathPattern || reqPath.startsWith(pathPattern + '/')) {
        return true;
      }
    } else if (pathPattern instanceof RegExp) {
      if (pathPattern.test(reqPath)) {
        return true;
      }
    }
  }

  return false;
}

app.use((req, res, next) => {
  if (isIntranetRequest(req)) {
    console.log(`[Intranet] ${req.method} ${req.url} - skipped proxy`);
    return next();
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'proxy-server', uptime: process.uptime() });
});

app.get('/api/internal', (req, res) => {
  res.json({ message: 'Internal API endpoint', method: req.method });
});

app.all('/local', (req, res) => {
  res.json({ message: 'Local resource', method: req.method, body: req.body });
});

const proxyMiddleware = createProxyMiddleware({
  target: config.target,
  changeOrigin: config.changeOrigin,
  logLevel: config.logLevel,
  pathRewrite: config.pathRewrite,
  onProxyReq: config.onProxyReq,
  onProxyRes: config.onProxyRes,
  onError: config.onError
});

app.use((req, res, next) => {
  if (isIntranetRequest(req)) {
    return next('route');
  }
  next();
}, proxyMiddleware);

app.use((req, res) => {
  if (isIntranetRequest(req)) {
    res.status(404).json({ error: 'Not Found', message: 'Intranet route not found', path: req.path });
  }
});

app.listen(config.port, () => {
  console.log(`Proxy server is running on http://localhost:${config.port}`);
  console.log(`Forwarding external requests to: ${config.target}`);
  console.log(`Intranet bypass enabled: ${config.intranet?.enabled ?? false}`);
});
