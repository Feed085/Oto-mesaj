export function buildInstagramSearchUrl(companyName: string): string {
  const query = `${companyName} instagram`;
  const encodedQuery = encodeURIComponent(query);
  return `https://www.google.com/search?q=${encodedQuery}`;
}

export function openInstagramSearch(companyName: string): void {
  const url = buildInstagramSearchUrl(companyName);
  window.open(url, "_blank", "noopener,noreferrer");
}
