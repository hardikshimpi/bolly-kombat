/* BOLLY KOMBAT — game engine: input, fighters, combat, AI, specials/supers, fatalities, scenes, HUD */
(function () {
  const BMK = window.BMK, DATA = window.BMK_DATA, A = BMK.Audio, POSES = BMK.POSES;
  const W = 1280, H = 720, G = 640, GRAV = 0.9;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const CH = DATA.characters;
  const byId = (id) => CH.find((c) => c.id === id);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const FONT = '"Bungee", Impact, "Arial Black", sans-serif';
  const FONT2 = '"Teko", "Arial Narrow", Arial, sans-serif';
  const RIVAL = { gone: 'raone', raone: 'gone' };
  const GRID_COLS = 4;
  const HOME = { raone: 'filmcity', jatt: 'marine', gone: 'filmcity', krrish: 'marine', chitti: 'filmcity', shaktimaan: 'marine', mrindia: 'marine', singham: 'ramgarh', chulbul: 'ramgarh', gabbar: 'ramgarh', mogambo: 'lair' };

  /* ═════════════════════ INPUT ═════════════════════ */
  const keys = new Set(), pressed = new Set();
  const BLOCK_DEFAULT = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter'];
  addEventListener('keydown', (e) => {
    A.init();
    if (!keys.has(e.code)) pressed.add(e.code);
    keys.add(e.code);
    if (BLOCK_DEFAULT.includes(e.code)) e.preventDefault();
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());
  const CREDIT_URL = 'https://hardikshimpi.vercel.app';
  const CREDIT_LABEL = 'hardikshimpi.vercel.app';
  const openCredit = () => window.open(CREDIT_URL, '_blank', 'noopener');
  // clickable credit link: scenes expose `link = {x, y, w, h}` in canvas coordinates
  canvas.addEventListener('pointerdown', (e) => {
    A.init();
    const r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    const l = scene && scene.link;
    if (l && x >= l.x && x <= l.x + l.w && y >= l.y && y <= l.y + l.h) openCredit();
  });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    const l = scene && scene.link;
    canvas.style.cursor = l && x >= l.x && x <= l.x + l.w && y >= l.y && y <= l.y + l.h ? 'pointer' : 'default';
  });
  /** Draws the "Created by" credit line centred at (x, y) and records its clickable area on the scene. */
  function drawCredit(sc, x, y, size) {
    drawText('Created by ' + CREDIT_LABEL, x, y, size, '#9fd3ff', { font: FONT2, stroke: 4 });
    ctx.font = `${size}px ${FONT2}`;
    const w = ctx.measureText('Created by ' + CREDIT_LABEL).width;
    sc.link = { x: x - w / 2, y: y - size, w, h: size + 6 };
  }
  const hit = (...codes) => codes.some((c) => pressed.has(c));

  const MAP_P1 = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', P: 'KeyF', K: 'KeyG', S: 'KeyH', b: 'KeyR', X: 'KeyT' };
  const MAP_P2 = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', P: 'KeyJ', K: 'KeyK', S: 'KeyL', b: 'KeyI', X: 'KeyO' };
  const blankInput = () => ({ left: false, right: false, up: false, down: false, b: false, P: false, K: false, S: false, X: false });

  class KeyCtrl {
    constructor(maps) { this.maps = maps; this.human = true; }
    read() {
      const i = blankInput();
      for (const m of this.maps) {
        for (const k of ['left', 'right', 'up', 'down', 'b']) if (keys.has(m[k])) i[k] = true;
        for (const k of ['P', 'K', 'S', 'X']) if (pressed.has(m[k])) i[k] = true;
      }
      return i;
    }
  }

  class AICtrl {
    constructor(level) { this.lv = level; this.cool = 20; this.act = null; this.actT = 0; this.seq = null; this.seqT = 0; this.seen = new WeakSet(); }
    read(f, o, g) {
      const inp = blankInput();
      const dx = o.x - f.x, dist = Math.abs(dx), F = dx > 0 ? 'right' : 'left', B = dx > 0 ? 'left' : 'right';
      if (g.phase === 'finish') {
        if (g.finishWinner === f) { if (dist > 170) inp[F] = true; else if (g.phaseT > 50 && g.phaseT % 15 === 0) inp.X = true; }
        return inp;
      }
      if (!g.canControl(f)) { this.seq = null; return inp; }
      const lv = this.lv;
      const blockP = [0.2, 0.5, 0.8][lv], react = [24, 14, 7][lv], aggr = [0.4, 0.6, 0.8][lv];
      const oInvis = o.invis > 0 ? 0.35 : 1;
      // air attack
      if (f.state === 'jump' && !f.airAtk && dist < 150 && f.vy > -6) { inp.K = true; return inp; }
      if (this.seq) {
        this.seqT++;
        let last = 0;
        for (const [k, at] of this.seq) { if (at === this.seqT) inp[k] = true; if (k === 'down' && at >= this.seqT - 1 && at <= this.seqT) inp.down = true; last = Math.max(last, at); }
        if (this.seqT > last + 1) this.seq = null;
        return inp;
      }
      if (this.act === 'block' && this.actT > 0) { this.actT--; inp.b = true; if (this.low) inp.down = true; return inp; }
      const oThreat = (o.state === 'attack' && o.st < o.atk.st + o.atk.ac) || (o.state === 'special' && o.st < 26) || o.state === 'super';
      if (oThreat && dist < 180 && Math.random() < blockP * 0.3 * oInvis) {
        this.act = 'block'; this.actT = 16; this.low = !!(o.atk && o.atk.low); inp.b = true; if (this.low) inp.down = true; return inp;
      }
      const proj = g.projectiles.find((p) => p.owner === o && (p.x - f.x) * p.vx < 0 && Math.abs(p.x - f.x) < 320);
      if (proj && !this.seen.has(proj)) {
        this.seen.add(proj);
        if (Math.random() < blockP + 0.1) {
          if (proj.low || Math.random() < 0.45) { inp.up = true; inp[F] = true; return inp; }
          this.act = 'block'; this.actT = 28; this.low = false; inp.b = true; return inp;
        }
      }
      if (g.jeep && g.jeep.owner === o && Math.random() < blockP * 0.2) { inp.up = true; return inp; }
      if (this.cool > 0) {
        this.cool--;
        if (this.act === 'fwd') inp[F] = true; else if (this.act === 'back') inp[B] = true; else if (this.act === 'crouch') inp.down = true;
        return inp;
      }
      this.cool = react + ((Math.random() * react) | 0);
      this.act = null;
      const r = Math.random(), sp = f.c.special;
      if (f.meter >= 100 && r < 0.6) {
        const k = f.c.super.kind;
        if ((k === 'rush' && dist < 420) || k === 'beam' || k === 'vehicle' || k === 'volley' || (k === 'spin' && dist < 500)) { inp.X = true; return inp; }
      }
      if (dist > 280) {
        if (f.specialCD <= 0 && ((sp.kind === 'projectile' && r < 0.45 * aggr) || (sp.kind === 'slam' && r < 0.25) || (sp.kind === 'invisible' && r < 0.2) || (sp.kind === 'teleport' && r < 0.3))) { inp.S = true; return inp; }
        if (r > 0.9) { inp.up = true; inp[F] = true; return inp; }
        this.act = 'fwd'; return inp;
      }
      if (dist > 125) {
        if ((sp.kind === 'dash' || sp.kind === 'spin' || sp.kind === 'flykick') && f.specialCD <= 0 && r < 0.3 * aggr) { inp.S = true; return inp; }
        if (r > 0.88) { inp.up = true; inp[F] = true; return inp; }
        this.act = r < 0.8 ? 'fwd' : 'back'; this.cool = (this.cool / 2) | 0; return inp;
      }
      if (r < aggr) {
        const c = Math.random();
        if (c < 0.35) this.seq = [['P', 1], ['P', 9], ['K', 18]];
        else if (c < 0.55) this.seq = [['P', 1], ['K', 9]];
        else if (c < 0.7) this.seq = [['K', 1]];
        else if (c < 0.85) this.seq = [['down', 1], ['K', 2]];
        else if (f.specialCD <= 0 && sp.kind !== 'invisible') this.seq = [['S', 1]];
        else this.seq = [['down', 1], ['P', 2]];
        this.seqT = 0; this.cool = 4;
        return inp;
      }
      if (Math.random() < 0.5) { this.act = 'block'; this.actT = 20; this.low = false; } else this.act = 'back';
      return inp;
    }
  }

  /* ═════════════════════ MOVES ═════════════════════ */
  const MOVES = {
    punch: { st: 4, ac: 4, rc: 9, dmg: 40, x0: 20, x1: 92, y0: -215, y1: -160, kb: 3.5, stun: 15, wind: 'punchWind', pose: 'punch', chain: { P: 'punch2', K: 'kick' } },
    punch2: { st: 4, ac: 4, rc: 10, dmg: 45, x0: 20, x1: 95, y0: -215, y1: -160, kb: 4, stun: 16, wind: 'punchWind2', pose: 'punch2', chain: { K: 'finisher', P: 'finisher' } },
    kick: { st: 7, ac: 5, rc: 15, dmg: 65, x0: 20, x1: 118, y0: -195, y1: -120, kb: 7, stun: 18, wind: 'kickWind', pose: 'kick', heavy: true },
    finisher: { st: 6, ac: 6, rc: 20, dmg: 90, x0: 20, x1: 122, y0: -225, y1: -130, kb: 10, stun: 22, wind: 'kickWind', pose: 'roundhouse', heavy: true, launch: true },
    cpunch: { st: 4, ac: 4, rc: 9, dmg: 35, x0: 20, x1: 88, y0: -130, y1: -80, kb: 3, stun: 14, wind: 'crouch', pose: 'cpunch', crouch: true },
    sweep: { st: 8, ac: 6, rc: 20, dmg: 55, x0: 10, x1: 130, y0: -45, y1: 0, kb: 4, stun: 20, wind: 'crouch', pose: 'sweep', crouch: true, heavy: true, trip: true, low: true },
    jpunch: { st: 3, ac: 9, rc: 6, dmg: 45, x0: 10, x1: 85, y0: -210, y1: -120, kb: 4, stun: 16, wind: 'jump', pose: 'jpunch', air: true },
    jkick: { st: 4, ac: 10, rc: 6, dmg: 60, x0: 10, x1: 105, y0: -140, y1: -40, kb: 6, stun: 18, wind: 'jump', pose: 'jkick', air: true, heavy: true }
  };

  /* ═════════════════════ FIGHTER ═════════════════════ */
  class Fighter {
    constructor(char, side, ctrl) {
      this.c = char; this.side = side; this.ctrl = ctrl;
      this.speed = char.stats.speed; this.power = char.stats.power; this.defense = char.stats.defense;
      this.maxHp = 1000; this.wins = 0; this.meter = 0;
      this.pose = BMK.copyPose(POSES.idle);
      this.usedLines = [];
      this.newRound();
    }
    newRound() {
      this.x = this.side === 0 ? 420 : 860; this.y = 0; this.vx = 0; this.vy = 0;
      this.facing = this.side === 0 ? 1 : -1;
      this.hp = this.maxHp; this.dispHp = this.maxHp;
      this.state = 'idle'; this.st = 0; this.atk = null; this.atkHit = false; this.buf = null;
      this.stun = 0; this.comboTaken = 0; this.specialCD = 0; this.invis = 0; this.speech = null; this.talkCD = 0;
      this.flash = 0; this.hitbox = null; this.trail = []; this.fx = null; this.dead = false; this.airAtk = false;
      this.lyingT = 0; this.walkPhase = 0; this.sup = null; this.spec = null; this.dizzyAfter = false;
    }
    get grounded() { return this.y >= 0; }
    get crouching() { return this.state === 'crouch' || this.state === 'cblock' || (this.state === 'attack' && this.atk.crouch); }
    get neutral() { return ['idle', 'walk', 'crouch', 'block', 'cblock'].includes(this.state); }
    hurtbox() {
      if (['down', 'ko', 'getup', 'fatalVictim'].includes(this.state) || this.fx) return null;
      if (this.state === 'special' && this.c.special.kind === 'teleport' && this.st >= 6 && this.st < 20) return null;
      const h = (this.c.look.build && this.c.look.build.h) || 1;
      const top = (this.crouching ? -150 : -235) * h;
      return { x0: this.x - 32, x1: this.x + 32, y0: G + this.y + top, y1: G + this.y };
    }
    say(trigger, prio, oppId) {
      let lines = this.c.dialogues.filter((d) => d.on.includes(trigger) && (!d.vs || d.vs === oppId));
      const rival = lines.filter((d) => d.vs && d.vs === oppId);
      if (rival.length && trigger === 'intro') lines = rival;
      if (!lines.length) return null;
      let pool = lines.filter((d) => !this.usedLines.includes(d));
      if (!pool.length) { this.usedLines = []; pool = lines; }
      const line = pick(pool);
      this.usedLines.push(line);
      this.speech = { line, t: 0, dur: clamp(70 + line.text.length * 2.6, 120, 300) };
      this.talkCD = 260;
      A.speak(line, this.c.voice, prio || 1);
      return line;
    }
    startAttack(name) {
      this.atk = MOVES[name]; this.atkName = name; this.state = 'attack'; this.st = 0; this.atkHit = false; this.buf = null;
      if (this.atk.air) this.airAtk = true;
      else this.vx = this.facing * 1.5;
      A.sfx('whoosh');
    }
    startSpecial(g) {
      const sp = this.c.special;
      if (sp.kind === 'projectile' && g.projectiles.some((p) => p.owner === this)) return false;
      if (sp.kind === 'invisible' && this.invis > 0) return false;
      this.state = 'special'; this.st = 0; this.spec = { fired: 0, landed: false }; this.vx = 0; this.atkHit = false;
      this.specialCD = sp.cd || 60;
      return true;
    }
    update(g, opp) {
      const inp = this.ctrl.read(this, opp, g);
      for (const k of ['X', 'S', 'P', 'K']) if (inp[k]) { this.buf = { k, t: 8 }; break; }
      if (this.buf && --this.buf.t <= 0) this.buf = null;
      this.st++;
      if (this.specialCD > 0) this.specialCD--;
      if (this.invis > 0) this.invis--;
      if (this.talkCD > 0) this.talkCD--;
      if (this.flash > 0) this.flash--;
      if (this.speech && ++this.speech.t > this.speech.dur) this.speech = null;
      this.hitbox = null;
      this.drawFacing = null;
      const ctl = g.canControl(this);

      if (this.neutral && ctl) this.facing = opp.x > this.x ? 1 : -1;

      switch (this.state) {
        case 'idle': case 'walk': case 'crouch': case 'block': case 'cblock': {
          if (!ctl) { this.state = 'idle'; this.vx = 0; break; }
          const b = this.buf && this.buf.k;
          if (b === 'X') {
            this.buf = null;
            if (g.phase === 'finish' && g.finishWinner === this && opp.state === 'dizzy') { g.tryFatality(this, opp); break; }
            if (this.meter >= 100) { g.startSuper(this); break; }
          }
          if (b === 'S' && this.specialCD <= 0) {
            this.buf = null;
            if (g.phase === 'finish' && g.finishWinner === this && g.tryFatality(this, opp)) break;
            if (this.startSpecial(g)) break;
          }
          if (inp.up) {
            this.state = 'jump'; this.st = 0; this.vy = -17.5; this.y = -1; this.airAtk = false;
            const d = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
            this.vx = d * this.speed * 1.15;
            A.sfx('jump'); break;
          }
          if (inp.down) {
            this.vx = 0;
            if (b === 'P') { this.startAttack('cpunch'); break; }
            if (b === 'K') { this.startAttack('sweep'); break; }
            this.state = inp.b ? 'cblock' : 'crouch'; break;
          }
          if (inp.b) { this.state = 'block'; this.vx = 0; break; }
          if (b === 'P') { this.startAttack('punch'); break; }
          if (b === 'K') { this.startAttack('kick'); break; }
          const d = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
          if (d) {
            const fwd = d === this.facing;
            this.vx = d * this.speed * (fwd ? 1 : 0.72);
            this.state = 'walk'; this.walkPhase += 0.2 * (fwd ? 1 : -1) * (this.speed / 5);
          } else { this.state = 'idle'; this.vx = 0; }
          break;
        }
        case 'jump':
          if (!this.airAtk && this.buf) {
            if (this.buf.k === 'P') { const vx = this.vx; this.startAttack('jpunch'); this.vx = vx; }
            else if (this.buf.k === 'K') { const vx = this.vx; this.startAttack('jkick'); this.vx = vx; }
          }
          break;
        case 'attack': {
          const m = this.atk;
          if (!m.air) this.vx *= 0.75;
          if (this.st >= m.st && this.st < m.st + m.ac && !this.atkHit) {
            this.hitbox = this.box(m.x0, m.x1, m.y0, m.y1, { dmg: m.dmg, kb: m.kb, stun: m.stun, heavy: m.heavy, launch: m.launch, trip: m.trip, low: m.low, name: this.atkName });
          }
          if (this.atkHit && this.buf && m.chain && m.chain[this.buf.k] && this.st >= m.st + 2) { this.startAttack(m.chain[this.buf.k]); break; }
          if (m.air) { if (this.grounded && this.st > 2) { this.state = 'idle'; A.sfx('land'); } }
          else if (this.st >= m.st + m.ac + m.rc) this.state = m.crouch ? 'crouch' : 'idle';
          break;
        }
        case 'special': this.updateSpecial(g, opp); break;
        case 'super': this.updateSuper(g, opp); break;
        case 'hit':
          this.vx *= 0.82;
          if (--this.stun <= 0 && this.grounded) this.state = 'idle';
          break;
        case 'down':
          if (this.grounded && this.vy >= 0) {
            if (this.lyingT === 0) { A.sfx('land'); g.shake = Math.max(g.shake, 6); g.dust(this.x, 10); }
            this.vx *= 0.8; this.lyingT++;
            if (this.dead) { if (this.lyingT > 12) this.state = 'ko'; }
            else if (this.lyingT > (this.dizzyAfter ? 30 : 42)) { this.state = 'getup'; this.st = 0; }
          }
          break;
        case 'getup':
          if (this.st > 22) {
            if (this.dizzyAfter) { this.state = 'dizzy'; this.st = 0; this.dizzyAfter = false; g.onDizzy(this); }
            else this.state = 'idle';
          }
          break;
        case 'dizzy': this.vx = 0; break;
      }

      // physics
      if (this.y < 0 || this.vy < 0) {
        this.vy += this.state === 'down' ? 0.75 : GRAV;
        this.y += this.vy;
        if (this.y >= 0) {
          this.y = 0; this.vy = 0;
          if (this.state === 'jump') { this.state = 'idle'; this.vx = 0; A.sfx('land'); }
        }
      }
      this.x += this.vx;
      this.x = clamp(this.x, 45, W - 45);

      // trails for fast moves
      if ((this.state === 'special' && ((this.c.special.kind === 'dash' && this.st > 6 && this.st < 26) || (this.c.special.kind === 'flykick' && this.st > 6 && !this.spec.landed))) || (this.sup && this.sup.trail)) {
        if (g.frame % 2 === 0) this.trail.push({ x: this.x, y: this.y, pose: BMK.copyPose(this.pose), facing: this.facing, a: 0.5 });
      }
      for (const tr of this.trail) tr.a -= 0.04;
      this.trail = this.trail.filter((t) => t.a > 0);

      this.updatePose(g);
    }
    box(x0, x1, y0, y1, props) {
      const a = this.facing === 1 ? [this.x + x0, this.x + x1] : [this.x - x1, this.x - x0];
      return Object.assign({ x0: a[0], x1: a[1], y0: G + this.y + y0, y1: G + this.y + y1 }, props);
    }
    updateSpecial(g, opp) {
      const sp = this.c.special, st = this.st, s = this.spec;
      switch (sp.kind) {
        case 'projectile': {
          const count = sp.count || 1, gap = sp.gap || 0;
          if (st >= 12 && s.fired < count && st === 12 + s.fired * gap) {
            g.spawnProjectile(this, sp); s.fired++;
          }
          if (st > 12 + (count - 1) * gap + 20) this.state = 'idle';
          break;
        }
        case 'dash':
          if (st === 8) { A.sfx('whoosh'); this.vx = this.facing * 19; }
          if (st >= 8 && st < 24) {
            this.vx = this.facing * 19;
            if (!this.atkHit) this.hitbox = this.box(0, 90, -215, -90, { dmg: sp.dmg, kb: 9, stun: 22, heavy: true, launch: true, name: 'special' });
          }
          if (st >= 24) this.vx *= 0.7;
          if (st > 40) this.state = 'idle';
          break;
        case 'spin':
          if (st === 4) A.sfx('spin');
          if (st >= 4 && st < 50) {
            this.vx = this.facing * 7;
            this.drawFacing = Math.floor(st / 4) % 2 ? -this.facing : this.facing;
            this.hitbox = this.box(-55, 70, -245, 0, { dmg: sp.dmg, kb: 5, stun: 14, heavy: st > 40, multi: 9, name: 'special' });
            if (g.frame % 2 === 0) g.sparkle(this.x + rand(-50, 50), G + this.y - rand(0, 220), sp.color);
          }
          if (st >= 50) this.vx *= 0.7;
          if (st > 62) this.state = 'idle';
          break;
        case 'teleport':
          if (st < 20 && st % 2 === 0) g.cubes(this.x, G + this.y - 120, sp.color, 3);
          if (st === 6) A.sfx('zap');
          if (st === 14) {
            const side = opp.x >= this.x ? 1 : -1;
            let nx = opp.x + side * 85;
            if (nx < 45 || nx > W - 45) nx = opp.x - side * 85;
            this.x = clamp(nx, 45, W - 45); this.facing = opp.x > this.x ? 1 : -1;
            A.sfx('zap'); g.cubes(this.x, G - 120, sp.color, 12);
          }
          if (st >= 22 && st < 28 && !this.atkHit) this.hitbox = this.box(0, 95, -215, -90, { dmg: sp.dmg, kb: 9, stun: 22, heavy: true, launch: true, name: 'special' });
          if (st > 46) this.state = 'idle';
          break;
        case 'flykick':
          if (st === 6) { this.vy = -11; this.y = -1; this.vx = this.facing * 12; A.sfx('whoosh'); }
          if (st > 6 && !s.landed && !this.atkHit) this.hitbox = this.box(0, 105, -150, -30, { dmg: sp.dmg, kb: 9, stun: 22, heavy: true, launch: true, name: 'special' });
          if (st > 8 && this.grounded && !s.landed) { s.landed = st; this.vx = 0; A.sfx('land'); g.dust(this.x, 8); }
          if (s.landed && st > s.landed + 12) this.state = 'idle';
          break;
        case 'invisible':
          if (st === 16) { this.invis = 300; A.sfx('invisible'); g.floatText('GAYAB!', this.x, G - 260, '#ff4040', 40); }
          if (st > 28) this.state = 'idle';
          break;
        case 'slam':
          if (st === 8) { this.vy = -13; this.y = -1; this.vx = 0; }
          if (st > 10 && this.grounded && !s.landed) {
            s.landed = st; A.sfx('slam'); g.shake = 14; g.dust(this.x, 30);
            g.spawnProjectile(this, { shape: 'wave', color: sp.color, speed: 10, r: 28, dmg: sp.dmg, low: true, trip: true });
          }
          if (s.landed && st > s.landed + 18) this.state = 'idle';
          break;
      }
    }
    updateSuper(g, opp) {
      const sup = this.sup, st = this.st, k = this.c.super;
      switch (k.kind) {
        case 'beam':
          if (st < 14 && g.frame % 2 === 0) g.sparkle(this.x + this.facing * 70, G + this.y - 165, k.color);
          if (st === 14) A.sfx('beam');
          if (st >= 14 && st < 74) {
            sup.beam = true;
            const hx = this.x + this.facing * 70;
            this.hitbox = { x0: this.facing === 1 ? hx : 0, x1: this.facing === 1 ? W : hx, y0: G + this.y - 205, y1: G + this.y - 125, dmg: 22, kb: 1.6, stun: 14, multi: 6, heavy: st > 66, launch: st > 66, name: 'super' };
            g.shake = Math.max(g.shake, 3);
          } else sup.beam = false;
          if (st > 90) this.endSuper();
          break;
        case 'rush': {
          if (st === 1 && k.variant === 'invisible') { this.invis = Math.max(this.invis, 160); A.sfx('invisible'); }
          if (!sup.locked) {
            sup.trail = true;
            if (st >= 8 && st < 40) {
              this.vx = this.facing * 21;
              this.hitbox = this.box(0, 80, -230, -60, { dmg: 30, kb: 0, stun: 60, rush: true, name: 'super' });
            }
            if (st >= 40) { this.vx *= 0.7; sup.trail = false; }
            if (st > 56) this.endSuper();
          } else {
            this.vx = 0; sup.trail = false;
            sup.n = sup.n || 0;
            const lt = st - sup.lockAt;
            if (lt > 0 && lt % 7 === 0 && sup.n < 8) {
              sup.n++;
              opp.state = 'hit'; opp.stun = 40; opp.vx = 0;
              g.applyHit(this, opp, { dmg: 22, kb: 0.3, stun: 40, unblockable: true, name: 'barrage', quiet: sup.n % 2 === 0 });
              if (k.variant === 'slap') A.sfx('slap');
            }
            if (sup.n >= 8 && !sup.final && lt > 60) {
              sup.final = true;
              g.applyHit(this, opp, { dmg: 60, kb: 12, stun: 30, launch: true, heavy: true, unblockable: true, name: 'barrage' });
              if (k.variant === 'space') { opp.vy = -24; this.vy = -21; this.y = -1; g.floatText('SPACE MEIN!', opp.x, G - 330, '#8fd6ff', 44); }
            }
            if (sup.final && lt > 85) this.endSuper();
          }
          break;
        }
        case 'spin':
          if (st === 2) A.sfx('spin');
          if (st < 85) {
            this.vx = this.facing * 9;
            if (this.x <= 50 || this.x >= W - 50) this.facing *= -1;
            this.drawFacing = Math.floor(st / 3) % 2 ? -this.facing : this.facing;
            this.hitbox = this.box(-80, 90, -300, 0, { dmg: 20, kb: 3, stun: 12, multi: 7, heavy: st > 78, launch: st > 78, name: 'super' });
            if (g.frame % 1 === 0) g.sparkle(this.x + rand(-80, 80), G + this.y - rand(0, 300), k.color);
          } else this.vx *= 0.7;
          if (st > 100) this.endSuper();
          break;
        case 'vehicle':
          if (st === 4) {
            A.sfx('siren');
            g.jeep = { x: this.facing === 1 ? -200 : W + 200, dir: this.facing, owner: this, hit: false, t: 0 };
          }
          if (st > 4 && !g.jeep) this.endSuper();
          if (st > 160) this.endSuper();
          break;
        case 'volley':
          if (st >= 12 && (st - 12) % 9 === 0 && (sup.n || 0) < 6) {
            sup.n = (sup.n || 0) + 1;
            g.spawnProjectile(this, { shape: 'bullet', color: k.color, speed: 22, r: 6, dmg: 40 });
            g.floatText(['EK', 'DO', 'TEEN', 'CHAAR', 'PAANCH', 'CHHE!'][sup.n - 1], this.x + this.facing * 90, G - 250, '#ffe08a', 30);
          }
          if (st > 12 + 6 * 9 + 20) this.endSuper();
          break;
      }
    }
    endSuper() { this.state = 'idle'; this.sup = null; this.vx = 0; }
    onConnect(def, blocked, hb, g) {
      if (this.state === 'super' && hb.rush && !blocked && this.sup && !this.sup.locked) {
        this.sup.locked = true; this.sup.lockAt = this.st;
        this.x = def.x - this.facing * 70;
        if (this.c.super.variant === 'clones') A.sfx('zap');
      } else if (this.state === 'super' && hb.rush && blocked) {
        this.vx = -this.facing * 6; this.st = Math.max(this.st, 40);
      }
    }
    updatePose(g) {
      let tgt, k = 0.3;
      const t = g.frame, st = this.st;
      switch (this.state) {
        case 'idle': {
          tgt = BMK.copyPose(POSES.idle);
          const b = Math.sin(t * 0.08 + this.side);
          tgt.lean += b * 0.02; tgt.fa1 += b * 0.06; tgt.ba1 -= b * 0.05; tgt.fl0 += b * 0.02; tgt.bl0 -= b * 0.02;
          break;
        }
        case 'walk': tgt = BMK.walkPose(this.walkPhase, this.vx * this.facing < 0); k = 0.4; break;
        case 'crouch': tgt = POSES.crouch; k = 0.45; break;
        case 'block': tgt = POSES.block; k = 0.5; break;
        case 'cblock': tgt = POSES.cblock; k = 0.5; break;
        case 'jump': tgt = POSES.jump; k = 0.25; break;
        case 'attack': {
          const m = this.atk;
          if (st < m.st) tgt = POSES[m.wind];
          else if (st < m.st + m.ac + m.rc * 0.5) tgt = POSES[m.pose];
          else tgt = m.air ? POSES.jump : m.crouch ? POSES.crouch : POSES.idle;
          k = 0.55; break;
        }
        case 'special': {
          const kd = this.c.special.kind;
          if (kd === 'projectile') tgt = st < 11 ? POSES.specialWind : (this.c.special.shape === 'bullet' ? POSES.shoot : POSES.special);
          else if (kd === 'dash') tgt = st < 8 ? POSES.specialWind : st < 26 ? POSES.dash : POSES.idle;
          else if (kd === 'spin') tgt = st < 50 ? POSES.spin : POSES.idle;
          else if (kd === 'invisible') tgt = POSES.watch;
          else if (kd === 'teleport') tgt = st < 14 ? POSES.watch : st < 20 ? POSES.specialWind : st < 34 ? POSES.punch2 : POSES.idle;
          else if (kd === 'flykick') tgt = st < 6 ? POSES.crouch : !this.spec.landed ? POSES.jkick : POSES.crouch;
          else if (kd === 'slam') tgt = st < 8 ? POSES.crouch : !this.spec.landed ? POSES.slamUp : POSES.slam;
          k = 0.5; break;
        }
        case 'super': {
          const kd = this.c.super.kind, v = this.c.super.variant;
          if (kd === 'beam') tgt = st < 14 ? POSES.specialWind : POSES.special;
          else if (kd === 'rush') {
            if (this.sup && this.sup.locked) {
              const n = this.sup.n || 0;
              tgt = v === 'slap' ? (n % 2 ? POSES.slap : POSES.punchWind) : [POSES.punch, POSES.punch2, POSES.kick, POSES.roundhouse][n % 4];
              if (this.sup.final) tgt = POSES.roundhouse;
            } else tgt = st < 8 ? POSES.specialWind : POSES.dash;
          } else if (kd === 'spin') tgt = POSES.spin;
          else if (kd === 'vehicle') tgt = POSES.taunt;
          else if (kd === 'volley') tgt = (st - 12) % 9 < 3 ? POSES.shoot : POSES.special;
          k = 0.55; break;
        }
        case 'hit': tgt = POSES.hit; k = 0.5; break;
        case 'down': tgt = this.grounded && this.vy >= 0 ? POSES.lying : POSES.fall; k = 0.3; break;
        case 'ko': tgt = POSES.lying; k = 0.3; break;
        case 'getup': tgt = POSES.crouch; k = 0.3; break;
        case 'dizzy': {
          tgt = BMK.copyPose(POSES.dizzy);
          const s = Math.sin(t * 0.07);
          tgt.lean = s * 0.18; tgt.head = 0.3 + s * 0.2; tgt.fa0 = 0.15 + s * 0.2; tgt.ba0 = -0.1 - s * 0.2;
          break;
        }
        case 'victory': tgt = this.c.id === 'gone' ? POSES.srk : POSES.victory; k = 0.15; break;
        case 'intro': tgt = this.c.id === 'gone' ? POSES.srk : POSES.taunt; k = 0.12; break;
        case 'fatalVictim': tgt = this.fxPose || POSES.hit; k = 0.35; break;
        case 'dance': tgt = Math.floor(t / 12) % 2 ? POSES.dance1 : POSES.dance2; k = 0.35; break;
        default: tgt = POSES.idle;
      }
      BMK.lerpPose(this.pose, tgt, k);
    }
  }

  /* ═════════════════════ MATCH (a fight between two fighters) ═════════════════════ */
  class Match {
    constructor(c1, c2, opts) {
      this.opts = opts;
      this.f = [new Fighter(c1, 0, opts.ctrl1), new Fighter(c2, 1, opts.ctrl2)];
      this.stage = opts.stage;
      this.round = 1; this.frame = 0;
      this.projectiles = []; this.particles = []; this.texts = [];
      this.shake = 0; this.hitstop = 0; this.slow = 0; this.paused = false;
      this.jeep = null; this.cine = null; this.fatal = null; this.banner = null; this.combo = [null, null];
      this.startRound(true);
    }
    get opponentOf() { return (f) => (f === this.f[0] ? this.f[1] : this.f[0]); }
    startRound(first) {
      for (const f of this.f) f.newRound();
      this.projectiles = []; this.jeep = null; this.cine = null; this.fatal = null; this.timer = 99; this.timerT = 0;
      this.finishWinner = null; this.roundWinner = null;
      if (first) { this.setPhase('intro'); for (const f of this.f) f.state = 'intro'; }
      else this.setPhase('round');
    }
    setPhase(p) { this.phase = p; this.phaseT = 0; }
    canControl(f) {
      if (this.cine || this.fatal) return false;
      if (this.phase === 'fight') return true;
      if (this.phase === 'finish') return f === this.finishWinner;
      return false;
    }
    showBanner(text, opts) { this.banner = Object.assign({ text, t: 0, dur: 90, color: '#ffd23f', size: 76 }, opts || {}); }
    floatText(text, x, y, color, size) { this.texts.push({ text, x, y, color: color || '#fff', size: size || 34, t: 0, dur: 50 }); }
    sparkle(x, y, color) { this.particles.push({ x, y, vx: rand(-1, 1), vy: rand(-2, 0), life: 30, max: 30, color, size: rand(2, 5), type: 'spark' }); }
    dust(x, n) { for (let i = 0; i < n; i++) this.particles.push({ x: x + rand(-50, 50), y: G - rand(0, 10), vx: rand(-3, 3), vy: rand(-3, -0.5), life: 40, max: 40, color: 'rgba(200,180,150,0.6)', size: rand(6, 14), type: 'dust' }); }
    cubes(x, y, color, n) {
      for (let i = 0; i < n; i++) this.particles.push({ x: x + rand(-35, 35), y: y + rand(-100, 100), vx: rand(-3, 3), vy: rand(-5, -1), life: 40, max: 40, color, size: rand(5, 11), type: 'cube' });
    }
    burst(x, y, color, n, speed) {
      for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2), s = rand(2, speed || 9); this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 22, max: 22, color, size: rand(2, 5), type: 'line' }); }
    }

    spawnProjectile(f, sp) {
      const handY = G + f.y - (sp.shape === 'wave' ? 18 : 168);
      const p = {
        x: f.x + f.facing * (sp.shape === 'wave' ? 70 : 72), y: handY, vx: f.facing * sp.speed, vy: sp.arc ? -9 : 0,
        r: sp.r, shape: sp.shape, color: sp.color, owner: f, dmg: sp.dmg, low: sp.low, trip: sp.trip,
        arc: sp.arc, boomerang: sp.boomerang, dir: f.facing, life: 200, dead: false
      };
      this.projectiles.push(p);
      A.sfx({ orb: 'orb', bolt: 'zap', bullet: 'shoot', glasses: 'whoosh', acid: 'orb', wave: 'slam' }[sp.shape] || 'whoosh');
    }

    startSuper(f) {
      f.meter = 0;
      f.state = 'super'; f.st = 0; f.sup = {}; f.vx = 0; f.atkHit = false;
      const line = f.say('super', 2);
      this.cine = { f, t: 0, dur: 105, line };
      A.sfx('super');
    }

    tryFatality(f, opp) {
      if (this.phase !== 'finish' || f !== this.finishWinner || opp.state !== 'dizzy') return false;
      if (Math.abs(f.x - opp.x) > 260) { this.floatText('PAAS AAO!', f.x, G - 280, '#fff', 26); return false; }
      this.fatal = { kind: f.c.fatality.kind, t: 0, att: f, def: opp };
      this.setPhase('fatality');
      f.state = 'intro'; f.vx = 0; opp.state = 'dizzy';
      f.say('fatality', 2);
      A.sfx('gong');
      return true;
    }

    applyHit(att, def, hb) {
      if (def.dead && def.state !== 'dizzy') return;
      const facingAtt = Math.sign(att.x - def.x) === def.facing || Math.abs(att.x - def.x) < 10;
      const blocked = !hb.unblockable && facingAtt && ((def.state === 'block' && !hb.low) || def.state === 'cblock');
      const cx = (Math.max(hb.x0 != null ? hb.x0 : def.x, def.x - 32) + Math.min(hb.x1 != null ? hb.x1 : def.x, def.x + 32)) / 2;
      const cy = hb.y0 != null ? clamp((hb.y0 + hb.y1) / 2, G + def.y - 230, G + def.y - 20) : G + def.y - 160;
      if (blocked) {
        const chip = hb.dmg * 0.1 * att.power;
        def.hp = Math.max(def.state === 'dizzy' ? 0 : 1, def.hp - chip);
        def.vx = -def.facing * (hb.kb * 0.8 + 2);
        att.meter = Math.min(100, att.meter + 3); def.meter = Math.min(100, def.meter + 5);
        A.sfx('block'); this.burst(cx, cy, '#9fd3ff', 8, 6);
        if (Math.random() < 0.3) this.floatText(pick(DATA.meta.blockWords), cx, cy - 40, '#9fd3ff', 26);
        this.hitstop = 3;
        if (att.onConnect) att.onConnect(def, true, hb, this);
        return;
      }
      // dizzy opponent during "Khatam karo isko" — any normal hit just knocks them out
      if (def.state === 'dizzy') {
        def.state = 'down'; def.vy = -12; def.y = -1; def.vx = att.facing * 8; def.dead = true; def.lyingT = 0;
        A.sfx('ko'); this.shake = 16; this.burst(cx, cy, '#fff4a0', 20, 10);
        this.floatText(pick(DATA.meta.hitWords), cx, cy - 40, '#ffd23f', 48);
        this.endMatch(att, false);
        return;
      }
      const inCombo = def.state === 'hit' || (def.state === 'down' && !def.grounded);
      def.comboTaken = inCombo ? def.comboTaken + 1 : 1;
      const scale = Math.pow(0.9, Math.max(0, def.comboTaken - 2));
      const dmg = (hb.dmg * att.power / def.defense) * scale * (att.invis > 0 ? 1.2 : 1);
      def.hp = Math.max(0, def.hp - dmg);
      att.meter = Math.min(100, att.meter + dmg * 0.13); def.meter = Math.min(100, def.meter + dmg * 0.09);
      def.flash = 6; def.atk = null; def.sup = null; def.spec = null;
      if (def.invis > 0) def.invis = Math.min(def.invis, 30);
      const ko = def.hp <= 0;
      if (hb.launch || ko || !def.grounded) {
        def.state = 'down'; def.vy = hb.launch || ko ? -12 : -7; def.y = Math.min(def.y, -1); def.vx = att.facing * (hb.kb * 0.8 + 2); def.lyingT = 0;
      } else if (hb.trip) {
        def.state = 'down'; def.vy = -6; def.y = -1; def.vx = att.facing * 2; def.lyingT = 0;
      } else {
        def.state = 'hit'; def.stun = hb.stun || 15; def.vx = att.facing * (hb.kb || 3);
      }
      def.st = 0;
      const heavy = hb.heavy || hb.launch;
      this.hitstop = heavy ? 7 : 4; this.shake = Math.max(this.shake, heavy ? 9 : 3);
      this.burst(cx, cy, heavy ? '#ffe46b' : '#ffffff', heavy ? 18 : 9, heavy ? 12 : 8);
      if (!hb.quiet && (heavy || Math.random() < 0.35)) this.floatText(pick(DATA.meta.hitWords), cx + rand(-20, 20), cy - 50, heavy ? '#ffd23f' : '#ffffff', heavy ? 46 : 32);
      A.sfx(heavy ? 'heavy' : hb.name === 'kick' ? 'kick' : 'punch');
      if (def.comboTaken >= 2) this.combo[att.side] = { n: def.comboTaken, t: 0 };
      // dialogue triggers — hard hits make the stars talk
      if (!ko) {
        if (att.talkCD <= 0 && !att.speech && ((heavy && Math.random() < 0.5) || def.comboTaken === 3 || (def.comboTaken >= 3 && Math.random() < 0.3))) att.say('hit');
        else if (heavy && def.talkCD <= 0 && !def.speech && def.hp < def.maxHp * 0.6 && Math.random() < 0.3) def.say('hurt');
      }
      if (att.onConnect) att.onConnect(def, false, hb, this);
      if (ko) this.onKO(att, def);
    }

    onKO(att, def) {
      if (this.phase !== 'fight') return;
      const matchPoint = att.wins + 1 >= 2;
      this.roundWinner = att;
      if (matchPoint) {
        def.dizzyAfter = true; def.hp = 0;
        this.finishWinner = att;
        this.setPhase('finish');
        this.slow = 30;
        A.sfx('heavy');
      } else {
        def.dead = true;
        this.slow = 50;
        A.sfx('ko');
        this.setPhase('ko');
        this.showBanner(DATA.meta.announcer.ko, { dur: 140, color: '#ff4040' });
        A.announce('K O!');
      }
      this.projectiles = []; this.jeep = null;
    }
    onDizzy(f) {
      if (this.phase === 'finish') {
        this.phaseT = 0;
        this.showBanner(DATA.meta.announcer.finishHim, { dur: 150, color: '#ff3030', size: 70 });
        A.announce('Khatam karo isko!', 'ख़त्म करो इसको!');
      }
    }
    endMatch(winner, fatal) {
      this.winner = winner;
      winner.wins = Math.max(winner.wins, 2);
      this.setPhase('matchEnd');
      this.matchFatal = fatal;
    }

    update() {
      this.frame++;
      this.phaseT++;
      if (this.banner && ++this.banner.t > this.banner.dur) this.banner = null;
      for (const c of this.combo) if (c) c.t++;
      if (this.shake > 0) this.shake *= 0.85;
      if (this.shake < 0.5) this.shake = 0;

      // super cinematic freezes the world
      if (this.cine) {
        this.cine.t++;
        const sp = this.cine.f.speech; if (sp) sp.t++;
        if (this.cine.t >= this.cine.dur) this.cine = null;
        return;
      }
      if (this.hitstop > 0) { this.hitstop--; return; }
      if (this.slow > 0) { this.slow--; if (this.frame % 3 !== 0) return; }

      this.updatePhase();
      const [a, b] = this.f;
      if (this.phase !== 'fatality') { a.update(this, b); b.update(this, a); }
      else { this.updateFatality(); }

      this.pushApart();
      this.resolveHits();
      this.updateProjectiles();
      this.updateJeep();
      for (const p of this.particles) {
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.type === 'dust') { p.vx *= 0.94; p.vy *= 0.94; p.size *= 1.02; }
        else if (p.type === 'pixel' || p.type === 'note') p.vy -= 0.02;
        else p.vy += 0.15;
      }
      this.particles = this.particles.filter((p) => p.life > 0);
      for (const t of this.texts) { t.t++; t.y -= 0.8; }
      this.texts = this.texts.filter((t) => t.t < t.dur);
      for (const f of this.f) f.dispHp += (f.hp - f.dispHp) * (f.dispHp > f.hp ? 0.05 : 1);
    }

    updatePhase() {
      const [a, b] = this.f, t = this.phaseT;
      switch (this.phase) {
        case 'intro':
          if (t === 15) a.say('intro', 2, b.c.id);
          if (!this.bIntro && t >= 15 + Math.max(110, (a.speech ? a.speech.dur : 0) - 20)) { this.bIntro = true; b.say('intro', 2, a.c.id); }
          if (t > 15 && !a.speech && !b.speech && t > 160) { for (const f of this.f) f.state = 'idle'; this.setPhase('round'); }
          if (hit('Enter', 'Space') && t > 20) { for (const f of this.f) { f.state = 'idle'; f.speech = null; } A.hush(); this.setPhase('round'); }
          break;
        case 'round':
          if (t === 1) { this.showBanner(DATA.meta.announcer.round.replace('{n}', this.round), { dur: 70 }); A.announce('Round ' + this.round); A.sfx('gong'); }
          if (t === 75) { this.showBanner(DATA.meta.announcer.fight, { dur: 80, size: 58, color: '#ffffff' }); A.announce('Lights! Camera! Action!'); }
          if (t > 105) this.setPhase('fight');
          break;
        case 'fight':
          if (++this.timerT >= 60) {
            this.timerT = 0; this.timer--;
            if (this.timer <= 0) this.timeOver();
          }
          break;
        case 'ko':
          if (t === 150 && this.roundWinner) { this.roundWinner.state = 'victory'; this.roundWinner.say('win', 2); }
          if (t > 330 || (t > 160 && hit('Enter'))) this.nextRound();
          break;
        case 'timeout':
          if (t === 120 && this.roundWinner) { this.roundWinner.state = 'victory'; this.roundWinner.say('win', 2); }
          if (t > 300 || (t > 130 && hit('Enter'))) this.nextRound();
          break;
        case 'finish':
          if (this.f.some((f) => f.state === 'dizzy') && t > 330) {
            const loser = this.f.find((f) => f.state === 'dizzy');
            loser.state = 'down'; loser.dead = true; loser.vy = -4; loser.y = -1; loser.lyingT = 0;
            this.endMatch(this.finishWinner, false);
          }
          break;
        case 'matchEnd':
          if (t === 60 && !this.matchFatal) { this.winner.state = 'victory'; this.winner.say('win', 2); }
          if (t === 60 && this.matchFatal) this.winner.state = 'victory';
          if (t === 30) {
            this.showBanner(DATA.meta.announcer.wins.replace('{name}', this.winner.c.name), { dur: 400, size: 50 });
            if (this.winner.hp >= this.winner.maxHp) setTimeout(() => this.showBanner(DATA.meta.announcer.flawless, { dur: 200, size: 54, color: '#7dff7a' }), 2500);
          }
          if (!this.ended && (t > 380 || (t > 120 && hit('Enter')))) { this.ended = true; this.opts.onEnd(this.winner.side, this); }
          break;
      }
    }
    timeOver() {
      const [a, b] = this.f;
      this.setPhase('timeout');
      this.showBanner(DATA.meta.announcer.timeOver, { dur: 120, size: 60 });
      A.announce('Interval!');
      if (Math.abs(a.hp - b.hp) < 1) { this.roundWinner = null; setTimeout(() => this.showBanner(DATA.meta.announcer.draw, { dur: 120, size: 44 }), 1500); return; }
      const w = a.hp > b.hp ? a : b, l = w === a ? b : a;
      this.roundWinner = w;
      l.state = 'down'; l.dead = true; l.vy = -4; l.y = -1; l.lyingT = 0;
    }
    nextRound() {
      if (this.roundWinner) this.roundWinner.wins++;
      const w = this.f.find((f) => f.wins >= 2);
      if (w) { this.endMatch(w, false); return; }
      this.round++;
      this.startRound(false);
    }

    pushApart() {
      const [a, b] = this.f;
      if (['ko', 'down'].includes(a.state) || ['ko', 'down'].includes(b.state) || a.fx || b.fx) return;
      if (Math.abs(a.y - b.y) > 110) return;
      const dx = b.x - a.x, min = 62;
      if (Math.abs(dx) < min) {
        const push = (min - Math.abs(dx)) / 2, s = dx >= 0 ? 1 : -1;
        a.x = clamp(a.x - s * push, 45, W - 45); b.x = clamp(b.x + s * push, 45, W - 45);
        if (Math.abs(b.x - a.x) < min - 1) { if (a.x <= 46 || a.x >= W - 46) b.x = clamp(a.x + s * min, 45, W - 45); else a.x = clamp(b.x - s * min, 45, W - 45); }
      }
    }
    resolveHits() {
      for (const att of this.f) {
        const hb = att.hitbox; if (!hb) continue;
        const def = this.opponentOf(att);
        const hurt = def.hurtbox(); if (!hurt) continue;
        if (hb.x1 < hurt.x0 || hb.x0 > hurt.x1 || hb.y1 < hurt.y0 || hb.y0 > hurt.y1) continue;
        if (hb.multi) { if (this.frame - (att.lastMulti || -99) < hb.multi) continue; att.lastMulti = this.frame; }
        else if (att.atkHit) continue;
        att.atkHit = true;
        this.applyHit(att, def, hb);
      }
    }
    updateProjectiles() {
      for (const p of this.projectiles) {
        p.x += p.vx; p.life--;
        if (p.arc) { p.vy += 0.38; p.y += p.vy; if (p.y > G - 12) { p.dead = true; this.burst(p.x, G - 10, p.color, 14, 6); } }
        if (p.boomerang) {
          p.vx -= p.dir * 0.32;
          if (Math.sign(p.vx) !== p.dir && Math.abs(p.x - p.owner.x) < 40) p.dead = true;
        }
        if (p.x < -60 || p.x > W + 60 || p.life <= 0) p.dead = true;
        if (p.dead) continue;
        const def = this.opponentOf(p.owner);
        const hb = def.hurtbox();
        if (hb && p.x + p.r > hb.x0 && p.x - p.r < hb.x1 && p.y + p.r > hb.y0 && p.y - p.r < hb.y1 && !p.hitDone) {
          p.hitDone = true; p.dead = true;
          this.applyHit(p.owner, def, { dmg: p.dmg, kb: 5, stun: 18, heavy: p.dmg >= 60, low: p.low, trip: p.trip, x0: p.x - 5, x1: p.x + 5, y0: p.y - 5, y1: p.y + 5, name: 'proj' });
        }
      }
      // projectile clash
      for (const p of this.projectiles) for (const q of this.projectiles) {
        if (p === q || p.dead || q.dead || p.owner === q.owner) continue;
        if (Math.abs(p.x - q.x) < p.r + q.r && Math.abs(p.y - q.y) < p.r + q.r + 20) { p.dead = q.dead = true; this.burst((p.x + q.x) / 2, p.y, '#ffffff', 20, 10); A.sfx('block'); this.floatText('TAKKAR!', p.x, p.y - 40, '#fff', 30); }
      }
      this.projectiles = this.projectiles.filter((p) => !p.dead);
    }
    updateJeep() {
      const j = this.jeep; if (!j) return;
      j.t++; j.x += j.dir * 24;
      if (this.frame % 3 === 0) this.dust(j.x - j.dir * 110, 2);
      const def = this.opponentOf(j.owner), hb = def.hurtbox();
      if (!j.hit && hb && Math.abs(j.x + j.dir * 90 - def.x) < 40 && hb.y1 > G - 110) {
        j.hit = true;
        this.applyHit(j.owner, def, { dmg: 230, kb: 14, stun: 30, launch: true, heavy: true, x0: def.x - 10, x1: def.x + 10, y0: G - 120, y1: G - 60, name: 'jeep' });
        this.floatText('JEEP ENTRY!', def.x, G - 300, '#ffd23f', 48);
      }
      if ((j.dir === 1 && j.x > W + 260) || (j.dir === -1 && j.x < -260)) this.jeep = null;
    }

    /* ── fatalities ("PACKUP") ── */
    updateFatality() {
      const F = this.fatal, att = F.att, def = F.def, t = ++F.t;
      att.update(this, def); // lets the attacker's speech tick & pose animate (no control during fatality)
      def.updatePose(this);
      if (def.speech && ++def.speech.t > def.speech.dur) def.speech = null;
      if (att.state !== 'dance') att.state = t < 90 ? 'intro' : 'victory';
      if (t === 1) { def.fx = { alpha: 1, rot: 0, dx: 0, dy: 0, scale: 1 }; }
      const fx = def.fx;
      if (t < 90) return;
      switch (F.kind) {
        case 'cubes':
          if (t === 90) { def.state = 'fatalVictim'; def.fxPose = POSES.hit; A.sfx('zap'); this.shake = 8; }
          fx.alpha = Math.max(0, 1 - (t - 90) / 60);
          if (t < 160 && t % 2 === 0) this.cubes(def.x, G - 120, pick(['#ff2a2a', def.c.look.torso.color, def.c.look.skin, def.c.look.pants]), 6);
          if (t === 150) { fx.hidden = true; A.sfx('heavy'); this.floatText('GAME OVER', def.x, G - 240, '#ff2a2a', 56); }
          if (t === 190) this.floatText('INSERT COIN TO CONTINUE', def.x, G - 190, '#fff', 24);
          break;
        case 'launch': case 'space':
          if (t === 90) {
            def.state = 'fatalVictim'; def.fxPose = POSES.fall; F.vy = -26; A.sfx('heavy'); this.burst(def.x, G - 150, att.c.special.color || '#29d4ff', 30, 14); this.shake = 14;
            if (F.kind === 'space') { att.vy = -26; att.y = -1; this.floatText('ANTARIKSH!', def.x, G - 330, '#8fd6ff', 46); }
          }
          F.vy += 0.25; fx.dy += F.vy; fx.rot += 0.25; fx.scale = Math.max(0.2, fx.scale - 0.006);
          if (G + fx.dy < -100 && !F.star) { F.star = t; A.sfx('twinkle'); }
          break;
        case 'dance':
          if (t === 90) { def.state = 'dance'; att.state = 'dance'; this.floatText('NACHO!', def.x, G - 300, '#ff7ad9', 46); }
          if (t % 10 === 0) this.particles.push({ x: def.x + rand(-40, 40), y: G - 250, vx: rand(-1, 1), vy: -1.5, life: 60, max: 60, color: '#ff7ad9', size: 18, type: 'note' });
          if (t === 210) { def.state = 'down'; def.vy = -4; def.y = -1; def.lyingT = 0; def.dead = true; def.fx = null; att.state = 'victory'; A.sfx('ko'); }
          if (t > 210) def.update(this, att);
          break;
        case 'delete':
          if (t === 90) { def.state = 'fatalVictim'; def.fxPose = POSES.hit; this.floatText('DELETING...', def.x, G - 300, '#7dffb0', 40); A.sfx('zap'); }
          fx.alpha = Math.max(0, 1 - (t - 90) / 90);
          if (t % 2 === 0 && fx.alpha > 0) for (let i = 0; i < 4; i++) this.particles.push({ x: def.x + rand(-35, 35), y: G - rand(0, 230), vx: rand(-0.5, 0.5), vy: rand(-1.5, -0.3), life: 50, max: 50, color: pick([def.c.look.torso.color, def.c.look.skin, def.c.look.pants, '#7dffb0']), size: rand(4, 9), type: 'pixel' });
          if (t === 185) { fx.hidden = true; this.floatText('0 FILES REMAINING', def.x, G - 200, '#7dffb0', 34); }
          break;
        case 'tornado':
          if (t === 90) { def.state = 'fatalVictim'; def.fxPose = POSES.spin; A.sfx('spin'); }
          F.th = Math.min(340, (F.th || 0) + 8);
          if (t > 120) { fx.dy -= 7; fx.rot += 0.4; }
          if (t === 140) this.floatText('SORRY SHAKTIMAAN!', def.x, G - 380, '#f2c230', 40);
          break;
        case 'vanish':
          if (t === 90) { def.state = 'fatalVictim'; def.fxPose = POSES.hit; A.sfx('invisible'); }
          fx.alpha = Math.max(0, 1 - (t - 90) / 70);
          if (t % 3 === 0) this.sparkle(def.x + rand(-40, 40), G - rand(0, 230), '#ff4040');
          if (t === 165) { fx.hidden = true; this.floatText('GAYAB!', def.x, G - 260, '#ff4040', 56); }
          break;
        case 'arrest':
          if (t === 90) { F.jx = att.facing === 1 ? -220 : W + 220; A.sfx('siren'); def.state = 'fatalVictim'; def.fxPose = POSES.victory; this.floatText('HAATH UPAR!', def.x, G - 300, '#fff', 40); }
          if (t >= 90) {
            const stopAt = def.x - att.facing * 40;
            if (t < 170) F.jx += (stopAt - F.jx) * 0.08;
            if (t === 160) { fx.hidden = true; this.floatText('ARRESTED!', def.x, G - 220, '#ffd23f', 50); }
            if (t === 170) A.sfx('siren');
            if (t >= 175) F.jx += att.facing * 24;
          }
          break;
        case 'slap':
          if (t === 90) { def.state = 'fatalVictim'; def.fxPose = POSES.dizzy; att.state = 'intro'; }
          if (t < 125) att.state = 'intro';
          if (t === 125) { A.sfx('slap'); A.sfx('heavy'); this.shake = 20; this.burst(def.x, G - 190, '#ffcf4a', 30, 14); this.floatText('THAPPAD!', def.x, G - 300, '#ffcf4a', 60); def.fxPose = POSES.fall; F.vx = att.facing * 26; F.vy = -10; }
          if (t > 125) { fx.dx += F.vx; F.vy += 0.4; fx.dy += F.vy; fx.rot += 0.35 * att.facing; }
          break;
        case 'noarms':
          if (t === 90) { def.state = 'fatalVictim'; def.fxPose = POSES.dizzy; }
          if (t === 115) {
            fx.noArms = true; A.sfx('heavy'); this.shake = 10;
            for (let i = 0; i < 30; i++) this.particles.push({ x: def.x + rand(-30, 30), y: G - 190 + rand(-20, 20), vx: rand(-2, 2), vy: rand(-2, 0), life: 60, max: 60, color: 'rgba(220,220,220,0.7)', size: rand(10, 20), type: 'dust' });
            this.floatText('YEH HAATH HUMKO DE DE!', def.x, G - 320, '#ffd23f', 32);
            def.fxPose = POSES.hit;
          }
          if (t === 200) { def.fxPose = POSES.fall; F.fall = true; }
          if (F.fall) { fx.rot = Math.max(-Math.PI / 2, fx.rot - 0.06); }
          break;
        case 'acid':
          if (t === 90) { def.state = 'fatalVictim'; def.fxPose = POSES.hit; F.pool = 0; A.sfx('orb'); }
          F.pool = Math.min(1, F.pool + 0.04);
          if (t > 115) { fx.dy += 2.6; fx.clip = true; }
          if (t % 3 === 0) this.particles.push({ x: def.x + rand(-60, 60), y: G - 5, vx: 0, vy: rand(-2, -0.5), life: 30, max: 30, color: '#9dff4a', size: rand(4, 9), type: 'pixel' });
          if (t === 200) this.floatText('MOGAMBO KHUSH HUA!', def.x, G - 260, '#9dff4a', 40);
          break;
      }
      if (t === 250) { this.showBanner(DATA.meta.announcer.fatality, { dur: 200, size: 110, color: '#ff3030', sub: att.c.fatality.name }); A.announce('Pack up!'); A.sfx('gong'); }
      if (t === 330) { def.dead = true; this.endMatch(att, true); }
    }

    /* ═════════════════════ DRAW ═════════════════════ */
    draw() {
      ctx.save();
      if (this.shake) ctx.translate(rand(-this.shake, this.shake), rand(-this.shake, this.shake));
      BMK.drawStage(ctx, this.stage, W, H, G, this.frame);
      if (this.phase === 'fatality') { ctx.fillStyle = `rgba(80,0,0,${Math.min(0.45, this.fatal.t / 120)})`; ctx.fillRect(0, 0, W, H); }
      if (this.fatal && this.fatal.kind === 'acid' && this.fatal.pool) {
        ctx.save(); ctx.shadowColor = '#7dff3a'; ctx.shadowBlur = 30; ctx.fillStyle = '#5fd12a';
        ctx.beginPath(); ctx.ellipse(this.fatal.def.x, G, 110 * this.fatal.pool, 22 * this.fatal.pool, 0, 0, 7); ctx.fill(); ctx.restore();
      }
      // fighters: the one attacking drawn on top
      const order = [...this.f].sort((a, b) => (a.state === 'attack' || a.state === 'super' ? 1 : 0) - (b.state === 'attack' || b.state === 'super' ? 1 : 0));
      for (const f of order) this.drawFighter(f);
      this.drawSuperFx();
      for (const p of this.projectiles) BMK.drawProjectile(ctx, p, this.frame);
      if (this.jeep) BMK.drawJeep(ctx, this.jeep.x, G + 8, this.jeep.dir, this.frame * 0.5);
      if (this.fatal) this.drawFatalityFx();
      this.drawParticles();
      for (const t of this.texts) {
        const s = t.t < 6 ? 0.5 + t.t / 12 : 1;
        drawText(t.text, t.x, t.y, t.size * s, t.color, { alpha: 1 - Math.max(0, (t.t - t.dur * 0.6) / (t.dur * 0.4)), rot: -0.08 });
      }
      for (const f of this.f) this.drawSpeech(f);
      ctx.restore();
      this.drawHUD();
      if (this.banner) this.drawBanner();
      if (this.cine) this.drawCinematic();
      if (this.phase === 'intro' && this.phaseT > 20) drawText('ENTER — skip', W / 2, H - 20, 18, 'rgba(255,255,255,0.6)', { font: FONT2 });
    }
    drawFighter(f) {
      const fx = f.fx || {};
      if (fx.hidden) return;
      // trails
      for (const tr of f.trail) BMK.drawFighter(ctx, { char: f.c, pose: tr.pose, x: tr.x, y: G + tr.y, facing: tr.facing, alpha: tr.a * (f.invis > 0 ? 0.2 : 1), t: this.frame, noShadow: true, air: -tr.y });
      let alpha = (fx.alpha == null ? 1 : fx.alpha);
      if (f.state === 'special' && f.c.special.kind === 'teleport') { const st = f.st; alpha *= st < 6 ? 1 - st / 7 : st < 20 ? 0.06 : Math.min(1, (st - 19) / 4); }
      if (f.invis > 0) alpha *= 0.07 + (f.invis < 40 && f.invis % 8 < 4 ? 0.4 : 0) + Math.abs(Math.sin(this.frame * 0.1)) * 0.05;
      let rot = fx.rot || 0, x = f.x + (fx.dx || 0), y = G + f.y + (fx.dy || 0), lying = false;
      if (f.state === 'down' || f.state === 'ko' || (f.state === 'getup')) {
        let r;
        if (f.state === 'getup') r = -Math.PI / 2 * Math.max(0, 1 - f.st / 14);
        else if (f.grounded && f.vy >= 0) r = -Math.PI / 2 * Math.min(1, (f.lyingT + 1) / 6);
        else r = -0.7;
        rot += r;
        const prog = -r / (Math.PI / 2);
        x += f.facing * 95 * prog; y -= 12 * prog; lying = prog > 0.5;
      }
      const mouth = f.speech && f.speech.t < f.speech.dur - 25 ? 0.5 + 0.5 * Math.sin(this.frame * 0.7) : (f.state === 'hit' || f.state === 'down' ? 0.6 : 0);
      if (fx.clip) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, G + 4); ctx.clip(); }
      BMK.drawFighter(ctx, {
        char: f.c, pose: f.pose, x, y, facing: f.drawFacing || f.facing, scale: fx.scale || 1, t: this.frame,
        alpha, rot, mouth, damaged: f.c.look.robot && f.hp < f.maxHp * 0.4,
        power: f.state === 'special' || f.state === 'super' || f.meter >= 100, hurt: ['hit', 'down', 'ko', 'dizzy', 'fatalVictim'].includes(f.state),
        flash: f.flash > 0, air: -f.y, noShadow: !!rot || fx.dy, noArms: fx.noArms
      });
      if (fx.clip) ctx.restore();
      if (f.invis > 0) { // the famous red light
        const s = BMK.skeleton(f.pose);
        ctx.save(); ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 25;
        BMK.circle(ctx, f.x + f.facing * (s.neck[0] + 10), G + f.y + s.neck[1] + 40, 5 + Math.sin(this.frame * 0.3) * 1.5, '#ff2020');
        ctx.restore();
      }
      if (f.state === 'dizzy') {
        for (let i = 0; i < 3; i++) {
          const a = this.frame * 0.1 + (i * Math.PI * 2) / 3;
          drawText('★', f.x + Math.cos(a) * 36, G + f.y - 262 + Math.sin(a) * 8, 24, '#ffe14a', { font: 'sans-serif' });
        }
      }
      // Chitti clones during "Chitti Army"
      if (f.state === 'super' && f.c.super.variant === 'clones' && f.sup && f.sup.locked) {
        const opp = this.opponentOf(f);
        [-150, 90, -230].forEach((off, i) => {
          const pose = [POSES.punch, POSES.kick, POSES.punch2][(Math.floor(this.frame / 6) + i) % 3];
          const cx = opp.x + off;
          BMK.drawFighter(ctx, { char: f.c, pose, x: cx, y: G + (i === 2 ? -60 : 0), facing: cx < opp.x ? 1 : -1, alpha: 0.55, t: this.frame, noShadow: true });
        });
      }
    }
    drawSuperFx() {
      for (const f of this.f) {
        if (f.state !== 'super' || !f.sup) continue;
        const k = f.c.super;
        if (k.kind === 'beam' && f.sup.beam) {
          const hx = f.x + f.facing * 75, hy = G + f.y - 168, len = f.facing === 1 ? W - hx : hx;
          const wob = 1 + Math.sin(this.frame * 0.8) * 0.15;
          ctx.save(); ctx.shadowColor = k.color; ctx.shadowBlur = 40;
          ctx.fillStyle = k.color; ctx.globalAlpha = 0.6;
          ctx.fillRect(f.facing === 1 ? hx : 0, hy - 38 * wob, len, 76 * wob);
          ctx.globalAlpha = 1; ctx.fillStyle = '#fff';
          ctx.fillRect(f.facing === 1 ? hx : 0, hy - 14 * wob, len, 28 * wob);
          BMK.circle(ctx, hx, hy, 48 * wob, '#fff');
          ctx.restore();
        }
        if (k.kind === 'spin' && f.st < 85) BMK.drawTornado(ctx, f.x, G + f.y, 320, k.color, this.frame);
      }
      for (const f of this.f) if (f.state === 'special' && f.c.special.kind === 'spin' && f.st < 50 && f.st > 3) BMK.drawTornado(ctx, f.x, G + f.y, 250, f.c.special.color, this.frame);
    }
    drawFatalityFx() {
      const F = this.fatal, t = F.t;
      if (F.kind === 'launch' && F.star && t - F.star < 50) {
        const s = 1 + Math.sin((t - F.star) * 0.5) * 0.5;
        drawText('✦', F.def.x, 70, 50 * s, '#ffffff', { font: 'sans-serif' });
      }
      if (F.kind === 'tornado' && F.th) BMK.drawTornado(ctx, F.def.x, G, F.th, '#f2c230', this.frame);
      if (F.kind === 'arrest' && F.jx != null) BMK.drawJeep(ctx, F.jx, G + 8, F.att.facing, this.frame * 0.5);
      if (F.kind === 'slap' && t > 95 && t < 140) {
        const p = Math.min(1, (t - 95) / 30), hx = F.att.x + F.att.facing * (40 + p * (Math.abs(F.def.x - F.att.x) - 20));
        ctx.save(); ctx.translate(hx, G - 190); ctx.scale(F.att.facing * 3.2, 3.2); ctx.rotate(-0.3);
        BMK.poly(ctx, [[-14, -16], [10, -18], [16, -26], [20, -24], [16, -12], [22, -6], [18, 12], [-14, 14]], F.att.c.look.skin, '#000', 1.5);
        ctx.restore();
      }
    }
    drawParticles() {
      for (const p of this.particles) {
        const a = p.life / p.max;
        ctx.globalAlpha = Math.max(0, a);
        if (p.type === 'line') {
          ctx.strokeStyle = p.color; ctx.lineWidth = p.size; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5); ctx.stroke();
        } else if (p.type === 'note') {
          drawText('♪', p.x + Math.sin(p.life * 0.2) * 10, p.y, p.size * 1.4, p.color, { font: 'sans-serif' });
        } else if (p.type === 'pixel' || p.type === 'cube') {
          ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size);
          if (p.type === 'cube') { ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(p.x, p.y, p.size, p.size); }
        } else {
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
    drawSpeech(f) {
      const sp = f.speech; if (!sp || (f.fx && f.fx.hidden)) return;
      const appear = Math.min(1, sp.t / 8);
      ctx.save();
      ctx.font = `600 21px ${FONT2.replace('"Teko", ', '')}`;
      ctx.font = '600 20px "Poppins", "Segoe UI", Arial, sans-serif';
      const lines = wrap(sp.line.text, 330);
      const lh = 25, bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 34, bh = lines.length * lh + 34;
      const headX = f.x, headY = G + f.y - 255;
      let bx = clamp(headX - bw / 2 + f.facing * 40, 10, W - bw - 10);
      let by = clamp(headY - bh - 30 - (f.side === 1 && this.f[0].speech ? 0 : 0), 120, H - bh - 10);
      if (f.side === 1 && this.f[0].speech) by = clamp(by - 20, 120, H);
      ctx.globalAlpha = appear;
      ctx.translate(bx + bw / 2, by + bh); ctx.scale(0.8 + 0.2 * appear, 0.8 + 0.2 * appear); ctx.translate(-(bx + bw / 2), -(by + bh));
      ctx.fillStyle = '#fffdf3'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3.5;
      roundRect(bx, by, bw, bh, 18); ctx.fill(); ctx.stroke();
      const tx = clamp(headX, bx + 24, bx + bw - 24);
      ctx.beginPath(); ctx.moveTo(tx - 12, by + bh - 2); ctx.lineTo(headX + f.facing * 6, headY - 12); ctx.lineTo(tx + 12, by + bh - 2); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillRect(tx - 10, by + bh - 6, 20, 6);
      ctx.fillStyle = '#111'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      lines.forEach((l, i) => ctx.fillText(l, bx + 17, by + 13 + i * lh));
      ctx.font = 'italic 12px Arial, sans-serif'; ctx.fillStyle = '#8a6a2a'; ctx.textAlign = 'right';
      const src = sp.line.type === 'parody' ? '— ' + f.c.name : '— ' + sp.line.source + (sp.line.year ? ` (${sp.line.year})` : '');
      ctx.fillText(src, bx + bw - 14, by + bh - 17);
      ctx.restore();
    }
    drawHUD() {
      const [a, b] = this.f;
      const bw = 500, bh = 30, y = 28;
      const bar = (f, x, dir) => {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - 4, y - 4, bw + 8, bh + 8);
        ctx.fillStyle = '#5a0b0b'; ctx.fillRect(x, y, bw, bh);
        const dw = bw * f.dispHp / f.maxHp, hw = bw * f.hp / f.maxHp;
        ctx.fillStyle = '#ff3b2f';
        if (dir === 1) ctx.fillRect(x, y, dw, bh); else ctx.fillRect(x + bw - dw, y, dw, bh);
        const gr = ctx.createLinearGradient(0, y, 0, y + bh);
        const low = f.hp < f.maxHp * 0.3;
        gr.addColorStop(0, low ? '#ffb02e' : '#7dff5a'); gr.addColorStop(1, low ? '#d86a00' : '#1f9e22');
        ctx.fillStyle = gr;
        if (dir === 1) ctx.fillRect(x, y, hw, bh); else ctx.fillRect(x + bw - hw, y, hw, bh);
        ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.strokeRect(x, y, bw, bh);
        // name
        const nx = dir === 1 ? x : x + bw;
        drawText(f.c.name, nx, y + bh + 26, 24, '#fff', { align: dir === 1 ? 'left' : 'right', stroke: 5 });
        drawText(`${f.c.actor} · ${f.c.film}`, nx + (dir === 1 ? 0 : 0), y + bh + 46, 15, '#ffd23f', { align: dir === 1 ? 'left' : 'right', font: FONT2, stroke: 3 });
        // round wins (film reels)
        for (let i = 0; i < f.wins; i++) {
          const rx = dir === 1 ? x + bw - 18 - i * 28 : x + 18 + i * 28;
          BMK.circle(ctx, rx, y + bh + 22, 11, '#ffd23f', '#000', 2);
          for (let j = 0; j < 5; j++) { const an = j * 1.256; BMK.circle(ctx, rx + Math.cos(an) * 6, y + bh + 22 + Math.sin(an) * 6, 2.3, '#000'); }
        }
        // super meter
        const my = H - 34, mw = 300, mx = dir === 1 ? 30 : W - 30 - mw;
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(mx - 3, my - 3, mw + 6, 20);
        const full = f.meter >= 100;
        ctx.fillStyle = full ? `hsl(${(this.frame * 8) % 360},90%,60%)` : '#2fa8ff';
        const mww = mw * f.meter / 100;
        if (dir === 1) ctx.fillRect(mx, my, mww, 14); else ctx.fillRect(mx + mw - mww, my, mww, 14);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(mx, my, mw, 14);
        const keyName = f.ctrl.human ? (f.side === 0 ? 'T' : 'O') : '';
        drawText(full ? `SUPERSTAR READY! ${keyName ? '[' + keyName + ']' : ''}` : 'SUPERSTAR METER', dir === 1 ? mx : mx + mw, my - 8, 16, full ? '#fff' : '#9fd3ff', { align: dir === 1 ? 'left' : 'right', font: FONT2, stroke: 3 });
      };
      bar(a, 30, 1); bar(b, W - 30 - bw, -1);
      // timer
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(W / 2 - 50, 14, 100, 70);
      ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.strokeRect(W / 2 - 50, 14, 100, 70);
      drawText(String(Math.max(0, this.timer)).padStart(2, '0'), W / 2, 72, 50, this.timer <= 10 ? '#ff4040' : '#fff', { stroke: 0 });
      drawText('ROUND ' + this.round, W / 2, 104, 16, '#ffd23f', { font: FONT2, stroke: 3 });
      // combos
      this.combo.forEach((c, i) => {
        if (!c || c.t > 90 || c.n < 2) return;
        const word = Object.keys(DATA.meta.comboWords).map(Number).filter((n) => n <= c.n).sort((x, y) => y - x)[0];
        const x = i === 0 ? 60 : W - 60;
        drawText(`${c.n} HIT COMBO`, x, 230, 34, '#ffd23f', { align: i === 0 ? 'left' : 'right', alpha: 1 - Math.max(0, (c.t - 60) / 30) });
        drawText(DATA.meta.comboWords[word], x, 266, 26, '#ff7ad9', { align: i === 0 ? 'left' : 'right', alpha: 1 - Math.max(0, (c.t - 60) / 30) });
      });
      if (this.phase === 'finish' && this.f.some((f) => f.state === 'dizzy')) {
        const human = this.finishWinner.ctrl.human;
        if (human && Math.floor(this.frame / 20) % 2) drawText(`Get close & press SUPER [${this.finishWinner.side === 0 ? 'T' : 'O'}] or SPECIAL for a FATALITY — "PACKUP"!`, W / 2, 200, 22, '#fff', { font: FONT2, stroke: 4 });
      }
    }
    drawBanner() {
      const b = this.banner, t = b.t;
      const s = t < 10 ? 2 - t / 10 : 1, a = t > b.dur - 15 ? (b.dur - t) / 15 : 1;
      drawText(b.text, W / 2, H / 2 - 30, b.size * s, b.color, { alpha: a, stroke: 10, shadow: true });
      if (b.sub) drawText(b.sub, W / 2, H / 2 + 40, 34, '#fff', { alpha: a, stroke: 6 });
    }
    drawCinematic() {
      const c = this.cine, f = c.f, t = c.t;
      const a = Math.min(1, t / 8, (c.dur - t) / 8);
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
      const col = f.c.super.color;
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-0.06);
      const gr = ctx.createLinearGradient(-W, 0, W, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.globalAlpha = a * 0.55; ctx.fillRect(-W, -130, W * 2, 260);
      ctx.globalAlpha = a;
      for (let i = 0; i < 14; i++) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(((i * 160 + t * 30) % (W * 2)) - W, -130 + (i * 37) % 260, 80, 3); }
      ctx.restore();
      const px = f.side === 0 ? 60 : W - 60 - 360, slide = (1 - Math.min(1, t / 14)) * (f.side === 0 ? -300 : 300);
      ctx.fillStyle = '#000'; ctx.fillRect(px + slide - 6, H / 2 - 186, 372, 372);
      ctx.fillStyle = col; ctx.fillRect(px + slide, H / 2 - 180, 360, 360);
      BMK.drawPortrait(ctx, f.c, px + slide, H / 2 - 180, 360, 360, { facing: f.side === 0 ? 1 : -1, mouth: 0.5 + 0.5 * Math.sin(t * 0.7), t, zoom: 1.0 });
      const tx = f.side === 0 ? 470 : 70;
      drawText(f.c.super.name.toUpperCase(), tx, H / 2 - 40, 54, '#fff', { align: 'left', stroke: 8 });
      drawText('SUPERSTAR MOVE', tx, H / 2 - 100, 24, col, { align: 'left', font: FONT2, stroke: 4 });
      if (c.line) {
        ctx.font = 'italic 600 24px "Poppins", Arial, sans-serif';
        const lines = wrap('"' + c.line.text + '"', 700);
        lines.forEach((l, i) => drawText(l, tx, H / 2 + 20 + i * 32, 24, '#ffe9a8', { align: 'left', font: '"Poppins", Arial, sans-serif', weight: 'italic 600', stroke: 4 }));
      }
      ctx.restore();
    }
  }

  /* ═════════════════════ text helpers ═════════════════════ */
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function wrap(text, maxW) {
    const words = text.split(' '), out = []; let line = '';
    for (const w of words) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test; }
    if (line) out.push(line);
    return out;
  }
  function drawText(text, x, y, size, color, o) {
    o = o || {};
    ctx.save();
    ctx.globalAlpha *= o.alpha == null ? 1 : Math.max(0, o.alpha);
    ctx.font = `${o.weight || ''} ${Math.round(size)}px ${o.font || FONT}`;
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic';
    ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
    if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6; }
    const sw = o.stroke == null ? 6 : o.stroke;
    if (sw) { ctx.lineJoin = 'round'; ctx.strokeStyle = o.strokeColor || '#000'; ctx.lineWidth = sw; ctx.strokeText(text, 0, 0); }
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = color; ctx.fillText(text, 0, 0);
    ctx.restore();
  }
  function wrapText(text, x, y, maxW, lh, size, color, font) {
    ctx.font = `${size}px ${font || FONT2}`;
    const lines = wrap(text, maxW);
    lines.forEach((l, i) => drawText(l, x, y + i * lh, size, color, { align: 'left', font: font || FONT2, stroke: 0 }));
    return lines.length;
  }

  /* ═════════════════════ SCENES ═════════════════════ */
  const settings = { difficulty: 1, };
  let scene = null, frame = 0;
  const setScene = (s) => { scene = s; frame = 0; if (s.enter) s.enter(); };

  function filmBackground(t, hue) {
    const gr = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 800);
    gr.addColorStop(0, `hsl(${hue || 0},60%,22%)`); gr.addColorStop(1, '#060208');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 0.08;
    for (let i = 0; i < 18; i++) { ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(t * 0.002 + i * 0.35); ctx.fillStyle = '#ffd23f'; ctx.fillRect(0, -20, 1200, 40); ctx.restore(); }
    ctx.restore();
    // film strips
    for (const y of [0, H - 36]) {
      ctx.fillStyle = '#000'; ctx.fillRect(0, y, W, 36);
      ctx.fillStyle = '#e8e2cf';
      for (let x = -(t * 2 % 40); x < W; x += 40) ctx.fillRect(x + 10, y + 10, 20, 16);
    }
  }

  /* ── TITLE ── */
  const TitleScene = {
    items: () => ['ARCADE  (1P vs CPU)', 'VERSUS  (2 Players)', `DIFFICULTY: ${['EASY', 'NORMAL', 'HARD'][settings.difficulty]}`, `VOICE (dialogues): ${A.voiceOn ? 'ON' : 'OFF'}`, `MUSIC: ${A.musicOn ? 'ON' : 'OFF'}`, 'HOW TO PLAY', 'CHARACTER DOSSIER', 'CREDITS'],
    sel: 0,
    enter() { A.setMusicMode('menu'); this.quote = pick(CH).dialogues; this.qc = pick(CH); this.q = pick(this.qc.dialogues); },
    update() {
      const n = this.items().length;
      if (hit('ArrowDown', 'KeyS')) { this.sel = (this.sel + 1) % n; A.sfx('move'); }
      if (hit('ArrowUp', 'KeyW')) { this.sel = (this.sel + n - 1) % n; A.sfx('move'); }
      const lr = hit('ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD');
      if (hit('Enter', 'Space', 'KeyF', 'KeyJ') || lr) {
        A.init(); A.startMusic('menu');
        switch (this.sel) {
          case 0: if (!lr) { A.sfx('confirm'); setScene(new SelectScene('arcade')); } break;
          case 1: if (!lr) { A.sfx('confirm'); setScene(new SelectScene('versus')); } break;
          case 2: settings.difficulty = (settings.difficulty + (hit('ArrowLeft', 'KeyA') ? 2 : 1)) % 3; A.sfx('select'); break;
          case 3: A.voiceOn = !A.voiceOn; A.sfx('select'); if (A.voiceOn) A.speak(pick(CH).dialogues[0], null, 2); else A.hush(); break;
          case 4: A.musicOn = !A.musicOn; A.sfx('select'); break;
          case 5: if (!lr) { A.sfx('confirm'); setScene(HowToScene); } break;
          case 6: if (!lr) { A.sfx('confirm'); setScene(new DossierScene()); } break;
          case 7: if (!lr) { A.sfx('confirm'); setScene(new CreditsScene()); } break;
        }
      }
      if (frame % 300 === 0) { this.qc = pick(CH); this.q = pick(this.qc.dialogues); }
    },
    draw() {
      filmBackground(frame, 350);
      // roster parade
      // the boss looms behind the logo
      BMK.drawFighter(ctx, { char: byId('mogambo'), pose: BMK.copyPose(POSES.taunt), x: W / 2 + 10, y: H + 260, facing: -1, scale: 2.6, t: frame, alpha: 0.18, noShadow: true });
      const heroes = CH.filter((c) => c.id !== 'mogambo');
      heroes.forEach((c, i) => {
        const half = Math.ceil(heroes.length / 2), left = i < half, x = left ? 55 + i * 76 : W - 55 - (i - half) * 76;
        const pose = BMK.copyPose(c.id === 'gone' ? POSES.srk : i % 2 ? POSES.victory : POSES.idle);
        pose.lean += Math.sin(frame * 0.05 + i) * 0.03;
        BMK.drawFighter(ctx, { char: c, pose, x, y: H - 44 - (i % 2) * 10, facing: left ? 1 : -1, scale: 0.8, t: frame, power: true });
      });
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(W / 2 - 250, 272, 500, 282);
      const pulse = 1 + Math.sin(frame * 0.05) * 0.02;
      drawText('BOLLY', W / 2 - 4, 120, 96 * pulse, '#ffd23f', { stroke: 14, shadow: true });
      drawText('KOMBAT', W / 2, 205, 96 * pulse, '#ff3030', { stroke: 14, shadow: true });
      drawText('— DHISHOOM EDITION —', W / 2, 245, 24, '#fff', { font: FONT2, stroke: 4 });
      this.items().forEach((it, i) => {
        const s = i === this.sel;
        drawText((s ? '▶ ' : '') + it + (s ? ' ◀' : ''), W / 2, 300 + i * 34, s ? 28 : 24, s ? '#ffd23f' : '#e9e2cf', { font: FONT2, stroke: 5 });
      });
      if (this.q) {
        ctx.font = 'italic 18px "Poppins", Arial, sans-serif';
        drawText(`"${this.q.text}"  — ${this.qc.name}`, W / 2, 580, 18, '#ffe9a8', { font: '"Poppins", Arial, sans-serif', weight: 'italic', stroke: 4 });
      }
      drawCredit(this, W / 2, 618, 22);
      drawText('↑↓ select · ENTER confirm · ←→ change', W / 2, H - 12, 14, 'rgba(255,255,255,0.7)', { font: FONT2, stroke: 0 });
    }
  };

  /* ── CREDITS ── */
  class CreditsScene {
    update() {
      if (hit('Enter', 'Space', 'KeyF')) { A.sfx('confirm'); openCredit(); }
      if (hit('Escape', 'Backspace')) { A.sfx('move'); setScene(TitleScene); }
    }
    draw() {
      filmBackground(frame, 45);
      drawText('CREDITS', W / 2, 100, 60, '#ffd23f', { stroke: 10 });
      drawText('A BOLLY KOMBAT PRODUCTION', W / 2, 160, 26, '#fff', { font: FONT2, stroke: 4 });
      drawText('Created by', W / 2, 225, 26, '#ffe9a8', { font: FONT2, stroke: 4 });
      const pulse = 1 + Math.sin(frame * 0.08) * 0.03;
      drawText(CREDIT_LABEL, W / 2, 285, 44 * pulse, '#3fd0ff', { stroke: 8 });
      ctx.font = `44px ${FONT}`;
      const w = ctx.measureText(CREDIT_LABEL).width;
      this.link = { x: W / 2 - w / 2, y: 240, w, h: 56 };
      ctx.fillStyle = '#3fd0ff'; ctx.fillRect(W / 2 - w / 2, 294, w, 3);
      drawText('ENTER or click — open website in a new tab', W / 2, 330, 20, '#fff', { font: FONT2, stroke: 3 });
      const lines = [
        'Starring: ' + CH.map((c) => c.name).join(' · '),
        'Dialogues: lovingly borrowed from Bollywood classics (plus a few new jokes)',
        'Every character is drawn in code — no photos, stills or audio clips used',
        'A fan-made parody. Respect to the stars, writers and films that inspired it.',
        'Picture abhi baaki hai, mere dost!'
      ];
      lines.forEach((l, i) => drawText(l, W / 2, 410 + i * 40, i === 0 ? 18 : 22, i === lines.length - 1 ? '#ffd23f' : '#e9e2cf', { font: FONT2, stroke: 3 }));
      drawText('ESC — back', W / 2, H - 12, 14, 'rgba(255,255,255,0.7)', { font: FONT2, stroke: 0 });
    }
  }

  /* ── HOW TO PLAY ── */
  const HowToScene = {
    update() { if (hit('Enter', 'Escape', 'Space', 'Backspace')) { A.sfx('move'); setScene(TitleScene); } },
    draw() {
      filmBackground(frame, 210);
      drawText('HOW TO PLAY', W / 2, 90, 54, '#ffd23f', { stroke: 10 });
      const rows = [
        ['', 'PLAYER 1', 'PLAYER 2'],
        ['Move / Jump / Crouch', 'A D  W  S', '← →  ↑  ↓'],
        ['Punch', 'F', 'J'],
        ['Kick', 'G', 'K'],
        ['Special move', 'H', 'L'],
        ['Block (hold, + down = low block)', 'R', 'I'],
        ['SUPERSTAR move (meter full)', 'T', 'O'],
        ['Pause', 'ESC / P', '']
      ];
      rows.forEach((r, i) => {
        const y = 160 + i * 42, c = i === 0 ? '#ffd23f' : '#fff';
        drawText(r[0], 260, y, 26, c, { font: FONT2, stroke: 3, align: 'left' });
        drawText(r[1], 760, y, 26, c, { font: FONT2, stroke: 3 });
        drawText(r[2], 1000, y, 26, c, { font: FONT2, stroke: 3 });
      });
      const tips = [
        'In 1P Arcade you can also use the arrow keys + J K L I O.',
        'Combos: Punch, Punch, Kick (3-hit "TAALIYAAN!") · Down+Kick = sweep · jump + Kick = flying kick.',
        'Hard hits make the stars deliver their famous dialogues. Land hits to fill the SUPERSTAR meter.',
        'Win the final round, then "KHATAM KARO ISKO!": get close and press SUPER (or SPECIAL) for a FATALITY — "PACKUP!"'
      ];
      tips.forEach((t, i) => drawText(t, W / 2, 530 + i * 32, 20, '#ffe9a8', { font: FONT2, stroke: 3 }));
      drawText('ENTER — back', W / 2, H - 50, 18, 'rgba(255,255,255,0.7)', { font: FONT2, stroke: 0 });
    }
  };

  /* ── CHARACTER DOSSIER (browse the dataset) ── */
  class DossierScene {
    constructor() { this.i = 0; this.li = 0; }
    update() {
      if (hit('ArrowRight', 'KeyD')) { this.i = (this.i + 1) % CH.length; this.li = 0; A.sfx('move'); A.hush(); }
      if (hit('ArrowLeft', 'KeyA')) { this.i = (this.i + CH.length - 1) % CH.length; this.li = 0; A.sfx('move'); A.hush(); }
      const c = CH[this.i];
      if (hit('ArrowDown', 'KeyS')) { this.li = (this.li + 1) % c.dialogues.length; A.sfx('move'); }
      if (hit('ArrowUp', 'KeyW')) { this.li = (this.li + c.dialogues.length - 1) % c.dialogues.length; A.sfx('move'); }
      if (hit('Enter', 'Space', 'KeyF')) { this.talkT = frame; A.speak(c.dialogues[this.li], c.voice, 2); }
      if (hit('Escape', 'Backspace')) { A.hush(); setScene(TitleScene); }
    }
    draw() {
      const c = CH[this.i];
      filmBackground(frame, 40);
      const talking = this.talkT != null && frame - this.talkT < 120;
      const pose = BMK.copyPose(c.id === 'gone' ? POSES.srk : POSES.taunt);
      BMK.drawFighter(ctx, { char: c, pose, x: 220, y: 600, facing: 1, scale: 1.55, t: frame, power: true, mouth: talking ? 0.5 + 0.5 * Math.sin(frame * 0.7) : 0 });
      drawText(`◀  ${c.name}  ▶`, 220, 90, 34, '#ffd23f', { stroke: 7 });
      drawText(`${c.actor} — ${c.film} (${c.year})`, 220, 122, 20, '#fff', { font: FONT2, stroke: 4 });
      const x = 450;
      drawText(c.alterEgo, x, 90, 22, '#ffe9a8', { align: 'left', font: FONT2, stroke: 4 });
      wrapText(c.bio, x, 120, 780, 24, 20, '#ddd');
      drawText('OUTFIT', x, 175, 22, '#ffd23f', { align: 'left' });
      c.outfit.forEach((o, i) => drawText('• ' + o, x, 202 + i * 24, 20, '#fff', { align: 'left', font: FONT2, stroke: 3 }));
      const my = 202 + c.outfit.length * 24 + 16;
      drawText('MOVES', x, my, 22, '#ffd23f', { align: 'left' });
      drawText(`Special: ${c.special.name}   ·   Superstar: ${c.super.name}   ·   Packup: ${c.fatality.name}`, x, my + 28, 20, '#fff', { align: 'left', font: FONT2, stroke: 3 });
      const dy = my + 70;
      drawText('DIALOGUES  (↑↓ choose · ENTER hear)', x, dy, 22, '#ffd23f', { align: 'left' });
      const start = Math.max(0, Math.min(this.li - 3, c.dialogues.length - 8));
      c.dialogues.slice(start, start + 8).forEach((d, j) => {
        const i = start + j, s = i === this.li;
        ctx.font = '17px "Poppins", Arial, sans-serif';
        let t = d.text; while (ctx.measureText(t).width > 560 && t.length > 10) t = t.slice(0, -4) + '…';
        drawText((s ? '▶ ' : '  ') + t, x, dy + 30 + j * 27, 17, s ? '#ffd23f' : '#eee', { align: 'left', font: '"Poppins", Arial, sans-serif', stroke: 3 });
        drawText(`${d.source}${d.year ? ' (' + d.year + ')' : ''} · ${d.type}`, x + 790, dy + 30 + j * 27, 15, '#9fd3ff', { align: 'right', font: FONT2, stroke: 3 });
      });
      drawText('←→ character · ESC back', W / 2, H - 12, 14, 'rgba(255,255,255,0.7)', { font: FONT2, stroke: 0 });
    }
  }

  /* ── CHARACTER SELECT ── */
  class SelectScene {
    constructor(mode) {
      this.mode = mode;
      this.cur = [0, 3]; this.done = [false, mode === 'arcade'];
    }
    enter() { A.setMusicMode('menu'); }
    update() {
      const ctrls = this.mode === 'arcade'
        ? [[['KeyA', 'ArrowLeft'], ['KeyD', 'ArrowRight'], ['KeyW', 'ArrowUp'], ['KeyS', 'ArrowDown'], ['KeyF', 'KeyJ', 'Enter', 'Space']]]
        : [[['KeyA'], ['KeyD'], ['KeyW'], ['KeyS'], ['KeyF', 'Space']], [['ArrowLeft'], ['ArrowRight'], ['ArrowUp'], ['ArrowDown'], ['KeyJ', 'Enter']]];
      ctrls.forEach((c, p) => {
        if (this.done[p]) return;
        let i = this.cur[p];
        const N = CH.length, C = GRID_COLS;
        if (hit(...c[0])) { i = (i + N - 1) % N; A.sfx('move'); }
        if (hit(...c[1])) { i = (i + 1) % N; A.sfx('move'); }
        if (hit(...c[2])) { if (i - C >= 0) i -= C; else { let j = i % C; while (j + C < N) j += C; i = j; } A.sfx('move'); }
        if (hit(...c[3])) { i = i + C < N ? i + C : i % C; A.sfx('move'); }
        this.cur[p] = i;
        if (hit(...c[4])) {
          this.done[p] = true; A.sfx('confirm');
          const ch = CH[i]; A.speak(pick(ch.dialogues.filter((d) => d.on.includes('intro'))) || ch.dialogues[0], ch.voice, 2);
          this.flash = [p, frame];
        }
      });
      if (hit('Escape', 'Backspace')) {
        if (this.done[0] || (this.mode === 'versus' && this.done[1])) { this.done = [false, this.mode === 'arcade']; this.doneT = 0; }
        else setScene(TitleScene);
      }
      if (this.done[0] && this.done[1]) {
        this.doneT = (this.doneT || 0) + 1;
        if (this.doneT > 70) {
          const p1 = CH[this.cur[0]];
          if (this.mode === 'arcade') {
            const boss = p1.id === 'mogambo' ? byId('gabbar') : byId('mogambo');
            const rival = RIVAL[p1.id] && byId(RIVAL[p1.id]);
            const others = CH.filter((c) => c !== p1 && c !== boss && c !== rival).sort(() => Math.random() - 0.5).slice(0, rival ? 3 : 4);
            const ladder = [...others, ...(rival ? [rival] : []), boss];
            startArcade(p1, ladder, 0);
          } else {
            const p2 = CH[this.cur[1]];
            startVersus(p1, p2);
          }
        }
      }
    }
    draw() {
      filmBackground(frame, 280);
      drawText('CHOOSE YOUR SUPERSTAR', W / 2, 82, 44, '#ffd23f', { stroke: 9 });
      const C = GRID_COLS, cs = 128, gap = 10, rows = Math.ceil(CH.length / C), gy = 112;
      const rowX = (r) => W / 2 - ((r < rows - 1 ? C : CH.length - C * (rows - 1)) * (cs + gap) - gap) / 2;
      const pos = (i) => [rowX(Math.floor(i / C)) + (i % C) * (cs + gap), gy + Math.floor(i / C) * (cs + gap)];
      CH.forEach((c, i) => {
        const [x, y] = pos(i);
        ctx.fillStyle = '#111'; ctx.fillRect(x - 3, y - 3, cs + 6, cs + 6);
        const g = ctx.createLinearGradient(0, y, 0, y + cs); g.addColorStop(0, '#3a1f4a'); g.addColorStop(1, '#120a18');
        ctx.fillStyle = g; ctx.fillRect(x, y, cs, cs);
        BMK.drawPortrait(ctx, c, x, y, cs, cs, { t: frame });
        ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(x, y + cs - 24, cs, 24);
        drawText(c.name, x + cs / 2, y + cs - 6, c.name.length > 10 ? 12 : 15, '#fff', { font: FONT, stroke: 0 });
      });
      const cursor = (p, color, label) => {
        const i = this.cur[p], [x, y] = pos(i);
        const pulse = this.done[p] ? 6 : 3 + Math.sin(frame * 0.2) * 2;
        ctx.strokeStyle = color; ctx.lineWidth = pulse; ctx.strokeRect(x - 2, y - 2, cs + 4, cs + 4);
        drawText(label, x + (p === 0 ? 14 : cs - 14), y + 22, 18, color, { stroke: 4 });
      };
      cursor(0, '#ffd23f', 'P1');
      if (this.mode === 'versus') cursor(1, '#3fd0ff', 'P2');
      // side previews
      const preview = (p, x, facing) => {
        const c = CH[this.cur[p]];
        const pose = BMK.copyPose(this.done[p] ? (c.id === 'gone' ? POSES.srk : POSES.victory) : POSES.idle);
        if (!this.done[p]) { const b = Math.sin(frame * 0.08); pose.lean += b * 0.02; pose.fa1 += b * 0.06; }
        BMK.drawFighter(ctx, { char: c, pose, x, y: 610, facing, scale: 1.25, t: frame, power: true, mouth: this.flash && this.flash[0] === p && frame - this.flash[1] < 90 ? 0.5 + 0.5 * Math.sin(frame * 0.7) : 0 });
        drawText(c.name, x, 640, 26, p === 0 ? '#ffd23f' : '#3fd0ff', { stroke: 6 });
        drawText(`${c.actor} · ${c.film} (${c.year})`, x, 664, 18, '#fff', { font: FONT2, stroke: 4 });
        drawText(`Special: ${c.special.name}`, x, 686, 16, '#ffe9a8', { font: FONT2, stroke: 3 });
      };
      preview(0, 190, 1);
      if (this.mode === 'versus') preview(1, W - 190, -1);
      else {
        drawText('ARCADE LADDER', W - 190, 240, 24, '#3fd0ff', { stroke: 5 });
        ['4 superstars (G.One must face Ra.One)', 'then the FINAL BOSS:', 'MOGAMBO', '(he will be khush', 'if you lose)'].forEach((l, i) => drawText(l, W - 190, 280 + i * 30, i === 2 ? 30 : 20, i === 2 ? '#ff3030' : '#fff', { font: i === 2 ? FONT : FONT2, stroke: 4 }));
      }
      // hovered quote
      const hc = CH[this.cur[0]];
      const q = hc.dialogues[Math.floor(frame / 180) % hc.dialogues.length];
      ctx.font = 'italic 18px "Poppins", Arial, sans-serif';
      const ql = wrap(`"${q.text}"`, 480);
      ql.slice(0, 2).forEach((l, i) => drawText(l, W / 2, 610 + i * 24, 18, '#ffe9a8', { font: '"Poppins", Arial, sans-serif', weight: 'italic', stroke: 4 }));
      drawText(`— ${q.source}${q.year ? ' (' + q.year + ')' : ''}`, W / 2, 610 + Math.min(2, ql.length) * 24, 14, '#9fd3ff', { font: FONT2, stroke: 3 });
      drawText(this.mode === 'arcade' ? 'Arrows/WASD move · ENTER/F select · ESC back' : 'P1: WASD + F   ·   P2: Arrows + J   ·   ESC back', W / 2, H - 12, 14, 'rgba(255,255,255,0.7)', { font: FONT2, stroke: 0 });
    }
  }

  /* ── VS SCREEN ── */
  class VsScene {
    constructor(c1, c2, stage, sub, next) { this.c = [c1, c2]; this.stage = stage; this.sub = sub; this.next = next; }
    enter() { A.announce(`${this.c[0].name.replace('.', ' ')} versus ${this.c[1].name.replace('.', ' ')}`); A.sfx('gong'); }
    update() { if (frame > 200 || (frame > 30 && hit('Enter', 'Space', 'KeyF', 'KeyJ'))) this.next(); }
    draw() {
      filmBackground(frame, 0);
      const slide = Math.max(0, 1 - frame / 18);
      const s = 380;
      [[0, 70 - slide * 500, 1, '#ffd23f'], [1, W - 70 - s + slide * 500, -1, '#3fd0ff']].forEach(([i, x, fc, col]) => {
        ctx.fillStyle = '#000'; ctx.fillRect(x - 6, 120 - 6, s + 12, s + 12);
        ctx.fillStyle = col; ctx.fillRect(x, 120, s, s);
        BMK.drawPortrait(ctx, this.c[i], x, 120, s, s, { facing: fc, t: frame });
        drawText(this.c[i].name, x + s / 2, 560, 40, col, { stroke: 8 });
        drawText(`${this.c[i].actor} — ${this.c[i].film}`, x + s / 2, 592, 20, '#fff', { font: FONT2, stroke: 4 });
      });
      const vs = 1 + Math.sin(frame * 0.15) * 0.08;
      drawText('VS', W / 2, 340, 120 * vs, '#ff3030', { stroke: 14, shadow: true });
      if (this.sub) drawText(this.sub, W / 2, 90, 30, '#fff', { stroke: 6 });
      const st = DATA.stages.find((s) => s.id === this.stage);
      drawText(`📍 ${st.name}`, W / 2, 650, 22, '#ffe9a8', { font: FONT2, stroke: 4 });
    }
  }

  /* ── FIGHT ── */
  class FightScene {
    constructor(match) { this.m = match; }
    enter() { A.setMusicMode('fight'); }
    update() {
      if (hit('Escape', 'KeyP')) { this.m.paused = !this.m.paused; A.sfx('select'); if (this.m.paused) A.hush(); }
      if (this.m.paused) { if (hit('KeyQ')) { A.hush(); setScene(TitleScene); } return; }
      this.m.update();
    }
    draw() {
      this.m.draw();
      if (this.m.paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
        drawText('INTERVAL', W / 2, H / 2 - 20, 80, '#ffd23f', { stroke: 12 });
        drawText('ESC — resume   ·   Q — quit to title', W / 2, H / 2 + 40, 24, '#fff', { font: FONT2, stroke: 4 });
      }
    }
  }

  /* ── CONTINUE / ENDING / VERSUS END ── */
  class ContinueScene {
    constructor(retry) { this.retry = retry; }
    update() {
      if (hit('Enter', 'Space', 'KeyF')) { A.sfx('confirm'); this.retry(); }
      if (frame > 600 || hit('Escape')) setScene(TitleScene);
    }
    draw() {
      filmBackground(frame, 0);
      drawText('FLOP!', W / 2, 220, 120, '#ff3030', { stroke: 14 });
      drawText('Picture abhi baaki hai mere dost... CONTINUE?', W / 2, 320, 30, '#fff', { font: FONT2, stroke: 5 });
      drawText(String(Math.max(0, 9 - Math.floor(frame / 60))), W / 2, 460, 110, '#ffd23f', { stroke: 12 });
      drawText('ENTER — continue  ·  ESC — give up', W / 2, 560, 22, '#ffe9a8', { font: FONT2, stroke: 4 });
    }
  }
  class EndingScene {
    constructor(c) { this.c = c; }
    enter() { A.speak(pick(this.c.dialogues.filter((d) => d.on.includes('win'))), this.c.voice, 2); }
    update() { if (frame > 90 && hit('Enter', 'Space', 'Escape')) setScene(TitleScene); }
    draw() {
      filmBackground(frame, 45);
      const pose = BMK.copyPose(this.c.id === 'gone' ? POSES.srk : POSES.victory);
      BMK.drawFighter(ctx, { char: this.c, pose, x: 300, y: 640, facing: 1, scale: 1.8, t: frame, power: true, mouth: frame < 150 ? 0.5 + 0.5 * Math.sin(frame * 0.7) : 0 });
      drawText('AAP TOH', 820, 170, 50, '#fff', { stroke: 8 });
      drawText('SUPERSTAR', 820, 245, 80, '#ffd23f', { stroke: 12, shadow: true });
      drawText('NIKLE!', 820, 320, 60, '#ff3030', { stroke: 10 });
      const lines = [`${this.c.name} defeated the entire industry.`, 'Box office collection: ₹1,000 crore (worldwide)', 'Critics: ★★★★★  "Paisa vasool!"', 'Sequel announced: BOLLY KOMBAT 2 — Return of the Item Number'];
      lines.forEach((l, i) => drawText(l, 820, 400 + i * 38, 24, '#ffe9a8', { font: FONT2, stroke: 4 }));
      drawCredit(this, 820, 575, 24);
      if (frame > 90) drawText('ENTER — back to title', 820, 615, 18, 'rgba(255,255,255,0.7)', { font: FONT2, stroke: 0 });
    }
  }
  class VersusEndScene {
    constructor(c1, c2, winner) { this.c = [c1, c2]; this.w = winner; }
    update() {
      if (hit('Enter', 'Space', 'KeyF', 'KeyJ')) { A.sfx('confirm'); startVersus(this.c[0], this.c[1]); }
      if (hit('Escape', 'Backspace')) setScene(new SelectScene('versus'));
    }
    draw() {
      filmBackground(frame, 120);
      const c = this.c[this.w];
      BMK.drawFighter(ctx, { char: c, pose: BMK.copyPose(c.id === 'gone' ? POSES.srk : POSES.victory), x: W / 2, y: 560, facing: 1, scale: 1.4, t: frame, power: true });
      drawText(`PLAYER ${this.w + 1} WINS!`, W / 2, 100, 60, '#ffd23f', { stroke: 10 });
      drawText(c.name + ' — BLOCKBUSTER!', W / 2, 150, 30, '#fff', { stroke: 6 });
      drawText('ENTER — rematch  ·  ESC — character select', W / 2, 640, 24, '#ffe9a8', { font: FONT2, stroke: 4 });
    }
  }

  function ctrlFor(side, mode) {
    if (mode === 'arcade') return side === 0 ? new KeyCtrl([MAP_P1, MAP_P2]) : new AICtrl(settings.difficulty);
    return new KeyCtrl([side === 0 ? MAP_P1 : MAP_P2]);
  }
  function startArcade(p1, ladder, idx) {
    const opp = ladder[idx];
    const stage = HOME[opp.id] || 'filmcity';
    const sub = idx === ladder.length - 1 ? 'FINAL BOSS' : `FIGHT ${idx + 1} OF ${ladder.length}`;
    setScene(new VsScene(p1, opp, stage, sub, () => {
      const m = new Match(p1, opp, {
        ctrl1: ctrlFor(0, 'arcade'), ctrl2: ctrlFor(1, 'arcade'), stage,
        onEnd: (winSide) => {
          A.hush();
          if (winSide === 0) {
            if (idx + 1 >= ladder.length) setScene(new EndingScene(p1));
            else startArcade(p1, ladder, idx + 1);
          } else setScene(new ContinueScene(() => startArcade(p1, ladder, idx)));
        }
      });
      setScene(new FightScene(m));
    }));
  }
  function startVersus(c1, c2) {
    const stage = pick(DATA.stages).id;
    setScene(new VsScene(c1, c2, stage, 'VERSUS', () => {
      const m = new Match(c1, c2, {
        ctrl1: ctrlFor(0, 'versus'), ctrl2: ctrlFor(1, 'versus'), stage,
        onEnd: (winSide) => { A.hush(); setScene(new VersusEndScene(c1, c2, winSide)); }
      });
      setScene(new FightScene(m));
    }));
  }

  /* ═════════════════════ LOOP ═════════════════════ */
  function resize() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    canvas.style.width = W * s + 'px'; canvas.style.height = H * s + 'px';
  }
  addEventListener('resize', resize); resize();

  let last = performance.now(), acc = 0;
  function loop(now) {
    acc += Math.min(100, now - last); last = now;
    let steps = 0;
    while (acc >= 1000 / 60) {
      scene.update(); frame++; acc -= 1000 / 60; steps++;
      pressed.clear();
    }
    scene.draw();
    requestAnimationFrame(loop);
  }
  setScene(TitleScene);
  // debug / testing hook
  window.BMK_GAME = { get scene() { return scene; }, setScene, startVersus, startArcade, byId, CH, Match, FightScene, AICtrl, settings };
  requestAnimationFrame(loop);
})();
