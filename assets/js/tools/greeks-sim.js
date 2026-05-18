(() => {
  function normcdf(x) {
    const a=[0.254829592,-0.284496736,1.421413741,-1.453152027,1.061405429], p=0.3275911;
    const sign=x<0?-1:1, t=1/(1+p*Math.abs(x));
    const y=1-(((((a[4]*t+a[3])*t+a[2])*t+a[1])*t+a[0])*t)*Math.exp(-x*x/2);
    return 0.5*(1+sign*y);
  }
  function normpdf(x){ return Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI); }

  function bs(S,K,T,r,sigma,isCall){
    if(T<=0.001){
      const iv=isCall?Math.max(S-K,0):Math.max(K-S,0);
      return{price:iv,delta:isCall?(S>K?1:0):(S<K?-1:0),gamma:0,theta:0,vega:0};
    }
    const d1=(Math.log(S/K)+(r+0.5*sigma*sigma)*T)/(sigma*Math.sqrt(T));
    const d2=d1-sigma*Math.sqrt(T);
    const eRT=Math.exp(-r*T);
    const Nd1=normcdf(d1),Nd2=normcdf(d2),pd1=normpdf(d1);
    const price=isCall?S*Nd1-K*eRT*Nd2:K*eRT*normcdf(-d2)-S*normcdf(-d1);
    const delta=isCall?Nd1:Nd1-1;
    const gamma=pd1/(S*sigma*Math.sqrt(T));
    const theta=isCall?(-(S*pd1*sigma)/(2*Math.sqrt(T))-r*K*eRT*Nd2)/365
                      :(-(S*pd1*sigma)/(2*Math.sqrt(T))+r*K*eRT*normcdf(-d2))/365;
    const vega=S*pd1*Math.sqrt(T)/100;
    return{price:Math.max(price,0),delta,gamma,theta,vega};
  }

  function init(){
    const container=document.getElementById('greeks-sim-tool');
    if(!container) return;

    const $ = id => document.getElementById(id);
    const isCall = true; // display call by default (no type switcher in this HTML)

    function update(){
      const S    = parseFloat($('gs-stock')?.value)  || 100;
      const K    = parseFloat($('gs-strike')?.value) || 100;
      const days = parseFloat($('gs-days')?.value)   || 30;
      const iv   = parseFloat($('gs-iv')?.value)     || 30;
      const T = days / 365;
      const sigma = iv / 100;
      const r = 0.05;

      const g = bs(S,K,T,r,sigma,isCall);

      // Update slider display labels
      const setVal=(id,v)=>{ const el=$(id); if(el) el.textContent=v; };
      setVal('gs-stock-val', '$'+S);
      setVal('gs-strike-val','$'+K);
      setVal('gs-days-val',  days+'天');
      setVal('gs-iv-val',    iv+'%');

      // Update greek display cards
      const fmt=(v,d=4)=>v.toFixed(d);
      const setG=(id,v,d=4)=>{ const el=$(id); if(el) el.textContent=fmt(v,d); };
      setG('g-delta', g.delta);
      setG('g-gamma', g.gamma);
      setG('g-theta', g.theta);
      setG('g-vega',  g.vega);

      // Color delta card
      const deltaCard=$('g-delta');
      if(deltaCard) deltaCard.style.color = g.delta>0?'var(--green)':'var(--red)';

      // Color theta (always negative for buyers)
      const thetaCard=$('g-theta');
      if(thetaCard) thetaCard.style.color='var(--red)';

      // Option price annotation (inject below greeks grid if not already there)
      let priceEl=container.querySelector('#gs-option-price');
      if(!priceEl){
        priceEl=document.createElement('div');
        priceEl.id='gs-option-price';
        priceEl.style.cssText='margin-top:12px;padding:10px 16px;background:rgba(255,179,0,0.06);border:1px solid rgba(255,179,0,0.2);border-radius:8px;display:flex;align-items:center;justify-content:space-between;font-size:0.88rem';
        container.querySelector('.greeks-grid')?.after(priceEl);
      }
      const moneyness=Math.abs(S/K-1)<0.02?'ATM 平价':((S>K)?'ITM 实值':'OTM 虚值');
      const mnColor=Math.abs(S/K-1)<0.02?'var(--amber)':S>K?'var(--green)':'var(--ink-secondary)';
      priceEl.innerHTML=`<span style="color:var(--ink-secondary)">Call 理论价格</span><span style="font-family:var(--font-mono);font-size:1.1rem;color:var(--amber)">$${g.price.toFixed(2)}</span><span style="font-family:var(--font-mono);font-size:11px;padding:2px 8px;border-radius:99px;background:${mnColor}22;color:${mnColor}">${moneyness}</span>`;
    }

    ['gs-stock','gs-strike','gs-days','gs-iv'].forEach(id=>{
      document.getElementById(id)?.addEventListener('input',update);
    });
    update();
    window.addEventListener('resize',update);
  }

  document.readyState==='loading'
    ?document.addEventListener('DOMContentLoaded',init)
    :init();
})();
