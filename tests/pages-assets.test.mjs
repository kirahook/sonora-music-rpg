import assert from 'node:assert/strict';
import {test} from 'node:test';
import {normalizeBase, rebaseAssetStrings, pagesAssets} from '../scripts/pages-assets.mjs';

test('Pages base preserves root and validates repository paths', () => {
  assert.equal(normalizeBase('/'), '/');
  assert.equal(normalizeBase('/sonora-music-rpg/'), '/sonora-music-rpg/');
  for (const value of ['//example.com/', 'https://example.com/', '/repo', '/../']) {
    assert.throws(() => normalizeBase(value));
  }
});

test('runtime JSX, JSON and template asset URLs share the deployment base', () => {
  const code = 'src="/assets/knight.png"; art:\'/assets/comic.png\'; cover:`/assets/${code}.jpg`; "https://audio.example/a.m4a"; "blob:local"';
  const result = rebaseAssetStrings(code, '/sonora-music-rpg/');
  assert.ok(result.includes('src="/sonora-music-rpg/assets/knight.png"'));
  assert.ok(result.includes('`/sonora-music-rpg/assets/${code}.jpg`'));
  assert.ok(result.includes('https://audio.example/a.m4a'));
  assert.ok(result.includes('blob:local'));
  assert.equal(rebaseAssetStrings(code, '/'), code);
  const plugin = pagesAssets('/sonora-music-rpg/');
  assert.equal(plugin.transform('url(/assets/a.png)', '/src/style.css'), null);
  assert.equal(plugin.transform(code, '/node_modules/x.js'), null);
  assert.ok(plugin.transform('{"cover":"/assets/a.jpg"}', 'C:\\project\\src\\extra-albums.json').code.includes('/sonora-music-rpg/assets/'));
});
