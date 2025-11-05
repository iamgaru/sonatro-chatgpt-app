// server/src/mcp.ts
import type { Request, Response } from 'express';
import { searchLinkOnly } from './bandcamp';

type JsonRpcReq = {
  jsonrpc: '2.0';
  id?: number | string | null;
  method?: string;
  params?: any;
};

function setCors(res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, mcp-protocol-version, authorization, *');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Vary', 'Access-Control-Request-Headers');
}

function sendJson(res: Response, obj: any) {
  const body = JSON.stringify(obj);
  res.status(200);
  setCors(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Connection', 'close');
  res.setHeader('Content-Length', Buffer.byteLength(body).toString());
  res.end(body);
}

// -------- SCHEMAS --------

const minimalParameters = {
  // Ultra-minimal schema to satisfy strict validators
  type: 'object',
  title: 'Bandcamp Search (Minimal)',
  description: 'Minimal schema for connector creation',
  properties: {
    query: { type: 'string', title: 'Query', description: 'Free-text search query' }
  },
  required: ['query'],
  additionalProperties: false
};

const fullParameters = {
  // Your real schema
  type: 'object',
  title: 'Bandcamp Search',
  description: 'Search Bandcamp with optional filters',
  properties: {
    query:  { type: 'string', title: 'Query', description: 'Free-text search query' },
    tags:   { type: 'array',  title: 'Tags', items: { type: 'string' }, description: 'Optional tag filters' },
    genre:  { type: 'string', title: 'Genre', description: 'Primary tag or genre' },
    format: { type: 'string', title: 'Format', enum: ['any','digital','vinyl','cassette','cd'] },
    price:  { type: 'string', title: 'Price', enum: ['any','free','name-your-price','under-10','under-20'] },
    location: { type: 'string', title: 'Location' },
    sort:   { type: 'string', title: 'Sort', enum: ['best-selling','new-arrivals','top'] },
    page:   { type: 'integer', title: 'Page', minimum: 1 }
  },
  required: [], // explicit but empty
  additionalProperties: false
};

const useMinimal = process.env.STRICT_MINIMAL === '1';
const sharedParameters = useMinimal ? minimalParameters : fullParameters;

// -------- TOOL DESCRIPTOR --------

const tools = [
  {
    name: 'bandcamp.search',
    title: 'Search Bandcamp',
    description: useMinimal
      ? 'Search Bandcamp (minimal schema during connector creation)'
      : 'Search Bandcamp (link-only)',

    // 1) MCP schema
    input_schema: sharedParameters,

    // 2) OpenAI function-style schema
    parameters: sharedParameters,

    // 3) Classic Actions tool shape
    type: 'function',
    function: {
      name: 'bandcamp_search',
      description: useMinimal
        ? 'Search Bandcamp (minimal schema during connector creation)'
        : 'Search Bandcamp (link-only)',
      parameters: sharedParameters
    },

    // 4) UI hints
    _meta: {
      openai: {
        outputTemplate: '/app/ui.html',
        toolInvocation: {
          invoking: 'Searching Bandcamp…',
          invoked: 'Showing Bandcamp results'
        }
      }
    }
  }
];

// -------- HANDLER --------

export function mcpHandler(req: Request, res: Response) {
  // Helpful for quick sanity checks (GET /mcp)
  if (req.method === 'GET' && req.url === '/mcp') {
    return sendJson(res, {
      server: { name: 'sonatro-chatgpt-app', version: '0.1.0' },
      tools
    });
  }

  if (req.method !== 'POST') return res.status(405).end();

  const body = (req.body || {}) as JsonRpcReq;
  const id = body.id;
  const method = body.method || '';
  const params = (body as any).params || {};

  // Notifications must not return a JSON-RPC body
  if (typeof id === 'undefined' || id === null) {
    return res.status(204).end();
  }

  if (method === 'initialize') {
    return sendJson(res, {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        serverInfo: { name: 'sonatro-bandcamp-ts', version: '0.0.6' }
      }
    });
  }

  if (method === 'tools/list') {
    return sendJson(res, { jsonrpc: '2.0', id, result: { tools } });
  }

  if (method === 'tools/call') {
    const name = params?.name;
    const args = params?.arguments || {};

    if (name === 'bandcamp.search') {
      const data = searchLinkOnly(args);
      return sendJson(res, {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            { type: 'text', text: 'Open the result in Bandcamp to browse.' },
            { type: 'application/json', data: { items: data.items } }
          ]
        }
      });
    }

    return sendJson(res, {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Unknown tool: ${name}` }
    });
  }

  return sendJson(res, {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Unknown method: ${method}` }
  });
}
