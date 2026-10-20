import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createSSRServer} from './ssr-server.mjs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {companions,portraitStates,portraitStyle,battlePortraits,equipmentNote,settlementLedger,cardPrintFor} from '../src/fieldPresentation.js';
import {gear,equip,inventoryFor} from '../src/equipment.js';
import {creatures,strike} from '../src/encounters.js';
import {rewards,claimRewards} from '../src/progression.js';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const sample=()=>({day:'2026-10-20',xp:7420,equipment:1,frontier:6,keys:1,claimed:false,viewed:['a','b','c','d'],listened:[{id:'1',title:'One',genre:'JAZZ'},{id:'2',title:'Two',genre:'ELECTRONIC'},{id:'3',title:'Three',genre:'AMBIENT'}],knownGenres:['JAZZ']});

test('six new companions have distinct stories and sixty non-stretched state cells',()=>{
 assert.equal(companions.length,6);assert.equal(new Set(companions.map(c=>c.name)).size,6);
 const cells=new Set();
 for(const c of companions){
  assert.equal(c.lines.length,4);assert.equal(new Set(c.lines).size,4);assert.ok(c.bio.length>20);
  const png=readFileSync(new URL('../public/assets/v16-battle-'+c.art+'.png',import.meta.url));
  assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);assert.equal(png[25],6);
  for(const role of ['monster','companion'])for(const state of portraitStates){const style=portraitStyle(c.region,role,state);assert.equal(style.backgroundSize,'500% 200%');cells.add(style.backgroundImage+style.backgroundPosition);}
 }
 assert.equal(cells.size,60);assert.match(read('../src/v16.css'),/aspect-ratio:3\/5/);
});

test('portrait state priorities follow real damage, low health, wins and failure',()=>{
 const c=creatures[0];assert.deepEqual(battlePortraits(undefined,c),{monster:'idle',companion:'idle'});
 assert.deepEqual(battlePortraits({hp:12,enemy:12},c),{monster:'low',companion:'low'});
 assert.deepEqual(battlePortraits({hp:40,enemy:25},c,'hit'),{monster:'hurt',companion:'attack'});
 assert.deepEqual(battlePortraits({hp:40,enemy:25},c,'counter'),{monster:'attack',companion:'hurt'});
 assert.equal(battlePortraits({hp:0,enemy:20},c,'counter').companion,'defeated');
 assert.equal(battlePortraits({hp:40,enemy:0,won:true},c,'hit').monster,'defeated');
 const s=sample(),after=strike(s,0,'echo');assert.equal(after.journal.battles[0].enemy,34);assert.equal(after.journal.battles[0].hp,48);
 assert.equal(s.journal,undefined,'presentation must not mutate its input');
});

test('every gear item has unique lore, a real acquisition route and its actual numerical effect',()=>{
 const notes=gear.map(equipmentNote);assert.equal(new Set(notes.map(n=>n.story)).size,24);
 for(let i=0;i<gear.length;i++){assert.ok(notes[i].origin.length);assert.ok(notes[i].effect.length);}
 assert.match(equipmentNote(gear.find(g=>g.id==='crystal-fork')).origin,/磁带水母支线终章/);
 assert.match(equipmentNote(gear.find(g=>g.id==='rose-cloak')).effect,/10%/);
});

test('settlement line items sum exactly and claimed receipt ignores later equipment changes',()=>{
 let s=sample();s={...s,inventory:{...inventoryFor(s),owned:[...inventoryFor(s).owned,'gold-compass','glacier-lantern']}};
 s=equip(s,'gold-compass');const r=rewards(s),ledger=settlementLedger(s,r);
 assert.equal(r.total,878);assert.equal(ledger.rows.reduce((n,row)=>n+row.value,0),ledger.total);assert.equal(ledger.rows[3].value,38);
 const claimed=claimRewards(s),changed=equip(claimed,'glacier-lantern');
 assert.deepEqual(settlementLedger(changed,rewards(changed)),settlementLedger(claimed,rewards(claimed)));
 assert.match(settlementLedger(changed,rewards(changed)).rows[3].formula,/结算时/);
 assert.equal(claimRewards(changed),changed);assert.equal(settlementLedger({...sample(),viewed:[],listened:[]},rewards({...sample(),viewed:[],listened:[]})).loot,null);
});

test('three card categories use three distinct back prints and physical front constructions',()=>{
 assert.equal(new Set(['album','artist','concept'].map(t=>{const p=cardPrintFor(t);return p.path+':'+p.cell;})).size,3);
 for(const n of ['v16-card-prints-a.png','v16-card-prints-b.png','v16-field-props.png']){const png=readFileSync(new URL('../public/assets/'+n,import.meta.url));assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);}
 const renderer=read('../src/holoRenderer.js');for(const s of ['CylinderGeometry','TorusGeometry','conceptPrint(card,region)',"card.type==='artist'",'paper.image','document.fonts.load'])assert.ok(renderer.includes(s));
 const css=read('../src/v16.css');for(const s of ['.comic-grid .unowned img{filter:grayscale(1)','.comic-grid .owned img{opacity:1;filter:none','collection-sheen','prefers-reduced-motion:reduce'])assert.ok(css.includes(s));
});

test('real UI renders all companions, state portraits, owned comics and a complete reward checklist',async()=>{
 const server=await createSSRServer();
 try{
  const {FieldNotes}=await server.ssrLoadModule('/src/FieldNotes.jsx');const {SettlementPanel}=await server.ssrLoadModule('/src/SettlementPanel.jsx');
  const s={...sample(),journal:{battles:{0:{hp:0,enemy:20,won:false}},quests:{},comics:[0,7]}};
  const before=JSON.stringify(s),html=renderToStaticMarkup(React.createElement(FieldNotes,{state:s,region:0,taleId:0}));
  for(const c of companions)assert.ok(html.includes(c.name));assert.ok(html.includes('留声猫 · 落败'));assert.ok(html.includes('重新调音'));
  assert.equal((html.match(/class="owned"/g)||[]).length,2);assert.equal((html.match(/class="unowned"/g)||[]).length,22);
  const bill=renderToStaticMarkup(React.createElement(SettlementPanel,{state:s,reward:rewards(s)}));
  for(const text of ['840','真实聆听','查阅唱片','新流派发现','装备回馈','探索钥匙 +1','信物 ·','强化等级'])assert.ok(bill.includes(text));
  assert.equal(JSON.stringify(s),before);
 }finally{await server.close();}
});

test('numbered features retain bilingual titles and UI fonts are locally licensed without replacing display headings',()=>{
 const app=read('../src/App.jsx'),adventure=read('../src/Adventure.jsx'),landscape=read('../src/SoundLandscape.jsx'),css=read('../src/typography.css');
 assert.ok(app.includes('title="PERSONAL LISTENING STATION."'));assert.ok(app.includes('subtitle.split(\'/\')[0].trim()'));
 assert.ok(adventure.includes('MORE WAYS TO WANDER.</h2><p className="section-chinese-title">'));
 assert.ok(landscape.includes('function-pixel-title">THE SHAPE OF YOUR LISTENING.'));
 for(const s of ['h1,h2,h3,h4,h5,h6','.console-brand strong','.xp-total strong','unicode-range','font-display:swap'])assert.ok(css.includes(s));
 for(const name of ['NotoSansSC','SpaceGrotesk']){const font=readFileSync(new URL('../public/assets/'+name+'-Variable.woff2',import.meta.url));assert.equal(font.subarray(0,4).toString(),'wOF2');assert.match(read('../public/assets/'+name+'-OFL.txt'),/SIL OPEN FONT LICENSE/);}
});
