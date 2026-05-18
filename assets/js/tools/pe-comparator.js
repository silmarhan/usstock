(() => {
  const STOCKS = {
    AAPL: { name: 'Apple',     sector: '科技', pe: 28.5, pb: 48.2, ps: 7.8,  ev_ebitda: 21.3, color: '#7FB3D3' },
    MSFT: { name: 'Microsoft', sector: '科技', pe: 35.1, pb: 13.6, ps: 13.2, ev_ebitda: 26.8, color: '#00C46E' },
    JPM:  { name: 'JPMorgan',  sector: '金融', pe: 11.8, pb: 1.8,  ps: 3.1,  ev_ebitda: 9.4,  color: '#FFB300' },
    TSLA: { name: 'Tesla',     sector: '消费', pe: 62.4, pb: 10.9, ps: 6.7,  ev_ebitda: 48.1, color: '#FF3058' },
  };
  const METRICS = ['pe','pb','ps','ev_ebitda'];
  const LABELS  = { pe:'P/E', pb:'P/B', ps:'P/S', ev_ebitda:'EV/EBITDA' };
  const MAXES   = { pe:80,    pb:60,    ps:16,    ev_ebitda:60 };

  let selected = Object.keys(STOCKS);

  function hexRgba(hex, a) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function drawRadar(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth || 280;
    const H = W;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    const cx = W/2, cy = H/2, R = Math.min(cx,cy) - 36;
    const N = METRICS.length;
    const angles = METRICS.map((_,i) => Math.PI*2*i/N - Math.PI/2);
    ctx.clearRect(0,0,W,H);

    // Grid rings
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      angles.forEach((a,i) => { const r = R*ring/4; const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.closePath();
      ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=1; ctx.stroke();
    }
    angles.forEach(a => {
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(a)*R, cy+Math.sin(a)*R);
      ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1; ctx.stroke();
    });

    // Axis labels
    ctx.font='bold 11px JetBrains Mono,monospace'; ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.textAlign='center'; ctx.textBaseline='middle';
    METRICS.forEach((m,i) => {
      const a=angles[i], lx=cx+Math.cos(a)*(R+20), ly=cy+Math.sin(a)*(R+20);
      ctx.fillText(LABELS[m], lx, ly);
    });

    // Data polygons
    selected.forEach(ticker => {
      const s = STOCKS[ticker]; if (!s) return;
      ctx.beginPath();
      METRICS.forEach((m,i) => {
        const ratio = Math.min(s[m]/MAXES[m],1);
        const x=cx+Math.cos(angles[i])*R*ratio, y=cy+Math.sin(angles[i])*R*ratio;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.closePath();
      ctx.fillStyle=hexRgba(s.color,0.15); ctx.fill();
      ctx.strokeStyle=s.color; ctx.lineWidth=2; ctx.stroke();
      METRICS.forEach((m,i) => {
        const ratio=Math.min(s[m]/MAXES[m],1), x=cx+Math.cos(angles[i])*R*ratio, y=cy+Math.sin(angles[i])*R*ratio;
        ctx.fillStyle=s.color; ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2); ctx.fill();
      });
    });
  }

  function buildUI(area) {
    area.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px" id="pec-check-row">
        ${Object.entries(STOCKS).map(([t,s]) => `
          <label style="display:flex;align-items:center;gap:5px;font-family:var(--font-mono);font-size:12px;font-weight:700;cursor:pointer;padding:4px 10px;border:1px solid ${s.color}44;border-radius:99px;transition:all 0.2s" data-ticker="${t}">
            <input type="checkbox" value="${t}" checked style="display:none">
            <span style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0"></span>
            ${t} <small style="font-weight:400;color:var(--ink-muted)">${s.name}</small>
          </label>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
        <canvas id="pec-radar" style="width:100%;aspect-ratio:1;display:block"></canvas>
        <div id="pec-bars"></div>
      </div>
    `;
    // Style selected
    area.querySelectorAll('[data-ticker]').forEach(lbl => {
      const ticker = lbl.dataset.ticker;
      const cb = lbl.querySelector('input');
      const update = () => {
        selected = Array.from(area.querySelectorAll('input[type=checkbox]:checked')).map(c=>c.value);
        if (selected.length===0){cb.checked=true; selected=[ticker];}
        lbl.style.background = cb.checked ? hexRgba(STOCKS[ticker].color,0.12) : 'transparent';
        render(area);
      };
      lbl.style.background = hexRgba(STOCKS[ticker].color,0.12);
      cb.addEventListener('change', update);
      lbl.addEventListener('click', e => { if (e.target===lbl){cb.checked=!cb.checked; update();} });
    });
  }

  function renderBars(container) {
    const el = document.getElementById('pec-bars');
    if (!el) return;
    el.innerHTML = METRICS.map(m => `
      <div style="margin-bottom:14px">
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--amber);margin-bottom:8px">${LABELS[m]}</div>
        ${selected.map(t => {
          const s=STOCKS[t]; if(!s)return'';
          const pct=Math.min(s[m]/MAXES[m]*100,100).toFixed(0);
          return `<div style="display:grid;grid-template-columns:44px 1fr 44px;gap:8px;align-items:center;margin-bottom:4px">
            <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${s.color}">${t}</span>
            <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${s.color};border-radius:99px;transition:width 0.4s ease"></div>
            </div>
            <span style="font-family:var(--font-mono);font-size:11px;text-align:right;color:var(--ink-secondary)">${s[m]}</span>
          </div>`;
        }).join('')}
      </div>`).join('');
  }

  function render(area) {
    const canvas = document.getElementById('pec-radar');
    if (canvas) drawRadar(canvas);
    renderBars(area);
  }

  function init() {
    const area = document.getElementById('pe-chart-area');
    if (!area) return;
    buildUI(area);
    render(area);
    window.addEventListener('resize', () => render(area));
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',init)
    : init();
})();
