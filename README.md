# Sonatro · Bandcamp (link-only) – ChatGPT App MVP

This is a minimal **Apps SDK + MCP** server exposing one tool `bandcamp.search` that returns **deeplinks** to Bandcamp browse/search pages. No scraping. No unofficial APIs.

## Why link-only first?
Bandcamp's official API is permissioned and uses OAuth 2.0; you must request access and will receive a client id/secret if approved. Until then, link-only keeps us compliant. See: Bandcamp Developer page. 

## Run locally
```bash
# terminal 1
cd server && npm i && npm run dev
# server at http://localhost:8787
```

Optional with Docker:
```bash
docker build -t sonatro-mvp -f docker/Dockerfile .
docker run --rm -it -p 8787:8787 sonatro-mvp
```

## Connect from ChatGPT
1. Expose your server publicly (e.g., with ngrok):
   ```bash
   ngrok http http://localhost:8787
   ```
   Note the public URL, e.g. `https://abc123.ngrok.app`.
2. In ChatGPT, open **Apps → Connect your own app** and set the **Connector URL** to `https://abc123.ngrok.app/mcp`.
3. After it lists the `bandcamp.search` tool, open a new chat and try:
   > “Use Sonatro to find Melbourne indie rock under $10, sort by new arrivals.”

The app will return a result card with an **Open on Bandcamp** button.

## Adding OAuth (v1 branch)
- Create a new branch `feature/oauth-bandcamp`.
- Implement OAuth 2.0 (authorization code + PKCE) per Apps SDK auth guide.
- Store tokens server-side and flip `bandcamp.search` to use official endpoints once approved.

## Sonos feature flag (v1.1)
- Gate Sonos tools behind `FEATURE_SONOS=true`.
- Implement `sonos.link`, `sonos.listPlayers`, `sonos.play(url, playerId)` using the Sonos Control API.

## Notes
- Do **not** proxy or rehost Bandcamp audio. Use legal handoff (deeplink) unless Bandcamp explicitly permits stream URLs for your client.
- Keep a clear Privacy & Data policy for store submission.
