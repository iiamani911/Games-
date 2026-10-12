/* =========================================================
   Kanz — sound effects (Web Audio) + spoken phrases (Web Speech)
   Everything is generated on the device: no audio files, no APIs.
   ========================================================= */
'use strict';

const Snd = (() => {
  let ac = null;
  const cfg = { sound:true, voice:true, lang:'ar' };

  function ctx(){
    if(!cfg.sound) return null;
    try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if(ac.state === 'suspended') ac.resume(); }catch(e){ return null; }
    return ac;
  }
  function tone(freq, start, dur, type, vol, slideTo){
    const a = ctx(); if(!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + start;
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .12, t + .02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .05);
  }
  const sfx = {
    click(){ tone(620,0,.07,'triangle',.06); },
    pop(){ tone(500,0,.09,'sine',.1,900); },
    correct(){ [523,659,784,1047].forEach((f,i) => tone(f, i*.08, .25, 'triangle', .12)); },
    wrong(){ tone(330,0,.18,'sawtooth',.05); tone(247,.16,.3,'sawtooth',.05); },
    yum(){ tone(660,0,.1,'sine',.1,990); tone(990,.1,.16,'sine',.1,1320); },
    coin(){ tone(988,0,.08,'square',.05); tone(1319,.08,.22,'square',.05); },
    hint(){ tone(880,0,.1,'sine',.08); tone(1175,.09,.16,'sine',.08); },
    tick(){ tone(1000,0,.03,'square',.03); },
    stage(){ [392,523,659,784,1047].forEach((f,i) => tone(f, i*.1, .3, 'triangle', .11)); },
    level(){ [523,784,1047,1568].forEach((f,i) => tone(f, i*.09, .35, 'sine', .1)); },
    fanfare(){ [523,523,523,659,784,659,784,1047].forEach((f,i) => tone(f, i*.13, .28, 'square', .06)); [262,330,392].forEach(f => tone(f, 1.0, .9, 'triangle', .06)); }
  };

  let voices = [];
  function loadVoices(){ try{ voices = speechSynthesis.getVoices() || []; }catch(e){ voices = []; } }
  if('speechSynthesis' in window){ loadVoices(); try{ speechSynthesis.onvoiceschanged = loadVoices; }catch(e){} }

  function speak(text, mood){
    if(!cfg.voice || !('speechSynthesis' in window) || !text) return;
    try{
      const clean = String(text).replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim();
      if(!clean) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      const want = cfg.lang === 'ar' ? 'ar' : 'en';
      u.lang = want === 'ar' ? 'ar-SA' : 'en-US';
      const v = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(want) && /female|zira|samantha|google/i.test(v.name)) || voices.find(v => v.lang && v.lang.toLowerCase().startsWith(want));
      if(v) u.voice = v;
      u.rate = 1.02;
      u.pitch = mood === 'happy' ? 1.25 : 1;
      speechSynthesis.speak(u);
    }catch(e){}
  }
  function hasVoiceFor(lang){ return voices.some(v => v.lang && v.lang.toLowerCase().startsWith(lang)); }

  return { cfg, sfx, speak, hasVoiceFor };
})();
