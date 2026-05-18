(() => {
  const NS = 'http://www.w3.org/2000/svg';

  const PHASES = [
    { id:'recovery',   label:'复苏期', en:'Recovery',  color:'#7FB3D3', angle:225 },
    { id:'expansion',  label:'扩张期', en:'Expansion', color:'#00C46E', angle:315 },
    { id:'peak',       label:'过热期', en:'Peak',      color:'#FFB300', angle:45  },
    { id:'recession',  label:'衰退期', en:'Recession', color:'#FF3058', angle:135 },
  ];

  const SECTORS = [
    { name:'信息技术', en:'Tech',        strength:{ recovery:2, expansion:3, peak:1, recession:0 }, color:'#7FB3D3' },
    { name:'非必需消费',en:'Cons.Disc',  strength:{ recovery:3, expansion:3, peak:1, recession:0 }, color:'#FFB300' },
    { name:'工业',     en:'Industrials', strength:{ recovery:2, expansion:3, peak:2, recession:0 }, color:'#8FB8A1' },
    { name:'金融',     en:'Financials',  strength:{ recovery:2, expansion:2, peak:3, recession:0 }, color:'#00C46E' },
    { name:'材料',     en:'Materials',   strength:{ recovery:3, expansion:2, peak:2, recession:0 }, color:'#C27BA0' },
    { name:'能源',     en:'Energy',      strength:{ recovery:0, expansion:1, peak:3, recession:1 }, color:'#E06C00' },
    { name:'医疗健康', en:'Healthcare',  strength:{ recovery:1, expansion:1, peak:1, recession:3 }, color:'#5EC8D8' },
    { name:'必需消费', en:'Staples',     strength:{ recovery:1, expansion:0, peak:1, recession:3 }, color:'#A8C84A' },
    { name:'公用事业', en:'Utilities',   strength:{ recovery:1, expansion:0, peak:0, recession:3 }, color:'#9B8EC4' },
    { name:'房地产',   en:'Real Estate', strength:{ recovery:2, expansion:1, peak:0, recession:2 }, color:'#D4845A' },
    { name:'通信服务', en:'Comm.Svc',    strength:{ recovery:2, expansion:2, peak:1, recession:1 }, color:'#4DB8A0' },
  ];

  let activePhaseId = 'expansion';

  function buildClock(svgEl) {
    svgEl.setAttribute('viewBox','0 0 300 300');
    svgEl.innerHTML = '';
    const cx=150, cy=150, R=120, innerR=42;
    const defs=document.createElementNS(NS,'defs');
    svgEl.appendChild(defs);

    PHASES.forEach((ph, i) => {
      const startA = (Math.PI*2*i/4) - Math.PI/2;
      const endA   = startA + Math.PI/2;
      const x1=cx+Math.cos(startA)*R, y1=cy+Math.sin(startA)*R;
      const x2=cx+Math.cos(endA)*R,   y2=cy+Math.sin(endA)*R;

      const path = document.createElementNS(NS,'path');
      const d=`M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
      path.setAttribute('d',d);
      path.setAttribute('fill', ph.id===activePhaseId ? ph.color+'33' : 'rgba(255,255,255,0.03)');
      path.setAttribute('stroke', ph.id===activePhaseId ? ph.color : 'rgba(255,255,255,0.1)');
      path.setAttribute('stroke-width', ph.id===activePhaseId ? '2' : '1');
      path.setAttribute('cursor','pointer');
      path.setAttribute('data-phase', ph.id);
      svgEl.appendChild(path);

      const midA = startA + Math.PI/4;
      const lx=cx+Math.cos(midA)*R*0.65, ly=cy+Math.sin(midA)*R*0.65;

      const t1=document.createElementNS(NS,'text');
      t1.setAttribute('x',lx); t1.setAttribute('y',ly-7);
      t1.setAttribute('text-anchor','middle'); t1.setAttribute('dominant-baseline','middle');
      t1.setAttribute('fill', ph.id===activePhaseId ? ph.color : 'rgba(255,255,255,0.4)');
      t1.setAttribute('font-size','12'); t1.setAttribute('font-weight','600');
      t1.setAttribute('font-family','Noto Serif SC,serif');
      t1.setAttribute('pointer-events','none');
      t1.textContent=ph.label;
      svgEl.appendChild(t1);

      const t2=document.createElementNS(NS,'text');
      t2.setAttribute('x',lx); t2.setAttribute('y',ly+9);
      t2.setAttribute('text-anchor','middle');
      t2.setAttribute('fill','rgba(255,255,255,0.25)'); t2.setAttribute('font-size','8');
      t2.setAttribute('font-family','JetBrains Mono,monospace');
      t2.setAttribute('pointer-events','none');
      t2.textContent=ph.en;
      svgEl.appendChild(t2);

      path.addEventListener('click',()=>{ activePhaseId=ph.id; updateAll(svgEl); });
    });

    // Inner circle
    const circle=document.createElementNS(NS,'circle');
    circle.setAttribute('cx',cx); circle.setAttribute('cy',cy); circle.setAttribute('r',innerR);
    circle.setAttribute('fill','#13131A'); circle.setAttribute('stroke','rgba(255,255,255,0.1)');
    circle.setAttribute('stroke-width','1');
    svgEl.appendChild(circle);

    // Pointer
    const ph=PHASES.find(p=>p.id===activePhaseId)||PHASES[1];
    const a=(ph.angle-90)*Math.PI/180;
    const px=cx+Math.cos(a)*(R*0.82), py=cy+Math.sin(a)*(R*0.82);
    const line=document.createElementNS(NS,'line');
    line.setAttribute('x1',cx); line.setAttribute('y1',cy);
    line.setAttribute('x2',px); line.setAttribute('y2',py);
    line.setAttribute('stroke',ph.color); line.setAttribute('stroke-width','2.5');
    line.setAttribute('stroke-linecap','round');
    svgEl.appendChild(line);

    const dot=document.createElementNS(NS,'circle');
    dot.setAttribute('cx',px); dot.setAttribute('cy',py); dot.setAttribute('r','6');
    dot.setAttribute('fill',ph.color);
    svgEl.appendChild(dot);

    const center=document.createElementNS(NS,'circle');
    center.setAttribute('cx',cx); center.setAttribute('cy',cy); center.setAttribute('r','5');
    center.setAttribute('fill','rgba(255,255,255,0.9)');
    svgEl.appendChild(center);

    // Center label
    const ct=document.createElementNS(NS,'text');
    ct.setAttribute('x',cx); ct.setAttribute('y',cy-5);
    ct.setAttribute('text-anchor','middle'); ct.setAttribute('fill',ph.color);
    ct.setAttribute('font-size','11'); ct.setAttribute('font-weight','700');
    ct.setAttribute('font-family','Noto Serif SC,serif');
    ct.textContent=ph.label;
    svgEl.appendChild(ct);
  }

  function updateList(listEl) {
    const sorted=[...SECTORS].sort((a,b)=>b.strength[activePhaseId]-a.strength[activePhaseId]);
    const labels=['','弱','中','强'];
    listEl.innerHTML=sorted.map(s=>{
      const str=s.strength[activePhaseId];
      const pct=(str/3*100).toFixed(0);
      const isTop=str===3;
      return `<div class="sector-item${isTop?' active':''}" style="padding:5px 8px;display:flex;align-items:center;gap:8px;font-size:0.82rem;border-radius:6px;${isTop?'background:rgba(255,255,255,0.04)':''}">
        <span style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0"></span>
        <span style="flex:1;color:${isTop?'var(--amber)':'var(--ink-secondary)'}${isTop?';font-weight:600':''}">${s.name}</span>
        <div style="width:50px;height:4px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${s.color};opacity:${0.4+str*0.2}"></div>
        </div>
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);width:12px">${labels[str]||''}</span>
      </div>`;
    }).join('');
  }

  function updateAll(svgEl) {
    buildClock(svgEl);
    const listEl=document.getElementById('sector-list');
    if(listEl) updateList(listEl);

    // Update tab buttons if present
    document.querySelectorAll('[data-tab]').forEach(btn=>{
      if(PHASES.find(p=>p.id===btn.dataset.tab)){
        btn.classList.toggle('active', btn.dataset.tab===activePhaseId);
      }
    });
  }

  function init(){
    const svgEl=document.getElementById('sector-clock-svg');
    if(!svgEl) return;
    updateAll(svgEl);
    window.addEventListener('resize',()=>updateAll(svgEl));
  }

  document.readyState==='loading'
    ?document.addEventListener('DOMContentLoaded',init)
    :init();
})();
