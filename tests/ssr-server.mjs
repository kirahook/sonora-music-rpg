import {createServer} from 'vite';

// These tests render modules in Node, not a client dev server. Loading the
// project's dev config also starts client warmup and dependency scanning;
// closing that unneeded work can strand a promise on cold Linux/Node22 runs.
// Vite's automatic JSX transform is sufficient for the exact source modules.
export function createSSRServer(){
 return createServer({
  configFile:false,
  appType:'custom',
  esbuild:{jsx:'automatic'},
  server:{middlewareMode:true,hmr:false,watch:null},
  optimizeDeps:{noDiscovery:true,include:[]},
  ssr:{optimizeDeps:{noDiscovery:true,include:[]}},
 });
}
