import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

test('mobile dock mirrors player state, protects power and track boundaries, and labels five destinations',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {MobileDock,mobileDestinations}=await server.ssrLoadModule('/src/MobileDock.jsx');
  assert.deepEqual(mobileDestinations.map(x=>x[0]),['terminal','armory','archive','world','adventure']);
  const player={track:{title:'A real track'},source:'catalog',playing:false,loading:false,index:0,queue:[{},{}],elapsed:3,duration:30};
  const props={player,power:'on',album:{cover:'/assets/cover.jpg'},nav:'archive',Icon:()=>null};
  const render=(extra={})=>renderToStaticMarkup(React.createElement(MobileDock,{...props,...extra}));
  const normal=render();assert.ok(normal.includes('A real track'));assert.ok(normal.includes('00:03 / 00:30'));
  assert.equal((normal.match(/aria-current="location"/g)||[]).length,1);assert.ok(normal.includes('手机快捷导航'));assert.ok(!normal.includes('<audio'));
  assert.ok(render({power:'off'}).includes('disabled="" aria-label="随行播放器播放"'));
  assert.ok(render({player:{...player,index:1}}).includes('disabled="" aria-label="随行播放器下一首"'));
  assert.ok(render({player:{...player,loading:true}}).includes('disabled="" aria-label="随行播放器播放"'));
  assert.ok(render({player:{...player,playing:true,loading:true}}).includes('aria-label="随行播放器暂停"'));
  assert.ok(render({player:{...player,source:'local'}}).includes('随行播放器'));assert.ok(!render({player:{...player,source:'local'}}).includes('<img'));
 }finally{await server.close();}
});

test('responsive layer keeps safe areas, zoom, single-page reading and proportional character layers',async()=>{
 const css=await readFile(new URL('../src/mobile.css',import.meta.url),'utf8');
 const main=await readFile(new URL('../src/main.jsx',import.meta.url),'utf8');
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(main.indexOf('./mobile.css')>main.indexOf('./v9.css'));
 assert.ok(html.includes('viewport-fit=cover'));assert.ok(!html.includes('user-scalable=no'));
 assert.ok(css.includes('safe-area-inset-bottom'));assert.ok(css.includes('var(--map-zoom,1)'));
 assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
 assert.ok(css.includes('aspect-ratio:3/4'));assert.ok(css.includes('font-size:16px!important'));
 assert.ok(!css.includes('body{overflow-x:hidden'));assert.ok(!css.includes('.journal-page{display:none'));
});
