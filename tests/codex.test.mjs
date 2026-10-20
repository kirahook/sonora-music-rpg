import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createSSRServer} from './ssr-server.mjs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {codexPortraits,codexArtStyle,interludeChannels} from '../src/codexArt.js';
import {genrePages,stampPage,turnPage,notePage,bookmarkPage} from '../src/handbook.js';
import {createGame} from '../src/gameplay.js';

test('eight distinct music knights map to exact non-stretched atlas centers',()=>{
 assert.equal(codexPortraits.length,genrePages.length);assert.equal(new Set(codexPortraits.map(p=>p.title)).size,8);
 const styles=codexPortraits.map((_,i)=>codexArtStyle(i));
 assert.equal(new Set(styles.map(s=>JSON.stringify(s))).size,8);
 assert.equal(styles[0]['--codex-shift'],'-12.5%');assert.equal(styles[3]['--codex-shift'],'-87.5%');
 assert.equal(styles[4]['--codex-top'],'-100%');assert.equal(codexArtStyle(4,true)['--codex-top'],'-308%');
});

test('all eight illuminated pages retain real history, source links and saved reader content',async()=>{
 const server=await createSSRServer();
 try{
  const {MusicHandbook}=await server.ssrLoadModule('/src/MusicHandbook.jsx');
  for(let i=0;i<8;i++){
   const topic=genrePages[i];
   let s={day:'2026-10-15',xp:7420,keys:1};
   s=notePage(bookmarkPage(stampPage(turnPage(s,i),topic.id,.52,.58,'green'),topic.id),topic.id,'我的聆听札记');
   const html=renderToStaticMarkup(React.createElement(MusicHandbook,{state:s}));
   assert.ok(html.includes(codexPortraits[i].title));assert.ok(html.includes(topic.summary));assert.ok(html.includes(topic.listen));
   for(const [date,title,body] of topic.timeline){assert.ok(html.includes(date));assert.ok(html.includes(title));assert.ok(html.includes(body));}
   for(const [,url] of topic.sources)assert.ok(html.includes(url.replaceAll('&','&amp;')));
   assert.ok(html.includes('我的聆听札记'));assert.ok(html.includes('已夹书签'));assert.ok(html.includes(topic.name+'阅读邮戳，2026-10-15'));
   assert.ok(html.includes('原创流派意象 · 非可穿戴装备'));assert.equal((html.match(/class="journal-page"/g)||[]).length,1);
   assert.equal(s.xp,7420);assert.equal(s.keys,1);
  }
 }finally{await server.close();}
});

test('decorative interlude sits below quests and keeps local pause/channel controls separate from audio and rewards',async()=>{
 const server=await createSSRServer();
 try{
  const {Adventure}=await server.ssrLoadModule('/src/Adventure.jsx');
  const html=renderToStaticMarkup(React.createElement(Adventure,{game:createGame('2026-10-15'),power:'on',handbook:{state:{}}}));
  assert.ok(html.indexOf('每日探索委托')<html.indexOf('声音中场循环动画'));
  assert.ok(html.includes('quest-column'));assert.ok(html.includes('voyage-column'));
  assert.ok(html.includes('暂停中场动画'));assert.ok(html.includes('切换中场装饰频道'));assert.ok(html.includes('不播放音频 · 不计经验'));
  assert.equal(interludeChannels.length,4);assert.equal(new Set(interludeChannels.map(c=>c.title)).size,4);
  const source=await readFile(new URL('../src/SoundInterlude.jsx',import.meta.url),'utf8');
  assert.ok(!/localStorage|\.play\(|claimRewards|onClaim|<audio|setInterval/.test(source));
  const css=await readFile(new URL('../src/v13.css',import.meta.url),'utf8');
  assert.ok(css.includes('.play-grid{align-items:stretch}'));assert.ok(css.includes('animation-play-state:paused'));assert.ok(css.includes('prefers-reduced-motion'));assert.ok(css.includes('flex-direction:column-reverse'));
 }finally{await server.close();}
});

test('all new raster assets and locally served licensed display font are present',async()=>{
 for(const file of ['v13-codex-paper.png','v13-music-knights.png','v13-interlude-crt.png','UnifrakturCook-Bold.ttf','UnifrakturCook-OFL.txt']){
  assert.ok((await stat(new URL('../public/assets/'+file,import.meta.url))).size>1000);
 }
});
