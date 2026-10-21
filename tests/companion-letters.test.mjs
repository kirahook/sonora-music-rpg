import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createSSRServer} from './ssr-server.mjs';
import {companionLetters,letterFrontier,readableLetterRegion,nextLetterIndex} from '../src/companionLetters.js';

test('six regional correspondents have eighteen original short letters and sound tags',()=>{
 assert.equal(companionLetters.length,6);
 assert.equal(new Set(companionLetters.map(c=>c.place)).size,6);
 const letters=companionLetters.flatMap(c=>c.letters);
 assert.equal(letters.length,18);assert.equal(new Set(letters.map(l=>l.body)).size,18);
 for(const c of companionLetters){assert.equal(c.tags.length,3);assert.equal(c.letters.length,3);for(const l of c.letters){assert.ok(l.title&&l.body.length>=40&&l.body.length<=100);}}
});
test('letter access clamps malformed frontiers and never selects locked identities',()=>{
 for(const frontier of [undefined,-2,0,NaN]){assert.equal(letterFrontier({frontier}),0);assert.equal(readableLetterRegion({frontier},0),null);}
 assert.equal(letterFrontier({frontier:99}),6);assert.equal(letterFrontier({frontier:2.8}),2);
 for(const selected of [-1,3,5,99,NaN,1.5])assert.equal(readableLetterRegion({frontier:3},selected),0);
 assert.equal(readableLetterRegion({frontier:3},2),2);assert.equal(readableLetterRegion(null),null);
});
test('manual letter paging wraps independently without progression state',()=>{
 for(let r=0;r<6;r++){assert.equal(nextLetterIndex(r,0),1);assert.equal(nextLetterIndex(r,1),2);assert.equal(nextLetterIndex(r,2),0);}
 assert.equal(nextLetterIndex(-1,0),0);assert.equal(nextLetterIndex(0,-4),1);
 const sample={frontier:3,xp:7630,keys:2},before=JSON.stringify(sample);readableLetterRegion(sample,3);nextLetterIndex(0,1);assert.equal(JSON.stringify(sample),before);
});
test('mailbox SSR uses actual companion art, bilingual headings and private locked labels',async()=>{
 const server=await createSSRServer();try{
  const {CompanionLetters}=await server.ssrLoadModule('/src/CompanionLetters.jsx');
  for(let r=0;r<6;r++){
   const html=renderToStaticMarkup(React.createElement(CompanionLetters,{state:{frontier:6},selectedRegion:r}));
   for(const text of ['LETTERS FROM THE SHORE.','旅伴来信','选择旅伴来信海域','换一封来信','aria-live="polite"','v16-battle-',companionLetters[r].letters[0].title,companionLetters[r].place])assert.ok(html.includes(text),text);
  }
  const state={frontier:3,keys:2,xp:7630},before=JSON.stringify(state);
  const locked=renderToStaticMarkup(React.createElement(CompanionLetters,{state,selectedRegion:3}));
  assert.ok(locked.includes('留声猫'));assert.ok(locked.includes('雾后的寄信人尚未公开'));assert.ok(locked.includes('未知海域 04'));
  for(const hidden of ['花房鹿','鼓点獾','雪邮企鹅',companionLetters[3].letters[0].title])assert.ok(!locked.includes(hidden));
  const empty=renderToStaticMarkup(React.createElement(CompanionLetters,{state:{frontier:0},selectedRegion:5}));
  assert.ok(empty.includes('信箱还在等第一片海域'));assert.ok(!empty.includes('v16-battle-'));assert.ok(!empty.includes('<select'));assert.ok(!empty.includes('换一封来信'));
  assert.equal(JSON.stringify(state),before);
 }finally{await server.close();}
});
test('letters integrate only in sidebar and remain page-local accessible native controls',async()=>{
 const read=path=>readFile(new URL(path,import.meta.url),'utf8');
 const [source,model,app,css,main]=await Promise.all(['../src/CompanionLetters.jsx','../src/companionLetters.js','../src/App.jsx','../src/v22.css','../src/main.jsx'].map(read));
 assert.doesNotMatch(source+model,/localStorage|sessionStorage|setInterval|setTimeout|\.play\(|<audio|claimRewards|unlockRegion|<svg|<canvas/);
 assert.ok(source.includes('<BattlePortrait'));assert.ok(source.includes('<FieldProp'));assert.ok(source.includes('<FieldIcon'));
 assert.ok(app.includes('<CompanionLetters state={state} selectedRegion={selectedRegion}/>'));
 assert.ok(app.indexOf('<CompanionLetters')>app.indexOf('<SettlementPanel'));
 for(const text of ['min-height:48px','font-size:16px','focus-visible','max-width:700px','grid-column:1/-1'])assert.ok(css.includes(text));
 assert.ok(main.indexOf('v22.css')>main.indexOf('v21.css'));
});
