(() => {
  const NS = 'http://www.w3.org/2000/svg';

  const STEPS = [
    {
      btnId: 'cf-btn-income',
      title: '① 收入 → 利润',
      color: '#FFB300',
      nodes: ['营收\nRevenue','成本\nCOGS','毛利\nGross P','运营费\nOpEx','净利润\nNet Inc'],
      flows: [[0,1,'减：销售成本'],[0,2,'= 毛利润'],[2,3,'减：运营费用'],[2,4,'= 净利润']],
      desc: '营收减去销货成本得到毛利润，毛利润再减运营费用（研发+销售+管理）和税，得到净利润。'
    },
    {
      btnId: 'cf-btn-balance',
      title: '② 资产 = 负债 + 权益',
      color: '#00C46E',
      nodes: ['流动资产\nCurrent A','非流动\nNon-curr','总资产\nAssets','负债\nLiabilities','股东权益\nEquity'],
      flows: [[0,2,'+'],[1,2,'+'],[2,3,'='],[2,4,'=']],
      desc: '资产负债表恒等式：总资产 = 总负债 + 股东权益。左边是资产，右边是资金来源（借的+自己的）。'
    },
    {
      btnId: 'cf-btn-cashflow',
      title: '③ 净利润 → FCF',
      color: '#7FB3D3',
      nodes: ['净利润\nNet Inc','+ 折旧\n+D&A','- 营运资金\n±WC','经营现金流\nCFO','- CapEx\nCapEx','自由现金流\nFCF'],
      flows: [[0,1,'非现金加回'],[1,2,'应收/应付调整'],[2,3,'= 经营现金流'],[3,4,'减：资本支出'],[4,5,'= 自由现金流']],
      desc: '净利润加回折旧（不花钱的费用），调整营运资金，得到经营现金流。再减资本支出，就是巴菲特最看重的 FCF。'
    }
  ];

  function buildSVG(step) {
    const svg = document.createElementNS(NS,'svg');
    const nodeCount = step.nodes.length;
    const W = 560, H = 160;
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
    svg.setAttribute('width','100%');

    const slotW = W / nodeCount;
    const nodeW = Math.min(slotW * 0.72, 88);
    const nodeH = 52;
    const cy = H / 2;

    const positions = step.nodes.map((_,i) => ({
      x: slotW * i + slotW / 2,
      y: cy
    }));

    // Arrows
    step.flows.forEach(([from, to]) => {
      const fx = positions[from].x + nodeW/2;
      const tx = positions[to].x - nodeW/2;
      if (tx <= fx) return;
      const line = document.createElementNS(NS,'line');
      line.setAttribute('x1', fx); line.setAttribute('y1', cy);
      line.setAttribute('x2', tx - 6); line.setAttribute('y2', cy);
      line.setAttribute('stroke', step.color + '55');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('marker-end', 'url(#arr)');
      svg.appendChild(line);
    });

    // Arrow marker
    const defs = document.createElementNS(NS,'defs');
    const marker = document.createElementNS(NS,'marker');
    marker.setAttribute('id','arr'); marker.setAttribute('markerWidth','8'); marker.setAttribute('markerHeight','8');
    marker.setAttribute('refX','6'); marker.setAttribute('refY','3'); marker.setAttribute('orient','auto');
    const poly = document.createElementNS(NS,'polygon');
    poly.setAttribute('points','0 0, 6 3, 0 6'); poly.setAttribute('fill', step.color + '88');
    marker.appendChild(poly); defs.appendChild(marker); svg.insertBefore(defs, svg.firstChild);

    // Nodes
    step.nodes.forEach((label, i) => {
      const { x, y } = positions[i];
      const g = document.createElementNS(NS,'g');

      const rect = document.createElementNS(NS,'rect');
      rect.setAttribute('x', x - nodeW/2); rect.setAttribute('y', y - nodeH/2);
      rect.setAttribute('width', nodeW); rect.setAttribute('height', nodeH);
      rect.setAttribute('rx', '6');
      rect.setAttribute('fill', i === step.nodes.length-1 ? step.color + '22' : '#16161A');
      rect.setAttribute('stroke', i === step.nodes.length-1 ? step.color : 'rgba(255,255,255,0.1)');
      rect.setAttribute('stroke-width', i === step.nodes.length-1 ? '1.5' : '1');
      g.appendChild(rect);

      const lines = label.split('\n');
      lines.forEach((txt, li) => {
        const t = document.createElementNS(NS,'text');
        t.setAttribute('x', x); t.setAttribute('y', y + (li===0 ? -6 : 10));
        t.setAttribute('text-anchor','middle'); t.setAttribute('dominant-baseline','middle');
        t.setAttribute('fill', li===0 ? (i===step.nodes.length-1 ? step.color : '#ECEAE5') : 'rgba(255,255,255,0.38)');
        t.setAttribute('font-size', li===0 ? '11' : '9');
        t.setAttribute('font-family', li===0 ? 'Noto Serif SC, serif' : 'JetBrains Mono, monospace');
        t.setAttribute('font-weight', li===0 ? '600' : '400');
        t.textContent = txt;
        g.appendChild(t);
      });

      svg.appendChild(g);
    });

    return svg;
  }

  function init() {
    const container = document.getElementById('cashflow-anim');
    if (!container) return;

    const area = document.getElementById('cashflow-svg-area');
    if (!area) return;

    let descEl = container.querySelector('.cf-step-desc');
    if (!descEl) {
      descEl = document.createElement('p');
      descEl.className = 'cf-step-desc';
      descEl.style.cssText = 'margin-top:12px;font-size:0.88rem;color:var(--ink-secondary);line-height:1.7;padding:12px 16px;border-left:3px solid var(--amber);font-family:var(--font-serif)';
      container.appendChild(descEl);
    }

    function activate(step) {
      area.innerHTML = '';
      const svg = buildSVG(step);
      area.appendChild(svg);
      descEl.textContent = step.desc;
      descEl.style.borderLeftColor = step.color;

      STEPS.forEach(s => {
        const btn = document.getElementById(s.btnId);
        if (btn) {
          btn.style.background = s === step ? step.color + '22' : '';
          btn.style.borderColor = s === step ? step.color : '';
          btn.style.color = s === step ? step.color : '';
        }
      });
    }

    STEPS.forEach(step => {
      const btn = document.getElementById(step.btnId);
      if (btn) btn.addEventListener('click', () => activate(step));
    });

    activate(STEPS[0]);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
