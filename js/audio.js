/* BOLLY KOMBAT — WebAudio SFX, procedural dhol/tabla music loop, and dialogue text-to-speech */
(function () {
  const BMK = (window.BMK = window.BMK || {});
  const A = (BMK.Audio = {
    ctx: null, master: null, musicGain: null, sfxOn: true, musicOn: true, voiceOn: true,
    hiVoice: null, enVoice: null, speakingPriority: 0
  });

  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    A.ctx = new AC();
    A.master = A.ctx.createGain(); A.master.gain.value = 0.7; A.master.connect(A.ctx.destination);
    A.musicGain = A.ctx.createGain(); A.musicGain.gain.value = 0.22; A.musicGain.connect(A.master);
    const len = A.ctx.sampleRate;
    A.noise = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
    const d = A.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  };

  function env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function tone(type, f0, f1, dur, vol, dest, when) {
    const c = A.ctx, t = when || c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, 0.005, vol, dur);
    o.connect(g); g.connect(dest || A.master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, freq, q, type, dest, when) {
    const c = A.ctx, t = when || c.currentTime;
    const s = c.createBufferSource(); s.buffer = A.noise;
    const f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq || 1000; f.Q.value = q || 1;
    const g = c.createGain(); env(g, t, 0.003, vol, dur);
    s.connect(f); f.connect(g); g.connect(dest || A.master); s.start(t); s.stop(t + dur + 0.05);
  }

  A.sfx = function (name) {
    if (!A.ctx || !A.sfxOn) return;
    switch (name) {
      case 'whoosh': noise(0.12, 0.25, 900, 0.8, 'bandpass'); break;
      case 'punch': noise(0.08, 0.6, 1800, 0.7); tone('sine', 180, 60, 0.12, 0.7); break;
      case 'kick': noise(0.12, 0.7, 900, 0.6); tone('sine', 130, 40, 0.2, 0.9); break;
      case 'heavy': noise(0.2, 0.9, 600, 0.5, 'lowpass'); tone('sine', 110, 30, 0.35, 1.0); tone('square', 80, 40, 0.15, 0.2); break;
      case 'block': tone('triangle', 900, 700, 0.08, 0.35); noise(0.05, 0.3, 4000, 2); break;
      case 'jump': tone('sine', 300, 600, 0.12, 0.15); break;
      case 'land': tone('sine', 90, 50, 0.1, 0.3); break;
      case 'orb': tone('sawtooth', 200, 900, 0.3, 0.2); noise(0.3, 0.2, 2000, 3); break;
      case 'shoot': noise(0.15, 0.9, 2500, 0.6, 'highpass'); tone('square', 300, 80, 0.12, 0.3); break;
      case 'zap': tone('square', 1200, 300, 0.15, 0.15); break;
      case 'spin': tone('sawtooth', 200, 700, 0.5, 0.12); noise(0.5, 0.25, 700, 1); break;
      case 'slam': noise(0.5, 1, 300, 0.5, 'lowpass'); tone('sine', 70, 25, 0.6, 1); break;
      case 'beam': tone('sawtooth', 120, 240, 1.0, 0.25); noise(1.0, 0.3, 1500, 2); break;
      case 'siren':
        for (let i = 0; i < 4; i++) tone('square', i % 2 ? 700 : 950, null, 0.22, 0.12, null, A.ctx.currentTime + i * 0.24);
        break;
      case 'invisible': tone('sine', 800, 2400, 0.5, 0.2); tone('sine', 1200, 3000, 0.5, 0.1); break;
      case 'super': tone('sawtooth', 110, 880, 0.6, 0.25); tone('sine', 55, 55, 1.0, 0.5); break;
      case 'ko': tone('sine', 60, 30, 1.2, 1); noise(0.8, 0.6, 400, 0.4, 'lowpass'); break;
      case 'select': tone('square', 660, 990, 0.08, 0.15); break;
      case 'move': tone('square', 440, null, 0.04, 0.08); break;
      case 'confirm': tone('square', 523, null, 0.08, 0.15); tone('square', 784, null, 0.12, 0.15, null, A.ctx.currentTime + 0.08); break;
      case 'gong': tone('sine', 110, 100, 2.5, 0.6); tone('sine', 220, 210, 2.0, 0.25); tone('sine', 347, 340, 1.5, 0.12); break;
      case 'twinkle': for (let i = 0; i < 4; i++) tone('sine', 1500 + i * 400, null, 0.12, 0.1, null, A.ctx.currentTime + i * 0.07); break;
      case 'slap': noise(0.1, 1, 3000, 0.5, 'highpass'); tone('sine', 400, 150, 0.08, 0.4); break;
    }
  };

  /* ── music: Bollywood-action dhol loop with a sawtooth drone + simple raag-ish riff ── */
  let musicTimer = null, nextNote = 0, step = 0, musicMode = 'fight';
  const SCALE = [146.8, 155.6, 185, 196, 220, 233.1, 277.2, 293.7]; // Bhairav-ish on D
  const RIFF = [0, -1, 2, 3, 4, -1, 3, 2, 0, -1, 2, 4, 5, 4, 3, 2];
  function scheduleStep(t) {
    const s = step % 16;
    const dest = A.musicGain;
    // dhol bass (dagga)
    if ([0, 3, 6, 8, 11, 14].includes(s)) tone('sine', 95, 45, 0.25, 0.9, dest, t);
    // tabla-ish "ta"
    if ([2, 5, 7, 10, 13, 15].includes(s)) { tone('triangle', 520, 380, 0.08, 0.35, dest, t); noise(0.05, 0.25, 3500, 3, 'bandpass', dest, t); }
    if (s % 2 === 1) noise(0.03, 0.1, 7000, 1, 'highpass', dest, t);
    if (musicMode === 'fight') {
      const r = RIFF[s];
      if (r >= 0 && step % 64 >= 32) tone('sawtooth', SCALE[r] * 2, null, 0.12, 0.08, dest, t);
      if (s === 0) tone('sawtooth', SCALE[0] / 2, null, 1.6, 0.12, dest, t);
    } else if (s === 0) tone('triangle', SCALE[(step / 16) % 2 ? 4 : 0], null, 1.4, 0.1, dest, t);
    step++;
  }
  A.startMusic = function (mode) {
    musicMode = mode || 'fight';
    if (!A.ctx || musicTimer) return;
    nextNote = A.ctx.currentTime + 0.1; step = 0;
    const bpm = 132, spb = 60 / bpm / 4;
    musicTimer = setInterval(() => {
      if (!A.musicOn) return;
      while (nextNote < A.ctx.currentTime + 0.12) { scheduleStep(nextNote); nextNote += spb; }
    }, 25);
  };
  A.setMusicMode = (m) => { musicMode = m; };
  A.stopMusic = function () { if (musicTimer) clearInterval(musicTimer); musicTimer = null; };

  /* ── dialogue text-to-speech ── */
  function pickVoices() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    A.hiVoice = vs.find((v) => /hi[-_]IN/i.test(v.lang)) || null;
    A.enVoice = vs.find((v) => /en[-_]IN/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }

  /** priority: 1 = combat chatter (skipped if something is already talking), 2 = important (interrupts) */
  A.speak = function (line, voice, priority) {
    if (!A.voiceOn || !('speechSynthesis' in window)) return;
    priority = priority || 1;
    if (speechSynthesis.speaking) {
      if (priority < 2 || priority < A.speakingPriority) return;
      speechSynthesis.cancel();
    }
    const useHi = !!(A.hiVoice && line.hi);
    const u = new SpeechSynthesisUtterance(useHi ? line.hi : line.text);
    u.voice = useHi ? A.hiVoice : A.enVoice;
    u.lang = useHi ? 'hi-IN' : 'en-IN';
    u.pitch = (voice && voice.pitch) || 1;
    u.rate = ((voice && voice.rate) || 1) * 1.05;
    u.volume = 1;
    A.speakingPriority = priority;
    u.onend = () => { A.speakingPriority = 0; };
    speechSynthesis.speak(u);
  };
  A.announce = function (text, hi) {
    if (!A.voiceOn || !('speechSynthesis' in window)) return;
    const useHi = !!(hi && A.hiVoice);
    const u = new SpeechSynthesisUtterance(useHi ? hi : text);
    u.voice = useHi ? A.hiVoice : A.enVoice; u.lang = useHi ? 'hi-IN' : 'en-IN'; u.pitch = 0.6; u.rate = 0.95;
    speechSynthesis.cancel(); A.speakingPriority = 3;
    u.onend = () => { A.speakingPriority = 0; };
    speechSynthesis.speak(u);
  };
  A.hush = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); A.speakingPriority = 0; };
})();
