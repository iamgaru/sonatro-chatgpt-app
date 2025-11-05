// server/src/index.ts
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { mcpHandler } from './mcp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

// Simple access logs
app.use((req, _res, next) => { console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`); next(); });

// CORS + preflight
app.use((req, res, next) => {
  const reqHeaders = req.headers['access-control-request-headers'];
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,HEAD');
  res.setHeader('Access-Control-Allow-Headers', reqHeaders ? String(reqHeaders) : 'content-type, mcp-protocol-version, authorization, *');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Vary', 'Access-Control-Request-Headers');
  if (req.method === 'OPTIONS') { res.setHeader('Cache-Control','no-store'); return res.status(204).end(); }
  next();
});

app.get('/', (_req, res) => res.json({ ok: true }));
app.get('/health', (_req, res) => res.json({ ok: true }));

// Well-known probes (no OAuth configured → 204)
const wellKnown = [
  '/.well-known/oauth-protected-resource',
  '/.well-known/oauth-authorization-server',
  '/.well-known/openid-configuration',
  '/.well-known/oauth-protected-resource/mcp',
  '/.well-known/oauth-authorization-server/mcp',
  '/.well-known/openid-configuration/mcp',
  '/mcp/.well-known/openid-configuration'
];
for (const p of wellKnown){ app.get(p, (_req, res) => res.status(204).set('Cache-Control','no-store').end()); }

// MCP endpoint
app.all('/mcp', mcpHandler);

// Serve UI assets (optional)
const repoRoot = path.resolve(__dirname, '..', '..');
app.get('/app/tool.json', (_req, res) => res.sendFile(path.join(repoRoot, 'app', 'tool.json')));
app.get('/app/ui.html',  (_req, res) => res.sendFile(path.join(repoRoot, 'app', 'ui.html')));

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Sonatro ChatGPT App listening on http://localhost:${port}`);
  console.log(`MCP endpoint: http://localhost:${port}/mcp`);
});
