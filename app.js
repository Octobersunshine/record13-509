const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const proxyMiddleware = createProxyMiddleware({
  target: config.target,
  changeOrigin: config.changeOrigin,
  logLevel: config.logLevel,
  pathRewrite: config.pathRewrite,
  onProxyReq: config.onProxyReq,
  onProxyRes: config.onProxyRes,
  onError: config.onError
});

app.use('*', proxyMiddleware);

app.listen(config.port, () => {
  console.log(`Proxy server is running on http://localhost:${config.port}`);
  console.log(`Forwarding all requests to: ${config.target}`);
});
