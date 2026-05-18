(() => {
  const STRATEGIES = {
    'covered-call': {
      desc: '持股100股 + 卖出1份看涨期权。收取权利金，上行收益封顶。',
      legs: (S, K) => [
        { type:'stock', qty:1, cost:S },
        { type:'call',  qty:-1, K:K, prem: S*0.04 },
      ]
    },
    'csp': {
      desc: '卖出看跌期权（现金担保）。收取权利金，被行权时以执行价买入股票。',
      legs: (S, K) => [{ type:'put', qty:-1, K:K, prem: S*0.035 }]
    },
    'bull-call': {
      desc: '买低执行价Call + 卖高执行价Call。降低成本，锁定最大利润。',
      legs: (S, K) => [
        { type:'call', qty:1,  K:K,       prem: S*0.05 },
        { type:'call', qty:-1, K:K*1.08,  prem: S*0.02 },
      ]
    },
    'iron-condor': {
      desc: '卖出Bull Put Spread + 卖出Bear Call Spread。在区间内收双向权利金。',
      legs: (S, K) => [
        { type:'put',  qty:1,  K:K*0.88, prem: S*0.01 },
        { type:'put',  qty:-1, K:K*0.94, prem: S*0.03 },
        { type:'call', qty:-1, K:K*1.06, prem: S*0.03 },
        { type:'call', qty:1,  K:K*1.12, prem: S*0.01 },
      ]
    },
    'straddle': {
      desc: '买入相同执行价的Call和Put。押注大幅波动，不赌方向。',
      legs: (S, K) => [
        { type:'call', qty:1, K:K, prem: S*0.05 },
        { type:'put',  qty:1, K:K, prem: S*0.05 },
      ]
    },
    'long-call': {
      desc: '买入看涨期权。风险=权利金，潜在收益无上限。',
      legs: (S, K) => [{ type:'call', qty:1, K:K, prem: S*0.05 }]
    },
  };

  function legPnl(leg, S) {
    if (leg.type==='stock') return leg.qty * (S - leg.cost) * 100;
    if (leg.type==='call')  return leg.qty * (Math.max(S - leg.K, 0) - leg.prem) * 100;
    if (leg.type==='put')   return leg.qty * (Math.max(leg.K - S, 0) - leg.prem) * 100;
    return 0;
  }

  function totalPnl(legs, S) { return legs.reduce((s,l)=>s+legPnl(l,S),0); }

  function findBreakEvens(legs, Smin, Smax) {
    const bes=[]; let prev=totalPnl(legs,Smin);
    for(let i=1;i<=1000;i++){
      const S=Smin+(Smax-Smin)*i/1000, pnl=totalPnl(legs,S);
      if(Math.sign(pnl)!==Math.sign(prev)&&prev!==0) bes.push(S);
      prev=pnl;
    }
    return bes;
  }

  function draw(canvas, legs, S, K) {
    const ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    const W=canvas.clientWidth||800, H=canvas.clientHeight||320;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);

    const Smin=K*0.65, Smax=K*1.35;
    const N=300;
    const xs=Array.from({length:N+1},(_,i)=>Smin+(Smax-Smin)*i/N);
    const pnls=xs.map(x=>totalPnl(legs,x));
    const maxP=Math.max(...pnls,0.01), minP=Math.min(...pnls,-0.01);
    const range=maxP-minP||1;

    const pad={top:16,right:16,bottom:36,left:70};
    const cw=W-pad.left-pad.right, ch=H-pad.top-pad.bottom;
    const xS=v=>pad.left+(v-Smin)/(Smax-Smin)*cw;
    const yP=v=>pad.top+ch-(v-minP)/range*ch;

    // Zero line
    ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(pad.left,yP(0)); ctx.lineTo(pad.left+cw,yP(0)); ctx.stroke();
    ctx.setLineDash([]);

    // Strike
    ctx.strokeStyle='rgba(255,179,0,0.25)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(xS(K),pad.top); ctx.lineTo(xS(K),pad.top+ch); ctx.stroke();
    ctx.setLineDash([]);

    // Current S
    ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(xS(S),pad.top); ctx.lineTo(xS(S),pad.top+ch); ctx.stroke();

    // Fill areas
    const fill=(filterFn,color)=>{
      let started=false; ctx.beginPath(); ctx.fillStyle=color;
      xs.forEach((x,i)=>{
        const pnl=pnls[i], px=xS(x), py=yP(pnl), zy=yP(0);
        if(filterFn(pnl)){ if(!started){ctx.moveTo(px,zy);ctx.lineTo(px,py);started=true;}else ctx.lineTo(px,py); }
        else if(started){ctx.lineTo(px,zy);started=false;}
      });
      if(started){ctx.lineTo(xS(xs[xs.length-1]),yP(0));} ctx.fill();
    };
    fill(p=>p>0,'rgba(0,196,110,0.12)'); fill(p=>p<0,'rgba(255,48,88,0.12)');

    // P&L line
    ctx.lineWidth=2.5; ctx.lineJoin='round';
    let prevPnl=pnls[0];
    xs.forEach((x,i)=>{
      const pnl=pnls[i], px=xS(x), py=yP(pnl);
      if(i===0){ctx.beginPath();ctx.moveTo(px,py);ctx.strokeStyle=pnl>=0?'#00C46E':'#FF3058';return;}
      if((pnl>=0)!==(prevPnl>=0)){
        const cx2=xS(xs[i-1]+(0-prevPnl)/(pnl-prevPnl)*(x-xs[i-1]));
        ctx.lineTo(cx2,yP(0)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx2,yP(0));
        ctx.strokeStyle=pnl>=0?'#00C46E':'#FF3058';
      }
      ctx.lineTo(px,py);
      prevPnl=pnl;
    });
    ctx.stroke();

    // Axes
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px JetBrains Mono,monospace';
    ctx.textAlign='right';
    [minP,0,maxP].forEach(v=>{
      if(Math.abs(v)>0.5) ctx.fillText((v>=0?'+':'')+Math.round(v),pad.left-6,yP(v)+4);
    });
    ctx.textAlign='center';
    [Smin,K,Smax].forEach(v=>ctx.fillText('$'+Math.round(v),xS(v),pad.top+ch+20));

    // Breakeven dots
    findBreakEvens(legs,Smin,Smax).forEach(be=>{
      ctx.fillStyle='#FFB300'; ctx.beginPath(); ctx.arc(xS(be),yP(0),5,0,Math.PI*2); ctx.fill();
    });

    return {maxP, minP, bes: findBreakEvens(legs,Smin,Smax)};
  }

  function init() {
    const container=document.getElementById('payoff-builder-tool');
    if(!container) return;

    const canvas=document.getElementById('payoff-canvas');
    const stockEl=document.getElementById('pb-stock');
    const strikeEl=document.getElementById('pb-strike');
    const maxProfitEl=document.getElementById('max-profit');
    const maxLossEl=document.getElementById('max-loss');
    const breakevenEl=document.getElementById('breakeven');
    const stratBtns=container.querySelectorAll('.payoff-strategy-btn');
    let activeStrategy='covered-call';

    // Add desc element
    let descEl=container.querySelector('#pb-strat-desc');
    if(!descEl){
      descEl=document.createElement('p');
      descEl.id='pb-strat-desc';
      descEl.style.cssText='font-size:0.85rem;color:var(--ink-muted);font-style:italic;margin:8px 0 12px;min-height:2.5em;font-family:var(--font-serif)';
      const selectDiv=container.querySelector('.payoff-strategy-select');
      selectDiv?.after(descEl);
    }

    function render(){
      const S=parseFloat(stockEl?.value)||100;
      const K=parseFloat(strikeEl?.value)||105;

      // Update display labels
      const sv=container.querySelector('#pb-stock-val');
      const kv=container.querySelector('#pb-strike-val');
      if(sv) sv.textContent='$'+S;
      if(kv) kv.textContent='$'+K;

      const strat=STRATEGIES[activeStrategy];
      if(descEl&&strat) descEl.textContent=strat.desc;
      const legs=strat.legs(S,K);

      if(canvas){
        const info=draw(canvas,legs,S,K);
        const inf=999999;
        if(maxProfitEl) maxProfitEl.textContent = info.maxP>inf-1?'无上限':'+$'+Math.round(info.maxP);
        if(maxLossEl)   maxLossEl.textContent   = info.minP<-inf+1?'无上限':'$'+Math.round(info.minP);
        if(breakevenEl) breakevenEl.textContent  = info.bes.length?info.bes.map(b=>'$'+b.toFixed(1)).join(' / '):'N/A';
        if(maxProfitEl) maxProfitEl.className='result-value positive';
        if(maxLossEl)   maxLossEl.className='result-value negative';
      }
    }

    stratBtns.forEach(btn=>{
      btn.addEventListener('click',()=>{
        stratBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        activeStrategy=btn.dataset.strategy;
        render();
      });
    });

    stockEl?.addEventListener('input',render);
    strikeEl?.addEventListener('input',render);
    render();
    window.addEventListener('resize',render);
  }

  document.readyState==='loading'
    ?document.addEventListener('DOMContentLoaded',init)
    :init();
})();
