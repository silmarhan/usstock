(() => {
  const $ = id => document.getElementById(id);

  function calcGrowth(P, rAnnual, years, monthly) {
    const r = rAnnual / 100 / 12;
    const months = years * 12;
    const points = [];
    let v = P;
    for (let m = 0; m <= months; m++) {
      if (m % 12 === 0 || m === months) points.push({ year: m / 12, value: v });
      if (m < months) v = v * (1 + r) + monthly;
    }
    return points;
  }

  function drawChart(canvas, points, P, monthly) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth || 800;
    const H = canvas.clientHeight || 280;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 20, right: 20, bottom: 36, left: 70 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;
    const maxVal = Math.max(...points.map(p => p.value));
    const maxYr = points[points.length - 1].year;

    const xS = yr => pad.left + (yr / maxYr) * cw;
    const yV = v  => pad.top + ch - (v / maxVal) * ch;

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const y = pad.top + ch * i / 4;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
    }

    // Invested line (dashed amber)
    ctx.strokeStyle = 'rgba(255,179,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    points.forEach((p, i) => {
      const invested = P + monthly * p.year * 12;
      const x = xS(p.year), y = yV(Math.min(invested, maxVal));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
    grad.addColorStop(0, 'rgba(255,179,0,0.18)');
    grad.addColorStop(1, 'rgba(255,179,0,0.02)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(xS(0), yV(points[0].value));
    points.forEach(p => ctx.lineTo(xS(p.year), yV(p.value)));
    ctx.lineTo(xS(maxYr), pad.top + ch);
    ctx.lineTo(xS(0), pad.top + ch);
    ctx.closePath();
    ctx.fill();

    // Growth line
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((p, i) => { i === 0 ? ctx.moveTo(xS(p.year), yV(p.value)) : ctx.lineTo(xS(p.year), yV(p.value)); });
    ctx.stroke();

    // Y labels
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const v = maxVal * (4 - i) / 4;
      ctx.fillText(fmtK(v), pad.left - 6, pad.top + ch * i / 4 + 4);
    }

    // X labels
    ctx.textAlign = 'center';
    [0, Math.round(maxYr / 2), maxYr].forEach(yr => {
      ctx.fillText(yr + '年', xS(yr), pad.top + ch + 20);
    });

    // End dot
    const last = points[points.length - 1];
    ctx.fillStyle = '#FFB300';
    ctx.beginPath();
    ctx.arc(xS(last.year), yV(last.value), 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function fmtK(v) {
    if (v >= 1e8) return (v / 1e8).toFixed(1) + '亿';
    if (v >= 1e4) return (v / 1e4).toFixed(1) + '万';
    return Math.round(v).toLocaleString();
  }

  function fmtUSD(v) {
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
    return '$' + Math.round(v).toLocaleString();
  }

  function update() {
    const P       = parseFloat($('cc-principal')?.value) || 10000;
    const rate    = parseFloat($('cc-rate')?.value)      || 10;
    const years   = parseInt($('cc-years')?.value)       || 20;
    const monthly = parseFloat($('cc-monthly')?.value)   || 0;

    const points = calcGrowth(P, rate, years, monthly);
    const final  = points[points.length - 1].value;
    const invested = P + monthly * years * 12;
    const gain   = final - invested;

    const setTxt = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };
    setTxt('cc-total',    fmtUSD(final));
    setTxt('cc-invested', fmtUSD(invested));
    setTxt('cc-gain',     '+' + fmtUSD(gain));
    setTxt('cc-multiple', (final / invested).toFixed(1) + '×');

    const gainEl = $('cc-gain');
    if (gainEl) gainEl.className = 'result-value positive';

    const canvas = $('cc-chart');
    if (canvas) drawChart(canvas, points, P, monthly);
  }

  function init() {
    if (!$('compound-calc')) return;
    ['cc-principal','cc-rate','cc-years','cc-monthly'].forEach(id => {
      $( id)?.addEventListener('input', update);
    });
    update();
    window.addEventListener('resize', update);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
