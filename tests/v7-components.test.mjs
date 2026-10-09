import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createGame} from '../src/gameplay.js';
import {equip} from '../src/equipment.js';

test('production JSX renders synchronized home/CRT avatars and accessible garden states',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {WardrobeAvatar}=await server.ssrLoadModule('/src/Wardrobe.jsx');
  const {QuestGarden}=await server.ssrLoadModule('/src/QuestGarden.jsx');
  const {Armory}=await server.ssrLoadModule('/src/Armory.jsx');
  const s=equip(equip({},'leaf-shield'),'amber-scarf');
  const avatar=renderToStaticMarkup(React.createElement(WardrobeAvatar,{state:s}));
  const crt=renderToStaticMarkup(React.createElement(WardrobeAvatar,{state:s,className:'crt-avatar'}));
  assert.ok(avatar.includes('echo-blade/leaf-shield/amber-scarf'));assert.ok(crt.includes('echo-blade/leaf-shield/amber-scarf'));
  assert.ok(avatar.includes('琥珀长围巾'));assert.equal((avatar.match(/aria-hidden="true"/g)||[]).length,4);assert.ok(avatar.includes('avatar-hand'));assert.ok(avatar.includes('transform-origin:'));
  const armory=renderToStaticMarkup(React.createElement(Armory,{state:s,onEquip:()=>{}}));assert.ok(armory.includes('10 / 24'));assert.equal((armory.match(/<option/g)||[]).length,24);
  const game=createGame('2026-10-08');
  const blank=renderToStaticMarkup(React.createElement(QuestGarden,{game}));assert.ok(blank.includes('每日声音花园'));assert.ok(blank.includes('0/1'));assert.equal((blank.match(/class="pixel-flower"/g)||[]).length,3);assert.ok(blank.includes('暂停漂浮'));
  const ready=renderToStaticMarkup(React.createElement(QuestGarden,{game:{...game,heard:[{id:'a',genre:'JAZZ',albumCode:'one'}]}}));assert.ok(ready.includes('第一封声音来信，可领取'));assert.ok(ready.includes('bloom'));
  const done=renderToStaticMarkup(React.createElement(QuestGarden,{game:{...game,heard:[{id:'a',genre:'JAZZ',albumCode:'one'}],claimed:['first']}}));assert.ok(done.includes('第一封声音来信，已领取'));assert.ok(done.includes('harvested'));
 }finally{await server.close();}
});
