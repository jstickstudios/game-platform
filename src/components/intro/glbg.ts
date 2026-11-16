// @ts-nocheck
/* WebGL smoke + energy ribbons + particle background (blue variant) */
const vm=`
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,Rh=.62,Hh=.04,mm=A=>`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

#define OCT ${A}

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPar;     // smoothed camera parallax (-1..1) incl. shake
uniform float uFront;   // x position of the travelling energy packet
uniform float uFade;    // global fade-in from black
uniform float uAmb;     // ambient energy level (settles)
uniform vec2  uPA;      // main pulse   (age, strength)
uniform vec2  uPB;      // echo / ambient pulse (age, strength)

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < OCT; i++) {
    v += a * noise(p);
    p = r * p * 2.03 + 17.0;
    a *= 0.5;
  }
  return v;
}

void addPulse(vec2 pa, vec2 uv, vec2 c,
              inout vec2 distort, inout float ring, inout float trail, inout float flash) {
  if (pa.y <= 0.0) return;
  float age = pa.x;
  vec2  dv  = uv - c;
  float d   = length(dv);
  float r   = age * ${Rh.toFixed(3)};
  float w   = mix(16.0, 5.0, clamp(age / 2.5, 0.0, 1.0));
  float life = exp(-age * 0.85) * pa.y;
  float dr  = (d - r) * w;
  float rg  = exp(-dr * dr) * life;
  // luminous wake trailing behind the wavefront
  float tr  = smoothstep(r - 0.55, r, d) * (1.0 - smoothstep(r, r + 0.03, d)) * life * 0.4;
  distort += (dv / (d + 1e-4)) * rg * 0.03;
  ring  += rg;
  trail += tr;
  flash += exp(-age * 2.6) * pa.y * exp(-d * 2.4);
}

float ribbons(vec2 p, float t, float amb, float front, float boost) {
  float acc = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float lane = fi - 2.0;
    vec2  q = p;
    q.x += uPar.x * 0.045 * lane;
    q.y += uPar.y * 0.03 * lane;

    float pkx = (q.x - front + fi * 0.06) * 1.05;
    float pk = exp(-pkx * pkx);
    float xs = q.x * (1.1 + fi * 0.22);

    float y = sin(xs * 2.1 + t * (0.45 + fi * 0.13) + fi * 1.9) * (0.11 + fi * 0.015)
            + sin(xs * 4.7 - t * 0.8 + fi * 3.1) * 0.028
            + sin(xs * 0.9 + t * 0.2 + fi) * 0.06
            + lane * 0.075;
    y *= 1.0 + pk * 0.65;

    float dy = abs(q.y - y);
    float g  = exp(-dy * (13.0 + fi * 3.0)) * 0.32
             + exp(-dy * (125.0 + fi * 28.0)) * 0.95;

    float flow = 0.55 + 0.45 * sin(q.x * 3.2 - t * (1.2 + fi * 0.2) + fi * 2.3);
    float env  = amb * 0.6 * flow + pk * 1.9;
    acc += g * env * (1.0 - fi * 0.11);
  }
  return acc * boost;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;
  vec2 c = vec2(0.0, ${Hh.toFixed(3)});

  // ---- Pulses: refraction + ring + wake + flash
  vec2 distort = vec2(0.0);
  float ring = 0.0, trail = 0.0, flash = 0.0;
  addPulse(uPA, uv, c, distort, ring, trail, flash);
  addPulse(uPB, uv, c, distort, ring, trail, flash);
  vec2 p = uv + distort;

  // ---- Volumetric smoke: domain-warped fbm on two parallax layers
  vec2 sp = p * 1.5 + uPar * 0.05;
  vec2 q = vec2(fbm(sp + vec2(0.0, t * 0.045)),
                fbm(sp + vec2(5.2, 1.3) - t * 0.035));
  float smokeFar  = fbm(sp + 2.0 * q + vec2(t * 0.03, -t * 0.02));
  vec2 np = p * 2.7 + uPar * 0.13 + vec2(t * 0.07, t * 0.02);
  float smokeNear = fbm(np + q * 1.5);
  float dens = smokeFar * 0.8 + smokeNear * 0.42;
  float thick = smoothstep(0.32, 1.0, dens);

  // ---- Lighting fields
  float lightK  = 0.25 + uAmb * 1.7;
  float horizon = exp(-length((p - vec2(0.0, -0.62)) * vec2(0.55, 1.5)) * 1.6);
  float back    = exp(-length((p - c) * vec2(0.8, 1.1)) * 2.6);
  float light   = (horizon * 0.95 + back * 0.5) * lightK;

  // God rays from an off-screen key light above
  vec2  lp  = vec2(0.28 + uPar.x * 0.04, 0.95);
  vec2  dl  = p - lp;
  float dist = length(dl);
  vec2  dir = dl / (dist + 1e-4);
  float rayN = fbm(dir * 3.2 + vec2(t * 0.06, 0.0));
  float rays = pow(smoothstep(0.38, 0.85, rayN), 2.0) * exp(-dist * 1.15);
  rays *= 0.35 + 0.65 * fbm(p * 2.4 + vec2(0.0, t * 0.08));
  rays *= lightK;

  // ---- Energy ribbons
  float boost = 1.0 + ring * 1.6 + flash * 0.4;
  float waves = ribbons(p, t, uAmb, uFront, boost);

  // ---- Compose in black / crimson space
  vec3 deep = vec3(0.03, 0.15, 0.52);
  vec3 red  = vec3(0.05, 0.38, 1.00);
  vec3 hot  = vec3(0.30, 0.66, 1.00);

  vec3 col = vec3(0.0, 0.004, 0.014);

  float smokeLight = light * 1.15 + rays * (0.55 + thick * 1.2)
                   + ring * 2.4 + trail * 1.4 + flash * 0.35 + 0.035;
  col += deep * thick * smokeLight;
  col += deep * rays * 0.5;                       // volumetric shafts in clear air
  col += deep * light * 0.35;                     // base bloom

  col += red * waves;
  col += hot * (pow(waves, 2.0) * 0.55);

  // shockwave ring + core flash
  col += red * (ring * 1.2 + trail * 0.6);
  col += hot * (ring * 0.55 + flash * 0.5 * exp(-length(uv - c) * 4.0));

  // anamorphic lens streak on the pulse
  float ana = exp(-abs(uv.y - c.y) * 75.0) * exp(-abs(uv.x - c.x) * 0.9) * flash;
  col += red * ana * 1.5 + hot * ana * 0.4;

  // ---- Grade
  col = 1.0 - exp(-col * 1.25);
  float vig = 1.0 - smoothstep(0.30, 1.15, length(uv * vec2(0.92, 1.0))) * 0.82;
  col *= vig;
  col *= uFade;

  // film grain / dither (red-biased so no stray hues)
  float g = hash(gl_FragCoord.xy + fract(t) * 91.7) - 0.5;
  col += vec3(0.22, 0.42, 1.0) * g * 0.02 * uFade;
  col = max(col, 0.0);

  gl_FragColor = vec4(col, 1.0);
}
`,Ft=(A,b=0,M=1)=>Math.min(M,Math.max(b,A)),gc=(A,b,M)=>A+(b-A)*M,Za=(A,b,M)=>{const h=Ft((M-A)/(b-A));return h*h*(3-2*h)},ym=A=>A<.5?4*A*A*A:1-Math.pow(-2*A+2,3)/2,yc=3.9,xh=4.8,rm=9;function gm(A,b){const M=Za(0,1.9,A),h=gc(-b-.9,b+.9,ym(Ft((A-.9)/3))),U=.14+.26*Za(.4,6.5,A),x=A>=yc?[A-yc,1]:[0,0];let L=[0,0];if(A>=12){const C=Math.floor((A-12)/11);L=[A-(12+11*C),.32]}else A>=xh&&(L=[A-xh,.5]);const V=.05+(A<4?.1+2.4*Za(.5,3,A):2.5*Math.exp(-(A-4)*1.5)),_=Za(.8,1.8,A)*(1-Za(4.4,6.5,A)),p=A-yc,j=p>=0?Math.exp(-p*4.5)*Math.sin(p*46):0;return{fade:M,front:h,amb:U,pa:x,pb:L,warp:V,streakI:_,shakeX:j*.05,shakeY:j*Math.cos(p*31)*.035}}function rc(A){const M=document.createElement("canvas");M.width=M.height=64;const h=M.getContext("2d"),U=h.createRadialGradient(64/2,64/2,0,64/2,64/2,64/2);return A==="sharp"?(U.addColorStop(0,"rgba(170,205,255,1)"),U.addColorStop(.14,"rgba(45,120,255,0.95)"),U.addColorStop(.45,"rgba(0,70,200,0.28)"),U.addColorStop(1,"rgba(0,30,120,0)")):A==="mid"?(U.addColorStop(0,"rgba(90,165,255,0.8)"),U.addColorStop(.35,"rgba(12,90,230,0.45)"),U.addColorStop(.75,"rgba(0,50,160,0.14)"),U.addColorStop(1,"rgba(0,30,120,0)")):(U.addColorStop(0,"rgba(60,140,255,0.5)"),U.addColorStop(.55,"rgba(6,90,215,0.32)"),U.addColorStop(.82,"rgba(0,60,190,0.22)"),U.addColorStop(1,"rgba(0,30,120,0)")),h.fillStyle=U,h.fillRect(0,0,64,64),M}function Sm(){const A=document.createElement("canvas");A.width=256,A.height=32;const b=A.getContext("2d"),M=b.createLinearGradient(0,0,256,0);M.addColorStop(0,"rgba(130,180,255,0)"),M.addColorStop(.015,"rgba(165,200,255,1)"),M.addColorStop(.1,"rgba(45,120,255,0.9)"),M.addColorStop(.45,"rgba(6,80,195,0.4)"),M.addColorStop(1,"rgba(0,40,120,0)"),b.fillStyle=M,b.fillRect(0,0,256,32),b.globalCompositeOperation="destination-in";const h=b.createLinearGradient(0,0,0,32);return h.addColorStop(0,"rgba(0,0,0,0)"),h.addColorStop(.5,"rgba(0,0,0,1)"),h.addColorStop(1,"rgba(0,0,0,0)"),b.fillStyle=h,b.fillRect(0,0,256,32),A}const Zn=.16,Ln=3,bm=.95;class zm{constructor(b,M,h){this.glCanvas=b,this.fxCanvas=M,this.host=h,this.mobile=window.matchMedia("(pointer: coarse)").matches||window.innerWidth<768,this.quality=this.mobile?.5:.72,this.dpr=Math.min(window.devicePixelRatio||1,this.mobile?1.25:1.5),this.mq=window.matchMedia("(prefers-reduced-motion: reduce)"),this.reduced=this.mq.matches,this.fx=M.getContext("2d",{alpha:!0}),this.sprites={sharp:rc("sharp"),mid:rc("mid"),soft:rc("soft")},this.streakSprite=Sm();const U=this.mobile?85:180;this.activeCount=U;for(let L=0;L<U;L++)this.particles.push(this.spawnParticle({},!0));const x=this.mobile?14:24;for(let L=0;L<x;L++)this.streaks.push({active:!1,wait:Math.random()*2,x:0,y:0,len:0,speed:0,thick:1,alpha:1,depth:1,ang:0});this.initGL(),this.resize(),window.addEventListener("pointermove",this.onPointer,{passive:!0}),document.addEventListener("visibilitychange",this.onVis),this.mq.addEventListener?.("change",this.onMotionPref),this.ro=new ResizeObserver(()=>this.resize()),this.ro.observe(h),this.io=new IntersectionObserver(L=>{this.visible=L[L.length-1].isIntersecting,this.syncRunning()}),this.io.observe(h),this.syncRunning()}glCanvas;fxCanvas;host;gl=null;prog=null;u={};fx;raf=0;running=!1;last=0;clock=0;W=1;H=1;dpr=1;quality;mobile;reduced;px=0;py=0;tx=0;ty=0;particles=[];activeCount;streaks=[];sprites;streakSprite;ema=1/60;slow=0;visible=!0;pageVisible=!0;io;ro;mq;initGL(){const b=this.glCanvas.getContext("webgl",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!b)return;const M=(_,p)=>{const j=b.createShader(_);return b.shaderSource(j,p),b.compileShader(j),b.getShaderParameter(j,b.COMPILE_STATUS)?j:(console.warn(b.getShaderInfoLog(j)),null)},h=M(b.VERTEX_SHADER,vm),U=M(b.FRAGMENT_SHADER,mm(this.mobile?4:5));if(!h||!U)return;const x=b.createProgram();if(b.attachShader(x,h),b.attachShader(x,U),b.linkProgram(x),!b.getProgramParameter(x,b.LINK_STATUS))return;b.useProgram(x);const L=b.createBuffer();b.bindBuffer(b.ARRAY_BUFFER,L),b.bufferData(b.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),b.STATIC_DRAW);const V=b.getAttribLocation(x,"aPos");b.enableVertexAttribArray(V),b.vertexAttribPointer(V,2,b.FLOAT,!1,0,0);for(const _ of["uRes","uTime","uPar","uFront","uFade","uAmb","uPA","uPB"])this.u[_]=b.getUniformLocation(x,_);this.gl=b,this.prog=x,this.glCanvas.addEventListener("webglcontextlost",_=>{_.preventDefault(),this.gl=null})}resize=()=>{const b=this.host.getBoundingClientRect();this.W=Math.max(1,b.width),this.H=Math.max(1,b.height),this.fxCanvas.width=Math.round(this.W*this.dpr),this.fxCanvas.height=Math.round(this.H*this.dpr),this.applyGLSize(),this.running||this.renderStatic()};applyGLSize(){const b=Math.max(2,Math.round(this.W*this.quality)),M=Math.max(2,Math.round(this.H*this.quality));(this.glCanvas.width!==b||this.glCanvas.height!==M)&&(this.glCanvas.width=b,this.glCanvas.height=M),this.gl?.viewport(0,0,b,M)}onPointer=b=>{this.tx=Ft(b.clientX/window.innerWidth*2-1,-1,1),this.ty=Ft(-(b.clientY/window.innerHeight*2-1),-1,1)};onVis=()=>{this.pageVisible=!document.hidden,this.syncRunning()};onMotionPref=()=>{this.reduced=this.mq.matches,this.syncRunning(),this.reduced&&this.renderStatic()};syncRunning(){const b=this.visible&&this.pageVisible&&!this.reduced;b&&!this.running?(this.running=!0,this.last=performance.now(),this.raf=requestAnimationFrame(this.frame)):!b&&this.running&&(this.running=!1,cancelAnimationFrame(this.raf)),this.reduced&&!this.running&&this.renderStatic()}frame=b=>{if(!this.running)return;this.raf=requestAnimationFrame(this.frame);const M=(b-this.last)/1e3;this.last=b;const h=Math.min(.05,Math.max(5e-4,M));this.clock+=h,this.adapt(M),this.render(this.clock,h)};adapt(b){this.ema=gc(this.ema,Math.min(b,.1),.06),!(this.clock<1)&&(this.ema>.026?this.slow++:this.slow=Math.max(0,this.slow-1),this.slow>45&&(this.slow=0,this.quality>.34&&(this.quality*=.85,this.applyGLSize()),this.activeCount=Math.max(40,Math.floor(this.activeCount*.85))))}renderStatic(){this.render(rm,0,!0)}render(b,M,h=!1){const U=M>0?1-Math.exp(-M*2.6):1,x=h?0:1,L=this.tx+Math.sin(b*.21)*.35*x,V=this.ty+Math.cos(b*.17)*.22*x;this.px+=(L-this.px)*U,this.py+=(V-this.py)*U;const _=this.W/this.H/2,p=gm(b,_),j=this.px+p.shakeX*12,C=this.py+p.shakeY*12;this.drawGL(b,p,j+p.shakeX*4,C+p.shakeY*4),this.drawFX(b,M,p,j,C,h)}drawGL(b,M,h,U){const x=this.gl;!x||!this.prog||(x.uniform2f(this.u.uRes,this.glCanvas.width,this.glCanvas.height),x.uniform1f(this.u.uTime,b),x.uniform2f(this.u.uPar,h,U),x.uniform1f(this.u.uFront,M.front),x.uniform1f(this.u.uFade,M.fade),x.uniform1f(this.u.uAmb,M.amb),x.uniform2f(this.u.uPA,M.pa[0],M.pa[1]),x.uniform2f(this.u.uPB,M.pb[0],M.pb[1]),x.drawArrays(x.TRIANGLES,0,3))}spawnParticle(b,M){const h=this.W/this.H;return b.z=M?Zn+Math.random()*(Ln-Zn):Ln-Math.random()*.5,b.x=(Math.random()*2-1)*h*.8*b.z*1.15,b.y=(Math.random()*2-1)*.81*b.z*1.1,b.seed=Math.random()*100,b.vy=.02+Math.random()*.07,b.size=.0035+Math.pow(Math.random(),2.2)*.011,b}spawnStreak(b){const M=.3+Math.random()*.7;b.depth=M,b.ang=-.1+(Math.random()-.5)*.08,b.len=(.22+Math.random()*.5)*this.W*(.5+M*.7),b.speed=this.W*(1.1+Math.random()*1.6)*(.55+M*.8),b.thick=(1+M*3.4)*(.8+Math.random()*.4),b.alpha=.35+M*.55,b.x=-b.len,b.y=this.H*(.08+Math.random()*.84)+this.W*.05,b.active=!0}drawFX(b,M,h,U,x,L){const V=this.fx,_=this.dpr,{W:p,H:j}=this;V.setTransform(1,0,0,1,0,0),V.clearRect(0,0,this.fxCanvas.width,this.fxCanvas.height),V.globalCompositeOperation="lighter";const C=j*.62,cl=p/2,ql=j/2,Bl=L?0:h.warp,Ml=h.fade,pt=sl=>sl*Rh,Vl=sl=>{let X=0;for(const B of[h.pa,h.pb])B[1]<=0||(X+=Math.exp(-Math.pow((sl-pt(B[0]))*7,2))*Math.exp(-B[0]*.9)*B[1]);return X},Ot=Math.min(this.activeCount,this.particles.length);for(let sl=0;sl<Ot;sl++){const X=this.particles[sl];M>0&&(X.z-=Bl*M*(.55+X.z*.25),X.y+=X.vy*M*X.z,X.x+=Math.sin(b*.35+X.seed)*.04*M*X.z,X.z<Zn?this.spawnParticle(X,!1):X.y>.9*X.z&&(X.y=-.9*X.z));const B=C/X.z,rl=cl+(X.x-U*.16)*B,Q=ql-(X.y-x*.1)*B;let Sl=X.size*B;if(rl<-80||rl>p+80||Q<-80||Q>j+80)continue;let _l=Za(Ln,Ln-.7,X.z)*Za(Zn,.42,X.z);_l*=.55+.45*Math.sin(b*(.8+X.seed%1.7)+X.seed),_l*=Ml;const Et=Math.hypot(rl-cl,Q-(ql-Hh*j))/j,Yl=Vl(Et);_l*=1+Yl*2.6,Sl*=1+Yl*.35;const xl=Ft(Math.abs(X.z-bm)/1.1),Rt=xl<.22?this.sprites.sharp:xl<.6?this.sprites.mid:this.sprites.soft,Tt=1+xl*1.8;if(xl>=.6&&(_l*=.7),_l<.01)continue;const lt=X.z+Bl*.05*(.55+X.z*.25),S=C/lt,O=cl+(X.x-U*.16)*S,Y=ql-(X.y-x*.1)*S,ul=Math.hypot(O-rl,Y-Q);if(V.globalAlpha=Ft(_l),ul>Sl*1.4&&!L){const P=Math.atan2(Y-Q,O-rl),o=Math.cos(P)*_,T=Math.sin(P)*_;V.setTransform(o,T,-T,o,rl*_,Q*_);const D=Math.max(1.2,Sl*.9);V.drawImage(this.streakSprite,0,-D,ul*1.15+D,D*2),V.setTransform(1,0,0,1,0,0)}else{const P=Sl*2.6*Tt;V.drawImage(Rt,(rl-P/2)*_,(Q-P/2)*_,P*_,P*_)}}if(!L){let sl=0;for(const B of this.streaks)B.active&&sl++;const X=Math.round(2+h.streakI*(this.streaks.length-2));for(const B of this.streaks){if(!B.active){B.wait-=M,B.wait<=0&&sl<X&&(this.spawnStreak(B),sl++);continue}if(B.x+=Math.cos(B.ang)*B.speed*M,B.y+=Math.sin(B.ang)*B.speed*M,B.x-B.len*.05>p+40){B.active=!1,B.wait=gc(5,.05,h.streakI)*(.5+Math.random());continue}const rl=U*38*B.depth,Q=-x*22*B.depth,Sl=B.ang+Math.PI,_l=Math.cos(Sl)*_,Et=Math.sin(Sl)*_;V.setTransform(_l,Et,-Et,_l,(B.x+rl)*_,(B.y+Q)*_);const Yl=B.len;V.globalAlpha=Ft(B.alpha*.32*Ml),V.drawImage(this.streakSprite,0,-B.thick*4.5,Yl,B.thick*9),V.globalAlpha=Ft(B.alpha*.8*Ml),V.drawImage(this.streakSprite,0,-B.thick*1.2,Yl,B.thick*2.4),V.globalAlpha=Ft(B.alpha*Ml),V.drawImage(this.streakSprite,0,-B.thick*.45,Yl*.55,B.thick*.9),V.setTransform(1,0,0,1,0,0)}}V.globalAlpha=1,V.setTransform(1,0,0,1,0,0),V.globalCompositeOperation="source-over"}destroy(){this.running=!1,cancelAnimationFrame(this.raf),window.removeEventListener("pointermove",this.onPointer),document.removeEventListener("visibilitychange",this.onVis),this.mq.removeEventListener?.("change",this.onMotionPref),this.ro?.disconnect(),this.io?.disconnect(),this.gl&&this.prog&&this.gl.deleteProgram(this.prog),this.gl=null}}
export { zm as GlowEngine };
