export function buildTikTokSearchUrl(companyName: string): string {
  const query = `site:tiktok.com "${companyName}"`;
  const encodedQuery = encodeURIComponent(query);
  return `https://www.google.com/search?q=${encodedQuery}`;
}

export function openTikTokSearch(companyName: string): void {
  const url = buildTikTokSearchUrl(companyName);
  window.open(url, "_blank", "noopener,noreferrer");
}
