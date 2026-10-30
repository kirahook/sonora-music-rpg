import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createSSRServer} from './ssr-server.mjs';
import {keyboardOccludes,isTextEntry} from '../src/viewportKeyboard.js';

test('keyboard occlusion distinguishes actual text entry from toolbar changes and pinch zoom',()=>{
 assert.equal(keyboardOccludes({editing:true,layoutHeight:852,visualHeight:500}),true);
 assert.equal(keyboardOccludes({editing:true,layoutHeight:852,visualHeight:760}),false);
 assert.equal(keyboardOccludes({editing:false,layoutHeight:852,visualHeight:400}),false);
 assert.equal(keyboardOccludes({editing:true,layoutHeight:852,visualHeight:500,scale:1.8}),false);
 for(const visualHeight of [NaN,0,-1,Infinity])assert.equal(keyboardOccludes({editing:true,layoutHeight:852,visualHeight}),false);
 assert.equal(keyboardOccludes(),false);
});
test('keyboard text targets exclude ranges, file import, buttons and native selects',()=>{
 for(const type of ['text','search','email','url','tel','number','password',''])assert.equal(isTextEntry({tagName:'INPUT',type}),true);
 for(const type of ['range','file','button','checkbox','color'])assert.equal(isTextEntry({tagName:'INPUT',type}),false);
 assert.equal(isTextEntry({tagName:'TEXTAREA'}),true);assert.equal(isTextEntry({tagName:'DIV',isContentEditable:true}),true);
 assert.equal(isTextEntry({tagName:'SELECT'}),false);assert.equal(isTextEntry(null),false);
});
test('responsive dock retains the exact original player actions and five destinations',async()=>{
 const server=await createSSRServer();try{
  const{MobileDock,mobileDestinations}=await server.ssrLoadModule('/src/MobileDock.jsx');
  const player={track:{title:'Test'},queue:[{id:1}],index:0,elapsed:0,duration:30,playing:false};
  const html=renderToStaticMarkup(React.createElement(MobileDock,{player,power:'on',album:{cover:'/assets/test.png'},nav:'world',Icon:()=>null}));
  assert.equal(mobileDestinations.length,5);for(const s of ['手机快捷操作','随行播放器','随行播放器播放','随行播放器下一首','aria-current="location"'])assert.ok(html.includes(s));
  assert.ok(!html.includes('<audio'));assert.ok(!html.includes('hidden=""'));
 }finally{await server.close();}
});
test('phone and unfolded layers preserve desktop, safe areas, readable forms and original art',async()=>{
 const read=p=>readFile(new URL(p,import.meta.url),'utf8');const[css,main,hook,dock,app]=await Promise.all(['../src/v23.css','../src/main.jsx','../src/useViewportKeyboard.js','../src/MobileDock.jsx','../src/App.jsx'].map(read));
 for(const s of ['max-width:1024px','min-width:701px','max-width:700px','max-width:360px','max-height:500px','safe-area-inset-bottom','safe-area-inset-left','100dvh','font-size:16px','min-height:44px','min-height:48px','prefers-reduced-motion'])assert.ok(css.includes(s),s);
 assert.ok(main.indexOf('v23.css')>main.indexOf('v22.css'));assert.ok(dock.includes('hidden={keyboardOpen}'));
 assert.ok(app.includes('(max-width: 1024px)'),'navigation observer shares unfolded dock breakpoint');
 for(const s of ['visualViewport','focusin','focusout','removeEventListener','visibilitychange'])assert.ok(hook.includes(s));
 assert.doesNotMatch(css+hook,/userAgent|devicePixelRatio|user-scalable|maximum-scale|localStorage|sessionStorage|setInterval|\.play\(|claimRewards|unlockRegion|<audio|data:image|<svg/);
 assert.ok(!css.includes('background-image:'));assert.ok(!css.includes('url('),'reuse unchanged original art');
});
