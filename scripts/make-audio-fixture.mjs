// Quiet five-second sine wave for local-file playback QA; never shipped in public/.
import {writeFileSync,mkdirSync} from 'node:fs';
const rate=22050,frames=rate*5,buffer=Buffer.alloc(44+frames*2);
buffer.write('RIFF');buffer.writeUInt32LE(buffer.length-8,4);buffer.write('WAVEfmt ',8);
buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);
buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*2,28);buffer.writeUInt16LE(2,32);
buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(frames*2,40);
for(let i=0;i<frames;i++)buffer.writeInt16LE(Math.round(Math.sin(i/rate*440*Math.PI*2)*600),44+i*2);
mkdirSync('.qa',{recursive:true});writeFileSync('.qa/local-audio-test.wav',buffer);
