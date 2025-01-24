import fetch from 'node-fetch';

export async function scrapeUrl(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const html = await response.text();
  
  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["']/g)]
    .map(match => match[1])
    .slice(0, 10);
  
  return {
    url,
    status: response.status,
    links,
    content_preview: html.slice(0, 500)
  };
}
