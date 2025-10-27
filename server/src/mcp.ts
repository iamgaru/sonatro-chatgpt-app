import type { Request, Response } from 'express';
import { searchLinkOnly } from './bandcamp';

// Very small shim that exposes one tool via a JSON POST protocol expected by Apps SDK.
// Tool name: "bandcamp.search"

export function mcpHandler(req: Request, res: Response){
  if (req.method === 'GET'){
    // Advertise tools
    return res.json({
      tools: [
        {
          name: 'bandcamp.search',
          description: 'Search Bandcamp (link-only)',
          input_schema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              genre: { type: 'string' },
              format: { type: 'string', enum: ['any','digital','vinyl','cassette','cd'] },
              price: { type: 'string', enum: ['any','free','name-your-price','under-10','under-20'] },
              location: { type: 'string' },
              sort: { type: 'string', enum: ['best-selling','new-arrivals','top'] },
              page: { type: 'integer', minimum: 1 }
            }
          }
        }
      ]
    });
  }

  if (req.method === 'POST'){
    const { tool, input } = req.body || {};
    if (tool !== 'bandcamp.search'){
      return res.status(400).json({ error: 'unknown_tool' });
    }
    const result = searchLinkOnly(input || {});
    // Apps SDK will inject this into the UI template (if configured)
    return res.json({ ok: true, result });
  }

  res.status(405).end();
}
