(() => {
  const PATTERNS = [
    {
      name: '锤子线',
      en: 'Hammer',
      signal: '看涨',
      signalClass: 'bullish',
      desc: '下影线长（≥实体2倍），出现在下跌末期，表示空方打压后多方强力反弹，常为底部反转信号。',
      candles: [
        { o: 0.55, h: 0.58, l: 0.1, c: 0.57, bull: true },
      ],
    },
    {
      name: '射击之星',
      en: 'Shooting Star',
      signal: '看跌',
      signalClass: 'bearish',
      desc: '上影线长（≥实体2倍），出现在上涨末期，表示多方拉升后被空方强力打回，常为顶部反转信号。',
      candles: [
        { o: 0.45, h: 0.9, l: 0.42, c: 0.43, bull: false },
      ],
    },
    {
      name: '看涨吞没',
      en: 'Bullish Engulfing',
      signal: '看涨',
      signalClass: 'bullish',
      desc: '第二根阳线实体完全吞没第一根阴线实体，反转信号强烈，尤其出现在支撑位时。',
      candles: [
        { o: 0.6, h: 0.65, l: 0.45, c: 0.5, bull: false },
        { o: 0.44, h: 0.72, l: 0.42, c: 0.68, bull: true },
      ],
    },
    {
      name: '看跌吞没',
      en: 'Bearish Engulfing',
      signal: '看跌',
      signalClass: 'bearish',
      desc: '第二根阴线实体完全吞没第一根阳线实体，出现在阻力位时是强烈的做空信号。',
      candles: [
        { o: 0.4, h: 0.6, l: 0.38, c: 0.55, bull: true },
        { o: 0.58, h: 0.6, l: 0.32, c: 0.35, bull: false },
      ],
    },
    {
      name: '十字星',
      en: 'Doji',
      signal: '中性',
      signalClass: 'neutral',
      desc: '开盘价≈收盘价，形成"+"字形，代表多空力量均衡，市场陷入犹豫，趋势可能转变。',
      candles: [
        { o: 0.5, h: 0.75, l: 0.25, c: 0.5, bull: true },
      ],
    },
    {
      name: '早晨之星',
      en: 'Morning Star',
      signal: '看涨',
      signalClass: 'bullish',
      desc: '三根K线组合：长阴→小星星→长阳，经典底部反转，中间星星体现犹豫，第三根确认多方回归。',
      candles: [
        { o: 0.7, h: 0.72, l: 0.48, c: 0.5, bull: false },
        { o: 0.46, h: 0.5,  l: 0.4,  c: 0.44, bull: false },
        { o: 0.44, h: 0.72, l: 0.42, c: 0.68, bull: true },
      ],
    },
    {
      name: '黄昏之星',
      en: 'Evening Star',
      signal: '看跌',
      signalClass: 'bearish',
      desc: '三根K线组合：长阳→小星星→长阴，经典顶部反转，第三根大阴线确认空方主导。',
      candles: [
        { o: 0.3, h: 0.52, l: 0.28, c: 0.5, bull: true },
        { o: 0.53, h: 0.6,  l: 0.5,  c: 0.56, bull: true },
        { o: 0.57, h: 0.59, l: 0.32, c: 0.35, bull: false },
      ],
    },
    {
      name: '三白兵',
      en: 'Three White Soldiers',
      signal: '看涨',
      signalClass: 'bullish',
      desc: '连续三根阳线，每根均高开高收，收盘在前一根上方，表明多方持续强势。',
      candles: [
        { o: 0.3, h: 0.48, l: 0.28, c: 0.46, bull: true },
        { o: 0.46, h: 0.62, l: 0.44, c: 0.6,  bull: true },
        { o: 0.6,  h: 0.78, l: 0.58, c: 0.75, bull: true },
      ],
    },
    {
      name: '三只乌鸦',
      en: 'Three Black Crows',
      signal: '看跌',
      signalClass: 'bearish',
      desc: '连续三根阴线，每根均低开低收，表明空方持续掌控，下跌趋势确认。',
      candles: [
        { o: 0.7, h: 0.72, l: 0.54, c: 0.55, bull: false },
        { o: 0.55, h: 0.57, l: 0.4,  c: 0.42, bull: false },
        { o: 0.42, h: 0.44, l: 0.26, c: 0.28, bull: false },
      ],
    },
    {
      name: '孕育线',
      en: 'Harami',
      signal: '中性',
      signalClass: 'neutral',
      desc: '第二根K线实体完全在第一根实体内（反向），代表趋势减弱，需等待后续确认信号。',
      candles: [
        { o: 0.65, h: 0.68, l: 0.38, c: 0.4,  bull: false },
        { o: 0.46, h: 0.58, l: 0.44, c: 0.56, bull: true },
      ],
    },
    {
      name: '平头顶部',
      en: 'Tweezers Top',
      signal: '看跌',
      signalClass: 'bearish',
      desc: '两根K线最高点几乎相同，形成双重阻力，表示价格在该水平遇到强烈抛压。',
      candles: [
        { o: 0.42, h: 0.72, l: 0.40, c: 0.68, bull: true },
        { o: 0.7,  h: 0.72, l: 0.42, c: 0.45, bull: false },
      ],
    },
    {
      name: '上升窗口',
      en: 'Rising Window',
      signal: '看涨',
      signalClass: 'bullish',
      desc: '后一根K线的最低价高于前一根K线的最高价，留下跳空缺口，形成强势支撑区域。',
      candles: [
        { o: 0.3, h: 0.48, l: 0.28, c: 0.46, bull: true },
        { o: 0.55, h: 0.75, l: 0.53, c: 0.72, bull: true },
      ],
    },
  ];

  function drawCandleChart(canvas, candles) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth || 120;
    const H = canvas.clientHeight || 90;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, W, H);

    const n = candles.length;
    const padX = 12, padY = 8;
    const slotW = (W - padX * 2) / n;
    const bodyW = Math.min(slotW * 0.6, 20);

    candles.forEach((c, i) => {
      const x = padX + slotW * i + slotW / 2;
      const yHigh = padY + (1 - c.h) * (H - padY * 2);
      const yLow  = padY + (1 - c.l) * (H - padY * 2);
      const yOpen = padY + (1 - c.o) * (H - padY * 2);
      const yClose = padY + (1 - c.c) * (H - padY * 2);
      const color = c.bull ? '#00C46E' : '#FF3058';

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      const top = Math.min(yOpen, yClose);
      const bottom = Math.max(yOpen, yClose);
      const bh = Math.max(bottom - top, 2);
      ctx.fillStyle = c.bull ? '#00C46E' : '#FF3058';
      ctx.fillRect(x - bodyW / 2, top, bodyW, bh);
    });
  }

  function createCard(pattern) {
    const card = document.createElement('div');
    card.className = 'kline-card';
    card.dataset.pattern = pattern.name;

    const canvas = document.createElement('canvas');
    canvas.className = 'kline-thumb';
    canvas.width = 120;
    canvas.height = 90;
    card.appendChild(canvas);

    const info = document.createElement('div');
    info.className = 'kline-card-info';
    info.innerHTML = `
      <div class="kline-card-name">${pattern.name} <small>${pattern.en}</small></div>
      <span class="kline-signal kline-${pattern.signalClass}">${pattern.signal}</span>
    `;
    card.appendChild(info);

    setTimeout(() => drawCandleChart(canvas, pattern.candles), 0);
    return card;
  }

  function createModal() {
    const modal = document.createElement('div');
    modal.id = 'kline-modal';
    modal.className = 'kline-modal-overlay';
    modal.innerHTML = `
      <div class="kline-modal-box">
        <button class="kline-modal-close" aria-label="关闭">&times;</button>
        <canvas id="kline-modal-canvas" width="240" height="180"></canvas>
        <div class="kline-modal-body">
          <h3 class="kline-modal-title"></h3>
          <span class="kline-modal-signal"></span>
          <p class="kline-modal-desc"></p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.kline-modal-close').addEventListener('click', () => {
      modal.classList.remove('open');
    });
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('open');
    });
    return modal;
  }

  function openModal(pattern, modal) {
    const canvas = modal.querySelector('#kline-modal-canvas');
    drawCandleChart(canvas, pattern.candles);
    modal.querySelector('.kline-modal-title').textContent = `${pattern.name} · ${pattern.en}`;
    modal.querySelector('.kline-modal-signal').textContent = pattern.signal;
    modal.querySelector('.kline-modal-signal').className = `kline-modal-signal kline-${pattern.signalClass}`;
    modal.querySelector('.kline-modal-desc').textContent = pattern.desc;
    modal.classList.add('open');
  }

  function init() {
    // Support both id="kline-gallery" (inner grid div) and id="kline-gallery-tool" (outer container)
    const container = document.getElementById('kline-gallery') || document.getElementById('kline-gallery-tool');
    if (!container) return;

    // Use container directly if it already has grid styling (.kline-gallery), else create grid child
    const isGrid = container.classList.contains('kline-gallery') || container.classList.contains('kline-grid');
    const grid = isGrid ? container : (() => {
      const g = document.createElement('div');
      g.className = 'kline-grid';
      container.appendChild(g);
      return g;
    })();

    // Apply grid styles directly if needed
    if (isGrid && !grid.style.display) {
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(130px, 1fr))';
      grid.style.gap = '12px';
    }

    const modal = createModal();

    PATTERNS.forEach(pattern => {
      const card = createCard(pattern);
      card.addEventListener('click', () => openModal(pattern, modal));
      grid.appendChild(card);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
