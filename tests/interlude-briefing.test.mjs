import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import React from'react';import{renderToStaticMarkup}from'react-dom/server';
import{createSSRServer}from'./ssr-server.mjs';import{interludeChannels}from'../src/codexArt.js';import{crtScreenQuad,screenTransform,radioFrameStyle,nextRadioChannel}from'../src/radioArt.js';
test('seven imaginary channels retain the original housing and have six four-frame original screen atlases',async()=>{
 assert.equal(interludeChannels.length,7);assert.equal(new Set(interludeChannels.map(s=>s.id)).size,7);assert.equal(new Set(interludeChannels.map(s=>s.frequency)).size,7);
 const frequencies=interludeChannels.map(s=>Number(s.frequency));assert.deepEqual(frequencies,[...frequencies].sort((a,b)=>a-b));
 assert.equal(interludeChannels.filter(s=>s.art).length,6);assert.equal(interludeChannels.at(-1).art,null);
 for(const s of interludeChannels){assert.ok(s.caption&&s.short&&s.copy&&s.title);assert.ok(s.loop>=8);if(s.art){const png=await readFile(new URL('../public'+s.art,import.meta.url));assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(png.readUInt32BE(16),png.readUInt32BE(20));assert.equal(png.readUInt32BE(16)%2,0);assert.ok(png.length>100000);}}
 assert.deepEqual([0,1,2,3].map(radioFrameStyle),[{backgroundPosition:'0% 0%'},{backgroundPosition:'100% 0%'},{backgroundPosition:'0% 100%'},{backgroundPosition:'100% 100%'}]);
 assert.equal(nextRadioChannel(6,1,7),0);assert.equal(nextRadioChannel(0,-1,7),6);assert.equal(nextRadioChannel(0,1,0),0);
});
test('real screen raster maps all four corners into the same CRT glass at every responsive size',()=>{
 for(const width of[120,240,320,550]){const m=screenTransform(width);assert.equal(m.length,16);assert.ok(m.every(Number.isFinite));[[0,0],[width,0],[width,width],[0,width]].forEach(([x,y],i)=>{const d=m[3]*x+m[7]*y+m[15];assert.ok(Math.abs((m[0]*x+m[4]*y+m[12])/d-crtScreenQuad[i][0]*width)<.00001);assert.ok(Math.abs((m[1]*x+m[5]*y+m[13])/d-crtScreenQuad[i][1]*width)<.00001);});}
 assert.deepEqual(screenTransform(NaN),screenTransform(320));assert.deepEqual(screenTransform(-1),screenTransform(320));
});
test('regional folio shows bounded real progress, distinct listening context and no locked spoilers or save mutations',async()=>{
 const server=await createSSRServer();try{
 const{regionGuide}=await server.ssrLoadModule('/src/regionGuide.js');const{RegionBriefing}=await server.ssrLoadModule('/src/RegionBriefing.jsx');
 const s={frontier:6,keys:2,xp:7420,journal:{battles:{0:{won:true}},quests:{0:{status:'claimed'},6:{status:'active'}},comics:[0,0,6,7,99]}},before=JSON.stringify(s);
for(let r=0;r<6;r++){const g=regionGuide(s,r),html=renderToStaticMarkup(React.createElement(RegionBriefing,{state:s,region:r}));assert.ok(g.unlocked);assert.equal(g.listenBody,g.atlas.concepts[0].body);assert.equal(g.listenTitle,g.atlas.concepts[0].title);assert.ok(html.includes(g.album.title));assert.ok(html.includes(g.friend.name));assert.ok(html.includes(g.listenBody));assert.ok(html.includes('BEFORE YOU WANDER.'));assert.ok(html.includes('20秒'));assert.ok(html.includes('80%'));assert.ok(html.includes('首次查阅记30 XP'));assert.ok(html.includes('不增加经验，不消耗钥匙'));assert.ok(html.includes('不是完整或唯一'));for(const[,url]of g.atlas.sources)assert.ok(html.includes(url.replaceAll('&','&amp;')));}
 const g=regionGuide(s,0);assert.equal(g.claimed,1);assert.equal(g.accepted,2);assert.equal(g.localComics,2);assert.equal(g.won,true);assert.equal(JSON.stringify(s),before);
 const fog={...s,frontier:3},locked=regionGuide(fog,3),html=renderToStaticMarkup(React.createElement(RegionBriefing,{state:fog,region:3}));assert.equal(locked.album,null);assert.equal(locked.friend,null);assert.equal(locked.atlas,null);assert.ok(html.includes('明确确认'));assert.ok(!html.includes('Heaven or Las Vegas'));assert.ok(!html.includes('花房鹿'));assert.ok(!html.includes('region-briefing-figure'));
 assert.ok(regionGuide({...fog,keys:0},3).next.includes('先聆听并结算'));assert.ok(regionGuide(fog,5).next.includes('前一片海域'));
 }finally{await server.close();}
});
test('decoration pauses for user, hidden/offscreen/reduced motion and uses responsive real raster rather than generated UI',async()=>{
 const read=p=>readFile(new URL(p,import.meta.url),'utf8');const source=await read('../src/SoundInterlude.jsx'),screen=await read('../src/RadioScreen.jsx'),css=await read('../src/v19.css'),folio=await read('../src/RegionBriefing.jsx');
 for(const v of['visibilitychange','IntersectionObserver','prefers-reduced-motion','observer.disconnect()','removeEventListener','paused||reduced||!available||!inView'])assert.ok(source.includes(v));
 for(const v of['ResizeObserver','observer.disconnect()','onError','v13-interlude-crt.png'])assert.ok(screen.includes(v));
 for(const v of['background-size:200% 200%','animation-play-state:paused','prefers-reduced-motion:reduce','min-height:48px','interlude-band-select','radio-frame-crossfade'])assert.ok(css.includes(v));
 assert.doesNotMatch(source+screen+folio,/localStorage|\.play\(|claimRewards|onClaim|<audio|setInterval|<svg|<canvas/);
 assert.ok(folio.includes('FieldIcon'));assert.ok(folio.includes('FieldProp'));
});
