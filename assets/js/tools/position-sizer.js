(() => {
  const $ = id => document.getElementById(id);

  function calcFixed(capital, riskPct, entry, stop) {
    const riskAmt = capital * riskPct / 100;
    const riskPerShare = Math.abs(entry - stop);
    if (riskPerShare <= 0) return { shares:0, value:0, riskAmt };
    const shares = Math.floor(riskAmt / riskPerShare);
    return { shares, value: shares * entry, riskAmt: shares * riskPerShare };
  }

  function kelly(winRate, ratio) {
    const p = winRate / 100, q = 1 - p, b = ratio;
    if (b <= 0) return 0;
    return Math.max(0, p - q / b);
  }

  function setTxt(id, txt) { const el=$(id); if(el) el.textContent=txt; }
  function fmtUSD(v) { return '$'+Math.round(v).toLocaleString(); }

  function updateFixed() {
    const capital  = parseFloat($('ps-capital')?.value)   || 100000;
    const riskPct  = parseFloat($('ps-risk-pct')?.value)  || 1;
    const entry    = parseFloat($('ps-entry')?.value)     || 100;
    const stop     = parseFloat($('ps-stop')?.value)      || 95;
    const res = calcFixed(capital, riskPct, entry, stop);
    setTxt('ps-r-risk',   fmtUSD(res.riskAmt));
    setTxt('ps-r-shares', res.shares + ' 股');
    setTxt('ps-r-value',  fmtUSD(res.value));
    setTxt('ps-r-pct',    capital > 0 ? (res.value / capital * 100).toFixed(1) + '%' : '—');
    const shareEl = $('ps-r-shares');
    if (shareEl) shareEl.className = 'position-row-value highlight';
  }

  function updateKelly() {
    const winRate = parseFloat($('ps-winrate')?.value)      || 55;
    const ratio   = parseFloat($('ps-ratio')?.value)        || 2;
    const capital = parseFloat($('ps-kelly-capital')?.value)|| 100000;

    const k      = kelly(winRate, ratio);
    const halfK  = k / 2;
    const evPer1 = (winRate/100)*ratio - (1 - winRate/100);
    const posSize= capital * halfK;

    // Inject Kelly result into the result panel (reuse existing IDs)
    setTxt('ps-r-risk',   (k*100).toFixed(1) + '% (全Kelly)');
    setTxt('ps-r-shares', (halfK*100).toFixed(1) + '% (Half-Kelly)');
    setTxt('ps-r-value',  fmtUSD(posSize));
    setTxt('ps-r-pct',    evPer1 >= 0 ? '+$' + evPer1.toFixed(2) + '/风险$1' : '$' + evPer1.toFixed(2));

    const lbls = ['最大风险金额','建议买入股数','持仓总价值','占总资金比例'];
    const kellyLbls = ['全Kelly仓位','Half-Kelly（推荐）','Half-Kelly金额','期望值'];
    const rows = document.querySelectorAll('#ps-result .position-row-label');
    rows.forEach((el,i) => { el.textContent = kellyLbls[i] || el.textContent; });
    // Color
    const pctEl=$('ps-r-pct');
    if(pctEl) pctEl.style.color = evPer1>=0?'var(--green)':'var(--red)';

    // Update labels back when leaving kelly tab
    window._psOrigLabels = window._psOrigLabels || Array.from(rows).map(el=>el.textContent);
  }

  function init() {
    const container = $('position-sizer-tool');
    if (!container) return;

    const tabs    = container.querySelectorAll('.tool-tab[data-tab]');
    const tabFixed = $('ps-tab-fixed');
    const tabKelly = $('ps-tab-kelly');
    let activeTab = 'fixed';

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        if (tabFixed) tabFixed.style.display = activeTab==='fixed' ? '' : 'none';
        if (tabKelly) tabKelly.style.display = activeTab==='kelly' ? '' : 'none';

        // Restore original labels when switching to fixed
        const rows = container.querySelectorAll('#ps-result .position-row-label');
        if (activeTab==='fixed') {
          const orig=['最大风险金额','建议买入股数','持仓总价值','占总资金比例'];
          rows.forEach((el,i)=>{ el.textContent=orig[i]; });
          const pctEl=$('ps-r-pct');
          if(pctEl) pctEl.style.color='';
          updateFixed();
        } else {
          updateKelly();
        }
      });
    });

    // Fixed tab inputs
    ['ps-capital','ps-risk-pct','ps-entry','ps-stop'].forEach(id => {
      $(id)?.addEventListener('input', () => { if(activeTab==='fixed') updateFixed(); });
    });
    // Kelly tab inputs
    ['ps-winrate','ps-ratio','ps-kelly-capital'].forEach(id => {
      $(id)?.addEventListener('input', () => { if(activeTab==='kelly') updateKelly(); });
    });

    updateFixed();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
