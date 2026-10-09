import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {recordSound} from '../src/soundHistory.js';
test('single-page notebook contains history and stamp space together; landscape uses real counts',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {MusicHandbook}=await server.ssrLoadModule('/src/MusicHandbook.jsx');
  const {SoundLandscape}=await server.ssrLoadModule('/src/SoundLandscape.jsx');
  const book=renderToStaticMarkup(React.createElement(MusicHandbook,{state:{day:'2026-10-09'}}));
  assert.equal((book.match(/class="journal-page"/g)||[]).length,1);assert.ok(book.includes('爵士单页手账'));assert.ok(book.includes('声音的时间线'));assert.ok(book.includes('POSTMARK'));assert.ok(!book.includes('book-left'));assert.ok(!book.includes('mobile-leaf'));
  let s={day:'2026-10-09'};s=recordSound(s,{id:'a',title:'真实曲目',genre:'JAZZ',albumCode:'A-004'});
  const banner=renderToStaticMarkup(React.createElement(SoundLandscape,{state:s}));
  assert.ok(banner.includes('暖色港湾，1条达标聆听记录'));assert.ok(banner.includes('width:100%'));assert.ok(banner.includes('--lift:60px'));assert.ok(banner.includes('真实曲目'));assert.equal((banner.match(/class="terrain-station/g)||[]).length,6);
  const empty=renderToStaticMarkup(React.createElement(SoundLandscape,{state:{day:'2026-10-09'}}));assert.ok(empty.includes('还没有记录'));assert.ok(empty.includes('width:0%'));assert.ok(empty.includes('地形插画为风格装饰'));
 }finally{await server.close();}
});
