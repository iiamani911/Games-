/* =========================================================
   Kanz — question engine (seedable, bilingual)
   ========================================================= */
'use strict';

let rng = Math.random;
function seedFrom(str){ let h = 1779033703 ^ str.length; for(let i=0;i<str.length;i++){ h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return h >>> 0; }
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function withSeed(seedStr, fn){ const prev = rng; rng = mulberry32(seedFrom(seedStr)); try{ return fn(); } finally { rng = prev; } }

const rnd = (a,b) => a + Math.floor(rng()*(b-a+1));
const pick = arr => arr[Math.floor(rng()*arr.length)];
function shuffle(arr){ const a = arr.slice(); for(let i=a.length-1;i>0;i--){ const j = Math.floor(rng()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }

/* ctx = { lang, used:Set, seen:Array|null, names:[] } */
function numOptions(ans){
  const set = new Set(); let guard = 0;
  const spread = Math.max(3, Math.round(Math.abs(ans)*0.15));
  while(set.size < 3 && guard++ < 200){
    const d = rng() < .5 ? pick([-10,-5,-2,-1,1,2,5,10]) : rnd(-spread, spread);
    const v = ans + d; if(v >= 0 && v !== ans) set.add(v);
  }
  let k = 1; while(set.size < 3){ set.add(ans + k++); }
  return shuffle([ans, ...set]).map(String);
}
function mc(cat, q, answer, options, hint, ex, seq){
  return { cat, type:'mc', q, answer:String(answer), options, hint:hint||'', ex:ex||'', seq:seq||null, key:cat+'|'+q+'|'+(seq?seq.join(','):'') };
}

/* ---------- number generators ---------- */
function numGen(level, ctx){
  const A = ctx.lang === 'ar';
  const T = (ar, en) => A ? ar : en;
  const who = () => ctx.names && ctx.names.length ? pick(ctx.names) : T('القبطان','The captain');
  const q = (text, ans, hint, ex) => mc('number', text, ans, numOptions(ans), hint, ex);
  const G = {
    easy:[
      () => { const a=rnd(8,45), b=rnd(5,40); return q(`${a} + ${b} = ?`.replace('?', T('؟','?')), a+b, T('اجمع العشرات أولاً، ثم الآحاد.','Add the tens first, then the ones.'), `${a} + ${b} = ${a+b}`); },
      () => { const a=rnd(20,70), b=rnd(4,a-5); return q(`${a} − ${b} = ${T('؟','?')}`, a-b, T('ابدأ من العدد الأصغر وعُدّ صعوداً.','Count up from the smaller number.'), `${a} − ${b} = ${a-b}`); },
      () => { const a=rnd(2,5), b=rnd(2,10); return q(`${a} × ${b} = ${T('؟','?')}`, a*b, T(`يعني جمع ${b} مع نفسه ${a} مرات.`,`It means adding ${b}, ${a} times.`), `${a} × ${b} = ${a*b}`); },
      () => { const a=rnd(12,30), b=rnd(3,a-4), n=who(); return q(T(`سؤال من ${n}: «وجدتُ ${a} من القطع الذهبية، ثم أنفقتُ ${b} منها. كم قطعة بقيت معي؟»`,`${n} asks: “I found ${a} gold coins and spent ${b}. How many do I have left?”`), a-b, T('هذه مسألة طرح.','It’s a subtraction problem.'), `${a} − ${b} = ${a-b}`); },
      () => { const a=rnd(6,25); return q(T(`ما ضِعف العدد ${a}؟`,`What is double ${a}?`), a*2, T('الضِّعف يعني جمع العدد مع نفسه.','Double means adding it to itself.'), `${a} + ${a} = ${a*2}`); },
      () => { const b=rnd(3,6), c=rnd(3,6); return q(T(`في الكهف ${b} من الصناديق، وفي كل صندوق ${c} من الجواهر. كم جوهرة في الكهف؟`,`A cave has ${b} chests with ${c} gems in each. How many gems in total?`), b*c, T('استخدم الضرب.','Use multiplication.'), `${b} × ${c} = ${b*c}`); }
    ],
    medium:[
      () => { const a=rnd(6,12), b=rnd(3,12); return q(`${a} × ${b} = ${T('؟','?')}`, a*b, T('تذكّر جدول الضرب.','Remember your times tables.'), `${a} × ${b} = ${a*b}`); },
      () => { const b=rnd(3,9), x=rnd(3,12); return q(`${b*x} ÷ ${b} = ${T('؟','?')}`, x, T(`أي عدد إذا ضربناه في ${b} أعطانا ${b*x}؟`,`What times ${b} makes ${b*x}?`), `${x} × ${b} = ${b*x}`); },
      () => { const x=rnd(3,12), b=rnd(3,9); return q(`${T('؟','?')} × ${b} = ${x*b}`, x, T('استخدم القسمة.','Use division.'), `${x*b} ÷ ${b} = ${x}`); },
      () => { const a=rnd(2,9), b=rnd(2,9), c=rnd(2,5); return q(`(${a} + ${b}) × ${c} = ${T('؟','?')}`, (a+b)*c, T('ما بين القوسين أولاً.','Brackets first.'), `${a+b} × ${c} = ${(a+b)*c}`); },
      () => { const k=rnd(3,25); return q(T(`ما ربع العدد ${k*4}؟`,`What is a quarter of ${k*4}?`), k, T('الربع = القسمة على 4.','A quarter = divide by 4.'), `${k*4} ÷ 4 = ${k}`); },
      () => { const n=rnd(3,8), k=rnd(3,9), w=who(); return q(T(`سؤال من ${w}: «معي ${n*k} من الحلوى الصحية (تمر)، وأريد توزيعها بالتساوي على ${n} من الأصدقاء. كم يأخذ كل واحد؟»`,`${w} asks: “I have ${n*k} dates to share equally among ${n} friends. How many does each get?”`), k, T('هذه مسألة قسمة.','It’s a division problem.'), `${n*k} ÷ ${n} = ${k}`); }
    ],
    hard:[
      () => { const a=rnd(5,30), b=rnd(3,12), c=rnd(3,12), d=rnd(2,a); return q(`${a} + ${b} × ${c} − ${d} = ${T('؟','?')}`, a+b*c-d, T('الضرب قبل الجمع والطرح!','Multiply before adding and subtracting!'), `${b} × ${c} = ${b*c} → ${a} + ${b*c} − ${d} = ${a+b*c-d}`); },
      () => { const p=pick([10,20,25,50,75]); const m={10:10,20:5,25:4,50:2,75:4}[p]; const base=m*rnd(3,25); return q(T(`كم يساوي ${p}% من ${base}؟`,`What is ${p}% of ${base}?`), base*p/100, T('10% تعني القسمة على 10.','10% means divide by 10.'), `${base} × ${p} ÷ 100 = ${base*p/100}`); },
      () => { const a=rnd(11,20); return q(`${a} × ${a} = ${T('؟','?')}`, a*a, T(`جرّب: ${a} × 10 ثم أضف ${a} × ${a-10}.`,`Try ${a} × 10, then add ${a} × ${a-10}.`), `${a}² = ${a*a}`); },
      () => { const a=rnd(6,15); return q(T(`ما الجذر التربيعي للعدد ${a*a}؟`,`What is the square root of ${a*a}?`), a, T('أي عدد إذا ضربته في نفسه أعطاك الناتج؟','Which number times itself gives this?'), `${a} × ${a} = ${a*a}`); },
      () => { const x=rnd(3,15), a=rnd(2,9), b=rnd(1,20); return q(T(`عدد سرّي، إذا ضربناه في ${a} ثم أضفنا ${b} كان الناتج ${a*x+b}. ما العدد؟`,`A secret number times ${a}, plus ${b}, equals ${a*x+b}. What is it?`), x, T(`اطرح ${b} ثم اقسم على ${a}.`,`Subtract ${b}, then divide by ${a}.`), `(${a*x+b} − ${b}) ÷ ${a} = ${x}`); },
      () => { const p=rnd(3,8), k=rnd(6,15), e=rnd(2,9); return q(T(`قسّم القبطان ${p*k} من القطع الذهبية بالتساوي على ${p} من القراصنة، ثم وجد كل قرصان ${e} قطع إضافية. كم قطعة مع كل قرصان الآن؟`,`The captain splits ${p*k} gold coins equally among ${p} pirates. Then each pirate finds ${e} more. How many does each pirate have now?`), k+e, T('اقسم أولاً، ثم أضف.','Divide first, then add.'), `${p*k} ÷ ${p} = ${k} → ${k} + ${e} = ${k+e}`); }
    ]
  };
  return pick(G[level])();
}

/* ---------- pattern generators ---------- */
const ALPHA = {
  ar:['أ','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'],
  en:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
};
const EMOJI_SETS = [['🍎','🍌','🍇','🍓','🥝'],['⭐','🌙','☀️','☁️','⚡'],['🔴','🟢','🔵','🟡','🟣'],['🐱','🐶','🐰','🐻','🐼'],['💎','🪙','👑','🗝️','🧭'],['🥦','🥕','🍅','🥒','🌽']];
const ARROWS = ['⬆️','➡️','⬇️','⬅️'];

function patGen(level, ctx){
  const A = ctx.lang === 'ar'; const T = (ar,en) => A ? ar : en;
  const Q = T('ما الذي يكمل النمط؟','What completes the pattern?');
  const seqQ = (items, answer, pool, hint, ex) => {
    const wrongs = shuffle([...new Set(pool.map(String))].filter(w => w !== String(answer))).slice(0,3);
    return mc('pattern', Q, answer, shuffle([String(answer), ...wrongs]), hint, ex, [...items.map(String), T('؟','?')]);
  };
  const numSeq = (t, hint, ex) => { const ans = t[t.length-1]; return seqQ(t.slice(0,-1), ans, numOptions(ans), hint, ex); };
  const emoji = unitPat => {
    const set = shuffle(pick(EMOJI_SETS));
    const unit = unitPat.split('').map(ch => set[ch.charCodeAt(0)-65]);
    const len = unit.length*2 + rnd(0, unit.length-1);
    const items = Array.from({length:len}, (_,i) => unit[i % unit.length]);
    return seqQ(items, unit[len % unit.length], set, T('ابحث عن المجموعة التي تتكرر.','Look for the group that repeats.'), T('النمط يتكرر: ','The repeating unit: ') + unit.join(' '));
  };
  const letters = (step, count) => {
    const AL = ALPHA[ctx.lang];
    const start = rnd(0, AL.length - 1 - step*count);
    const idx = Array.from({length:count}, (_,i) => start + i*step);
    const ai = start + count*step;
    const pool = [ai-1, ai+1, ai+2, ai-step, ai+step, ai-2, ai-3, ai-4].filter(i => i>=0 && i<AL.length && i!==ai).map(i => AL[i]);
    return seqQ(idx.map(i => AL[i]), AL[ai], pool,
      step === 1 ? T('إنها حروف الأبجدية بالترتيب.','Alphabet order.') : T(`نتخطى ${step===2?'حرفاً واحداً':'حرفين'} في كل مرة.`,`Skip ${step-1} letter${step>2?'s':''} each time.`),
      AL.slice(start, ai+1).join(' '));
  };
  const G = {
    easy:[
      () => { const s=pick([2,3,5,10]), a=rnd(1,20); const t=[0,1,2,3,4].map(i => a+i*s); return numSeq(t, T('كم يزيد كل عدد عن الذي قبله؟','How much does each number grow?'), `+${s}`); },
      () => emoji(pick(['AB','ABC','AAB'])),
      () => emoji(pick(['AB','ABB'])),
      () => letters(1, 4)
    ],
    medium:[
      () => { const s=pick([4,6,7,8,9,11,-2,-3,-4,-5]); const a = s<0 ? Math.abs(s)*5+rnd(1,20) : rnd(1,25); const t=[0,1,2,3,4].map(i => a+i*s); return numSeq(t, T('انظر إلى الفرق بين كل عددين.','Look at the difference between neighbours.'), (s>0?'+':'−')+Math.abs(s)); },
      () => { const r=pick([2,2,3]); const a = r===2 ? rnd(1,6) : rnd(1,3); const t=[0,1,2,3,4].map(i => a*Math.pow(r,i)); return numSeq(t, T('هل هو جمع… أم شيء ينمو أسرع؟','Adding… or something that grows faster?'), '× '+r); },
      () => { const st=rnd(0,3), dir=pick([1,3]); const items=Array.from({length:6},(_,i) => ARROWS[(st+dir*i)%4]); return seqQ(items, ARROWS[(st+dir*6)%4], ARROWS, T('السهم يدور… لكن في أي اتجاه؟','The arrow turns… but which way?'), dir===1 ? T('ربع دورة مع عقارب الساعة.','A quarter turn clockwise.') : T('ربع دورة عكس عقارب الساعة.','A quarter turn anticlockwise.')); },
      () => emoji(pick(['ABBC','AABB','ABCB'])),
      () => letters(2, 4)
    ],
    hard:[
      () => { const a=rnd(1,10), d=rnd(1,4); const t=[a]; for(let i=0;i<5;i++) t.push(t[i]+d+i); return numSeq(t, T('الفرق نفسه يتغيّر بانتظام!','The gap itself grows!'), `+${d}, +${d+1}, +${d+2}…`); },
      () => { const a=rnd(1,5), b=rnd(a,8); const t=[a,b]; for(let i=2;i<7;i++) t.push(t[i-1]+t[i-2]); return numSeq(t, T('كل عدد له علاقة بالعددين قبله.','Each number relates to the two before it.'), `${t[4]} + ${t[5]} = ${t[6]}`); },
      () => { const a=rnd(1,4), plus=pick([1,-1]); const t=[a+(plus<0?1:0)]; for(let i=0;i<4;i++) t.push(t[i]*2+plus); return numSeq(t, T('جرّب الضرب في 2 ثم انظر ماذا يبقى.','Try ×2 and see what’s left over.'), `×2 ${plus>0?'+':'−'} 1`); },
      () => { const u=rnd(1,5), us=rnd(2,3), d=rnd(30,50), ds=rnd(2,5); const items=[]; for(let i=0;i<3;i++) items.push(u+i*us, d-i*ds); const ans=u+3*us; return seqQ(items, ans, [ans+1, ans-1, d-3*ds, ans+us, ans+2].filter(v => v>=0), T('هناك نمطان متداخلان!','Two patterns are woven together!'), `${u}, ${u+us}, ${u+2*us}, ${ans}`); },
      () => letters(3, 4)
    ]
  };
  return pick(G[level])();
}

function scrambleQ(level, ctx){
  const list = SCRAMBLE[ctx.lang][level];
  const pool = list.filter(([w]) => !ctx.used.has('scr|'+w));
  const [word, clue] = pick(pool.length ? pool : list);
  const letters = Array.from(word);
  let mixed = shuffle(letters), guard = 0;
  while(mixed.join('') === word && guard++ < 20) mixed = shuffle(letters);
  const A = ctx.lang === 'ar';
  return { cat:'word', type:'scramble', q: A ? 'رتّب الحروف لتكوين كلمة صحيحة' : 'Unscramble the letters to make a word', clue, answer:word, letters:mixed,
           hint: A ? `أول حرف هو «${letters[0]}»` : `The first letter is “${letters[0]}”`, ex: A ? `الكلمة هي «${word}»` : `The word is “${word}”`, key:'scr|'+word };
}

function bankQ(cat, level, ctx){
  const near = level==='easy' ? ['easy','medium','hard'] : level==='hard' ? ['hard','medium','easy'] : ['medium','easy','hard'];
  for(const lv of near){
    const fresh = BANK.filter(b => b.lang===ctx.lang && b.cat===cat && b.level===lv && !ctx.used.has(b.id));
    if(!fresh.length) continue;
    const unseen = ctx.seen ? fresh.filter(b => !ctx.seen.includes(b.id)) : fresh;
    const b = pick(unseen.length ? unseen : fresh);
    if(ctx.seen){ const i = ctx.seen.indexOf(b.id); if(i >= 0) ctx.seen.splice(i,1); ctx.seen.push(b.id); if(ctx.seen.length > 200) ctx.seen.shift(); }
    const q = mc(cat, b.q, b.answer, shuffle([b.answer, ...b.wrongs]), b.hint, b.ex, b.seq ? [...b.seq, ctx.lang==='ar'?'؟':'?'] : null);
    q.bankId = b.id;
    return q;
  }
  return null;
}

function makeQuestion(cat, level, ctx){
  const bankChance = { riddle:1, knowledge:1, health:1, word:.55, number:.35, pattern:.3 }[cat];
  const bankOnly = bankChance === 1;
  for(let tries=0; tries<30; tries++){
    if(rng() < bankChance){
      const q = bankQ(cat, level, ctx);
      if(q){ ctx.used.add(q.bankId); return q; }
      if(bankOnly){ BANK.forEach(b => { if(b.cat === cat) ctx.used.delete(b.id); }); continue; }
    }
    const q = cat==='number' ? numGen(level, ctx) : cat==='pattern' ? patGen(level, ctx) : scrambleQ(level, ctx);
    if(!ctx.used.has(q.key)){ ctx.used.add(q.key); return q; }
  }
  return bankOnly ? bankQ(cat, level, ctx) : (cat==='number' ? numGen(level, ctx) : patGen(level, ctx));
}
