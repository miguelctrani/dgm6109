/*
  EXO-PDRN Centella Mask, interactive landing prototype.
  What happens in this file, top to bottom:
    Ingredient list below the fold (built from js/content.js)
    Mask geometry: outline plus eye, nose and mouth holes, defined in uv space (0 to 1)
    layout(): sizes the mask, pouch and bubbles to the viewport, desktop and mobile
    build(): creates the cloth grid (COLS x ROWS points) and its constraints
    shapeMatch(): pulls the cloth back toward its rest shape, this is what stops folding
    Modes: "soft" = flexes but never folds, "rigid" = stays flat and floats
    Input: mouse and touch; touches only get captured when they land on the mask, so the page still scrolls
    step(): physics, bubble hit tests, particles
    renderCard(): the info card states (intro, each ingredient, complete)
    draw(): canvas 2D rendering (shadow, glow, shaded cells clipped to the mask outline)
  No dependencies, plain script. Works from file:// or any static host.
*/
(function(){
const ING=window.MASK_CONTENT.ingredients;

// static list below the fold
const list=document.getElementById('activeList');
ING.forEach(g=>{
  const d=document.createElement('div');d.className='active';
  d.innerHTML=`<img src="${g.img}" alt="" width="96" height="96"><div><h4>${g.name}<span>${g.zh}</span></h4><p>${g.body}</p></div>`;
  list.appendChild(d);
});

const stage=document.getElementById('stage'),cv=document.getElementById('c'),ctx=cv.getContext('2d');
const pouch=document.getElementById('pouch'),card=document.getElementById('card'),bubWrap=document.getElementById('bubbles');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLS=24,ROWS=30;
let mode='soft',maskPts=[],w,h,dpr,W,H,home,mobile,pts,cons,cells,edges,bubbles=[],found=[false,false,false,false],engaged=false,t=0,drag=null,particles=[],complete=false,glow=0;

function outer(u,v){
  const x=(u-.5)/.5,y=(v-.5)/.5;
  const f=y>0?1-.3*y*y:1-.06*y*y;
  return Math.pow(Math.abs(x/f),2.3)+Math.pow(Math.abs(y),2.1)<=1;
}
function inside(u,v){
  if(!outer(u,v))return false;
  for(const hl of HOLES){if(pip(hl,u,v))return false;}
  return true;
}
function pip(poly,x,y){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];
  if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
// outline in uv space
const OUT=[];for(let k=0;k<160;k++){const th=k/160*6.2832,dx=Math.cos(th),dy=Math.sin(th);
  let lo=0,hi=.8;for(let n=0;n<22;n++){const m=(lo+hi)/2;outer(.5+dx*m,.5+dy*m)?lo=m:hi=m;}
  OUT.push([.5+dx*lo,.5+dy*lo]);}
function almond(cx,cy,rx,ry,rot,n=36){const p=[];for(let k=0;k<n;k++){const a=k/n*6.2832;
  let x=Math.cos(a)*rx,y=Math.sin(a)*ry*(1-.25*Math.cos(a)*Math.sign(rot));
  const c=Math.cos(rot),s=Math.sin(rot);p.push([cx+x*c-y*s,cy+x*s+y*c]);}return p;}
const HOLES=[almond(.31,.395,.12,.05,.1),almond(.69,.395,.12,.05,-.1),
  almond(.5,.745,.15,.03,0),[[.5,.5],[.515,.6],[.485,.6]]];

function layout(){
  dpr=Math.min(devicePixelRatio||1,2);
  w=stage.clientWidth;h=stage.clientHeight;
  cv.width=w*dpr;cv.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  mobile=w<760;
  if(mobile){
    const top=200,bot=150,avail=Math.max(200,h-top-bot);
    W=Math.min(w*.52,avail/1.22*.92,260);
    home={x:w/2,y:top+avail/2};
  }else{
    W=Math.min(320,w*.25,h*.52/1.22);
    home={x:w*.63,y:h*.5};
  }
  H=W*1.22;
  build();
  const pw=W*.62;
  pouch.style.width=pw+'px';
  const px=home.x-W*.72-pw/2,py=home.y+H*.36-pw*1.43/2;
  pouch.style.transform=`translate(${px}px,${py}px) rotate(-11deg)`;
  const r=Math.max(34,Math.min(62,W*.21));
  const base=[[-.98,-.36],[.92,-.52],[1.0,.3],[.42,.82]];
  bubbles.forEach((b,i)=>{
    b.r=r;
    let bx=home.x+base[i][0]*W,by=home.y+base[i][1]*H;
    bx=Math.max(r+10,Math.min(w-r-10,bx));
    by=Math.max(mobile?185+r:r+20,Math.min(h-(mobile?180:40)-r,by));
    b.bx=bx;b.by=by;
    b.el.style.width=b.el.style.height=(2*r)+'px';
  });
}

function build(){
  pts=[];cons=[];cells=[];
  const idx=(i,j)=>j*(COLS+1)+i;
  for(let j=0;j<=ROWS;j++)for(let i=0;i<=COLS;i++){
    const u=i/COLS,v=j/ROWS,ox=(u-.5)*W,oy=(v-.5)*H,x=home.x+ox,y=home.y+oy+(reduce?0:70);
    pts.push({x,y,px:x,py:y,ox,oy,u,v,pin:false,m:inside(u,v)||outer(u,v)});
  }
  const add=(a,b,st)=>{const A=pts[a],B=pts[b];cons.push({a:A,b:B,r:Math.hypot(A.ox-B.ox,A.oy-B.oy),s:st});};
  for(let j=0;j<=ROWS;j++)for(let i=0;i<=COLS;i++){
    const k=idx(i,j);
    if(i<COLS)add(k,k+1,1);
    if(j<ROWS)add(k,idx(i,j+1),1);
    if(i<COLS&&j<ROWS){add(k,idx(i+1,j+1),.45);add(idx(i+1,j),idx(i,j+1),.45);
      const uc=(i+.5)/COLS,vc=(j+.5)/ROWS;
      cells.push({p:[pts[k],pts[k+1],pts[idx(i+1,j+1)],pts[idx(i,j+1)]],rest:(W/COLS)*(H/ROWS),u:uc,v:vc,vis:outer(uc,vc)||outer(i/COLS,j/ROWS)||outer((i+1)/COLS,(j+1)/ROWS)||outer((i+1)/COLS,j/ROWS)||outer(i/COLS,(j+1)/ROWS)});}
    if(i+2<=COLS)add(k,k+2,.3);
    if(j+2<=ROWS)add(k,idx(i,j+2),.3);
  }
  cells=cells.filter(c=>c.vis);
  maskPts=pts.filter(p=>p.m);
}
function map(u,v){
  const fx=Math.min(COLS-1e-6,Math.max(0,u*COLS)),fy=Math.min(ROWS-1e-6,Math.max(0,v*ROWS));
  const i=fx|0,j=fy|0,a=fx-i,b=fy-j,k=j*(COLS+1)+i;
  const p00=pts[k],p10=pts[k+1],p01=pts[k+COLS+1],p11=pts[k+COLS+2];
  return [p00.x*(1-a)*(1-b)+p10.x*a*(1-b)+p01.x*(1-a)*b+p11.x*a*b,
          p00.y*(1-a)*(1-b)+p10.y*a*(1-b)+p01.y*(1-a)*b+p11.y*a*b];
}
function shapePath(){
  const P=new Path2D();
  const ring=r=>{r.forEach((q,n)=>{const m=map(q[0],q[1]);n?P.lineTo(m[0],m[1]):P.moveTo(m[0],m[1]);});P.closePath();};
  ring(OUT);HOLES.forEach(ring);return P;
}

function shapeMatch(alpha,maxTilt){
  let cx=0,cy=0;for(const p of pts){cx+=p.x;cy+=p.y;}cx/=pts.length;cy/=pts.length;
  let sn=0,cs=0;for(const p of pts){const qx=p.x-cx,qy=p.y-cy;sn+=p.ox*qy-p.oy*qx;cs+=p.ox*qx+p.oy*qy;}
  let a=Math.atan2(sn,cs);a=Math.max(-maxTilt,Math.min(maxTilt,a));
  const c=Math.cos(a),si=Math.sin(a);
  for(const p of pts){if(p.pin)continue;
    const gx=cx+p.ox*c-p.oy*si,gy=cy+p.ox*si+p.oy*c;
    p.x+=(gx-p.x)*alpha;p.y+=(gy-p.y)*alpha;}
}
document.querySelectorAll('.modes button').forEach(b=>b.addEventListener('click',()=>{
  mode=b.dataset.mode;
  document.querySelectorAll('.modes button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));
}));

function makeBubbles(){
  ING.forEach((g,i)=>{
    const el=document.createElement('div');el.className='bubble';
    el.innerHTML=`<img src="${g.img}" alt="">`;bubWrap.appendChild(el);
    bubbles.push({el,phase:i*1.7,bx:0,by:0,r:40,x:0,y:0});
  });
}

function renderCard(i){
  const n=found.filter(Boolean).length;
  const pips=found.map((f,k)=>`<i style="${f?'background:'+ING[k].color:''}"></i>`).join('');
  if(complete){
    card.style.setProperty('--accent','#C9A27E');
    card.innerHTML=`<p class="count">4 of 4 actives</p><h2>Everything's in the sheet</h2><p class="body">Now it's fifteen minutes of calm. Your skin does the rest.</p><div class="pips">${pips}</div><div class="actions"><a class="btn" href="#use">How to use it</a><button type="button" id="again">Play again</button></div>`;
    document.getElementById('again').onclick=reset;return;
  }
  if(i==null){
    card.style.removeProperty('--accent');
    card.innerHTML=`<p class="count">${n} of 4 actives</p><h2>Meet what's inside</h2><p class="body">Drag the sheet through each bubble.</p><div class="pips">${pips}</div><div class="actions"><a class="btn" href="#actives">Skip to the ingredients</a></div>`;
    return;
  }
  const g=ING[i];card.style.setProperty('--accent',g.color);
  card.innerHTML=`<p class="count">${n} of 4 actives</p><h2>${g.name}<span>${g.zh}</span></h2><p class="body">${g.body}</p><div class="pips">${pips}</div>`;
}

function reset(){
  found=[false,false,false,false];complete=false;glow=0;
  bubbles.forEach(b=>b.el.classList.remove('found'));renderCard(null);
}

function nearest(x,y){
  let best=null,bd=1e9;for(const p of maskPts){const d=(p.x-x)**2+(p.y-y)**2;if(d<bd){bd=d;best=p;}}
  return {p:best,d:Math.sqrt(bd)};
}
function pos(e){const r=cv.getBoundingClientRect();const s=e.touches?e.touches[0]:e;return{x:s.clientX-r.left,y:s.clientY-r.top};}
function grab(x,y,touch){
  const n=nearest(x,y);if(!n.p||n.d>(touch?46:34))return false;
  const R=W*.16,infl=[];
  for(const p of pts){const d=Math.hypot(p.x-n.p.x,p.y-n.p.y);if(d<R)infl.push([p,Math.pow(1-d/R,2)]);}
  drag={p:n.p,x,y,infl};n.p.pin=true;engaged=true;cv.style.cursor='grabbing';return true;
}
function release(){if(drag){drag.p.pin=false;drag=null;}cv.style.cursor='';}

cv.addEventListener('mousedown',e=>{const q=pos(e);grab(q.x,q.y,false);});
addEventListener('mousemove',e=>{const q=pos(e);if(drag){drag.x=q.x;drag.y=q.y;}else{const n=nearest(q.x,q.y);cv.style.cursor=n.d<34?'grab':'';}});
addEventListener('mouseup',release);
cv.addEventListener('touchstart',e=>{const q=pos(e);if(grab(q.x,q.y,true))e.preventDefault();},{passive:false});
cv.addEventListener('touchmove',e=>{if(drag){e.preventDefault();const q=pos(e);drag.x=q.x;drag.y=q.y;}},{passive:false});
cv.addEventListener('touchend',release);cv.addEventListener('touchcancel',release);

function step(){
  t+=1/60;
  const hx=home.x+(reduce?0:Math.sin(t*.6)*7),hy=home.y+(reduce?0:Math.sin(t*.83)*9);
  const K=drag?.0012:(t<2?.01:.0035),D=.975;
  for(const p of pts){
    const vx=(p.x-p.px)*D,vy=(p.y-p.py)*D;p.px=p.x;p.py=p.y;
    let ax=(hx+p.ox-p.x)*K,ay=(hy+p.oy-p.y)*K;
    if(!reduce)ax+=Math.sin(t*1.4+p.oy*.025)*.035*(p.v+.2);
    p.x+=vx+ax;p.y+=vy+ay;
  }
  if(drag){
    const dx=drag.x-drag.p.x,dy=drag.y-drag.p.y;
    if(mode==='soft')for(const [p,wt] of drag.infl){if(p!==drag.p){p.x+=dx*wt*.35;p.y+=dy*wt*.35;}}
    drag.p.x=drag.x;drag.p.y=drag.y;
  }
  if(mode==='rigid'){
    for(let it=0;it<4;it++)shapeMatch(1,.45);
  }else{
    for(let it=0;it<8;it++){
      for(const c of cons){
        const a=c.a,b=c.b,dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1e-4;
        const diff=(d-c.r)/d*c.s;
        if(a.pin){b.x-=dx*diff;b.y-=dy*diff;}
        else if(b.pin){a.x+=dx*diff;a.y+=dy*diff;}
        else{a.x+=dx*diff*.5;a.y+=dy*diff*.5;b.x-=dx*diff*.5;b.y-=dy*diff*.5;}
      }
      shapeMatch(.09,.7);
    }
  }
  for(const p of pts){p.x=Math.max(4,Math.min(w-4,p.x));p.y=Math.max(4,Math.min(h-4,p.y));}

  // bubbles
  bubbles.forEach((b,i)=>{
    b.x=b.bx+(reduce?0:Math.sin(t*.5+b.phase)*10);b.y=b.by+(reduce?0:Math.cos(t*.42+b.phase)*12);
    b.el.style.transform=`translate(${b.x-b.r}px,${b.y-b.r}px)`;
    if(engaged&&!found[i]){
      const rr=(b.r*.72)**2;
      for(let k=0;k<maskPts.length;k+=2){const p=maskPts[k];if((p.x-b.x)**2+(p.y-b.y)**2<rr){hit(i,b);break;}}
    }
  });
  particles=particles.filter(q=>{q.life-=1/50;q.x+=q.vx;q.y+=q.vy;q.vx*=.96;q.vy*=.96;
    const c=centroid();q.vx+=(c.x-q.x)*.0025;q.vy+=(c.y-q.y)*.0025;return q.life>0;});
  if(complete)glow=Math.min(1,glow+.02);
}
let cen={x:0,y:0};
function centroid(){return cen;}
function hit(i,b){
  found[i]=true;b.el.classList.add('found');
  for(let k=0;k<(reduce?0:22);k++){const a=Math.random()*6.283,s=1+Math.random()*3;
    particles.push({x:b.x,y:b.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1+Math.random()*.6,c:ING[i].color,r:1.5+Math.random()*3});}
  if(found.every(Boolean)){complete=true;setTimeout(()=>renderCard(),900);}
  renderCard(i);
}

function draw(){
  ctx.clearRect(0,0,w,h);
  let sx=0,sy=0;for(const p of maskPts){sx+=p.x;sy+=p.y;}cen={x:sx/maskPts.length,y:sy/maskPts.length};
  // soft shadow
  const sh=ctx.createRadialGradient(cen.x+10,cen.y+H*.18,0,cen.x+10,cen.y+H*.18,W*.8);
  sh.addColorStop(0,'rgba(30,42,68,.16)');sh.addColorStop(1,'rgba(30,42,68,0)');
  ctx.fillStyle=sh;ctx.fillRect(0,0,w,h);
  if(glow>0){
    const g=ctx.createRadialGradient(cen.x,cen.y,W*.1,cen.x,cen.y,W*1.1);
    g.addColorStop(0,`rgba(255,244,228,${.55*glow})`);g.addColorStop(.5,`rgba(214,204,240,${.25*glow})`);g.addColorStop(1,'rgba(214,204,240,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  }
  const path=shapePath();
  ctx.fillStyle='#F7F8FB';ctx.fill(path,'evenodd');
  ctx.save();ctx.clip(path,'evenodd');ctx.lineJoin='round';ctx.lineWidth=1;
  for(const c of cells){
    const [a,b,d,e]=c.p;
    const area=((d.x-a.x)*(e.y-b.y)-(e.x-b.x)*(d.y-a.y))/2;
    const r=area/c.rest;
    let L=251-Math.max(0,Math.min(.7,1-Math.abs(r)))*55-c.v*8-c.u*3;
    if(r<0)L-=8;if(r>1.08)L+=3;
    const col=`rgb(${L-5|0},${L-3|0},${Math.min(255,L+3)|0})`;
    ctx.fillStyle=col;ctx.strokeStyle=col;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(d.x,d.y);ctx.lineTo(e.x,e.y);ctx.closePath();
    ctx.fill();ctx.stroke();
  }
  // wet sheen
  const sg=ctx.createLinearGradient(cen.x-W*.6,cen.y-H*.6,cen.x+W*.5,cen.y+H*.5);
  sg.addColorStop(0,'rgba(255,255,255,.55)');sg.addColorStop(.45,'rgba(255,255,255,0)');sg.addColorStop(1,'rgba(200,210,235,.18)');
  ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
  ctx.restore();
  ctx.strokeStyle='rgba(30,42,68,.14)';ctx.lineWidth=1;ctx.stroke(path);
  for(const q of particles){ctx.globalAlpha=Math.max(0,Math.min(1,q.life));ctx.fillStyle=q.c;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,6.283);ctx.fill();}
  ctx.globalAlpha=1;
}

function loop(){step();draw();requestAnimationFrame(loop);}
makeBubbles();layout();renderCard(null);
requestAnimationFrame(()=>pouch.classList.add('in'));
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(layout,120);});
loop();
})();
