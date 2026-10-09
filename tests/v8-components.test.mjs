import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createGame} from '../src/gameplay.js';
import {stampPage,bookmarkPage,notePage,turnPage} from '../src/handbook.js';
test('handbook renders below expedition with live stamps, notes, sources and boundary navigation',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {Adventure}=await server.ssrLoadModule('/src/Adventure.jsx');
  let s={day:'2026-10-08'};s=notePage(bookmarkPage(stampPage(turnPage(s,7),'ambient'),'ambient'),'ambient','慢慢聆听');
  const markup=renderToStaticMarkup(React.createElement(Adventure,{game:createGame(s.day),power:'on',handbook:{state:s}}));
  assert.ok(markup.indexOf('三曲远征歌单')<markup.indexOf('声音的来处'));
  assert.ok(markup.includes('1 / 8 邮戳'));assert.ok(markup.includes('环境音乐阅读邮戳，2026-10-08'));assert.ok(markup.includes('慢慢聆听'));assert.ok(markup.includes('查阅资料来源'));assert.ok(markup.includes('已夹书签'));
  assert.ok(markup.includes('disabled="">下一页'));assert.equal((markup.match(/--tab-color:/g)||[]).length,8);
 }finally{await server.close();}
});
