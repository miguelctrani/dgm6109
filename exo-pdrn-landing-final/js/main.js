/*
  EXO-PDRN Centella Mask, interactive landing prototype, v4 "Touch to create, particle swirl".
  Visitors tap each ingredient bubble; it shatters into droplets that orbit the mask and snap in to build one piece
  (forehead, left cheek, right cheek, chin). When all four are in, the finished mask becomes draggable.
  What happens in this file, top to bottom:
    Ingredient list below the fold (built from js/content.js)
    Mask geometry: outline plus eye, nose and mouth holes, defined in uv space (0 to 1)
    layout(): sizes the mask, pouch and bubbles to the viewport, desktop and mobile
    build(): creates the cloth grid (COLS x ROWS points) and its constraints
    shapeMatch(): pulls the cloth back toward its rest shape, this is what stops folding
    zone(): which piece of the mask each active builds
    SWIRL, tapBubble(), swarmPos(): the particle swirl (burst, orbit, snap) that builds each piece
    COACH and updateCoach(): the hand that shows idle visitors which bubble to touch, then how to drag the finished mask
    GLOW and sprite(): droplet halos, the flash when a droplet lands, and the twinkle as it fades
    checkDone() and finale: ripple, shimmer sweep and one slow breath when the mask is complete
    Input: mouse and touch; touches only get captured when they land on the mask, so the page still scrolls
    step(): physics, bubble hit tests, particles
    renderCard(): the info card states (intro, each ingredient, complete)
    draw(): canvas 2D rendering (shadow, glow, shaded cells clipped to the mask outline)
  No dependencies, plain script. Works from file:// or any static host.
*/
(function(){
const ING=window.MASK_CONTENT.ingredients;
ING.forEach(g=>{const n=parseInt(g.color.slice(1),16);g.rgb=[n>>16,(n>>8)&255,n&255];});

// static list below the fold
const list=document.getElementById('activeList');
ING.forEach(g=>{
  const d=document.createElement('div');d.className='active';
  d.innerHTML=`<img src="${g.img}" alt="" width="96" height="96"><div><h4>${g.name}<span>${g.zh}</span></h4><p>${g.body}</p></div>`;
  list.appendChild(d);
});

const stage=document.getElementById('stage'),cv=document.getElementById('c'),ctx=cv.getContext('2d');
const coach=document.getElementById('coach'),coachLabel=document.getElementById('coachLabel'),hint=document.getElementById('hint'),pouch=document.getElementById('pouch'),card=document.getElementById('card'),bubWrap=document.getElementById('bubbles');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLS=24,ROWS=30;
const mode='soft';let reveal=[null,null,null,null],maskPts=[],w,h,dpr,W,H,home,mobile,pts,cons,cells,edges,bubbles=[],found=[false,false,false,false],engaged=false,t=0,drag=null,particles=[],swarm=[],sparks=[],finale=null,complete=false,glow=0;

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

// Which piece of the mask each active builds: 0 forehead, 1 left cheek, 2 right cheek, 3 chin.
// Index matches js/content.js order. Wavy seams so the pieces read as soft, not cut.
function zone(u,v){
  if(v<.33+.025*Math.sin(u*14))return 0;
  if(v>.67+.02*Math.sin(u*12+1))return 3;
  return u<.5+.02*Math.sin(v*16)?1:2;
}
const s0=u=>.33+.025*Math.sin(u*14),s3=u=>.67+.02*Math.sin(u*12+1),sm=v=>.5+.02*Math.sin(v*16);
const ZONES=(()=>{const N=40,O=.014,Z=[[],[],[],[]];
  // forehead: above seam s0
  Z[0].push([-.05,-.05],[1.05,-.05]);for(let k=N;k>=0;k--){const u=-.05+1.1*k/N;Z[0].push([u,s0(u)+O]);}
  // chin: below seam s3
  for(let k=0;k<=N;k++){const u=-.05+1.1*k/N;Z[3].push([u,s3(u)-O]);}Z[3].push([1.05,1.05],[-.05,1.05]);
  // cheeks: between the seams, split by sm
  for(const side of [1,2]){const P=Z[side],L=side===1;
    const um0=sm(.33),um1=sm(.67);
    for(let k=0;k<=N;k++){const f=k/N,u=L?-.05+(um0+O+.05)*f:um0-O+(1.05-um0+O)*f;P.push([u,s0(u)-O]);}
    if(L){for(let k=0;k<=N;k++){const v=.3+.4*k/N;P.push([sm(v)+O,v]);}
      for(let k=N;k>=0;k--){const f=k/N,u=-.05+(um1+O+.05)*f;P.push([u,s3(u)+O]);}}
    else{for(let k=N;k>=0;k--){const f=k/N,u=um1-O+(1.05-um1+O)*f;P.push([u,s3(u)+O]);}
      for(let k=N;k>=0;k--){const v=.3+.4*k/N;P.push([sm(v)-O,v]);}}
  }
  return Z;})();
const layer=document.createElement('canvas'),lctx=layer.getContext('2d');
const ZONE_CENTER=[[.5,.2],[.27,.53],[.73,.53],[.5,.84]];

function layout(){
  dpr=Math.min(devicePixelRatio||1,2);
  w=stage.clientWidth;h=stage.clientHeight;
  cv.width=w*dpr;cv.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  mobile=w<760;
  if(mobile){
    const top=140,bot=190,avail=Math.max(200,h-top-bot);
    W=Math.min(w*.52,avail/1.22*.92,260);
    home={x:w/2,y:top+avail/2};
  }else{
    W=Math.min(320,w*.25,h*.52/1.22);
    home={x:w*.63,y:h*.5};
  }
  H=W*1.22;
  layer.width=cv.width;layer.height=cv.height;lctx.setTransform(dpr,0,0,dpr,0,0);
  build();
  const pw=W*(mobile?.5:.62);
  pouch.style.width=pw+'px';
  const px=home.x+W*(mobile?.78:.86)-pw/2,py=home.y+H*(mobile?.5:.4)-pw*1.43/2;
  pouch.style.transform=`translate(${px}px,${py}px) rotate(9deg)`;
  hint.style.left=home.x+'px';hint.style.top=(home.y+H*.07)+'px';
  const r=Math.max(34,Math.min(62,W*.21));
  const base=[[-.92,-.5],[-1.02,.14],[.98,-.24],[-.5,.84]];
  bubbles.forEach((b,i)=>{
    b.r=r;
    let bx=home.x+base[i][0]*W,by=home.y+base[i][1]*H;
    bx=Math.max(r+10,Math.min(w-r-10,bx));
    by=Math.max(mobile?135+r:r+20,Math.min(h-(mobile?200:40)-r,by));
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
      cells.push({p:[pts[k],pts[k+1],pts[idx(i+1,j+1)],pts[idx(i,j+1)]],rest:(W/COLS)*(H/ROWS),u:uc,v:vc,z:zone(uc,vc),vis:outer(uc,vc)||outer(i/COLS,j/ROWS)||outer((i+1)/COLS,(j+1)/ROWS)||outer((i+1)/COLS,j/ROWS)||outer(i/COLS,(j+1)/ROWS)});}
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

function makeBubbles(){
  ING.forEach((g,i)=>{
    const el=document.createElement('button');el.type='button';el.className='bubble';
    el.setAttribute('aria-label','Add '+g.name+' to the mask');
    el.innerHTML=`<img src="${g.img}" alt="">`;bubWrap.appendChild(el);
    const b={el,phase:i*1.7,bx:0,by:0,r:40,x:0,y:0,fly:null};
    el.addEventListener('click',()=>tapBubble(i));
    bubbles.push(b);
  });
}

function renderCard(i){
  const n=found.filter(Boolean).length;
  const pips=found.map((f,k)=>`<i style="${f?'background:'+ING[k].color:''}"></i>`).join('');
  if(complete){
    card.style.setProperty('--accent','#C9A27E');
    card.innerHTML=`<p class="count">4 of 4 actives</p><h2>Your mask is complete</h2><p class="body">Four actives in one sheet. Give it a drag and feel how soft it is.</p><div class="pips">${pips}</div><div class="actions"><a class="btn" href="#use">How to use it</a><button type="button" id="again">Start over</button></div>`;
    document.getElementById('again').onclick=reset;return;
  }
  if(i==null){
    card.style.removeProperty('--accent');
    card.innerHTML=`<p class="count">${n} of 4 actives</p><h2>Create your mask</h2><p class="body">Touch each bubble to add its active to the sheet.</p><div class="pips">${pips}</div><div class="actions"><a class="btn" href="#actives">Skip to the ingredients</a></div>`;
    return;
  }
  const g=ING[i];card.style.setProperty('--accent',g.color);
  card.innerHTML=`<p class="count">${n} of 4 actives</p><h2>${g.name}<span>${g.zh}</span></h2><p class="body">${g.body}</p><div class="pips">${pips}</div>`;
}

function reset(){
  release();found=[false,false,false,false];reveal=[null,null,null,null];complete=false;glow=0;swarm=[];sparks=[];finale=null;
  bubbles.forEach(b=>{b.el.classList.remove('used');b.el.style.opacity='';});
  hint.classList.remove('gone');lastAction=t;dragged=false;hideCoach();renderCard(null);
}

function nearest(x,y){
  let best=null,bd=1e9;for(const p of maskPts){const d=(p.x-x)**2+(p.y-y)**2;if(d<bd){bd=d;best=p;}}
  return {p:best,d:Math.sqrt(bd)};
}
function pos(e){const r=cv.getBoundingClientRect();const s=e.touches?e.touches[0]:e;return{x:s.clientX-r.left,y:s.clientY-r.top};}
function grab(x,y,touch){
  if(!complete)return false;
  const n=nearest(x,y);if(!n.p||n.d>(touch?46:34))return false;
  const R=W*.16,infl=[];
  for(const p of pts){const d=Math.hypot(p.x-n.p.x,p.y-n.p.y);if(d<R)infl.push([p,Math.pow(1-d/R,2)]);}
  drag={p:n.p,x,y,infl};n.p.pin=true;dragged=true;engaged=true;cv.style.cursor='grabbing';return true;
}
function release(){if(drag){drag.p.pin=false;drag=null;}cv.style.cursor='';}

cv.addEventListener('mousedown',e=>{const q=pos(e);grab(q.x,q.y,false);});
addEventListener('mousemove',e=>{const q=pos(e);if(drag){drag.x=q.x;drag.y=q.y;}else{const n=nearest(q.x,q.y);cv.style.cursor=complete&&n.d<34?'grab':'';}});
addEventListener('mouseup',release);
cv.addEventListener('touchstart',e=>{const q=pos(e);if(grab(q.x,q.y,true))e.preventDefault();},{passive:false});
cv.addEventListener('touchmove',e=>{if(drag){e.preventDefault();const q=pos(e);drag.x=q.x;drag.y=q.y;}},{passive:false});
cv.addEventListener('touchend',release);cv.addEventListener('touchcancel',release);

const T0=performance.now();
function step(){
  t=(performance.now()-T0)/1000;
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
  // finale: a ripple rolls out from the centre of the sheet
  if(finale&&!reduce){const s=t-finale;if(s<1.1){const front=s*W*1.1;
    for(const p of pts){const d=Math.hypot(p.ox,p.oy)||1,band=d-front;
      if(Math.abs(band)<W*.12){const f=Math.cos(band/(W*.12)*1.5708)*2.2*(1-s/1.1);p.x+=p.ox/d*f;p.y+=p.oy/d*f;}}}}
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
    if(found[i])return;
    b.x=b.bx+(reduce?0:Math.sin(t*.5+b.phase)*10);b.y=b.by+(reduce?0:Math.cos(t*.42+b.phase)*12);
    b.el.style.transform=`translate(${b.x-b.r}px,${b.y-b.r}px)`;
  });
  updateSwarm();
  updateCoach();
  if(complete)glow=Math.min(1,glow+.02);
}
let cen={x:0,y:0};
function centroid(){return cen;}
// Particle swirl: each tap shatters the bubble into droplets that orbit the mask
// and then snap into place to form that active's piece.
const SWIRL={count:mobile=>mobile?150:230,burst:.35,orbit:1.15,snap:.6,stagger:.45};
function sampleZone(z){for(let n=0;n<400;n++){const u=Math.random(),v=Math.random();if(inside(u,v)&&zone(u,v)===z)return[u,v];}return ZONE_CENTER[z];}
const ease=k=>1-Math.pow(1-k,3),easeBack=k=>{const c=1.5;return 1+(c+1)*Math.pow(k-1,3)+c*Math.pow(k-1,2);};
function tapBubble(i){
  if(found[i])return;
  const b=bubbles[i];found[i]=true;b.el.classList.add('used');hint.classList.add('gone');
  renderCard(i);
  if(reduce){reveal[i]=t;checkDone();return;}
  const n=SWIRL.count(mobile),col=ING[i].color,spin=Math.random()<.5?1:-1;
  for(let k=0;k<n;k++){
    const a=Math.random()*6.283,dist=25+Math.random()*80,[tu,tv]=sampleZone(i);
    const roll=Math.random();
    swarm.push({seed:Math.random()*6.283,flash:0,landed:false,z:i,t0:t+k*.0012,sx:b.x,sy:b.y,dx:Math.cos(a)*dist,dy:Math.sin(a)*dist,tu,tv,
      spin:spin*(Math.random()<.85?1:-1),turns:1.1+Math.random()*.9,orbitR:W*(.55+Math.random()*.35),
      delay:Math.random()*SWIRL.stagger,r:1+Math.random()*2.4,
      c:roll<.62?col:roll<.85?'#FFFFFF':'#F4E9D8',x:b.x,y:b.y,px:b.x,py:b.y,a:1});
  }
  // the piece fades in as the droplets arrive
  reveal[i]=t+SWIRL.burst+SWIRL.orbit+SWIRL.snap*.6;
  setTimeout(checkDone,(SWIRL.burst+SWIRL.orbit+SWIRL.snap+SWIRL.stagger+.3)*1000);
}
// Coach: a tapping hand that points at the next untouched bubble.
// Appears after a few idle seconds, stays for COACH.show seconds, then hides.
// Comes back while the visitor stays idle, and stops once the mask is complete.
const COACH={firstDelay:2.5,show:3,repeatEvery:7};
const touchUI=matchMedia('(pointer: coarse)').matches;
const COACH_TEXT={tap:touchUI?'Tap here':'Click here',drag:'Drag the mask'};
coachLabel.textContent=COACH_TEXT.tap;
let lastAction=0,coachOn=false,coachTarget=-1,dragged=false;
function nudge(){lastAction=t;hideCoach();}
function hideCoach(){coachOn=false;coach.classList.remove('show');}
function updateCoach(){
  // after completion the coach switches to a drag gesture on the mask, until the visitor drags it once
  if(complete){
    if(dragged||drag){if(coachOn)hideCoach();return;}
    const since=t-Math.max(finale+2.2,lastAction),cyc=Math.max(0,since)%(COACH.show+COACH.repeatEvery);
    const should=since>=0&&cyc<COACH.show;
    if(should&&!coachOn){coachOn=true;coachLabel.textContent=COACH_TEXT.drag;coach.classList.add('drag','show');}
    if(!should&&coachOn)hideCoach();
    if(coachOn){const m=map(.72,.6);coach.classList.toggle('flip',m[0]>w-130);coach.style.transform=`translate(${m[0]}px,${m[1]}px)`;}
    return;
  }
  const idle=t-lastAction,first=found.every(f=>!f);
  const wait=first&&lastAction===0?COACH.firstDelay:COACH.firstDelay+1;
  const cyc=Math.max(0,idle-wait)%(COACH.show+COACH.repeatEvery);
  const should=idle>=wait&&cyc<COACH.show;
  if(should&&!coachOn){coachTarget=found.findIndex(f=>!f);if(coachTarget<0)return;coachOn=true;coachLabel.textContent=COACH_TEXT.tap;coach.classList.remove('drag');coach.classList.add('show');}
  if(!should&&coachOn)hideCoach();
  if(coachOn){const b=bubbles[coachTarget];const x=b.x+b.r*.15,y=b.y+b.r*.1;
    coach.classList.toggle('flip',x>w-110);coach.style.transform=`translate(${x}px,${y}px)`;}
}
addEventListener('pointerdown',nudge,{passive:true});addEventListener('keydown',nudge);

function checkDone(){
  if(complete||!reveal.every(r=>r!==null&&t>=r))return;
  complete=true;finale=t;
  if(!reduce){const n=90;for(let k=0;k<n;k++){const q=OUT[(k*7)%OUT.length],m=map(q[0],q[1]),dx=m[0]-home.x,dy=m[1]-home.y,d=Math.hypot(dx,dy)||1,s=2+Math.random()*3.5;
    sparks.push({x:m[0],y:m[1],vx:dx/d*s,vy:dy/d*s,life:1,r:1+Math.random()*2.2,c:ING[k%4].color});}}
  setTimeout(()=>renderCard(),900);
}
function swarmPos(q,s){
  const B=SWIRL.burst,O=SWIRL.orbit,S=SWIRL.snap;
  const bx=q.sx+q.dx,by=q.sy+q.dy;
  if(s<B){const e=ease(s/B);return[q.sx+q.dx*e,q.sy+q.dy*e];}
  const a0=Math.atan2(by-home.y,bx-home.x),r0=Math.hypot(bx-home.x,by-home.y);
  const orbitAt=e=>{const a=a0+q.spin*q.turns*6.283*e,r=r0+(q.orbitR-r0)*e;return[home.x+Math.cos(a)*r,home.y+Math.sin(a)*r*1.1];};
  if(s<B+O){const k=(s-B)/O;return orbitAt(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2);}
  const end=orbitAt(1),tg=map(q.tu,q.tv);
  const k=Math.min(1,Math.max(0,(s-B-O-q.delay*.6)/S)),e=easeBack(k);
  // keep circling a little while waiting to snap
  if(k<=0){const a=Math.atan2(end[1]-home.y,end[0]-home.x)+q.spin*(s-B-O)*1.4,r=Math.hypot(end[0]-home.x,end[1]-home.y);return[home.x+Math.cos(a)*r,home.y+Math.sin(a)*r];}
  const wa=Math.atan2(end[1]-home.y,end[0]-home.x)+q.spin*q.delay*.6*1.4,wr=Math.hypot(end[0]-home.x,end[1]-home.y);
  const sx=home.x+Math.cos(wa)*wr,sy=home.y+Math.sin(wa)*wr;
  return[sx+(tg[0]-sx)*e,sy+(tg[1]-sy)*e];
}
// Glow: each droplet carries a soft halo in its colour while it flies,
// flashes brighter the moment it snaps into the sheet, then twinkles as it fades.
const GLOW={halo:7,flash:11,flashFade:.35,linger:.9};
const darkMQ=matchMedia('(prefers-color-scheme: dark)');
const sprites={};
function sprite(c){if(sprites[c])return sprites[c];const s=document.createElement('canvas');s.width=s.height=64;const g=s.getContext('2d');
  const n=parseInt(c.slice(1),16),r=n>>16,gg=(n>>8)&255,b=n&255,gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,`rgba(${r},${gg},${b},.95)`);gr.addColorStop(.3,`rgba(${r},${gg},${b},.45)`);gr.addColorStop(1,`rgba(${r},${gg},${b},0)`);
  g.fillStyle=gr;g.fillRect(0,0,64,64);return sprites[c]=s;}
function isDark(){const th=document.documentElement.dataset.theme;return th==='dark'||(th!=='light'&&darkMQ.matches);}
function updateSwarm(){
  const total=SWIRL.burst+SWIRL.orbit+SWIRL.snap;
  swarm=swarm.filter(q=>{const s=t-q.t0;if(s<0)return true;
    q.px=q.x;q.py=q.y;const p=swarmPos(q,s);q.x=p[0];q.y=p[1];
    const land=s-(SWIRL.burst+SWIRL.orbit+q.delay*.6+SWIRL.snap);
    q.flash=land>0?Math.exp(-land/GLOW.flashFade):0;
    q.a=land>0?Math.max(0,1-land/GLOW.linger):1;q.landed=land>0;return q.a>0;});
  sparks=sparks.filter(q=>{q.x+=q.vx;q.y+=q.vy;q.vx*=.95;q.vy*=.95;q.life-=1/55;return q.life>0;});
}

function draw(){
  ctx.clearRect(0,0,w,h);
  let sx=0,sy=0;for(const p of maskPts){sx+=p.x;sy+=p.y;}cen={x:sx/maskPts.length,y:sy/maskPts.length};
  // soft shadow
  const sh=ctx.createRadialGradient(cen.x+10,cen.y+H*.18,0,cen.x+10,cen.y+H*.18,W*.8);
  const built=reveal.filter(r=>r!==null).length/4;
  sh.addColorStop(0,`rgba(30,42,68,${.16*built})`);sh.addColorStop(1,'rgba(30,42,68,0)');
  ctx.fillStyle=sh;ctx.fillRect(0,0,w,h);
  if(glow>0){
    const g=ctx.createRadialGradient(cen.x,cen.y,W*.1,cen.x,cen.y,W*1.1);
    g.addColorStop(0,`rgba(255,244,228,${.55*glow})`);g.addColorStop(.5,`rgba(214,204,240,${.25*glow})`);g.addColorStop(1,'rgba(214,204,240,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  }
  const path=shapePath();
  // 1. shade the whole sheet into an offscreen layer
  lctx.clearRect(0,0,w,h);lctx.save();lctx.clip(path,'evenodd');lctx.lineJoin='round';lctx.lineWidth=1;
  for(const c of cells){
    const [a,b,d,e]=c.p;
    const area=((d.x-a.x)*(e.y-b.y)-(e.x-b.x)*(d.y-a.y))/2;
    const r=area/c.rest;
    let L=251-Math.max(0,Math.min(.7,1-Math.abs(r)))*55-c.v*8-c.u*3;
    if(r<0)L-=8;if(r>1.08)L+=3;
    const col=`rgb(${L-5|0},${L-3|0},${Math.min(255,L+3)|0})`;
    lctx.fillStyle=col;lctx.strokeStyle=col;
    lctx.beginPath();lctx.moveTo(a.x,a.y);lctx.lineTo(b.x,b.y);lctx.lineTo(d.x,d.y);lctx.lineTo(e.x,e.y);lctx.closePath();
    lctx.fill();lctx.stroke();
  }
  // wet sheen once the mask is complete
  if(glow>0){const sg=lctx.createLinearGradient(cen.x-W*.6,cen.y-H*.6,cen.x+W*.5,cen.y+H*.5);
    sg.addColorStop(0,'rgba(255,255,255,.55)');sg.addColorStop(.45,'rgba(255,255,255,0)');sg.addColorStop(1,'rgba(200,210,235,.18)');
    lctx.globalAlpha=glow;lctx.fillStyle=sg;lctx.fillRect(0,0,w,h);lctx.globalAlpha=1;}
  lctx.restore();
  // finale shimmer: a bright band sweeps across the finished sheet
  if(finale&&!reduce){const s=t-finale-.25;if(s>0&&s<1.3){const k=s/1.3,x=cen.x-W*1.1+k*W*2.2;
    const g=lctx.createLinearGradient(x-W*.3,cen.y-H*.5,x+W*.3,cen.y+H*.5);
    g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,252,245,.85)');g.addColorStop(1,'rgba(255,255,255,0)');
    lctx.save();lctx.clip(path,'evenodd');lctx.fillStyle=g;lctx.fillRect(0,0,w,h);lctx.restore();}}
  // 2. reveal each built piece, tinted with its active's color as it lands
  ctx.save();
  if(finale&&!reduce){const s=t-finale-1.1;if(s>0&&s<1.8){const sc=1+.035*Math.sin(Math.PI*s/1.8);
    ctx.translate(cen.x,cen.y);ctx.scale(sc,sc);ctx.translate(-cen.x,-cen.y);}}
  if(complete&&reveal.every(r=>t-r>1.6)){ctx.drawImage(layer,0,0,w,h);}
  else for(let z=0;z<4;z++){
    const rv=reveal[z];if(rv===null||t<rv)continue;
    const age=t-rv,al=reduce?1:Math.min(1,age/.45);
    const tint=reduce?0:Math.max(0,Math.min(1,1-(age-.25)/1.3))*.55;
    const zp=new Path2D();ZONES[z].forEach((q,n)=>{const m=map(Math.min(1,Math.max(0,q[0])),Math.min(1,Math.max(0,q[1])));n?zp.lineTo(m[0],m[1]):zp.moveTo(m[0],m[1]);});zp.closePath();
    ctx.save();ctx.clip(zp);ctx.globalAlpha=al;ctx.drawImage(layer,0,0,w,h);
    if(tint>0){ctx.clip(path,'evenodd');ctx.globalAlpha=al*tint;ctx.fillStyle=ING[z].color;ctx.fillRect(0,0,w,h);
      const zc=map(ZONE_CENTER[z][0],ZONE_CENTER[z][1]),bl=ctx.createRadialGradient(zc[0],zc[1],0,zc[0],zc[1],W*.45);
      bl.addColorStop(0,'rgba(255,255,255,.9)');bl.addColorStop(1,'rgba(255,255,255,0)');ctx.globalAlpha=al*tint*.8;ctx.fillStyle=bl;ctx.fillRect(0,0,w,h);}
    ctx.restore();
  }
  ctx.restore();
  // until the mask is complete, a dashed outline shows the empty template
  if(!complete){ctx.setLineDash([4,6]);ctx.strokeStyle='rgba(120,128,150,.55)';ctx.lineWidth=1.2;ctx.stroke(path);ctx.setLineDash([]);}
  else{ctx.strokeStyle='rgba(30,42,68,.14)';ctx.lineWidth=1;ctx.stroke(path);}
  // droplets: glowing halo, short motion trail, bright core
  ctx.lineCap='round';const dark=isDark();
  ctx.globalCompositeOperation=dark?'lighter':'source-over';
  for(const q of swarm){if(t<q.t0)continue;
    const tw=q.landed?.7+.3*Math.sin(t*18+q.seed):1;
    const sz=q.r*(GLOW.halo+GLOW.flash*q.flash);
    ctx.globalAlpha=q.a*(.5+.5*q.flash)*tw;
    ctx.drawImage(sprite(q.c==='#FFFFFF'||q.c==='#F4E9D8'?ING[q.z].color:q.c),q.x-sz,q.y-sz,sz*2,sz*2);}
  ctx.globalCompositeOperation='source-over';
  for(const q of swarm){if(t<q.t0)continue;
    const tw=q.landed?.7+.3*Math.sin(t*18+q.seed):1;
    ctx.globalAlpha=q.a*.9*tw;ctx.strokeStyle=q.c;ctx.lineWidth=q.r*1.6;
    let tx=q.px-q.x,ty=q.py-q.y;const tl=Math.hypot(tx,ty);if(tl>10){tx*=10/tl;ty*=10/tl;}
    if(q.landed){tx=0;ty=0;}
    ctx.beginPath();ctx.moveTo(q.x+tx,q.y+ty);ctx.lineTo(q.x+.01,q.y);ctx.stroke();
    ctx.globalAlpha=q.a*tw*(.6+.4*q.flash);ctx.fillStyle='#FFFFFF';ctx.beginPath();ctx.arc(q.x,q.y,q.r*(.45+.5*q.flash),0,6.283);ctx.fill();}
  for(const q of sparks){const a=Math.max(0,q.life),sz=q.r*8;ctx.globalAlpha=a*.6;ctx.drawImage(sprite(q.c),q.x-sz,q.y-sz,sz*2,sz*2);
    ctx.globalAlpha=a;ctx.fillStyle='#FFFFFF';ctx.beginPath();ctx.arc(q.x,q.y,q.r*.7,0,6.283);ctx.fill();}
  ctx.globalAlpha=1;
}

function loop(){step();draw();requestAnimationFrame(loop);}
makeBubbles();layout();renderCard(null);
requestAnimationFrame(()=>pouch.classList.add('in'));
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(layout,120);});
loop();
})();
