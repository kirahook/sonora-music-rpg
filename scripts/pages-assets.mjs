// Public-folder URLs in runtime strings need the same base as Vite's CSS URLs.
// Keep local/Sites builds at /, and rewrite only source asset string prefixes.
export function normalizeBase(value = '/') {
  if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(value)) {
    throw new Error('PAGES_BASE_PATH must be a slash-delimited local path.');
  }
  return value;
}

export function rebaseAssetStrings(code, base) {
  const safe = normalizeBase(base);
  return safe === '/' ? code : code.replace(/(["'`])\/assets\//g, `$1${safe}assets/`);
}

export function pagesAssets(base) {
  return {
    name: 'sonora-public-assets-base',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0].replace(/\\/g, '/');
      if (!file.includes('/src/') || !/\.(?:jsx?|json)$/.test(file) || base === '/') return null;
      return {code: rebaseAssetStrings(code, base), map: null};
    },
  };
}
