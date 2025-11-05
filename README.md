# Sonatro ChatGPT MCP Connector (MVP)

# Sonatro ChatGPT MCP Connector (MVP)

![Sonatro Logo](./So.png)

## Overview

This repository contains the **Sonatro MCP connector**, a minimal and compliant server implementation of the [OpenAI Model Context Protocol (MCP)](https://github.com/openai/model-context-protocol).  
It’s designed to demonstrate and validate end-to-end connectivity between a custom MCP endpoint and OpenAI’s ChatGPT platform.

The current version serves as a **functional MVP** — fully compliant with the MCP JSON-RPC 2.0 interface and verified with manual `curl` tests.  
However, **ChatGPT account-level feature gating** may prevent registration until OpenAI enables custom connectors for your account or workspace.

---

## Features

- ✅ Fully JSON-RPC 2.0 compliant MCP endpoint (`/mcp`)
- ✅ Implements `initialize`, `tools/list`, and `tools/call` methods
- ✅ Minimal tool example (`bandcamp.search`)
- ✅ Cross-origin friendly (CORS enabled)
- ✅ Works with local testing via `curl` or tunneling (ngrok/cloudflared)
- ⚙️ Ready for ChatGPT Enterprise or Business rollout once custom MCP is enabled

---

## Project Structure

```
sonatro-chatgpt-app/
├── src/
│   ├── server.ts         # Express server entry point
│   ├── mcp.ts            # MCP method implementations
│   └── utils/            # Helpers (logging, validation, etc.)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- (optional) ngrok or cloudflared for HTTPS tunneling

### Installation

```bash
npm install
```

### Run the server

```bash
npm run dev
```

Server runs by default on:

```
http://localhost:8787/mcp
```

You can expose it publicly via:

```bash
ngrok http 8787
# or
cloudflared tunnel --url http://localhost:8787
```

---

## Testing Locally

You can verify that your MCP server is responding correctly:

### 1️⃣ List available tools

```bash
curl -s 'https://<your-tunnel-domain>/mcp'   -H 'content-type: application/json'   -d '{"method":"tools/list","jsonrpc":"2.0","id":1}' | jq
```

Expected output (truncated):

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "bandcamp.search",
        "title": "Search Bandcamp",
        "description": "Search Bandcamp (link-only)",
        "parameters": {
          "type": "object",
          "properties": {
            "query": { "type": "string", "description": "Free-text search query" }
          },
          "required": ["query"]
        }
      }
    ]
  }
}
```

### 2️⃣ Call a tool manually

```bash
curl -s 'https://<your-tunnel-domain>/mcp'   -H 'content-type: application/json'   -d '{"method":"tools/call","jsonrpc":"2.0","id":2,"params":{"name":"bandcamp.search","arguments":{"query":"ambient"}}}' | jq
```

---

## ChatGPT Connector Registration

Once OpenAI enables custom MCP connectors for your account,  
you’ll be able to register this endpoint in ChatGPT using:

```
https://<your-tunnel-domain>/mcp
```

If you currently see:

```json
{"detail":"Failed to build actions from MCP endpoint"}
```

That simply means your account hasn’t yet been granted access to custom MCP connectors.  
The server itself is verified and working.

---

## Known Limitations

- ❌ ChatGPT Free/Plus/Pro accounts cannot yet create custom MCP connectors.
- ✅ ChatGPT **Enterprise, Business, or EDU** accounts can — once enabled by an administrator.
- 💡 No changes are required to your server once the feature is rolled out; it will connect as-is.

---

## Next Steps

1. Commit and tag this repo as your **MVP release**:
   ```bash
   git add .
   git commit -m "Initial MCP MVP"
   git tag v0.1
   git push origin main --tags
   ```
2. Request **custom connector enablement** from your Enterprise workspace admin or OpenAI support.
3. Once approved, reattempt registration in ChatGPT.

---

## License

MIT License © 2025 Sonatro
