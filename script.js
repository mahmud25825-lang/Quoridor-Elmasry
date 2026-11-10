// تعريف ملف الصوت باستخدام Howler
const wallSound = new Howl({
    src: ['fahhh_KcgAXfs.mp3'],
    volume: 1.0
});

const COL=[0xd62828,0x1d6fe0,0x2fa84f,0xf2c21b],HEX=['#d62828','#1d6fe0','#2fa84f','#f2c21b'],NAMES=['الأحمر','الأزرق','الأخضر','الأصفر'],D4=[[0,1],[0,-1],[1,0],[-1,0]],P=1.2;
const PR={fast:{p:.1,th:3},bal:{p:.5,th:2},def:{p:.9,th:1},agg:{p:1,th:1},sly:{p:.65,th:2}};
const $=id=>document.getElementById(id),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
let N=9,c=4,NP=2,WIN=1,mode='local',SND=true,G,pawns=[],hl=[],ghost=null,fx=[],star=null,shake=0,pv={x:3,y:3,o:'h'};
const inb=(x,y)=>x>=0&&y>=0&&x<N&&y<N,X=x=>(x-c)*P;

let AC;const au=()=>{if(!AC)try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}if(AC&&AC.state=='suspended')AC.resume();return AC};
function tone(f,d,ty='sine',v=.2,f2,t0=0){if(!SND||!au())return;const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+t0;o.type=ty;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d);}
function noise(d,v,f1,f2,t0=0){if(!SND||!au())return;const n=Math.floor(AC.sampleRate*d),b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
 const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime+t0;s.buffer=b;f.type='lowpass';f.frequency.setValueAtTime(f1,t);f.frequency.exponentialRampToValueAtTime(f2,t+d);
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t);}
const sMove=()=>{tone(520,.09,'triangle',.18,300);noise(.05,.15,3000,800)},sErr=()=>tone(140,.25,'sawtooth',.14,90),sTick=()=>tone(700,.05,'square',.06);
const sWhoosh=()=>{noise(.9,.3,4000,150);tone(1000,.9,'sine',.07,90);tone(55,1,'sawtooth',.12,200)};
const sBoom=()=>{tone(95,.8,'sine',.95,22);noise(.6,.9,900,50);tone(55,1,'square',.25,18);tone(200,.15,'sawtooth',.3,40)};
const sStar=()=>[660,880,1320].forEach((f,i)=>tone(f,.25,'triangle',.18,0,i*.09)),sWin=()=>[523,659,784,1047,1319].forEach((f,i)=>tone(f,.4,'triangle',.2,0,i*.14));

// موسيقى هادئة في الخلفية
function playAmbientChill() {
    if(!SND || !au()) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 587.33];
    const f = notes[Math.floor(Math.random() * notes.length)];
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.04, t + 1.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
    o.connect(g); g.connect(AC.destination);
    o.start(t); o.stop(t + 4.5);
}
setInterval(() => { if(SND) playAmbientChill(); }, 5000);

function blk(ax,ay,bx,by,W=G.walls){
 if(ax==bx){const r=Math.min(ay,by);return W.some(w=>w.o=='h'&&w.y==r&&(w.x==ax||w.x==ax-1));}
 const k=Math.min(ax,bx);return W.some(w=>w.o=='v'&&w.x==k&&(w.y==ay||w.y==ay-1));}
const isGoal=(p,x,y)=>WIN>=3?(x==G.star.x&&y==G.star.y):p.ax=='y'?y==p.gv:x==p.gv;
const occ=(x,y,i)=>G.p.some((q,j)=>j!=i&&q.x==x&&q.y==y);
function moves(i){const me=G.p[i],out=[];
 for(const[dx,dy]of D4){const nx=me.x+dx,ny=me.y+dy;if(!inb(nx,ny)||blk(me.x,me.y,nx,ny))continue;
  if(!occ(nx,ny,i)){out.push([nx,ny]);continue;}
  const jx=nx+dx,jy=ny+dy;
  if(inb(jx,jy)&&!blk(nx,ny,jx,jy)&&!occ(jx,jy,i))out.push([jx,jy]);
  else for(const[sx,sy]of[[dy,dx],[-dy,-dx]]){const tx=nx+sx,ty=ny+sy;if(inb(tx,ty)&&!blk(nx,ny,tx,ty)&&!occ(tx,ty,i))out.push([tx,ty]);}}
 return out;}
function dist(x,y,p,W){const d=new Map([[x*N+y,0]]),q=[[x,y]];
 for(let i=0;i<q.length;i++){const[cx,cy]=q[i],k=d.get(cx*N+cy);if(isGoal(p,cx,cy))return k;
  for(const[dx,dy]of D4){const nx=cx+dx,ny=cy+dy;if(inb(nx,ny)&&!d.has(nx*N+ny)&&!blk(cx,cy,nx,ny,W)){d.set(nx*N+ny,k+1);q.push([nx,ny]);}}}
 return 1e9;}
function wallErr(w){
 if(w.x<0||w.y<0||w.x>N-2||w.y>N-2)return 'الجدار خارج اللوحة';
 for(const e of G.walls){if(e.x==w.x&&e.y==w.y)return 'الجدار يتقاطع مع جدار آخر';
  if(e.o==w.o&&(w.o=='h'?(e.y==w.y&&Math.abs(e.x-w.x)==1):(e.x==w.x&&Math.abs(e.y-w.y)==1)))return 'الجدار يتداخل مع جدار آخر';}
 const W=[...G.walls,w];
 if(G.p.some(p=>dist(p.x,p.y,p,W)>=1e9))return 'مرفوض: هذا الجدار يسدّ الطريق تماماً أمام لاعب';
 return null;}

const R=new THREE.WebGLRenderer({canvas:$('cv'),antialias:true});R.shadowMap.enabled=true;R.setPixelRatio(Math.min(devicePixelRatio,2));
const S=new THREE.Scene();S.background=new THREE.Color(0xf0c987);S.fog=new THREE.Fog(0xf0c987,90,300);
const C=new THREE.PerspectiveCamera(45,1,.1,400);
S.add(new THREE.HemisphereLight(0xfff1d0,0x8a6a3a,.85));
const L=new THREE.DirectionalLight(0xffe2a8,.9);L.position.set(-8,14,10);L.castShadow=true;L.shadow.mapSize.set(1024,1024);S.add(L);
const M=(k,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:k,roughness:r,metalness:m});
const B=new THREE.Group();S.add(B);
const add=(g,m,x,y,z,sh,par=B)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=!!sh;par.add(o);return o;};
const gnd=add(new THREE.PlaneGeometry(800,800),M(0xe3b66b),0,-.65,0,0,S);gnd.rotation.x=-Math.PI/2;
for(const[x,z,s]of[[-30,-70,1.5],[28,-85,2],[70,-50,1.1]]){const p=add(new THREE.ConeGeometry(12*s,14*s,4),M(0xd8ab5c),x,7*s-.65,z,0,S);p.rotation.y=Math.PI/4;}
const cg=new THREE.BoxGeometry(1,.3,1);
const tint=(x,y)=>WIN==1?(y==0?0xe3a595:y==N-1&&NP>=2?0x9fbbe6:x==N-1&&NP>=3?0xa5d9a0:x==0&&NP>=4?0xe8dc8a:0):WIN==2&&y==0?0xf2d37a:0;

function buildBoard(){
    B.clear();
    const w=N*P;
    add(new THREE.BoxGeometry(w+.8,.4,w+.8), M(0x111111,.5,.4), 0, -.4, 0);
    for(let x=0;x<N;x++)for(let y=0;y<N;y++)add(cg,M(tint(x,y)||((x+y)%2?0xd9b87a:0xcfa868),.9),X(x),-.15,X(y));
    const e=w/2+1;for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*e,z=sz*e;
     add(new THREE.CylinderGeometry(.5,.55,4.2,16),M(0xdcc08a),x,1.5,z,1);add(new THREE.BoxGeometry(1.3,.35,1.3),M(0xf2c14e,.3,.8),x,3.75,z,1);}
    const s=w/2+3;Object.assign(L.shadow.camera,{left:-s,right:s,top:s,bottom:-s,near:1,far:70});L.shadow.camera.updateProjectionMatrix();
}

const D=new THREE.Group();S.add(D);
function mkPawn(k){const g=new THREE.Group(),m=M(k,.4,.2),a=(geo,mt,y)=>{const o=new THREE.Mesh(geo,mt);o.position.y=y;o.castShadow=true;g.add(o);return o;};
 a(new THREE.CylinderGeometry(.4,.45,.18,24),m,.09);a(new THREE.CylinderGeometry(.16,.34,.7,24),m,.5);
 a(new THREE.SphereGeometry(.22,24,16),m,1);a(new THREE.ConeGeometry(.26,.28,4),M(0xf2c14e,.3,.8),1.28).rotation.y=Math.PI/4;return g;}
function mkWall(w,k,gh){const g=new THREE.Group(),h=w.o=='h',m=M(k,.5,.1);if(gh){m.transparent=true;m.opacity=.6;}
 const b=new THREE.Mesh(new THREE.BoxGeometry(h?2.2:.2,.7,h?.2:2.2),m);b.position.y=.35;
 const t=new THREE.Mesh(new THREE.BoxGeometry(h?2.3:.3,.08,h?.3:2.3),gh?m:M(0xf2c14e,.3,.8));t.position.y=.74;
 g.add(b,t);g.traverse(o=>o.castShadow=!gh);g.userData.bm=m;g.position.set((w.x+.5-c)*P,0,(w.y+.5-c)*P);return g;}
function mkStar(){const s=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?.22:.5,a=i*Math.PI/5+Math.PI/2;(i?s.lineTo:s.moveTo).call(s,Math.cos(a)*r,Math.sin(a)*r);}s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:.14,bevelEnabled:false});g.translate(0,0,-.07);
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0xffd23a,emissive:0xffa800,emissiveIntensity:.7,metalness:.8,roughness:.3}));m.castShadow=true;m.add(new THREE.PointLight(0xffc040,.8,6));return m;}
function puff(x,z,n,k,v,g,life){for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.12,6,6),new THREE.MeshBasicMaterial({color:k,transparent:true}));
 m.position.set(x,.1,z);const a=Math.random()*6.28,s=Math.random()*v;m.userData={v:new THREE.Vector3(Math.cos(a)*s,Math.random()*v*.8,Math.sin(a)*s),g,life,max:life};D.add(m);fx.push(m);}}

let th=0,ph=.9,rad=30,fitR=30;
function fit(){const t=Math.tan(22.5*Math.PI/180)*Math.min(innerWidth/innerHeight,1);rad=fitR=cl((N*P/2+1.8)/t,11,90);}
function cam(){
    shake*=.92;
    const j=()=>(Math.random()-.5)*shake;
    C.position.set(rad*Math.sin(ph)*Math.sin(th)+j(), rad*Math.cos(ph)+j(), rad*Math.sin(ph)*Math.cos(th)+j());
    C.lookAt(0,0,0);
}
function resize(){R.setSize(innerWidth,innerHeight);C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();fit();}
addEventListener('resize',resize);resize();

const ptr=new Map(),pd=()=>{const a=[...ptr.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};let st=null,pl0=0;const cv=$('cv');
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});st={t:Date.now(),m:0};if(ptr.size==2){pl0=pd();st.m=99;}});
cv.addEventListener('pointermove',e=>{const o=ptr.get(e.pointerId);if(!o)return;const dx=e.clientX-o.x,dy=e.clientY-o.y;o.x=e.clientX;o.y=e.clientY;
 if(ptr.size==1){
     st.m+=Math.abs(dx)+Math.abs(dy);
     if(st.m>10){
         th-=dx*.006;
         ph=cl(ph-dy*.005, 0.05, Math.PI - 0.05);
     }
 }
 else if(ptr.size==2){const d=pd();rad=cl(rad*pl0/d, 4, 150);pl0=d;}});
const up=(e,tp)=>{ptr.delete(e.pointerId);if(tp&&!ptr.size&&st&&st.m<10&&Date.now()-st.t<600)tap(e.clientX,e.clientY);if(!ptr.size)st=null;};
cv.addEventListener('pointerup',e=>up(e,1));cv.addEventListener('pointercancel',e=>up(e,0));

/* ====== P2P (جهازين، بدون إنترنت وبدون سيرفر) ====== */
let peerConnection=null, dataChannel=null, isHost=false, myPlayerId=0;
const rtcConfig={iceServers:[]};
function updateNetStatus(text,bg,color){const d=$('netStatus');d.textContent=text;if(bg)d.style.background=bg;if(color)d.style.color=color;}

// ننتظر انتهاء جمع عناوين الشبكة قبل عرض الكود
function waitIce(pc){
    return new Promise(res=>{
        if(pc.iceGatheringState==='complete')return res();
        const t=setTimeout(res,3000);
        pc.addEventListener('icegatheringstatechange',()=>{
            if(pc.iceGatheringState==='complete'){clearTimeout(t);res();}
        });
    });
}

// ضغط الكود: حرف النوع + نص SDP بأسطر \n فقط (أصغر بكثير من JSON)
const enc=d=>d.type[0]+d.sdp.replace(/\r\n/g,'\n');
const dec=s=>({type:s[0]=='o'?'offer':'answer',sdp:s.slice(1).replace(/\n/g,'\r\n')});

function setLocalCode(t){
    $('localCode').value=t;
    const box=$('qrBox');box.innerHTML='';
    try{new QRCode(box,{text:t,width:260,height:260,correctLevel:QRCode.CorrectLevel.L});box.style.display='block';}
    catch(e){box.style.display='none';toast('الكود كبير على QR، استخدم النسخ واللصق');}
}

async function scanQR(){
    if(!('BarcodeDetector' in window)||!navigator.mediaDevices){toast('الماسح غير مدعوم هنا، استخدم النسخ واللصق');return null;}
    const box=$('scanner'),vid=$('scanVid');let stream;
    try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});}
    catch(e){toast('تعذّر فتح الكاميرا (لازم الصفحة تُفتح من localhost أو https)');return null;}
    vid.srcObject=stream;await vid.play();box.style.display='flex';
    const det=new BarcodeDetector({formats:['qr_code']});
    return new Promise(res=>{
        let done=false,iv;
        const fin=v=>{if(done)return;done=true;clearInterval(iv);stream.getTracks().forEach(t=>t.stop());box.style.display='none';res(v);};
        iv=setInterval(async()=>{try{const r=await det.detect(vid);if(r.length)fin(r[0].rawValue);}catch(e){}},250);
        $('scanCancel').onclick=()=>fin(null);
    });
}

async function createOffer(){
    try{
        if(peerConnection)peerConnection.close();
        isHost=true; myPlayerId=0; NP=2;
        peerConnection=new RTCPeerConnection(rtcConfig);
        dataChannel=peerConnection.createDataChannel("egyptCorridor");
        setupDataChannel();
        const offer=await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await waitIce(peerConnection);
        setLocalCode(enc(peerConnection.localDescription));
        updateNetStatus("اطلب من اللاعب الثاني مسح الـ QR، ثم اضغط «مسح QR» لتمسح رده","#3a2a12","#f2c14e");
    }catch(e){alert("خطأ: "+e.message);}
}

async function connectWithCode(txt){
    const code=(typeof txt==='string'?txt:$('remoteCode').value).trim();
    if(!code)return alert("أدخل الكود أولاً!");
    try{
        const parsed=dec(code);
        if(!peerConnection){
            // الضيف: استلم كود المضيف ويُنشئ كود الرد
            isHost=false; myPlayerId=1;
            peerConnection=new RTCPeerConnection(rtcConfig);
            peerConnection.ondatachannel=(e)=>{dataChannel=e.channel;setupDataChannel();};
            await peerConnection.setRemoteDescription(new RTCSessionDescription(parsed));
            const answer=await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            await waitIce(peerConnection);
            setLocalCode(enc(peerConnection.localDescription));
            updateNetStatus("اعرض الـ QR للمضيف ليمسحه بكاميرته","#3a2a12","#f2c14e");
        }else{
            // المضيف: استلم كود الرد
            await peerConnection.setRemoteDescription(new RTCSessionDescription(parsed));
            updateNetStatus("جاري الاتصال...","#3a2a12","#f2c14e");
        }
    }catch(e){alert("الكود غير صحيح أو حدث خطأ: "+e.message);}
}

function setupDataChannel(){
    dataChannel.onopen=()=>{
        updateNetStatus("متصل بنجاح!","#3a2a12","#3fe07a");
        setTimeout(()=>{
            $('netModal').style.display='none';
            if(isHost){startGameSession();}
        },600);
    };
    dataChannel.onclose=()=>{updateNetStatus("انقطع الاتصال","#3a2a12","#e03737");toast('انقطع الاتصال بالجهاز الآخر');};
    dataChannel.onmessage=(e)=>{
        const packet=JSON.parse(e.data);
        if(packet.type==='STATE') applyRemoteState(packet.data);
        else if(packet.type==='IMPACT') impact({position:new THREE.Vector3(packet.x,0,packet.z)});
    };
}

function broadcastState(){
    if(socket&&roomCode)return socket.emit('state',G);
    if(dataChannel&&dataChannel.readyState==='open')dataChannel.send(JSON.stringify({type:'STATE',data:G}));
}
function sendImpactPacket(x,z){
    if(socket&&roomCode)return socket.emit('impact',{x,z});
    if(dataChannel&&dataChannel.readyState==='open')dataChannel.send(JSON.stringify({type:'IMPACT',x:x,z:z}));
}

/* ====== أونلاين (Node.js + Socket.io) — بجانب الوضع الأوفلاين ====== */
let socket=null, roomCode=null;
const updateOnStatus=(t,color)=>{const d=$('onStatus');d.textContent=t;d.style.color=color||'#f2c14e';};

function loadIO(url){
    return new Promise((res,rej)=>{
        if(window.io)return res();
        const sc=document.createElement('script');
        sc.src=url+'/socket.io/socket.io.js';
        sc.onload=res;sc.onerror=()=>rej(new Error('تعذّر الوصول للسيرفر، تأكد من العنوان والإنترنت'));
        document.head.appendChild(sc);
    });
}

async function netInit(){
    if(socket&&socket.connected)return socket;
    const url=$('srvUrl').value.trim().replace(/\/$/,'');
    if(!url){alert('اكتب عنوان السيرفر أولاً');return null;}
    try{localStorage.setItem('srvUrl',url);}catch(e){}
    try{await loadIO(url);}catch(e){alert(e.message);return null;}
    if(socket)socket.disconnect();
    socket=io(url);
    socket.on('connect',()=>updateOnStatus('متصل بالسيرفر','#3fe07a'));
    socket.on('connect_error',()=>updateOnStatus('تعذّر الاتصال بالسيرفر','#e03737'));
    socket.on('disconnect',()=>updateOnStatus('انقطع الاتصال بالسيرفر','#e03737'));
    socket.on('roomUpdate',({count,np})=>updateOnStatus('اللاعبون في الغرفة: '+count+'/'+np));
    socket.on('roomFull',()=>{
        $('onlineModal').style.display='none';
        if(isHost)startGameSession();
    });
    socket.on('state',data=>applyRemoteState(data));
    socket.on('impact',({x,z})=>impact({position:new THREE.Vector3(x,0,z)}));
    socket.on('peerLeft',()=>{
        toast('خرج أحد اللاعبين وانتهت الغرفة');
        roomCode=null;$('win').style.display='none';$('menu').style.display='flex';
    });
    return socket;
}

async function createRoom(){
    if(!(await netInit()))return;
    isHost=true;myPlayerId=0;
    socket.emit('createRoom',{np:NP},res=>{
        if(!res||!res.ok)return alert('تعذّر إنشاء الغرفة');
        roomCode=res.code;
        $('roomCodeBox').textContent=res.code;
        updateOnStatus('أرسل الكود للاعبين ('+1+'/'+res.np+')');
    });
}

async function joinRoom(){
    const code=$('joinCode').value.trim().toUpperCase();
    if(!code)return alert('أدخل كود الغرفة أولاً!');
    if(!(await netInit()))return;
    isHost=false;
    socket.emit('joinRoom',{code},res=>{
        if(!res||!res.ok)return alert((res&&res.error)||'فشل الانضمام');
        myPlayerId=res.playerId;roomCode=res.code;NP=res.np;
        updateOnStatus('تم الانضمام، بانتظار باقي اللاعبين','#3fe07a');
    });
}

function leaveOnline(){
    if(socket){socket.disconnect();socket=null;}
    roomCode=null;
}

function applyRemoteState(remoteG){
    G=remoteG; WIN=G.WIN||WIN; N=G.N||N; NP=G.NP||NP; c=(N-1)/2;
    buildBoard(); D.clear();
    pawns=G.p.map((p,i)=>{const o=mkPawn(COL[i]);o.position.set(X(p.x),0,X(p.y));D.add(o);return o;});
    G.walls.forEach(w=>{const m=mkWall(w,COL[w.c]);m.position.y=0;D.add(m);});
    if(WIN>=3&&G.star){star=mkStar();star.position.set(X(G.star.x),1,X(G.star.y));D.add(star);}
    clearHL();
    if(human()&&G.act=='move')setAct('move');else ui();
    if(G.over){$('wt').textContent='🏆 انتهت اللعبة!';$('win').style.display='flex';}
}

const isBot=i=>mode=='single'&&i>0,human=()=>{
    if(mode=='lan')return G&&!G.over&&!G.lock&&G.turn===myPlayerId;
    return G&&!G.over&&!G.lock&&!isBot(G.turn);
};
function toast(t){const e=$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.opacity=0,2600);}
const WT=()=>['','الهدف: الوصول إلى الضلع المقابل لبيتك','سباق: الجميع من جهة واحدة، والهدف الجهة المقابلة','الهدف: أول من يصل إلى النجمة في المنتصف','النجمة تنتقل بعد كل '+N+' حركات — أول من يصل إليها يفوز'][WIN];

function startGameSession(){
    const n=cl(Math.floor(+$('wn').value||10),1,99999),m=N-1;c=m/2;
    buildBoard(); D.clear(); fx=[]; hl=[]; ghost=null; star=null;
    let base=WIN==2?Array.from({length:NP},(_,i)=>({x:Math.round((i+1)*m/(NP+1)),y:m,ax:'y',gv:0})):[{x:c,y:m,ax:'y',gv:0},{x:c,y:0,ax:'y',gv:m},{x:0,y:c,ax:'x',gv:m},{x:m,y:c,ax:'x',gv:0}].slice(0,NP);
    const keys=Object.keys(PR),ps=$('ps').value;
    G={p:base.map(p=>({...p,w:n})),walls:[],turn:0,act:'move',over:false,t:1,mc:0,lock:0,star:{x:c,y:c},bot:base.map(()=>ps=='mix'?keys[Math.floor(Math.random()*5)]:ps),WIN,N,NP};
    pawns=G.p.map((p,i)=>{const o=mkPawn(COL[i]);o.position.set(X(p.x),0,X(p.y));D.add(o);return o;});
    if(WIN>=3){star=mkStar();star.position.set(X(c),1,X(c));D.add(star);}
    pv={x:Math.max(0,c-1),y:Math.max(0,c-1),o:'h'};$('win').style.display='none';th=0;ph=.9;fit();setAct('move');toast(WT());
    if(mode=='lan') broadcastState();
}

function newGame(){
    if(mode=='lan'&&!isHost)return toast('المضيف فقط يستطيع بدء لعبة جديدة');
    startGameSession();
}

function clearHL(){hl.forEach(h=>D.remove(h));hl=[];if(ghost){D.remove(ghost);ghost=null;}}
function setAct(a){G.act=a;clearHL();
 if(human()&&a=='move')moves(G.turn).forEach(([x,y])=>{const k=new THREE.Mesh(new THREE.CircleGeometry(.4,24),new THREE.MeshBasicMaterial({color:0x37e07a,transparent:true,opacity:.7}));
  k.rotation.x=-Math.PI/2;k.position.set(X(x),.03,X(y));D.add(k);hl.push(k);});
 if(human()&&a=='wall')showGhost();ui();}
function showGhost(){if(ghost)D.remove(ghost);const e=wallErr(pv);ghost=mkWall(pv,e?0xff3030:0x37e07a,true);D.add(ghost);$('ok').style.opacity=e?.45:1;if(e){toast(e);sErr();}else sTick();}
function ui(){const t=G.turn;$('pn').innerHTML='<span id="dot" style="background:'+HEX[t]+'"></span>دور اللاعب '+NAMES[t]+(isBot(t)?' (الكمبيوتر)':'');
 $('st').innerHTML=G.p.map((p,j)=>'<span style="'+(j==t?'border-bottom:2px solid '+HEX[j]:'')+'"><i style="color:'+HEX[j]+'">●</i>🧱'+p.w+'</span>').join(' ')+' • الدور '+G.t+(WIN==4?' • النجمة بعد '+(N-G.mc):'');
 const w=G.act=='wall';$('mv').style.display=$('wl').style.display=w?'none':'';$('ok').style.display=$('no').style.display=$('ro').style.display=w?'':'none';
 $('bar').style.visibility=human()?'visible':'hidden';}
function tap(px,py){if(!human()||$('menu').style.display=='flex'||$('netModal').style.display=='flex'||$('onlineModal').style.display=='flex')return;
 const ray=new THREE.Raycaster(),v=new THREE.Vector3();ray.setFromCamera(new THREE.Vector2(px/innerWidth*2-1,-(py/innerHeight)*2+1),C);
 if(!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),v))return;
 const gx=v.x/P+c,gz=v.z/P+c;
 if(G.act=='move'){const x=Math.round(gx),y=Math.round(gz);
  if(moves(G.turn).some(m=>m[0]==x&&m[1]==y))doMove(G.turn,x,y);else if(inb(x,y)){toast('حركة غير مسموحة');sErr();}}
 else{pv.x=cl(Math.round(gx-.5),0,N-2);pv.y=cl(Math.round(gz-.5),0,N-2);showGhost();}}

function doMove(i,x,y){
    const p=G.p[i];p.x=x;p.y=y;pawns[i].tp={x:X(x),z:X(y)};clearHL();sMove();
    if(isGoal(p,x,y))return win(i);
    if(WIN==4&&++G.mc>=N){G.mc=0;moveStar();}
    end();
}
function moveStar(){const o=G.star,ok=[];
 for(let x=0;x<N;x++)for(let y=0;y<N;y++){if(G.p.some(p=>p.x==x&&p.y==y))continue;G.star={x,y};
  if(G.p.every(p=>dist(p.x,p.y,p,G.walls)<1e9))ok.push({x,y,d:Math.min(...G.p.map(p=>Math.abs(p.x-x)+Math.abs(p.y-y)))});}
 const far=ok.filter(k=>k.d>=Math.floor(N/2)),pool=far.length?far:ok.sort((a,b)=>b.d-a.d).slice(0,3);
 G.star=pool.length?pool[Math.floor(Math.random()*pool.length)]:o;
 puff(X(o.x),X(o.y),16,0xffd23a,.12,.004,40);star.position.set(X(G.star.x),1,X(G.star.y));star.scale.setScalar(.01);sStar();toast('✨ انتقلت النجمة إلى مكان جديد!');}

function place(w){
    G.walls.push({x:w.x,y:w.y,o:w.o,c:G.turn});
    G.p[G.turn].w--;
    clearHL();
    G.lock=1;

    const m = mkWall(w, COL[G.turn]);
    m.position.y = 16;

    const mk = new THREE.Mesh(
        new THREE.PlaneGeometry(w.o=='h'?2.4:.5, w.o=='h'?.5:2.4),
        new THREE.MeshBasicMaterial({color:0xff1010, transparent:true, opacity:0})
    );
    mk.rotation.x = -Math.PI/2;
    mk.position.set(m.position.x, .04, m.position.z);
    D.add(mk);
    m.userData.bm.emissive.setHex(0xff2200);

    Object.assign(m.userData, {
        drop: 1,
        vy: 0,
        mk,
        after: () => { G.lock = 0; end(); }
    });

    D.add(m);
    sWhoosh();
    ui();

}

function impact(m){
    if(SND)wallSound.play(); // صوتك يشتغل لحظة وصول الجدار للوحة
    shake=1.1;L.intensity=3.2;sBoom();
    puff(m.position.x,m.position.z,22,0xc9a35e,.22,-.002,45);
}

function end(){
    G.turn=(G.turn+1)%NP;if(G.turn==0)G.t++;setAct('move');
    if(mode=='lan'){
        broadcastState();
    }else{
        if(isBot(G.turn))setTimeout(aiPlay,900);
    }
}
function win(i){
    G.over=true;pawns[i].spin=1;rad=Math.max(8,rad*.6);ph=.75;clearHL();ui();sWin();shake=.6;
    for(let k=0;k<100;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(.14,.14,.02),new THREE.MeshBasicMaterial({color:[0xf2c14e,0xd62828,0x1d6fe0,0xffffff][k%4]}));
     m.position.set(0,7,0);m.userData={v:new THREE.Vector3((Math.random()-.5)*.3,Math.random()*.15,(Math.random()-.5)*.3),g:.006,life:260,max:260,nf:1};D.add(m);fx.push(m);}
    if(mode=='lan')broadcastState();
    setTimeout(()=>{$('wt').textContent='🏆 فاز اللاعب '+NAMES[i]+'!';$('wt').style.color=HEX[i];$('win').style.display='flex';},1100);
}
function aiPlay(){if(G.over)return;const i=G.turn,me=G.p[i],W=G.walls,ps=PR[G.bot[i]],ds=G.p.map(p=>dist(p.x,p.y,p,W)),dm=ds[i];
 let ld=-1;ds.forEach((d,j)=>{if(j!=i&&(ld<0||d<ds[ld]))ld=j;});const Lp=G.p[ld],dl=ds[ld];let best=null,bg=Math.max(1,dl<dm?ps.th-1:ps.th);
 if(me.w>0&&Math.random()<ps.p)for(let x=Math.max(0,Lp.x-2);x<=Math.min(N-2,Lp.x+1);x++)for(let y=Math.max(0,Lp.y-2);y<=Math.min(N-2,Lp.y+1);y++)for(const o of['h','v']){
  const w={x,y,o};if(wallErr(w))continue;const W2=[...W,w],g=dist(Lp.x,Lp.y,Lp,W2)-dl-(dist(me.x,me.y,me,W2)-dm);if(g>=bg){bg=g;best=w;}}
 if(best)return place(best);
 const ms=moves(i).map(m=>[dist(m[0],m[1],me,W),m]).sort((a,b)=>a[0]-b[0]);if(!ms.length)return end();doMove(i,ms[0][1][0],ms[0][1][1]);}

function loop(){requestAnimationFrame(loop);const t=performance.now()/1000;

 pawns.forEach(p=>{if(p.spin){p.rotation.y+=.05;p.position.y=.4+Math.abs(Math.sin(t*3))*.6;}
  else if(p.tp){const dx=p.tp.x-p.position.x,dz=p.tp.z-p.position.z,d=Math.hypot(dx,dz);p.position.x+=dx*.2;p.position.z+=dz*.2;p.position.y=Math.min(d,1)*.5;if(d<.02){p.position.set(p.tp.x,0,p.tp.z);p.tp=null;}}});
 if(star&&G){const s=star.scale.x;star.scale.setScalar(Math.min(1,s+.04));star.rotation.y+=.04;star.position.y=1+Math.sin(t*2)*.15;star.position.x+=(X(G.star.x)-star.position.x)*.5;star.position.z+=(X(G.star.y)-star.position.z)*.5;}
 [...D.children].forEach(m=>{const u=m.userData;if(!u.drop)return;
  u.vy+=.012;
  m.position.y-=u.vy;
  u.mk.material.opacity=cl(.1+.6*(1-m.position.y/16),0,.7);u.bm.emissiveIntensity=.5+.5*Math.sin(t*40);
  if(m.position.y<=0){
      m.position.y=0;u.drop=0;D.remove(u.mk);u.bm.emissive.setHex(0);
      impact(m);if(mode=='lan')sendImpactPacket(m.position.x,m.position.z);u.after();
  }
});
 fx.slice().forEach(m=>{const u=m.userData;u.v.y-=u.g;m.position.add(u.v);m.rotation.x+=.2;if(!u.nf)m.material.opacity=u.life/u.max;if(m.position.y<-.3){m.position.y=-.3;u.v.set(0,0,0);}if(--u.life<=0){D.remove(m);fx.splice(fx.indexOf(m),1);}});
 L.intensity+=(.9-L.intensity)*.12;if(G&&G.over)th+=.004;cam();R.render(S,C);}

const setN=d=>{N=cl(N+d*2,5,25);$('nv').textContent=N+'×'+N;};
$('nm').onclick=()=>setN(-1);$('npp').onclick=()=>setN(1);
$('npb').onclick=e=>{const b=e.target.closest('button');if(!b)return;[...$('npb').children].forEach(x=>x.classList.remove('on'));b.classList.add('on');NP=+b.dataset.v;};
$('wm').onchange=e=>WIN=+e.target.value;

const start=m=>{au();$('menu').style.display='none';
    NP=+$('npb').querySelector('.on').dataset.v;
    isHost=false;myPlayerId=0;leaveOnline();
    if(m=='lan'){mode='lan';NP=2;$('netModal').style.display='flex';}
    else if(m=='net'){mode='lan';$('onlineModal').style.display='flex';}
    else{mode=m;newGame();}};
$('m1').onclick=()=>start('single');$('m2').onclick=()=>start('local');
$('m3').onclick=()=>start('lan');
$('m4').onclick=()=>start('net');

$('btnCreateOffer').onclick=createOffer;
$('btnConnect').onclick=()=>connectWithCode();
$('btnScan').onclick=async()=>{const t=await scanQR();if(t)connectWithCode(t);};
$('btnCopyLocal').onclick=()=>{
    const box=$('localCode');
    if(!box.value)return toast("لا يوجد كود للنسخ بعد!");
    navigator.clipboard.writeText(box.value).then(()=>toast("✨ تم نسخ الكود"));
};
$('btnPasteRemote').onclick=()=>{
    navigator.clipboard.readText().then(t=>{$('remoteCode').value=t;}).catch(()=>toast("الصق الكود يدوياً في المربع"));
};

$('btnCloseNet').onclick=()=>{
    $('netModal').style.display='none';$('menu').style.display='flex';
    if(peerConnection){peerConnection.close();peerConnection=null;dataChannel=null;}
    mode='local';
};

try{$('srvUrl').value=localStorage.getItem('srvUrl')||(location.protocol.startsWith('http')?location.origin:'');}catch(e){}
$('onCreate').onclick=createRoom;
$('onJoin').onclick=joinRoom;
$('onCopy').onclick=()=>{
    if(!roomCode)return toast('لا يوجد كود بعد!');
    navigator.clipboard.writeText(roomCode).then(()=>toast('✨ تم نسخ الكود'));
};
$('onClose').onclick=()=>{leaveOnline();$('onlineModal').style.display='none';$('menu').style.display='flex';mode='local';};

$('mn').onclick=()=>$('menu').style.display='flex';$('rc').onclick=()=>{th=0;ph=.9;fit();};
$('sn').onclick=()=>{SND=!SND;$('sn').textContent=SND?'🔊':'🔇';};
$('again').onclick=()=>newGame();$('mv').onclick=()=>setAct('move');
$('wl').onclick=()=>G.p[G.turn].w>0?setAct('wall'):toast('لا توجد جدران متبقية');
$('no').onclick=()=>setAct('move');$('ro').onclick=()=>{pv.o=pv.o=='h'?'v':'h';showGhost();};
$('ok').onclick=()=>{const e=wallErr(pv);if(e){sErr();return toast(e);}place(pv);};

startGameSession();$('menu').style.display='flex';loop();
