// src/extension/content-script.ts

// declare chrome global for extension runtime (TypeScript)
declare const chrome: any;

function detectBrandFromPage(): string | null {
  // Hostname mapping
  const host = window.location.hostname.replace('www.', '');
  const hostMap: Record<string, string> = {
    'patagonia.com': 'Patagonia',
    // add more mappings as needed
  };
  if (hostMap[host]) return hostMap[host];

  // Example: try slug from path segment
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length) {
    // heuristically use first segment as brand slug
    const candidate = pathParts[0].replace(/[-_]/g, ' ');
    if (candidate.length > 2) return candidate;
  }

  // try title or H1
  const h1 = document.querySelector('h1')?.textContent?.trim();
  if (h1) return h1;

  const title = document.title;
  if (title) return title.split('|')[0].trim();

  // try og:site_name or meta brand
  const ogSite = document.querySelector('meta[property="og:site_name"]') as HTMLMetaElement;
  if (ogSite?.content) return ogSite.content;

  return null;
}

function injectBadge(scoreText: string) {
  const existing = document.getElementById('ecostyle-badge');
  if (existing) {
    existing.textContent = `Eco: ${scoreText}`;
    return;
  }
  const badge = document.createElement('div');
  badge.id = 'ecostyle-badge';
  badge.textContent = `Eco: ${scoreText}`;
  badge.style.position = 'fixed';
  badge.style.right = '12px';
  badge.style.bottom = '12px';
  badge.style.background = 'rgba(14,165,164,0.95)';
  badge.style.color = 'white';
  badge.style.padding = '6px 10px';
  badge.style.borderRadius = '8px';
  badge.style.zIndex = '2147483647';
  badge.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  document.documentElement.appendChild(badge);
}

async function run() {
  const brand = detectBrandFromPage();
  if (!brand) return;

  // ask background for the score
  chrome.runtime.sendMessage({ type: 'GET_BRAND_SCORE', brand }, (resp) => {
    if (!resp) return;
    if (resp.ok) {
      injectBadge(String(resp.score ?? '—'));
    } else {
      console.error('Error getting brand score', resp.error);
    }
  });
}

// run on initial load + maybe on SPA route changes (optional)
run();

// Optionally observe SPA navigation: observe history/pushState or use router detection