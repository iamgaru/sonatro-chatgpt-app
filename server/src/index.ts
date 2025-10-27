import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { mcpHandler } from './mcp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.all('/mcp', mcpHandler);

// serve descriptor + UI
app.get('/app/tool.json', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../app/tool.json'));
});
app.get('/app/ui.html', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../app/ui.html'));
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Sonatro Bandcamp MVP listening on http://localhost:${port}`);
  console.log(`MCP endpoint: http://localhost:${port}/mcp`);
});
