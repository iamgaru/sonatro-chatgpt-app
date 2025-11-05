export type SearchInput = {
  query?: string;
  tags?: string[];
  genre?: string;
  format?: 'any'|'digital'|'vinyl'|'cassette'|'cd';
  price?: 'any'|'free'|'name-your-price'|'under-10'|'under-20';
  location?: string;
  sort?: 'best-selling'|'new-arrivals'|'top';
  page?: number;
};

export type Item = {
  title: string;
  artist?: string;
  type?: 'album'|'track'|'collection';
  url: string;
  artwork?: string;
  tags?: string[];
  price_text?: string;
};

function toQuery(input: SearchInput): string {
  const q = new URLSearchParams();
  if (input.query) q.set('q', input.query);
  if (input.sort) q.set('sort', input.sort);
  if (input.page && input.page > 1) q.set('page', String(input.page));
  return q.toString();
}

export function buildBrowseUrl(input: SearchInput): string {
  if (input.genre || (input.tags && input.tags.length)) {
    const tags = [input.genre, ...(input.tags || [])]
      .filter(Boolean)
      .map(x => encodeURIComponent(String(x)));
    const path = tags.map(t => `/tag/${t}`).join('');
    const qs = toQuery(input);
    return `https://bandcamp.com${path}${qs ? `?${qs}` : ''}`;
  }
  const qs = toQuery(input);
  return `https://bandcamp.com/search?${qs}`;
}

export function searchLinkOnly(input: SearchInput): { items: Item[], link: string } {
  const link = buildBrowseUrl(input);
  const items: Item[] = [
    { title: input.query ? `Search: ${input.query}` : 'Browse Bandcamp', type: 'collection', url: link, tags: input.tags }
  ];
  // Add a couple of mock items so the UI has something to render.
  if (input.query) {
    items.push({ title: `${input.query} — Compilation`, artist: 'Various Artists', type: 'album', url: link });
    items.push({ title: `${input.query} — Live Sessions`, artist: 'Local Scene', type: 'album', url: link });
  }
  return { items, link };
}
