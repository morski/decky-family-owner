import { writeFileSync, readFileSync, existsSync } from "node:fs";
// Development-only CDP inspection. No plugin runtime dependency.
// Prints target titles or the initiating stack of one observed public avatar.
// Never prints headers, cookies, authenticated responses or full target URLs.
const [endpointArg, mode = 'list', targetTitle] = process.argv.slice(2);
if (!endpointArg || !['list', 'capture', 'sources', 'probe', 'ownership', 'avatars', 'capsule-sources', 'capsule-probe', 'capsule-dom', 'capsule-identity', 'login-probe', 'dev-test', 'dev-start', 'dev-stop', 'cleanup-check', 'screenshot', 'all-owners', 'cs2', 'license-details'].includes(mode)) {
  console.error('Usage: node scripts/inspect-cef.mjs HOST:PORT [list | capture TARGET_TITLE | sources TARGET_TITLE]');
  process.exit(1);
}
const endpoint = new URL(endpointArg.includes('://') ? endpointArg : `http://${endpointArg}`);
if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
  throw Error('Expected a CEF HTTP endpoint without credentials or query parameters.');
}
const response = await fetch(new URL('/json/list', endpoint), { signal: AbortSignal.timeout(5000) });
if (!response.ok) throw Error(`CEF target list returned HTTP ${response.status}`);
const targets = await response.json();
if (!Array.isArray(targets)) throw Error('CEF returned an unexpected target list.');
if (mode === 'list') {
  console.log(JSON.stringify(targets.map(t => ({ title: t.title, type: t.type })), null, 2));
  process.exit(0);
}
const candidates = targets.filter(t => t.title === targetTitle && typeof t.webSocketDebuggerUrl === 'string');
if (candidates.length !== 1) throw Error(`Expected one target with that title; found ${candidates.length}.`);
const socketUrl = new URL(candidates[0].webSocketDebuggerUrl);
// Route advertised localhost addresses through the supplied remote/tunnel endpoint.
if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(socketUrl.hostname)) socketUrl.host = endpoint.host;
const socket = new WebSocket(socketUrl);
const requests = new Map();
let nextId = 0;
const scripts = new Map();
const contexts = new Map();
let observed = false;
let captureTimer;
const AVATAR = 'https://avatars.steamstatic.com/1eed2efd03a89fe4d95cd5fd62661a522fe1d5e0_medium.jpg';
function send(method, params = {}, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => { requests.delete(id); reject(Error(`${method} timed out`)); }, timeoutMs);
    requests.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
function sourceLocation(value) {
  try { const url = new URL(value); return `${url.origin}${url.pathname}`; }
  catch { return '(no source URL)'; }
}
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id && requests.has(message.id)) {
    const pending = requests.get(message.id);
    clearTimeout(pending.timeout); requests.delete(message.id);
    if (message.error) pending.reject(Error('CEF command rejected'));
    else pending.resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.executionContextCreated') contexts.set(message.params.context.id, message.params.context);
  if (message.method === 'Debugger.scriptParsed') scripts.set(message.params.scriptId, message.params.url);
  if (message.method !== 'Network.requestWillBeSent' || message.params?.request?.url !== AVATAR) return;
  observed = true;
  const initiator = message.params.initiator;
  const stacks = [];
  let stack = initiator?.stack;
  for (let depth = 0; stack && depth < 8; depth++, stack = stack.parent) {
    stacks.push((stack.callFrames ?? []).map(frame => ({
      functionName: frame.functionName,
      source: sourceLocation(frame.url),
      line: frame.lineNumber + 1,
      column: frame.columnNumber + 1,
    })));
  }
  console.log(JSON.stringify({ status: 'avatar request observed', initiatorType: initiator?.type, stacks }, null, 2));
});
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('CEF WebSocket connection timed out')), 5000);
    socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
    socket.addEventListener('error', () => { clearTimeout(timer); reject(Error('CEF WebSocket connection failed')); }, { once: true });
  });
  if(mode==='license-details'){
    const result=await send('Runtime.evaluate',{expression:`(async()=>({fixtures:await Promise.all([730,431240,243780].map(appid=>new Promise(resolve=>{
      let handle;let settled=false;
      const finish=details=>{if(settled)return;settled=true;clearTimeout(timer);handle?.unregister?.();resolve({appid,received:!!details,unAppID:details?.unAppID,subscribed:details?.bIsSubscribedTo,ownerSteamId:details?.strOwnerSteamID,flags:details?.eAppOwnershipFlags,excludedFromSharing:details?.bIsExcludedFromSharing});};
      const timer=setTimeout(()=>finish(),3500);
      try{handle=SteamClient.Apps?.RegisterForAppDetails?.(appid,finish)||SteamClient.App?.RegisterForAppDetails?.(appid,finish);if(settled)handle?.unregister?.();if(typeof handle?.unregister!=='function')finish();}catch{finish();}
    })))}))()`,awaitPromise:true,returnByValue:true});
    if(result.exceptionDetails)throw Error('Native license-details probe failed');
    writeFileSync('/tmp/family-owner-license-details.json',JSON.stringify(result.result.value,null,2));console.log(JSON.stringify(result.result.value,null,2));
  }else if(mode==='cs2'){
    const result=await send('Runtime.evaluate',{expression:`(async()=>{
      const a=window.appStore?.GetAppOverviewByAppID(730);
      const account=await SteamClient.WebChat.GetCurrentUserAccountID();
      return {account, appid:a?.appid,app_type:a?.app_type,owner:a?.owner_account_id??null,
        visible_in_game_list:a?.visible_in_game_list,subscribed_to:a?.subscribed_to,
        lenders:(await SteamClient.FamilySharing.GetAvailableLenders(730)).map(x=>({appid:x.appid,steamid:x.steamid,preferred:x.bPreferred})),
        owned:typeof a?.BIsOwned==='function'?a.BIsOwned():null,
        borrowed:typeof a?.BIsBorrowed==='function'?a.BIsBorrowed():null,
        ownSource:typeof a?.BIsOwned==='function'?a.BIsOwned.toString():null,
        subscribedSource:typeof SteamClient.Apps?.GetAppOwnershipInfo==='function'?SteamClient.Apps.GetAppOwnershipInfo.toString():null};
    })()`,awaitPromise:true,returnByValue:true});
    if(result.exceptionDetails)throw Error('CS2 targeted probe failed');
    writeFileSync('/tmp/family-owner-cs2.json',JSON.stringify(result.result.value,null,2));console.log(JSON.stringify(result.result.value,null,2));
  }else if (mode === 'all-owners') {
    const result=await send('Runtime.evaluate',{expression:`(async()=>{
      const fixtures=[3905450,1127500,431240,243780,1599660,424840];
      const account=await SteamClient.WebChat.GetCurrentUserAccountID();
      return {account,fixtures:await Promise.all(fixtures.map(async appid=>{
        const a=window.appStore?.GetAppOverviewByAppID(appid);
        const lenders=await SteamClient.FamilySharing.GetAvailableLenders(appid);
        return {appid,owner:a?.owner_account_id??null,appType:a?.app_type,
          lenders:lenders.map(l=>({steamid:l.steamid,appid:l.appid,preferred:l.bPreferred})),
          ownedMethod:typeof a?.BIsOwned==='function'?a.BIsOwned.toString():null,
          otherUserMethod:typeof a?.BIsOwnedByAnotherUser==='function'?a.BIsOwnedByAnotherUser.toString():null};
      }))};
    })()`,awaitPromise:true,returnByValue:true},15000);
    if(result.exceptionDetails)throw Error('All-owner discovery failed');
    writeFileSync('/tmp/family-owner-all-owners.json',JSON.stringify(result.result.value,null,2));
    console.log(JSON.stringify(result.result.value,null,2));
  } else if (mode === 'screenshot') {
    const result=await send('Page.captureScreenshot',{format:'png',clip:{x:0,y:120,width:1280,height:520,scale:1}});
    const path='/tmp/family-owner-library-device.png';writeFileSync(path,Buffer.from(result.data,'base64'));console.log(JSON.stringify({path}));
  } else if (mode === 'dev-start') {
    const source=readFileSync(new URL('../dist/index.js',import.meta.url),'utf8');
    const result=await send('Runtime.evaluate',{expression:`(async()=>{
      if(window.__familyOwnerDevelopment) return {status:'already running'};
      const url=URL.createObjectURL(new Blob([${JSON.stringify(source)}],{type:'text/javascript'}));
      let plugin;try{const module=await import(url);plugin=module.default();}finally{URL.revokeObjectURL(url);}
      const stop=()=>{clearTimeout(timer);plugin.onDismount();delete window.__familyOwnerDevelopment;};
      const timer=setTimeout(stop,600000);
      window.__familyOwnerDevelopment={stop};
      window.DFL.Navigation.Navigate('/settings/home');
      await new Promise(resolve=>setTimeout(resolve,350));
      window.DFL.Navigation.Navigate('/library');
      return {status:'temporary development frontend running',automaticCleanupSeconds:600};
    })()`,awaitPromise:true,returnByValue:true});
    if(result.exceptionDetails)throw Error('Temporary development load failed');console.log(JSON.stringify(result.result.value));
  } else if (mode === 'cleanup-check') {
    const result=await send('Runtime.evaluate',{expression:`(()=>{const doc=window.DFL?.Router?.WindowStore?.GamepadUIMainWindowInstance?.BrowserWindow?.document;return {temporaryFrontendPresent:!!window.__familyOwnerDevelopment,renderedDocumentAvailable:!!doc,ownerGroups:doc?.querySelectorAll('[data-family-owner-group]').length};})()`,returnByValue:true});
    if(result.exceptionDetails)throw Error('Cleanup inspection failed');console.log(JSON.stringify(result.result.value));
  } else if (mode === 'dev-stop') {
    const result=await send('Runtime.evaluate',{expression:`(()=>{const running=!!window.__familyOwnerDevelopment;window.__familyOwnerDevelopment?.stop();return {wasRunning:running,stopped:!window.__familyOwnerDevelopment};})()`,returnByValue:true});
    if(result.exceptionDetails)throw Error('Temporary development cleanup failed');console.log(JSON.stringify(result.result.value));
  } else if (mode === 'dev-test') {
    const source=readFileSync(new URL('../dist/index.js',import.meta.url),'utf8').replace('export { index as default };','export { index as default, discoverLibraryCapsule };');
    const result=await send('Runtime.evaluate',{expression:`(async () => {
      const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
      const before=[]; const api=window.DFL;
      api.findAllModules(mod=>{ if(typeof mod?.LibraryItemBox==='string'&&typeof mod?.LibraryItemOverlayOuterArea==='string') before.push(mod.LibraryItemBox);return false;});
      const classes=[...new Set(before)]; if(classes.length!==1) return {status:'ambiguous CSS'};
      const win=api.Router?.WindowStore?.GamepadUIMainWindowInstance?.BrowserWindow;
      if(!win?.document) return {status:'no rendered window'};
      const url=URL.createObjectURL(new Blob([${JSON.stringify(source)}],{type:'text/javascript'}));
      let plugin; let observer; let output={renders:[]};
      const badges=()=>[...win.document.querySelectorAll('span[role="img"]')].filter(n=>n.getAttribute('aria-label')?.startsWith('Owned by '));
      const tiles=()=>[...win.document.getElementsByClassName(classes[0])];
      function sample(){return {tiles:tiles().length,badges:badges().length,images:badges().map(n=>({loaded:!!n.querySelector('img')?.naturalWidth,position:getComputedStyle(n).position,pointerEvents:getComputedStyle(n).pointerEvents,width:getComputedStyle(n).width,tabIndex:n.getAttribute('tabindex')}))};}
      try {
        const mod=await import(url); const pristine=mod.discoverLibraryCapsule(api.findAllModules)?.target.type; plugin=mod.default();
        const discovered=mod.discoverLibraryCapsule(api.findAllModules);
        output.patchChanged=!!discovered?.target.type.__deckyPatch;
        if(discovered) observer=api.afterPatch(discovered.target,'type',(args,tree)=>{
          const classes=[];let pluginNodes=0;
          function walk(node,depth=0){if(!node||depth>25)return;if(Array.isArray(node)){node.forEach(x=>walk(x,depth+1));return;}if(node.props?.className)classes.push(node.props.className);if(node.props?.['data-family-owner'])pluginNodes++;walk(node.props?.children,depth+1);}
          walk(tree);if(output.renders.length<5)output.renders.push({appid:args[0]?.app?.appid,classes,pluginNodes});return tree;
        });
        await delay(100);
        api.Navigation.Navigate('/settings/home'); await delay(400);
        api.Navigation.Navigate('/library'); await delay(1200);
        output.initial=sample();output.groups=[...win.document.querySelectorAll('[data-family-owner-group]')].map(n=>({bottom:n.style.bottom,left:n.style.left,right:n.style.right,direction:n.style.flexDirection})).slice(0,2);
        output.visibleOwnership=tiles().slice(0,25).map(tile=>{const key=Object.getOwnPropertyNames(tile).find(k=>k.startsWith('__reactFiber$'));let f=key?tile[key]:undefined;for(let d=0;f&&d<20;d++,f=f.return){const id=f.memoizedProps?.app?.appid;if(Number.isInteger(id)){const a=window.appStore?.GetAppOverviewByAppID(id);return {appid:id,owner:a?.owner_account_id??null,appType:a?.app_type};}}return {};});
        const store=plugin.content?.props?.children?.props?.store;
        if(store){
          const original={...store.getSnapshot()};output.originalSettings=original;
          store.update({enabled:false});await delay(100);output.disabled=sample();
          store.update({enabled:true,size:36,corner:'top-left'});await delay(250);output.settings=sample();
          output.corners=[];
          for(const corner of ['top-left','top-right','bottom-left','bottom-right']){store.update({corner});await delay(30);const b=badges()[0]?.closest('[data-family-owner-group]');output.corners.push({corner,top:b?.style.top,bottom:b?.style.bottom,left:b?.style.left,right:b?.style.right});}
          const image=badges()[0]?.querySelector('img');if(image){image.dispatchEvent(new win.Event('error'));await delay(40);output.forcedImageFailure={badgeStillVisible:!!badges()[0],imageRemoved:!badges()[0]?.querySelector('img'),focusable:badges()[0]?.hasAttribute('tabindex')};}

          store.update(original);await delay(100);
        }
        output.fixtures=[];
        const wanted=new Set([730,3905450,1127500,431240,243780,1599660,424840]);
        let scroll=tiles()[0]?.parentElement;
        while(scroll && !(scroll.scrollHeight>scroll.clientHeight+10 && /auto|scroll/.test(win.getComputedStyle(scroll).overflowY)))scroll=scroll.parentElement;
        if(scroll){
          const originalTop=scroll.scrollTop; const max=scroll.scrollHeight-scroll.clientHeight;
          output.scrollRange=max;const observed=new Set();
          try{
            for(let step=0;step<=80;step++){
              scroll.scrollTop=max*step/80;await delay(180);
              for(const tile of tiles()){
                const key=Object.getOwnPropertyNames(tile).find(k=>k.startsWith('__reactFiber$'));let f=key?tile[key]:undefined;let appid;
                for(let d=0;f&&d<20;d++,f=f.return)if(Number.isInteger(f.memoizedProps?.app?.appid)){appid=f.memoizedProps.app.appid;break;}
                if(appid)observed.add(appid);
                if(wanted.has(appid)&&!output.fixtures.some(x=>x.appid===appid)){
                  await delay(1200);
                  if(!tile.isConnected) continue;
                  const a=window.appStore?.GetAppOverviewByAppID(appid);
                  const b=[...tile.querySelectorAll('span[role="img"]')].find(n=>n.getAttribute('aria-label')?.startsWith('Owned by '));
                  const avatars=[...tile.querySelectorAll('span[role="img"]')].filter(n=>n.getAttribute('aria-label')?.startsWith('Owned by '));output.fixtures.push({appid,owner:a?.owner_account_id??null,badge:!!b,avatarCount:avatars.length,loaded:avatars.filter(n=>!!n.querySelector('img')?.naturalWidth).length,imagePaths:avatars.map(n=>n.querySelector('img')?new URL(n.querySelector('img').src).pathname:null),positions:avatars.map(n=>({x:n.getBoundingClientRect().x,y:n.getBoundingClientRect().y}))});
                }
              }
              if(output.fixtures.length===wanted.size)break;
            }
            output.observedDuringScroll=observed.size;
          }finally{scroll.scrollTop=originalTop;await delay(250);}
        }
        output.correlations=badges().map(b=>{
          const tile=b.closest('.'+classes[0]);
          const key=tile&&Object.getOwnPropertyNames(tile).find(k=>k.startsWith('__reactFiber$')); let f=key?tile[key]:undefined;
          let appid; for(let d=0;f&&d<20;d++,f=f.return) if(Number.isInteger(f.memoizedProps?.app?.appid)){appid=f.memoizedProps.app.appid;break;}
          const overview=appid?window.appStore?.GetAppOverviewByAppID(appid):undefined;
          return {appid,owner:overview?.owner_account_id,imagePath:b.querySelector('img')?new URL(b.querySelector('img').src).pathname:null};
        });
        store?.update({enabled:false,size:20,corner:'top-right'});
        observer?.unpatch();observer=undefined;plugin.onDismount();plugin=undefined;await delay(100);output.unloaded=sample();
        output.patchRestored=mod.discoverLibraryCapsule(api.findAllModules)?.target.type===pristine;
        plugin=mod.default();await delay(100);
        const reloadedStore=plugin.content?.props?.children?.props?.store;
        output.reloadedSettings=reloadedStore?.getSnapshot();
        reloadedStore?.update(output.originalSettings);
        plugin.onDismount();plugin=undefined;
        return output;
      } finally { observer?.unpatch();plugin?.onDismount();URL.revokeObjectURL(url); }
    })()`,awaitPromise:true,returnByValue:true},45000);
    if(result.exceptionDetails) {console.log(JSON.stringify({status:'device evaluation failed',error:result.exceptionDetails.exception?.description?.slice(0,800)}));}
    else {writeFileSync('/tmp/family-owner-dev-test.json',JSON.stringify(result.result.value,null,2));console.log(JSON.stringify(result.result.value,null,2));}
  } else if (mode === 'login-probe') {
    const result = await send('Runtime.evaluate', {expression:`(() => {
      const user=SteamClient.User; const events=[];
      if(typeof user?.RegisterForLoginStateChange!=='function') return {available:false};
      const handle=user.RegisterForLoginStateChange((_accountName,state)=>events.push({state}));
      const unregisterable=typeof handle?.unregister==='function';
      if(unregisterable) handle.unregister();
      return {available:true,unregisterable,events};
    })()`,returnByValue:true});
    if(result.exceptionDetails) throw Error('Login subscription probe failed');
    console.log(JSON.stringify(result.result.value));
  } else if (mode === 'capsule-identity') {
    const result = await send('Runtime.evaluate', { expression: `(() => {
      const api = window.DFL;
      if (typeof api?.findAllModules !== 'function') return {status: 'discovery unavailable'};
      const css = new Set(), wrappers = [], exports = [], seen = new Set();
      api.findAllModules(mod => {
        if (typeof mod?.LibraryItemBox === 'string' && typeof mod?.LibraryItemOverlayOuterArea === 'string') css.add(mod);
        if (!mod || !['object','function'].includes(typeof mod) || seen.has(mod)) return false;
        seen.add(mod);
        for (const key of Object.keys(mod)) { let value; try {value=mod[key];} catch {continue;}
          exports.push({mod,key,value});
        }
        return false;
      });
      const router = api.Router;
      const win = router?.WindowStore?.GamepadUIMainWindowInstance?.BrowserWindow;
      if (css.size !== 1 || !win?.document) return {cssCandidates:css.size, routerAvailable:!!router, mainWindowAvailable:!!win};
      const cls=[...css][0];
      const nodes=[...win.document.getElementsByClassName(cls.LibraryItemBox)];
      for (const node of nodes) {
        const key=Object.getOwnPropertyNames(node).find(k=>k.startsWith('__reactFiber$'));
        let fiber=key?node[key]:undefined;
        for(let depth=0;fiber&&depth<20;depth++,fiber=fiber.return) {
          if (Number.isInteger(fiber.memoizedProps?.app?.appid) && typeof fiber.type !== 'string') {
            wrappers.push({type:fiber.type,elementType:fiber.elementType,appid:fiber.memoizedProps.app.appid}); break;
          }
        }
      }
      const types=new Set(wrappers.map(x=>x.type));
      const matches=exports.filter(e=>wrappers.some(w=>e.value===w.type||e.value===w.elementType||e.value?.type===w.type||e.value?.render===w.type));
      return {cssCandidates:css.size,tileCount:nodes.length,wrapperTypes:types.size,
        libraryNavigationSource:router.WindowStore.GamepadUIMainWindowInstance.Navigator?.LibraryTab?.toString().slice(0,4000),
        libraryInputs:[...win.document.querySelectorAll('input')].map(n=>({type:n.type,placeholder:n.placeholder,role:n.getAttribute('role')})),
        apps:wrappers.map(w=>w.appid),exportMatches:matches.length,
        structuralModules: [...seen].filter(mod=>Object.values(mod).some(v=>typeof v?.prototype?.GetAssetImage==='function'&&typeof v?.prototype?.BHasVerticalCapsule==='function')).map(mod=>({memoExports:Object.values(mod).filter(v=>v?.$$typeof===Symbol.for('react.memo')&&typeof v.type==='function').length, exports:Object.values(mod).map(v=>({shape:typeof v,memo:v?.$$typeof===Symbol.for('react.memo'),keys:v&&typeof v==='object'?Object.keys(v):[]}))})),
        matches:matches.map(e=>({exportName:e.key,shape:typeof e.value,keys:typeof e.value==='object'?Object.keys(e.value):[],typeSource:(e.value?.type||e.value?.render||e.value)?.toString().slice(0,1000),siblingSources:Object.values(e.mod).filter(v=>typeof v==='function').map(v=>v.toString().slice(0,4000)).slice(0,10)}))};
    })()`, returnByValue:true });
    if(result.exceptionDetails) throw Error('Capsule identity inspection failed');
    writeFileSync('/tmp/family-owner-capsule-identity.json',JSON.stringify(result.result.value,null,2));
    console.log(JSON.stringify(result.result.value,null,2));
  } else if (mode === 'capsule-dom') {
    await send('Runtime.enable');
    for (const [contextId, context] of contexts) {
      const inspection = await send('Runtime.evaluate', { contextId, expression: `(() => ({ hasDocument: typeof document !== 'undefined', elements: typeof document === 'undefined' ? 0 : document.querySelectorAll('*').length, libraryClasses: typeof document === 'undefined' ? [] : [...new Set([...document.querySelectorAll('[class]')].flatMap(n => [...n.classList]).filter(c => /library|capsule/i.test(c)))].slice(0, 25), capsuleClasses: typeof document === 'undefined' ? [] : [...new Set([...document.querySelectorAll('[class]')].flatMap(n => [...n.classList]).filter(c => /LibraryItemBox|LibraryItemOverlay/.test(c)))].slice(0, 10) }))()`, returnByValue: true });
      console.log(JSON.stringify({contextId, isDefault: context.auxData?.isDefault, dom: inspection.result?.value}));
    }
    await send('Runtime.disable');
    const classEvidencePath = '/tmp/family-owner-capsule-class.json';
    const observedClasses = targetTitle !== 'SharedJSContext' && existsSync(classEvidencePath) ? JSON.parse(readFileSync(classEvidencePath, 'utf8')) : [];
    const result = await send('Runtime.evaluate', {
      expression: `(() => {
        const classes = new Set(${JSON.stringify(observedClasses)});
        const api = window.DFL;
        if (typeof api?.findAllModules === 'function') api.findAllModules(mod => {
          if (typeof mod?.LibraryItemBox === 'string' && typeof mod?.LibraryItemOverlayOuterArea === 'string') classes.add(mod.LibraryItemBox);
          return false;
        });
        const nodes = classes.size === 1 ? [...document.getElementsByClassName([...classes][0])] : [...document.querySelectorAll('[class]')].filter(node => [...node.classList].some(token => token.includes('LibraryItemBox') && !token.includes('Shine')));
        return { discoveryAvailable: !!api, classCandidates: classes.size, discoveredClasses: [...classes], tileCount: nodes.length,
          tiles: nodes.slice(0, 5).map(node => ({ tag: node.tagName, position: getComputedStyle(node).position,
            components: (() => { const key = Object.getOwnPropertyNames(node).find(k => k.startsWith('__reactFiber$')); let fiber = key ? node[key] : undefined; const found = []; for (let depth = 0; fiber && depth < 20; depth++, fiber = fiber.return) { const props = fiber.memoizedProps; if (Number.isInteger(props?.app?.appid)) { const type = fiber.type; const fn = typeof type === 'function' ? type : type?.render || type?.type; found.push({ appid: props.app.appid, shape: typeof type, renderSource: typeof fn === 'function' ? fn.toString().slice(0, 12000) : null }); } } return found; })(),
            width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height,
            childTags: [...node.children].map(x => ({tag: x.tagName, position: getComputedStyle(x).position})),
            imagePaths: [...node.querySelectorAll('img')].map(x => { try { const u = new URL(x.src); return u.pathname; } catch {return null;} })
          })) };
      })()`, returnByValue: true,
    });
    if (result.exceptionDetails) throw Error('Capsule DOM inspection failed');
    if (targetTitle === 'SharedJSContext') writeFileSync(classEvidencePath, JSON.stringify(result.result.value.discoveredClasses));
    writeFileSync('/tmp/family-owner-capsule-dom-' + targetTitle.replace(/[^a-z0-9]/gi, '-') + '.json', JSON.stringify(result.result.value, null, 2));
    console.log(JSON.stringify(result.result.value, null, 2));
  } else if (mode === 'capsule-probe') {
    const result = await send('Runtime.evaluate', {
      expression: `(() => {
        const api = window.DFL;
        if (typeof api?.findAllModules !== 'function') return { status: 'Decky discovery unavailable' };
        const candidates = new Map();
        function consider(fn, shape) {
          if (typeof fn !== 'function' || candidates.has(fn)) return;
          const source = fn.toString();
          if (source.includes('LibraryItemBox') || source.includes('library_capsule_filename')) candidates.set(fn, { shape, length: source.length, source: source.slice(0, 9000) });
        }
        const visited = new Set();
        function visit(value, shape, depth = 0) {
          if (!value || !['object', 'function'].includes(typeof value) || visited.has(value) || depth > 6) return;
          visited.add(value);
          consider(value, shape);
          visit(value.type, shape + '.type', depth + 1);
          visit(value.render, shape + '.render', depth + 1);
          consider(value.prototype?.render, shape + '.class-render');
        }
        api.findAllModules(mod => {
          if (!mod || !['object', 'function'].includes(typeof mod)) return false;
          visit(mod, 'module');
          for (const key of Object.keys(mod)) {
            let value; try { value = mod[key]; } catch { continue; }
            visit(value, 'export');
          }
          return false;
        });
        return { candidateCount: candidates.size, candidates: [...candidates.values()] };
      })()`, returnByValue: true,
    });
    if (result.exceptionDetails) throw Error('Capsule source discovery failed');
    const evidencePath = '/tmp/family-owner-capsule-candidates.json';
    writeFileSync(evidencePath, JSON.stringify(result.result.value, null, 2));
    console.log(JSON.stringify({ candidateCount: result.result.value.candidateCount, evidencePath }));
  } else if (mode === 'avatars') {
    const result = await send('Runtime.evaluate', {
      expression: `(async () => {
        return await Promise.all([
          'e729340c0cda2935be187cda3208e346882cc811',
          '1eed2efd03a89fe4d95cd5fd62661a522fe1d5e0'
        ].map(hash => new Promise(resolve => {
          const image = new Image();
          const finish = status => {
            clearTimeout(timer); image.onload = null; image.onerror = null;
            resolve({ hash, status, width: image.naturalWidth, height: image.naturalHeight });
            image.removeAttribute('src');
          };
          const timer = setTimeout(() => finish('timeout'), 4000);
          image.onload = () => finish('loaded');
          image.onerror = () => finish('failed');
          image.src = 'https://avatars.steamstatic.com/' + hash + '_medium.jpg';
        })));
      })()`, awaitPromise: true, returnByValue: true,
    });
    if (result.exceptionDetails) throw Error('Avatar image verification failed');
    console.log(JSON.stringify(result.result.value, null, 2));
  } else if (mode === 'ownership') {
    const result = await send('Runtime.evaluate', {
      expression: `(async () => {
        const appId = 424840;
        const overview = window.appStore?.GetAppOverviewByAppID?.(appId);
        const lenders = await SteamClient.FamilySharing.GetAvailableLenders(appId);
        return {
          appid: overview?.appid, display_name: overview?.display_name,
          owner_account_id: overview?.owner_account_id ?? null, app_type: overview?.app_type,
          lenders: lenders.map(x => ({ steamid: x.steamid, appid: x.appid, preferred: x.bPreferred })),
          fixtures: [3905450, 1127500, 431240, 243780, 1599660].map(appid => {
            const x = window.appStore?.GetAppOverviewByAppID?.(appid);
            return { appid: x?.appid ?? null, display_name: x?.display_name ?? null,
              owner_account_id: x?.owner_account_id ?? null, ownerType: typeof x?.owner_account_id,
              ownerIsNull: x?.owner_account_id === null, app_type: x?.app_type ?? null };
          })
        };
      })()`, awaitPromise: true, returnByValue: true,
    });
    if (result.exceptionDetails) throw Error('Targeted ownership read failed');
    console.log(JSON.stringify(result.result.value, null, 2));
  } else if (mode === 'probe') {
    const result = await send('Runtime.evaluate', {
      expression: `(() => {
        const api = window.DFL;
        if (typeof api?.findAllModules !== 'function') return { status: 'Decky structural discovery unavailable' };
        const friends = new Set(), profiles = new Set();
        api.findAllModules(mod => {
          if (!mod || typeof mod !== 'object') return false;
          for (const key of Object.keys(mod)) {
            let value; try { value = mod[key]; } catch { continue; }
            if (!value || !['object', 'function'].includes(typeof value)) continue;
            
            if (typeof value.prototype?.GetProfileByAccountID === 'function') profiles.add(value.prototype);
            if (typeof value.GetFriendState === 'function' && typeof value.m_FriendsUIFriendStore?.m_mapPlayerCache?.get === 'function' && typeof value.m_mapPlayerCache?.get === 'function' && typeof value.currentUserSteamID?.GetAccountID === 'function') friends.add(value);
            if (typeof value.GetProfileByAccountID === 'function') profiles.add(value);
          }
          return false;
        });
        return {
          friendCandidates: friends.size,
          profileCandidates: profiles.size,
          friendReadSources: [...friends].map(x => ({
            instanceAvailable: !!x.m_FriendsUIFriendStore,
            source: x.GetFriendState.toString().slice(0, 2000),
            playerReadSource: typeof x.m_FriendsUIFriendStore?.GetPlayer === 'function' ? x.m_FriendsUIFriendStore.GetPlayer.toString().slice(0, 2500) : null,
            currentAccount: typeof x.currentUserSteamID?.GetAccountID === 'function' ? x.currentUserSteamID.GetAccountID() : null
          })),
          profileReadSources: [...profiles].map(x => x.GetProfileByAccountID.toString().slice(0, 1000)),
          cachedPersonas: friends.size === 1 ? [79927, 68324741].map(accountId => {
            const store = [...friends][0];
            const player = store.m_FriendsUIFriendStore?.m_mapPlayerCache?.get(accountId) || store.m_mapPlayerCache?.get(accountId);
            const persona = player?.m_persona;
            function getterSource(key) {
              let proto = player;
              for (let depth = 0; proto && depth < 6; depth++, proto = Object.getPrototypeOf(proto)) {
                const descriptor = Object.getOwnPropertyDescriptor(proto, key);
                if (descriptor?.get) return descriptor.get.toString().slice(0, 1500);
              }
              return null;
            }
            return { accountId, cached: !!player,
              name: typeof persona?.m_strPlayerName === 'string' ? persona.m_strPlayerName : null,
              avatarHash: typeof persona?.m_strAvatarHash === 'string' ? persona.m_strAvatarHash : null,
              steamId64: typeof persona?.m_steamid?.ConvertTo64BitString === 'function' ? persona.m_steamid.ConvertTo64BitString() : null,
              avatarGetter: getterSource('avatar_url_medium'),
              steamIdGetter: getterSource('steamid64'),
              nameGetter: getterSource('display_name')
            };
          }) : []
        };
      })()`, returnByValue: true,
    });
    if (result.exceptionDetails) throw Error('Targeted discovery evaluation failed');
    console.log(JSON.stringify(result.result.value, null, 2));
  } else if (['sources', 'capsule-sources', 'capsule-probe'].includes(mode)) {
    await send('Debugger.enable');
    const needles = mode === 'capsule-sources' ? ['.LibraryItemBox', '.LibraryItemOverlayOuterArea', '.AppPortraitBannerContainer', 'bShowUninstalled'] : ['avatars.steamstatic.com', 'm_mapPersonaCache', 'avatar_hash', 'GetPersona', 'm_strAvatarURL', 'avatar_url', 'GetAvailableLenders', 'owner_account_id'];
    const results = [];
    const staticSources = [];
    let inspected = 0;
    for (const [scriptId, source] of scripts) {
      let url;
      try { url = new URL(source); } catch { continue; }
      if (!['https:', 'http:'].includes(url.protocol) || !url.pathname.endsWith('.js') || !/steam|loopback/.test(url.hostname)) continue;
      const body = await send('Debugger.getScriptSource', { scriptId });
      inspected++;
      if (mode === 'capsule-sources' && body.scriptSource.includes('.LibraryItemBox')) writeFileSync('/tmp/family-owner-steam-ui-source.js', body.scriptSource);
      staticSources.push(sourceLocation(source));
      for (const needle of needles) {
        let start = 0;
        for (let match = 0; match < 3; match++) {
          const index = body.scriptSource.indexOf(needle, start);
          if (index < 0) break;
          results.push({ source: sourceLocation(source), needle, excerpt: body.scriptSource.slice(Math.max(0, index - 300), index + 650) });
          start = index + needle.length;
        }
      }
      if (results.length >= 80) break;
    }
    const output = { inspectedStaticScripts: inspected, staticSources, results };
    const evidencePath = `/tmp/family-owner-cef-${mode}-${targetTitle.replace(/[^a-z0-9]/gi, '-')}.json`;
    writeFileSync(evidencePath, JSON.stringify(output, null, 2));
    console.log(JSON.stringify({ inspectedStaticScripts: inspected, staticSources, matches: results.length, evidencePath }, null, 2));
  } else {
  await send('Network.enable');
  console.log('Listening for the selected public avatar for 30 seconds.');
  await new Promise(resolve => { captureTimer = setTimeout(resolve, 30000); });
  if (!observed) console.log(JSON.stringify({ status: 'no matching avatar request observed' }));
  }
} finally {
  clearTimeout(captureTimer);
  if (socket.readyState === WebSocket.OPEN && ['sources', 'capsule-sources', 'capture'].includes(mode)) {
    try { await send(mode === 'capture' ? 'Network.disable' : 'Debugger.disable'); } catch { /* socket teardown still runs */ }
  }
  for (const pending of requests.values()) { clearTimeout(pending.timeout); pending.reject(Error('Inspection ended')); }
  requests.clear();
  socket.close();
}
