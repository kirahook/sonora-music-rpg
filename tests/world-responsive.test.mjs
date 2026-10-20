import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createSSRServer} from './ssr-server.mjs';

test('SSR harness does not load client warmup, watchers or dependency optimizers',async()=>{
 const server=await createSSRServer();
 try{
  assert.equal(server.config.configFile,undefined);
  assert.equal(server.config.esbuild.jsx,'automatic');
  assert.equal(server.config.server.watch,null);
  assert.equal(server.config.optimizeDeps.noDiscovery,true);
  assert.deepEqual(server.config.optimizeDeps.include,[]);
  assert.equal(server.config.ssr.optimizeDeps.noDiscovery,true);
  assert.deepEqual(server.config.ssr.optimizeDeps.include,[]);
  assert.ok(!(server.config.server.warmup?.clientFiles||[]).length);
  const {MapStatusBar}=await server.ssrLoadModule('/src/WorldStatus.jsx');
  assert.ok(renderToStaticMarkup(React.createElement(MapStatusBar,{state:{frontier:3,keys:1}})).includes('CHARTED WATERS.'));
 }finally{await server.close();}
});

test('world status uses real, bounded, unique progress and never exposes locked dossiers or mutates saves',async()=>{
 const server=await createSSRServer();
 try{
  const {worldStatus,worldNotes}=await server.ssrLoadModule('/src/worldStatus.js');
  const {MapStatusBar,MapWorldNotes}=await server.ssrLoadModule('/src/WorldStatus.jsx');
  const sample={frontier:3,keys:2,xp:7420,journal:{battles:{0:{won:true},1:{won:false},4:{won:true}},comics:[0,0,6,7,21,99]}},before=JSON.stringify(sample);
  const s=worldStatus(sample,0);
  assert.equal(s.frontier,3);assert.equal(s.keys,2);assert.equal(s.won,1);assert.equal(s.comics,3);assert.equal(s.localComics,2);assert.equal(s.albumCount,7);
  assert.equal(worldNotes.length,6);assert.equal(new Set(worldNotes.map(n=>n.note)).size,6);
  const locked=worldStatus(sample,5);assert.equal(locked.unlocked,false);assert.equal(locked.note,null);assert.equal(locked.name,'未知海域 06');assert.equal(locked.albumCount,0);
  const normal=renderToStaticMarkup(React.createElement(MapStatusBar,{state:sample}));
  for(const t of ['CHARTED WATERS.','世界海','已测绘海域','探索钥匙','已共鸣相遇','奇闻收藏','当前浏览器存档'])assert.ok(normal.includes(t));
  const dossier=renderToStaticMarkup(React.createElement(MapWorldNotes,{state:sample,selected:0}));
  for(const t of ['FIELD FREQUENCY.','蓝调港湾','虚构世界观','不显示实时天气','进入音乐城市'])assert.ok(dossier.includes(t));
  const fog=renderToStaticMarkup(React.createElement(MapWorldNotes,{state:sample,selected:5}));
  assert.ok(fog.includes('查看解锁条件'));assert.ok(!fog.includes('极地电台'));assert.equal((fog.match(/aria-pressed=/g)||[]).length,6);
  assert.equal(JSON.stringify(sample),before);
  const capped=worldStatus({frontier:999,keys:-4},999);assert.equal(capped.frontier,6);assert.equal(capped.region,5);assert.equal(capped.keys,0);
  assert.equal(worldStatus({frontier:0,keys:0}).won,0);
 }finally{await server.close();}
});

test('responsive treatment is shared, keeps original assets and preserves mobile navigation and safe-area contracts',()=>{
 const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
 const css=read('../src/v18.css'),app=read('../src/App.jsx'),source=read('../src/WorldStatus.jsx');
 for(const value of ['saturate(.32) contrast(.72)','z-index:-2','filter:grayscale(1);opacity:.4','height:auto;align-self:start','flex:none;display:block','repeat(2,minmax(0,1fr))','env(safe-area-inset-bottom','min-height:44px','max-height:560px','prefers-reduced-motion:reduce','.app-shell>.section-heading{order:2'])assert.ok(css.includes(value));
 assert.ok(app.includes('<MapStatusBar state={state}/>'));assert.ok(app.includes('<MapWorldNotes state={state}'));
 assert.match(read('../src/main.jsx'),/import ".\/v18.css"/);
 assert.doesNotMatch(source,/localStorage|unlockRegion|claimRewards|recordListen|<svg|<canvas/);
 assert.ok(source.includes('FieldIcon'));assert.ok(source.includes('FieldProp'));
});
