(function(){
  const $=id=>document.getElementById(id);
  let queue=[], ok=0, bad=0, errors=new Map(), firstTry=new Set(), solved=new Set();

  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const typeset=el=>{ if(window.MathJax&&MathJax.typesetPromise){MathJax.typesetPromise([el]).catch(()=>{})} else setTimeout(()=>typeset(el),300) };

  function start(){
    queue=shuffle(CARDS.map((_,i)=>i)); ok=0; bad=0; errors=new Map(); firstTry=new Set(); solved=new Set();
    renderErrors(); show();
  }
  function stats(){
    $('sLeft').textContent=queue.length; $('sOk').textContent=ok; $('sBad').textContent=bad;
    $('prog').style.width=(solved.size/CARDS.length*100)+'%';
  }
  function show(){
    stats();
    if(!queue.length) return finish();
    const i=queue[0], c=CARDS[i], rep=errors.has(i);
    $('area').innerHTML=`
    <div class="stage"><div class="card" id="card">
      <div class="face front">
        <div class="label"><span>Утверждение</span><span>${c.s&&window.MIXED?'<span class="sub-tag">'+c.s+'</span> ':''}${rep?'<span class="repeat-tag">Повторение</span>':''}</span></div>
        <div class="statement">${esc(c.t)}</div>
        <div class="btns">
          <button class="b-true" data-v="1">Верно</button>
          <button class="b-false" data-v="0">Неверно</button>
        </div>
        <div class="hint">Клавиши: ← Верно · → Неверно</div>
      </div>
      <div class="face back" id="back"></div>
    </div></div>`;
    typeset($('card'));
    $('area').querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>answer(b.dataset.v==='1'));
  }
  function answer(v){
    const i=queue[0], c=CARDS[i], right=(v===c.a);
    if(right){ ok++; solved.add(i); if(errors.has(i)) errors.get(i).fixed=true; }
    else { bad++; if(!errors.has(i)) errors.set(i,{fixed:false}); else errors.get(i).fixed=false; }
    queue.shift();
    if(!right){ const pos=Math.min(queue.length, 3+Math.floor(Math.random()*3)); queue.splice(pos,0,i); }
    const back=$('back');
    back.innerHTML=`
      <div class="label"><span>Ответ</span></div>
      <div class="verdict">
        <span class="truth ${c.a?'t':'f'}">${c.a?'Верно':'Неверно'}</span>
        <span class="pill ${right?'ok':'bad'}">${right?'Вы ответили правильно':'Вы ошиблись'}</span>
      </div>
      <p class="mini">${esc(c.t)}</p>
      <div class="expl">${c.e}</div>
      <button class="next" id="next">${queue.length?'Следующее утверждение':'Посмотреть итог'}</button>`;
    typeset(back);
    $('card').classList.add('flipped');
    $('next').onclick=show;
    setTimeout(()=>$('next')&&$('next').focus({preventScroll:true}),500);
    renderErrors(); stats();
  }
  function renderErrors(){
    const ul=$('errs'); ul.innerHTML='';
    $('errEmpty').style.display=errors.size?'none':'block';
    [...errors.entries()].reverse().forEach(([i,st])=>{
      const li=document.createElement('li'); if(st.fixed) li.className='fixed';
      li.innerHTML=esc(CARDS[i].t)+`<small class="${st.fixed?'c':'w'}">${st.fixed?'Исправлено · ответ: ':'Повторится · ответ: '}${CARDS[i].a?'Верно':'Неверно'}</small>`;
      ul.appendChild(li);
    });
  }
  function finish(){
    const total=CARDS.length, clean=total-errors.size;
    $('area').innerHTML=`<div class="finish">
      <h2>Раздел пройден</h2>
      <div class="score">${clean} / ${total}</div>
      <p>с первой попытки. Ошибок по ходу: ${bad}.</p>
      <div class="row">
        ${errors.size?'<button class="b-false" id="again">Повторить только ошибки</button>':''}
        <button class="b-true" id="all">Пройти заново</button>
      </div>
      <div class="promo promo-wide">
        <div class="promo-k">Хотите разобрать ошибки с репетитором?</div>
        <p>Кубракова Екатерина Сергеевна, репетитор по физике. Подготовка к ЕГЭ и ОГЭ, индивидуальные занятия и мини-группы.</p>
        <a class="tg-btn" href="https://t.me/KubrakovaES" target="_blank" rel="noopener">Написать в Telegram: @KubrakovaES</a>
      </div></div>`;
    $('all').onclick=start;
    if($('again')) $('again').onclick=()=>{ queue=shuffle([...errors.keys()]); errors.forEach(s=>s.fixed=false); renderErrors(); show(); };
  }
  document.addEventListener('keydown',e=>{
    const card=$('card'); if(!card) return;
    if(!card.classList.contains('flipped')){
      if(e.key==='ArrowLeft') answer(true);
      else if(e.key==='ArrowRight') answer(false);
    } else if(e.key==='Enter'&&document.activeElement!==$('next')) show();
  });
  $('restart').onclick=start;
  start();
})();
