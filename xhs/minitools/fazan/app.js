const $=id=>document.getElementById(id);
const state={rod:0,head:0,gem:0,tassel:0,rodColor:"#c8a24f",headColor:"#f3e5c6",gemColor:"#a83a39",tasselColor:"#a83a39"};
const groups=[
  {key:"rod",title:"簪杆",options:["素金直簪","弯头银簪","双股玉簪"],color:"rodColor",colorTitle:"簪杆色"},
  {key:"head",title:"簪首",options:["玉燕钗","颤叶牡丹","金镶玉步摇","蝶戏花步摇"],color:"headColor",colorTitle:"簪首色"},
  {key:"gem",title:"点翠",options:["无点翠","点翠蓝","玛瑙红","松石绿"],color:"gemColor",colorTitle:"点翠色"},
  {key:"tassel",title:"流苏",options:["长穗","双短穗","三串步摇","珍珠链"],color:"tasselColor",colorTitle:"流苏色"}
];
let step=0;

function rgb2arr(c){
  if(c[0]==="#"){const n=parseInt(c.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];}
  const m=c.match(/(\d+)\D+(\d+)\D+(\d+)/);return m?[+m[1],+m[2],+m[3]]:[0,0,0];
}
function shade(c,amt){
  const [r,g,b]=rgb2arr(c),cl=v=>Math.max(0,Math.min(255,v));
  return `rgb(${cl(r+amt)},${cl(g+amt)},${cl(b+amt)})`;
}
function mix(c1,c2,t){
  const a=rgb2arr(c1),b=rgb2arr(c2);
  return `rgb(${(a[0]*(1-t)+b[0]*t)|0},${(a[1]*(1-t)+b[1]*t)|0},${(a[2]*(1-t)+b[2]*t)|0})`;
}
function buildControls(){
  const area=$("stepArea");area.innerHTML="";
  if(step===3){
    area.innerHTML=`<div class="summary">你的簪子已完成<br><span>轻点“导出图片”，保存竖版作品</span></div>`;
  }else{
    const group=groups[step];
    const page=document.createElement("div");page.className="control-page";
    page.innerHTML=`<div class="section-title">${group.title}</div><div class="cards">${group.options.map((name,index)=>`<button class="card${state[group.key]===index?" active":""}" data-key="${group.key}" data-index="${index}"><span class="card-icon">${name.slice(0,2)}</span><span>${name}</span></button>`).join("")}</div><div class="color-row"><label>${group.colorTitle}</label><input type="color" id="colorInput" value="${state[group.color]}"></div>`;
    area.appendChild(page);
    page.querySelector("#colorInput").oninput=e=>{state[group.color]=e.target.value;render()};
  }
}
$("stepArea").addEventListener("click",e=>{
  const card=e.target.closest(".card");if(!card)return;
  state[card.dataset.key]=+card.dataset.index;buildControls();render();
});

/* ============ 水彩风格基础图元 ============ */
const P=(d,f,extra="")=>`<path d="${d}" fill="${f}" ${extra}/>`;
// 二次贝塞尔转为三次，便于把多段曲线连成一条闭合路径
function seg(x1,y1,x2,y2,cx,cy){
  return `C${x1+(cx-x1)*2/3} ${y1+(cy-y1)*2/3} ${x2+(cx-x2)*2/3} ${y2+(cy-y2)*2/3} ${x2} ${y2}`;
}
// 由折线点集生成平滑闭合形状
function blob(pts,close=1){
  let d=`M${pts[0][0]} ${pts[0][1]}`;
  for(let i=0;i<pts.length-1;i++){
    const [x1,y1]=pts[i],[x2,y2]=pts[i+1];
    const [px,py]=pts[i-1]||pts[0],[nx,ny]=pts[i+2]||pts[pts.length-1];
    const tx=(nx-px)*.2,ty=(ny-py)*.2;
    d+=`C${x1+tx} ${y1+ty} ${x2-tx} ${y2-ty} ${x2} ${y2}`;
  }
  if(close){const [ex,ey]=pts[0],[x1,y1]=pts[pts.length-1],[px,py]=pts[pts.length-2];
    const tx=(pts[1][0]-px)*.2,ty=(pts[1][1]-py)*.2;
    d+=`C${x1+tx} ${y1+ty} ${ex-tx} ${ey-ty} ${ex} ${ey}Z`;}
  return d;
}
// 水彩斑块：不用描边，靠叠加浓淡表现
function wash(d,f,o=".95"){return P(d,f,`opacity="${o}"`)}
// 细枝 / 茎
function stem(x1,y1,x2,y2,c,w=1.5,bend=10){
  return P(`M${x1} ${y1}${seg(x1,y1,x2,y2,(x1+x2)/2+bend,(y1+y2)/2)}`,"none",`stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none"`);
}
// 叶片：两侧鼓起的柳叶形，叶脉为同色更淡的一笔
function leaf(x,y,len,rot,fill,vein){
  const r=rot*Math.PI/180,ux=Math.cos(r),uy=Math.sin(r),px=-uy,py=ux;
  const bx=x+ux*len*.42,by=y+uy*len*.42,w=len*.22;
  const d=blob([[x,y],[bx+px*w,by+py*w],[x+ux*len,y+uy*len],[bx-px*w,by-py*w]]);
  return wash(d,fill)+P(`M${x} ${y}${seg(x,y,x+ux*len,y+uy*len,bx,by)}`,"none",`stroke="${vein||fill}" stroke-width=".55" opacity=".45" fill="none"`);
}
// 三条叶脉的叶片（略细，作对比层次）
function leafFine(x,y,len,rot,fill,vein){return leaf(x,y,len,rot,fill,vein);}
// 花瓣：自花心放出的圆瓣，带一点外翻的尖
function petalShape(cx,cy,len,wid,rot,fill){
  const r=rot*Math.PI/180,ux=Math.cos(r),uy=Math.sin(r),px=-uy,py=ux;
  const tipx=cx+ux*len,tipy=cy+uy*len;
  const bx=cx+ux*len*.5,by=cy+uy*len*.5;
  let d=`M${cx} ${cy}${seg(cx,cy,tipx,tipy,bx+px*wid*1.25,by+py*wid*1.25)}`;
  d+=seg(tipx,tipy,cx,cy,bx-px*wid*1.25,by-py*wid*1.25);
  return P(d+"Z",fill);
}
// 一朵五瓣花：外层花瓣平放，内层花瓣略转角度，花心另点
function flower(cx,cy,r,fill,deep,core,rot=-90){
  let out="";
  for(let i=0;i<5;i++)out+=petalShape(cx,cy,r*1.3,r*.56,rot+i*72,fill);
  for(let i=0;i<5;i++)out+=petalShape(cx,cy,r*.86,r*.4,rot+i*72+24,deep||fill);
  out+=`<circle cx="${cx}" cy="${cy}" r="${Math.max(1.6,r*.17)}" fill="${core||"#fff"}"/>`;
  return out;
}
// 花苞
function bud(cx,cy,len,rot,fill){
  const r=rot*Math.PI/180,x2=cx+Math.cos(r)*len,y2=cy+Math.sin(r)*len;
  return wash(blob([[cx,cy],[cx+Math.cos(r)*len*.5-Math.sin(r)*len*.16,cy+Math.sin(r)*len*.5+Math.cos(r)*len*.16],[x2,y2],
    [cx+Math.cos(r)*len*.5+Math.sin(r)*len*.16,cy+Math.sin(r)*len*.5-Math.cos(r)*len*.16]]),fill);
}
// 芽叶小枝：一朵花生在细枝上
function sprig(cx,cy,len,rot,fill,vein){
  const r=rot*Math.PI/180;
  return leaf(cx,cy,len,rot-180,fill,vein)+leaf(cx,cy,len*.78,rot-152,fill,vein)+leaf(cx,cy,len*.86,rot-208,fill,vein)
    +`<circle cx="${cx+Math.cos(r)*len*.3}" cy="${cy+Math.sin(r)*len*.3}" r="${len*.1}" fill="${vein}" opacity=".55"/>`;
}
// 一条垂下的柔软藤蔓：带波浪
function vine(x1,y1,x2,y2,c,w=1.3,wob=6){
  let d=`M${x1} ${y1}`;
  const n=4;
  for(let i=1;i<=n;i++){
    const t=i/n,tp=(i-1)/n;
    const py=y1+(y2-y1)*(tp),
          cyy=y1+(y2-y1)*(tp+1/n/2);
    d+=`Q${x1+(x2-x1)*tp+Math.sin(tp*Math.PI*2)*wob} ${cyy} ${x1+(x2-x1)*t+Math.sin(t*Math.PI*2)*wob} ${y1+(y2-y1)*t}`;
  }
  return P(d,"none",`stroke="${c}" stroke-width="${w}" fill="none" opacity=".85"`);
}
// 米珠链
function beadChain(x1,y1,x2,y2,c,n=6){
  let out=P(`M${x1} ${y1}${seg(x1,y1,x2,y2,(x1+x2)/2+8,(y1+y2)/2)}`,"none",`stroke="${c}" stroke-width=".9" opacity=".8" fill="none"`);
  for(let i=1;i<=n;i++){const t=i/(n+1);
    out+=`<circle cx="${x1+(x2-x1)*t}" cy="${y1+(y2-y1)*t+Math.sin(Math.PI*t)*8}" r="2.1" fill="#fff8ea" opacity=".95"/>`;}
  return out;
}
// 一束穗子：顶端金扣 + 同心圆收束 + 穗身 + 穗尖，共 5 股
function strand(x,y,len,w,color){
  const tip=y+len,d=shade(color,-46),md=shade(color,-16),hi=shade(color,54);
  const nx=i=>x+(i-(5-1)/2)*(w*.3);   // 5 股穗丝的横向位置
  let dk=`<ellipse cx="${x}" cy="${y}" rx="${w*.62}" ry="${w*.4}" fill="${shade(color,34)}"/>`
    +`<ellipse cx="${x}" cy="${y}" rx="${w*.4}" ry="${w*.26}" fill="${shade(color,-6)}" opacity=".85"/>`
    +`<ellipse cx="${x}" cy="${y}" rx="${w*.2}" ry="${w*.14}" fill="${shade(color,16)}"/>`;
  let body="";
  for(let i=0;i<5;i++){
    const sx=nx(i),ex=nx(i)*.34+x*.66,sw=w*.3;
    body+=P(`M${sx-sw} ${y+len*.1} C${sx-sw*.8} ${y+len*.55} ${ex-sw*.6} ${tip-5} ${ex-sw*.34} ${tip} L${ex+sw*.34} ${tip} C${ex+sw*.6} ${tip-5} ${sx+sw*.8} ${y+len*.55} ${sx+sw} ${y+len*.1} Z`,
      i%2?color:md);
  }
  let lines="";
  for(let i=0;i<4;i++){
    const t=(i+1)/5,sy=y+len*(.18+t*.5);
    lines+=P(`M${x-w*(1-t*.72)} ${sy}${seg(x-w*(1-t*.72),sy,x+w*(1-t*.72),sy+3,x,sy-2)}`,"none",`stroke="${d}" stroke-width=".55" opacity="${.3-t*.12}" fill="none"`);
  }
  return dk+body+lines
    +P(`M${x-w*.16} ${y+len*.16}L${x-w*.1} ${tip-3}`,"none",`stroke="${hi}" stroke-width=".6" opacity=".65"`)
    +wash(`M${x-w*.34} ${tip}L${x-w*.2} ${tip+7}L${x} ${tip+3}L${x+w*.2} ${tip+7}L${x+w*.34} ${tip}Z`,hi);
}

/* ============ 主渲染 ============ */
function render(){
  const s=state,cx=160,svg=$("preview");let g="";
  const rodDark=shade(s.rodColor,-42),rodLight=shade(s.rodColor,55),rodSoft=shade(s.rodColor,22);
  const ink=shade(s.headColor,-58);          // 花瓣根部/勾勒色
  const petalMid=shade(s.headColor,-4);      // 花色
  const petalDeep=shade(s.headColor,-26);    // 花瓣加深层
  const petalLight=shade(s.headColor,46);    // 花瓣受光面
  const leafC=mix(s.headColor,"#7e9a6b",.46);// 叶色：带一点青绿，不发黑
  const leafD=shade(leafC,-26);
  const jade=s.gemColor;                      // 点翠色
  g+=`<defs>
  <linearGradient id="rod" x1="0" x2="1"><stop offset="0" stop-color="${rodLight}"/><stop offset=".42" stop-color="${s.rodColor}"/><stop offset="1" stop-color="${rodDark}"/></linearGradient>
  <linearGradient id="petal" x1=".15" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="${petalLight}"/><stop offset=".5" stop-color="${petalMid}"/><stop offset="1" stop-color="${shade(s.headColor,-30)}"/></linearGradient>
  <linearGradient id="leaf" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="${shade(leafC,30)}"/><stop offset="1" stop-color="${leafC}"/></linearGradient>
  <filter id="shadow" x="-35%" y="-35%" width="170%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#6b4c30" flood-opacity=".16"/></filter>
  </defs>
  <ellipse cx="160" cy="508" rx="70" ry="14" fill="#7a5c3d" opacity=".07"/>`;

  /* ---------- 簪杆：簪首饰件收在杆顶，杆身向下渐细 ---------- */
  if(s.rod===0)g+=`<path d="M154.5 112 L165.5 112 L162.5 488 L157.5 488 Z" fill="url(#rod)"/>`;
  if(s.rod===1)g+=`<path d="M151 126 C158 210 164 336 165 486 L156 486 C156 336 153 210 153 130 Z" fill="url(#rod)"/>`;
  if(s.rod===2)g+=`<path d="M153.5 116 L160.2 116 L160.2 487 L155 487 Z" fill="url(#rod)"/><path d="M159.8 116 L166.5 116 L165.5 487 L159.8 487 Z" fill="${shade(s.rodColor,-14)}"/>`;
  if(s.rod===0)g+=P("M157.5 300 L162.5 300","none",`stroke="${rodLight}" stroke-width="1.1" opacity=".55"`);
  if(s.rod===1)g+=P("M154 440 C157 480 164 480 167 440","none",`stroke="${rodDark}" stroke-width=".9" opacity=".45" fill="none"`);
  if(s.rod===2)g+=P("M160.2 150 L160.2 470","none",`stroke="${rodDark}" stroke-width=".7" opacity=".5"`);
  // 簪首件与杆的连接（花心托）
  g+=`<ellipse cx="160" cy="108" rx="10" ry="3.4" fill="${rodSoft}"/>`;
  g+=`<ellipse cx="160" cy="104" rx="7" ry="2.6" fill="${rodLight}" opacity=".8"/>`;

  /* ---------- 簪首：以 (160,100) 为花心，整体放大以接近参考图的花头比例 ---------- */
  const fade=.88;                  // 水彩色浓度
  const HS=1.42,HX=160,HY=104;     // 簪首放大倍数与缩放基准点（贴着杆顶）
  const hwrap=t=>`<g transform="translate(${HX} ${HY}) scale(${HS}) translate(${-HX} ${-HY})" opacity="${fade}">${t}</g>`;
  let hd="";
  if(s.head===0){
    // 玉燕钗：轻盈的玉燕一枝，花枝自左侧斜出
    hd=hwrap(`<g filter="url(#shadow)">`
      +stem(150,128,154,112,leafD,1.4,-4)
      +leaf(152,120,20,-140,"url(#leaf)",leafD)+leaf(150,112,17,-38,"url(#leaf)",leafD)
      +wash(blob([[160,58],[152,42],[160,33],[170,41],[166,56],[162,60]]),petalLight,.9)
      +wash(blob([[156,63],[146,50],[152,39],[162,47],[163,59]]),petalMid,.9)
      +wash(blob([[166,63],[177,52],[184,62],[176,74],[166,72]]),petalMid,.85)
      +wash(blob([[157,66],[150,86],[158,100],[166,88],[164,66]]),"#ffffff",.35)
      +P(`M162 52${seg(162,52,168,78,171,66)}`,"none",`stroke="${ink}" stroke-width=".7" opacity=".4" fill="none"`)
      +`<circle cx="166" cy="48" r="2.6" fill="${ink}" opacity=".75"/>`
      +P(`M162 62${seg(162,62,190,84,180,80)}`,"none",`stroke="${ink}" stroke-width=".8" opacity=".55" fill="none"`)
      +stem(152,126,140,116,leafD,1.2,-6)+leaf(140,116,15,-40,"url(#leaf)",leafD)
      +`</g>`);
  }
  if(s.head===1){
    // 颤叶牡丹：重瓣大花，四周散出颤动的小枝，长尾金丝自右下拖出
    hd=hwrap(`<g filter="url(#shadow)">`
      +P(`M150 118${seg(150,118,194,72,190,110)}`,"none",`stroke="${rodSoft}" stroke-width="1.6" opacity=".9" fill="none"`)
      +P(`M147 122${seg(147,122,110,76,116,106)}`,"none",`stroke="${rodSoft}" stroke-width="1.6" opacity=".9" fill="none"`)
      +P(`M154 124${seg(154,124,166,50,150,64)}`,"none",`stroke="${rodSoft}" stroke-width="1.4" opacity=".85" fill="none"`)
      +leaf(170,96,28,-30,"url(#leaf)",leafD)+leaf(190,72,24,-26,"url(#leaf)",leafD)+leaf(180,54,19,-34,"url(#leaf)",leafD)
      +leaf(148,100,28,-152,"url(#leaf)",leafD)+leaf(120,70,24,-152,"url(#leaf)",leafD)
      +flower(160,96,36,petalMid,petalDeep,shade(petalLight,26),-90)
      +flower(160,96,24,petalLight,petalMid,shade(petalLight,40),54)
      +flower(160,96,13,shade(petalLight,10),shade(petalMid,-6),ink,18)
      +`<circle cx="160" cy="96" r="3.4" fill="${ink}" opacity=".8"/>`
      +`<circle cx="158" cy="94" r="1.3" fill="#fff" opacity=".6"/>`
      +`</g>`);
  }
  if(s.head===2){
    // 金镶玉步摇：金托镶一颗翠玉，玉下垂三条细金丝
    hd=hwrap(`<g filter="url(#shadow)">`
      +wash(blob([[160,44],[176,50],[181,64],[160,80],[139,64],[144,50]]),rodSoft,.95)
      +`<path d="M160 44 C176 50 181 64 160 80 C139 64 144 50 160 44 Z" fill="none" stroke="${rodLight}" stroke-width="1.2" opacity=".9"/>`
      +wash(blob([[160,52],[172,56],[175,66],[160,78],[145,66],[148,56]]),jade,.95)
      +wash(blob([[160,56],[166,59],[167,66],[160,72],[153,66],[154,59]]),"#ffffff",.3)
      +`<circle cx="154" cy="60" r="3" fill="#fff" opacity=".7"/>`
      +`<circle cx="160" cy="42" r="4.4" fill="${rodLight}"/><circle cx="160" cy="41" r="2.2" fill="${rodSoft}"/>`
      +`<path d="M160 80 L160 98" stroke="${rodSoft}" stroke-width="2"/>`
      +wash(blob([[160,96],[172,106],[168,122],[160,130],[152,122],[148,106]]),rodSoft)
      +`<path d="M160 96 C172 106 168 122 160 130 C152 122 148 106 160 96 Z" fill="none" stroke="${rodLight}" stroke-width="1" opacity=".8"/>`
      +`<path d="M160 100 L160 126" stroke="${shade(s.gemColor,-30)}" stroke-width=".8" opacity=".5"/>`
      +`</g>`);
  }
  if(s.head===3){
    // 蝶戏花步摇：右侧一只蝴蝶，左侧一枝花叶
    hd=hwrap(`<g filter="url(#shadow)">`
      +P(`M168 104${seg(168,104,178,58,180,82)}`,"none",`stroke="${rodSoft}" stroke-width="1.6" opacity=".9" fill="none"`)
      +wash(blob([[176,44],[196,24],[210,34],[204,52],[186,60],[176,56]]),jade,.9)
      +wash(blob([[176,60],[200,58],[206,74],[192,88],[178,80],[174,70]]),jade,.85)
      +wash(blob([[172,44],[156,26],[144,36],[152,54],[168,58]]),shade(jade,26),.9)
      +wash(blob([[174,60],[154,58],[146,72],[158,86],[174,78]]),shade(jade,26),.8)
      +wash(blob([[194,40],[202,32],[208,38],[200,48]]),shade(jade,55),.5)
      +P(`M176 74 L188 100`,"none",`stroke="${rodSoft}" stroke-width="1.6" stroke-linecap="round"`)
      +wash(blob([[188,100],[198,104],[196,111],[187,108]]),shade(jade,10),.9)
      +wash(blob([[186,102],[176,106],[178,112],[187,108]]),shade(jade,-10),.9)
      +`<ellipse cx="176" cy="60" rx="3.6" ry="12" fill="${shade(petalMid,-10)}"/>`
      +`<circle cx="176" cy="46" r="4.2" fill="${ink}" opacity=".8"/>`
      +`<path d="M174 42 C170 34 164 30 160 31 M178 42 C182 34 188 30 192 32" fill="none" stroke="${ink}" stroke-width=".8" opacity=".7"/>`
      +stem(170,104,124,74,leafD,1.5,-12)
      +leaf(146,92,22,-142,"url(#leaf)",leafD)+leaf(130,82,20,-150,"url(#leaf)",leafD)
      +flower(120,70,13,"url(#petal)",shade(petalMid,-6),ink,-100)
      +bud(134,88,14,-150,"url(#petal)")
      +`</g>`);
  }
  g+=hd;

  /* ---------- 宝石（可选，与点翠并存）---------- */
  if(s.gem<3){
    const gy=state.head===2?78:100,gy0=gy+(state.head===2?-1:0);
    const bezel=`stroke="${shade(s.rodColor,48)}" stroke-width="2"`;
    if(state.head===2&&s.gem<3){} /* 金镶玉时宝石叠在玉上 */
    if(s.gem===0)g+=`<circle cx="160" cy="${gy0}" r="12" fill="url(#gem)" ${bezel}/><circle cx="155.5" cy="${gy0-4.5}" r="3.2" fill="#fff" opacity=".85"/>`;
    if(s.gem===1)g+=`<path d="M160 ${gy0-11} L170 ${gy0} L160 ${gy0+12} L150 ${gy0} Z" fill="url(#gem)" ${bezel}/><circle cx="156" cy="${gy0-1}" r="2.8" fill="#fff" opacity=".85"/>`;
    if(s.gem===2)g+=`<circle cx="160" cy="${gy0}" r="16" fill="url(#gem)" ${bezel}/><circle cx="154" cy="${gy0-6}" r="3.8" fill="#fff" opacity=".85"/>`;
  }

  /* ---------- 流苏：从簪首饰件下方垂落 ---------- */
  const t0=state.head===2?128:110;
  if(s.tassel===0)g+=beadChain(148,t0,150,190,s.rodColor,3)+strand(150,196,124,9,s.tasselColor);
  if(s.tassel===1)g+=beadChain(148,t0,124,168,s.rodColor,3)+beadChain(172,t0,196,170,s.rodColor,3)
    +strand(124,176,96,8,s.tasselColor)+strand(196,178,92,8,shade(s.tasselColor,14));
  if(s.tassel===2)g+=beadChain(140,t0,108,154,s.rodColor,2)+beadChain(160,t0,160,166,s.rodColor,3)+beadChain(180,t0,212,154,s.rodColor,2)
    +strand(108,162,72,7,s.tasselColor)+strand(160,174,88,7.5,s.tasselColor)+strand(212,162,72,7,shade(s.tasselColor,14));
  if(s.tassel===3)g+=beadChain(146,t0,146,210,s.rodColor,3)+beadChain(174,t0,174,196,s.rodColor,3)
    +`<circle cx="146" cy="224" r="11" fill="none" stroke="${s.tasselColor}" stroke-width="1.6" opacity=".9"/>`
    +`<circle cx="174" cy="210" r="9" fill="none" stroke="${s.tasselColor}" stroke-width="1.4" opacity=".9"/>`
    +`<circle cx="146" cy="224" r="4" fill="#fff8ea" opacity=".9"/><circle cx="174" cy="210" r="3.4" fill="#fff8ea" opacity=".9"/>`;

  svg.innerHTML=g;
}

function showStep(){
  document.querySelectorAll(".step").forEach((item,index)=>{item.classList.toggle("active",index===step);item.classList.toggle("done",index<step)});
  $("prevBtn").disabled=step===0;$("nextBtn").disabled=step===3;
  $("nextBtn").textContent=step===2?"完成":"继续";
  buildControls();
}
$("prevBtn").onclick=()=>{if(step>0)step--;showStep()};
$("nextBtn").onclick=()=>{if(step<3)step++;showStep()};
$("randomBtn").onclick=()=>{
  for(const group of groups)state[group.key]=Math.floor(Math.random()*group.options.length);
  const palettes=[["#c8a24f","#f6ead0","#a83a39","#a83a39"],["#b9c7c3","#eaf3f1","#3f6b8f","#3f6b8f"],["#d1a878","#f9dfb8","#8c4b76","#8c4b76"],["#9aa67c","#f2f4e4","#5f8e6b","#5f8e6b"]];
  const p=palettes[Math.floor(Math.random()*palettes.length)];
  [state.rodColor,state.headColor,state.gemColor,state.tasselColor]=p;
  showStep();render();
};
$("exportBtn").onclick=()=>{
  const svgText=new XMLSerializer().serializeToString($("preview")),img=new Image();
  img.onload=()=>{
    const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1890;const ctx=canvas.getContext("2d");
    const grad=ctx.createRadialGradient(540,420,60,540,945,1100);grad.addColorStop(0,"#fffdf8");grad.addColorStop(.62,"#f7ecd8");grad.addColorStop(1,"#e3d0b4");
    ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1890);ctx.drawImage(img,0,0,1080,1890);
    const a=document.createElement("a");a.href=canvas.toDataURL("image/png");a.download="我的古风簪子.png";a.click();
  };
  img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgText);
};
showStep();render();
