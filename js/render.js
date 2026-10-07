/* BOLLY KOMBAT — procedural renderer: fighters (skeleton + outfit), portraits, stages, effects */
(function () {
  const BMK = (window.BMK = window.BMK || {});
  const L = { thigh: 54, shin: 54, upper: 40, fore: 38, torso: 82, neck: 9, headR: 21 };
  BMK.L = L;
  const OUT = '#08080a';

  /* ───────── Poses (angles in radians, measured from straight down, + = toward facing) ───────── */
  const P = (lean, head, fa0, fa1, ba0, ba1, fl0, fl1, bl0, bl1) => ({ lean, head, fa0, fa1, ba0, ba1, fl0, fl1, bl0, bl1 });
  const LEG_IDLE = [0.3, 0.0, -0.25, -0.1];
  const LEG_CROUCH = [1.35, -0.35, 0.5, -1.3];
  const LEG_JUMP = [1.3, -0.2, 0.7, -0.8];
  const POSES = {
    idle: P(0.06, 0, 0.55, 2.55, 0.3, 2.35, ...LEG_IDLE),
    punchWind: P(0.0, 0, 0.3, 2.9, 0.4, 2.3, ...LEG_IDLE),
    punch: P(0.2, 0, 1.55, 1.55, 0.1, 2.5, 0.45, 0.05, -0.35, -0.15),
    punchWind2: P(0.02, 0, 0.6, 2.6, -0.2, 2.6, ...LEG_IDLE),
    punch2: P(0.28, 0, 0.4, 2.6, 1.55, 1.55, 0.45, 0.05, -0.4, -0.15),
    kickWind: P(-0.1, 0, 0.7, 2.4, 0.4, 2.3, 1.1, -0.6, -0.05, 0),
    kick: P(-0.35, 0, 0.9, 2.2, -0.6, 0.6, 1.75, 1.7, -0.1, 0),
    roundhouse: P(-0.5, 0.1, 1.2, 1.8, -0.9, -0.4, 2.05, 2.1, -0.15, 0),
    crouch: P(0.25, 0, 0.9, 2.6, 0.7, 2.4, ...LEG_CROUCH),
    cpunch: P(0.35, 0, 1.45, 1.45, 0.5, 2.4, ...LEG_CROUCH),
    sweep: P(-0.15, 0, 0.4, 0.5, -0.3, 0.0, 1.42, 1.48, 1.2, -1.4),
    jump: P(0.1, 0, 0.8, 2.4, 0.5, 2.6, ...LEG_JUMP),
    jkick: P(-0.15, 0, 0.9, 2.2, -0.4, 0.8, 1.25, 1.25, 0.6, -0.9),
    jpunch: P(0.2, 0, 1.2, 1.1, 0.4, 2.5, ...LEG_JUMP),
    block: P(-0.05, -0.05, 0.95, 2.95, 0.75, 3.0, 0.32, 0.05, -0.3, -0.12),
    cblock: P(0.15, -0.05, 0.95, 2.95, 0.75, 3.0, ...LEG_CROUCH),
    hit: P(-0.35, -0.3, -0.4, 0.5, -0.7, 0.2, 0.35, 0.1, -0.35, -0.2),
    fall: P(-0.5, -0.3, -1.8, -1.5, -2.2, -2.0, 0.6, 0.3, 0.2, 0.5),
    lying: P(0, 0, 2.6, 2.6, 2.2, 2.4, 0.08, 0.04, -0.04, 0),
    specialWind: P(-0.12, 0, -0.6, 0.6, -0.8, 0.4, ...LEG_IDLE),
    special: P(0.15, 0, 1.6, 1.6, 1.45, 1.5, 0.45, 0.05, -0.4, -0.15),
    dash: P(0.5, -0.1, 1.6, 1.6, -0.9, -0.6, 0.9, 0.3, -0.6, -0.3),
    spin: P(0, 0, 1.57, 1.57, -1.57, -1.57, 0.12, 0, -0.12, 0),
    watch: P(0.02, 0.15, 0.6, 2.0, 1.0, 1.75, ...LEG_IDLE),
    slamUp: P(-0.05, -0.1, 3.0, 3.0, 2.8, 2.9, ...LEG_JUMP),
    slam: P(0.5, 0.1, 0.7, 0.4, 0.5, 0.3, ...LEG_CROUCH),
    victory: P(-0.05, -0.1, 2.9, 3.1, -0.5, 0.9, 0.3, 0.1, -0.3, -0.1),
    srk: P(-0.12, -0.18, 1.85, 2.05, -1.85, -2.05, 0.25, 0.05, -0.25, -0.05),
    taunt: P(0.05, 0, 1.6, 1.62, -0.5, 0.9, 0.32, 0.05, -0.3, -0.1),
    dizzy: P(0.05, 0.3, 0.15, 0.1, -0.1, -0.05, 0.2, 0.05, -0.2, -0.05),
    dance1: P(0.05, 0.1, 2.4, 3.0, -0.3, 1.2, 0.6, -0.4, -0.2, 0),
    dance2: P(-0.05, -0.1, 0.3, 1.4, -2.4, -3.0, 0.2, 0, -0.6, 0.3),
    portrait: P(0, 0, 0.35, 1.75, 0.45, 1.65, ...LEG_IDLE),
    shoot: P(0.05, 0, 1.55, 1.58, 0.3, 2.3, 0.4, 0.05, -0.35, -0.15),
    slap: P(0.25, 0, 1.9, 1.3, -0.5, 0.6, 0.45, 0.05, -0.4, -0.15)
  };
  BMK.POSES = POSES;
  const KEYS = ['lean', 'head', 'fa0', 'fa1', 'ba0', 'ba1', 'fl0', 'fl1', 'bl0', 'bl1'];
  BMK.copyPose = (p) => { const o = {}; for (const k of KEYS) o[k] = p[k]; return o; };
  BMK.lerpPose = (cur, tgt, k) => { for (const key of KEYS) cur[key] += (tgt[key] - cur[key]) * k; return cur; };
  BMK.walkPose = (phase, back) => {
    const s = Math.sin(phase), c = Math.cos(phase);
    const p = BMK.copyPose(POSES.idle);
    const amp = back ? 0.28 : 0.38;
    p.fl0 = 0.05 + s * amp; p.fl1 = p.fl0 - 0.1 - Math.max(0, -c) * 0.5;
    p.bl0 = 0.05 - s * amp; p.bl1 = p.bl0 - 0.1 - Math.max(0, c) * 0.5;
    p.lean = back ? -0.02 : 0.1;
    p.fa0 = 0.55 + s * 0.08; p.ba0 = 0.3 - s * 0.08;
    return p;
  };

  /* ───────── helpers ───────── */
  const down = (a, len) => [Math.sin(a) * len, Math.cos(a) * len];
  const up = (a, len) => [Math.sin(a) * len, -Math.cos(a) * len];
  const add = (p, v) => [p[0] + v[0], p[1] + v[1]];
  BMK.legH = (t, s) => Math.cos(t) * L.thigh + Math.cos(s) * L.shin;

  function shade(hex, amt) {
    if (!hex || hex[0] !== '#') return hex;
    let h = hex.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
    return '#' + ((1 << 24) | (f(r) << 16) | (f(g) << 8) | f(b)).toString(16).slice(1);
  }
  BMK.shade = shade;

  function seg(ctx, a, b, w, color, hl) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = OUT; ctx.lineWidth = w + 5;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    if (hl !== false) {
      ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.lineWidth = w * 0.3;
      ctx.beginPath(); ctx.moveTo(a[0] + 2, a[1] - 2); ctx.lineTo(b[0] + 2, b[1] - 2); ctx.stroke();
    }
  }
  function glowLine(ctx, pts, color, w) {
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 10;
    ctx.strokeStyle = color; ctx.lineWidth = w || 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke(); ctx.restore();
  }
  function circle(ctx, x, y, r, fill, stroke, lw) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
  }
  function poly(ctx, pts, fill, stroke, lw) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2.5; ctx.lineJoin = 'round'; ctx.stroke(); }
  }
  BMK.poly = poly; BMK.circle = circle;

  /* ───────── skeleton ───────── */
  function skeleton(p) {
    const hipH = Math.max(BMK.legH(p.fl0, p.fl1), BMK.legH(p.bl0, p.bl1), 18);
    const hip = [0, -hipH];
    const fk = add(hip, down(p.fl0, L.thigh)), ff = add(fk, down(p.fl1, L.shin));
    const bk = add(hip, down(p.bl0, L.thigh)), bf = add(bk, down(p.bl1, L.shin));
    const neck = add(hip, up(p.lean, L.torso));
    const sh = add(hip, up(p.lean, L.torso - 8));
    const fs = [sh[0] + 3, sh[1]], bs = [sh[0] - 3, sh[1]];
    const fe = add(fs, down(p.fa0, L.upper)), fh = add(fe, down(p.fa1, L.fore));
    const be = add(bs, down(p.ba0, L.upper)), bh = add(be, down(p.ba1, L.fore));
    const head = add(neck, up(p.lean + p.head * 0.6, L.neck + L.headR));
    return { hipH, hip, fk, ff, bk, bf, neck, sh, fs, bs, fe, fh, be, bh, head };
  }
  BMK.skeleton = skeleton;

  /* ───────── limbs ───────── */
  function drawArm(ctx, s, k, sh, el, ha, a1, back) {
    const lk = k.look;
    const dk = back ? -0.28 : 0;
    const skin = shade(lk.skin, dk);
    const sleeve = lk.sleeve ? shade(lk.sleeve, dk) : skin;
    const fore = lk.forearm ? shade(lk.forearm, dk) : skin;
    seg(ctx, sh, el, 15, sleeve);
    seg(ctx, el, ha, 13, fore);
    if (lk.forearm === null && lk.sleeve) { // rolled sleeve cuff
      const c = [el[0] + (ha[0] - el[0]) * 0.12, el[1] + (ha[1] - el[1]) * 0.12];
      seg(ctx, el, c, 16, shade(lk.sleeve, dk - 0.1), false);
    }
    if (lk.wristbands) {
      const a = [el[0] + (ha[0] - el[0]) * 0.55, el[1] + (ha[1] - el[1]) * 0.55];
      const b = [el[0] + (ha[0] - el[0]) * 0.9, el[1] + (ha[1] - el[1]) * 0.9];
      seg(ctx, a, b, 15, shade(lk.wristbands, dk), false);
    }
    if (lk.circuits) {
      glowLine(ctx, [sh, el, ha], back ? shade(lk.circuits, -0.35) : lk.circuits, 2);
    }
    const hc = lk.gloves ? shade(lk.gloves, dk) : skin;
    circle(ctx, ha[0], ha[1], 8.5, hc, OUT, 2.5);
    if (lk.armor) {
      ctx.save(); ctx.translate(sh[0], sh[1] + 2); ctx.rotate(s.lean || 0);
      ctx.beginPath(); ctx.ellipse(0, 0, 14, 11, 0, Math.PI * 1.05, Math.PI * 2.05);
      ctx.closePath(); ctx.fillStyle = shade(lk.armor, dk); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke();
      if (lk.circuits) glowLine(ctx, [[-11, -3], [0, -9], [11, -3]], back ? shade(lk.circuits, -0.35) : lk.circuits, 1.6);
      ctx.restore();
    }
    if (lk.epaulettes) {
      ctx.save(); ctx.translate(sh[0], sh[1] - 2); ctx.rotate(s.lean || 0);
      poly(ctx, [[-11, -4], [11, -4], [12, 3], [-12, 3]], shade(lk.epaulettes, dk - (lk.gold ? 0 : 0.12)), OUT, 2);
      if (lk.gold && lk.epaulettes === lk.gold) { // golden fringe epaulettes (Mogambo)
        ctx.strokeStyle = shade(lk.gold, dk - 0.1); ctx.lineWidth = 2;
        for (let i = -10; i <= 10; i += 4) { ctx.beginPath(); ctx.moveTo(i, 3); ctx.lineTo(i * 1.15, 11); ctx.stroke(); }
      } else {
        circle(ctx, 6, 0, 2, '#d8c27a');
      }
      ctx.restore();
    }
  }
  function drawLeg(ctx, k, hip, kn, ft, a1, back) {
    const lk = k.look;
    const dk = back ? -0.28 : 0;
    const pants = shade(lk.pants, dk);
    seg(ctx, hip, kn, 19, pants);
    seg(ctx, kn, ft, 16, pants);
    if (lk.circuits) glowLine(ctx, [hip, kn, ft], back ? shade(lk.circuits, -0.35) : lk.circuits, 2);
    if (lk.boots) { // tall laced boots (Flying Jatt)
      const b = [kn[0] + (ft[0] - kn[0]) * 0.3, kn[1] + (ft[1] - kn[1]) * 0.3];
      seg(ctx, b, ft, 18, shade(lk.boots.color, dk), false);
      ctx.strokeStyle = lk.boots.laces; ctx.lineWidth = 1.6;
      const dx = ft[0] - b[0], dy = ft[1] - b[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len * 6, ny = dx / len * 6;
      for (let i = 0; i < 4; i++) {
        const p0 = [b[0] + dx * (i / 4), b[1] + dy * (i / 4)], p1 = [b[0] + dx * ((i + 1) / 4), b[1] + dy * ((i + 1) / 4)];
        ctx.beginPath(); ctx.moveTo(p0[0] - nx, p0[1] - ny); ctx.lineTo(p1[0] + nx, p1[1] + ny);
        ctx.moveTo(p0[0] + nx, p0[1] + ny); ctx.lineTo(p1[0] - nx, p1[1] - ny); ctx.stroke();
      }
    }
    if (lk.gold && lk.shoes === lk.gold) { // golden boot shaft
      const b = [kn[0] + (ft[0] - kn[0]) * 0.55, kn[1] + (ft[1] - kn[1]) * 0.55];
      seg(ctx, b, ft, 17, shade(lk.gold, dk), false);
    }
    ctx.save(); ctx.translate(ft[0], ft[1]); ctx.rotate(-a1);
    ctx.beginPath(); ctx.ellipse(6, 2, 15, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = shade(lk.shoes, dk); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
  }

  /* ───────── torso ───────── */
  function drawTorso(ctx, k, s, p, o) {
    const lk = k.look, t = lk.torso, w = (lk.build && lk.build.w) || 1;
    ctx.save(); ctx.translate(s.hip[0], s.hip[1]); ctx.rotate(p.lean);
    // pelvis
    poly(ctx, [[-16 * w, -12], [17 * w, -12], [18 * w, 8], [-17 * w, 8]], lk.pants, OUT, 2.5);
    const body = [[-17 * w, -80], [16 * w, -81], [21 * w, -60], [17 * w, -6], [-15 * w, -4], [-19 * w, -50]];
    poly(ctx, body, t.color, OUT, 3);
    // soft shading on the back half
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-25 * w, -90, 14 * w, 90);
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(4 * w, -85, 10 * w, 80);
    ctx.restore();

    switch (t.type) {
      case 'suit': {
        const c = lk.circuits;
        glowLine(ctx, [[8 * w, -78], [4 * w, -56], [10 * w, -36], [6 * w, -8]], c, 2.2);
        glowLine(ctx, [[-10 * w, -78], [-6 * w, -50], [-12 * w, -24], [-8 * w, -6]], shade(c, -0.3), 2);
        glowLine(ctx, [[-14 * w, -66], [16 * w, -66]], c, 1.6);
        glowLine(ctx, [[-12 * w, -22], [14 * w, -22]], c, 1.6);
        ctx.save(); ctx.shadowColor = lk.core; ctx.shadowBlur = 18;
        circle(ctx, 8 * w, -55, 7, lk.core, c, 2); ctx.restore();
        break;
      }
      case 'coat': case 'jacket': {
        poly(ctx, [[2 * w, -81], [15 * w, -81], [12 * w, -28], [6 * w, -28]], t.inner, OUT, 1.5);
        ctx.strokeStyle = shade(t.color, 0.25); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(2 * w, -80); ctx.lineTo(8 * w, -58); ctx.lineTo(4 * w, -10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(15 * w, -80); ctx.lineTo(18 * w, -62); ctx.stroke();
        if (t.type === 'jacket') {
          poly(ctx, [[-12 * w, -84], [4 * w, -84], [0, -74], [-14 * w, -74]], shade(t.color, 0.12), OUT, 1.5);
          ctx.fillStyle = '#9aa0a8'; ctx.fillRect(-12 * w, -40, 9, 3);
        }
        break;
      }
      case 'hero': {
        const g = lk.gold;
        poly(ctx, [[-17 * w, -80], [16 * w, -81], [20 * w, -62], [10 * w, -52], [-6 * w, -52], [-18 * w, -60]], g, OUT, 2);
        ctx.save(); ctx.shadowColor = g; ctx.shadowBlur = 12;
        circle(ctx, 6 * w, -56, 10, '#fff2a8', OUT, 2); ctx.restore();
        ctx.strokeStyle = '#c8102e'; ctx.lineWidth = 1.6;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath(); ctx.moveTo(6 * w + Math.cos(a) * 3, -56 + Math.sin(a) * 3);
          ctx.lineTo(6 * w + Math.cos(a) * 8, -56 + Math.sin(a) * 8); ctx.stroke();
        }
        circle(ctx, 6 * w, -56, 2.5, '#c8102e');
        break;
      }
      case 'jatt': {
        const g = lk.gold;
        poly(ctx, [[-10 * w, -82], [12 * w, -82], [16 * w, -74], [2 * w, -68], [-12 * w, -74]], t.collar, OUT, 2);
        ctx.strokeStyle = g; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(16 * w, -80); ctx.quadraticCurveTo(21 * w, -66, 14 * w, -56); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-16 * w, -80); ctx.quadraticCurveTo(-20 * w, -66, -14 * w, -54); ctx.stroke();
        // khanda: chakkar ring, central double-edged khanda, two kirpans
        ctx.save(); ctx.translate(5 * w, -52); ctx.shadowColor = g; ctx.shadowBlur = 8;
        ctx.strokeStyle = g; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(0, 8); ctx.stroke();
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(-4, -1, 9, Math.PI * 0.35, Math.PI * 1.25); ctx.stroke();
        ctx.beginPath(); ctx.arc(4, -1, 9, -Math.PI * 0.25, Math.PI * 0.65); ctx.stroke();
        ctx.restore();
        break;
      }
      case 'uniform': {
        if (t.open) poly(ctx, [[4 * w, -81], [14 * w, -81], [9 * w, -64]], t.inner, OUT, 1.2);
        ctx.strokeStyle = shade(t.color, -0.3); ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(9 * w, t.open ? -64 : -80); ctx.lineTo(8 * w, -10); ctx.stroke();
        for (let y = t.open ? -56 : -72; y < -14; y += 14) circle(ctx, 9.5 * w, y, 1.8, '#d9c38a');
        // pocket flaps
        poly(ctx, [[11 * w, -66], [19 * w, -66], [19 * w, -60], [11 * w, -59]], shade(t.color, -0.12), OUT, 1.2);
        poly(ctx, [[-14 * w, -66], [-4 * w, -66], [-4 * w, -60], [-14 * w, -59]], shade(t.color, -0.2), OUT, 1.2);
        if (lk.badge) {
          ctx.fillStyle = '#e9c85a';
          ctx.beginPath();
          for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 2.4 : 5; ctx.lineTo(15 * w + Math.cos(a) * r, -72 + Math.sin(a) * r); }
          ctx.closePath(); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = '#111'; ctx.fillRect(-12 * w, -71, 9, 3);
        }
        break;
      }
      case 'fatigue': {
        poly(ctx, [[10 * w, -64], [19 * w, -64], [18 * w, -52], [10 * w, -52]], shade(t.color, -0.15), OUT, 1.2);
        poly(ctx, [[-14 * w, -40], [-4 * w, -40], [-4 * w, -28], [-14 * w, -28]], shade(t.color, -0.2), OUT, 1.2);
        // camo-ish blotches
        ctx.fillStyle = 'rgba(30,35,15,0.35)';
        [[-6, -70, 6], [12, -36, 5], [-10, -18, 5], [4, -46, 4]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x * w, y, r * 1.4, r, 0.4, 0, 7); ctx.fill(); });
        break;
      }
      case 'robe': {
        const g = lk.gold;
        ctx.strokeStyle = g; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(9 * w, -80); ctx.lineTo(10 * w, -6); ctx.stroke();
        ctx.lineWidth = 1.5;
        for (let y = -72; y < -10; y += 10) { ctx.beginPath(); ctx.moveTo(4 * w, y); ctx.lineTo(16 * w, y + 3); ctx.stroke(); }
        poly(ctx, [[-14 * w, -84], [16 * w, -84], [18 * w, -76], [-16 * w, -76]], g, OUT, 1.5);
        // sparkles
        ctx.fillStyle = 'rgba(255,230,140,0.55)';
        for (let i = 0; i < 9; i++) ctx.fillRect(((i * 37) % 30 - 14) * w, -74 + ((i * 23) % 64), 1.6, 1.6);
        break;
      }
    }
    if (lk.bandolier) {
      ctx.save();
      ctx.lineCap = 'butt';
      ctx.strokeStyle = OUT; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(-17 * w, -80); ctx.lineTo(17 * w, -14); ctx.stroke();
      ctx.strokeStyle = lk.bandolier.strap; ctx.lineWidth = 9; ctx.stroke();
      for (let i = 0.08; i < 0.95; i += 0.11) {
        const x = -17 * w + 34 * w * i, y = -80 + 66 * i;
        ctx.save(); ctx.translate(x, y); ctx.rotate(-0.4);
        ctx.fillStyle = lk.bandolier.bullet; ctx.fillRect(-1.6, -7, 3.2, 8);
        ctx.fillStyle = '#8a6a22'; ctx.fillRect(-1.6, -8.5, 3.2, 2);
        ctx.restore();
      }
      ctx.restore();
    }
    if (lk.belt) {
      poly(ctx, [[-16 * w, -16], [17 * w, -16], [17 * w, -7], [-16 * w, -7]], lk.belt.color, OUT, 2);
      poly(ctx, [[8 * w, -18], [17 * w, -18], [17 * w, -5], [8 * w, -5]], lk.belt.buckle, OUT, 1.5);
    }
    if (lk.hanky) {
      poly(ctx, [[-14 * w, -6], [-6 * w, -6], [-9 * w, 14], [-15 * w, 10]], lk.hanky, OUT, 1.5);
    }
    // collar / neck base
    ctx.restore();
  }

  function drawCoatSkirt(ctx, k, s, p, t) {
    const c = k.look.coat; if (!c) return;
    const w = (k.look.build && k.look.build.w) || 1;
    // waist point in world coords
    const wx = s.hip[0] + Math.sin(p.lean) * 8, wy = s.hip[1] - Math.cos(p.lean) * 8;
    const sway = Math.sin(t * 0.08) * 3;
    const backHem = [wx - 26 * w - Math.max(0, p.lean) * 30 + sway, s.hip[1] + 62];
    // back panel
    poly(ctx, [[wx - 16 * w, wy], [wx + 2, wy], [s.bk[0] + 4, s.bk[1] + 18], backHem], shade(c.color, -0.2), OUT, 2.5);
    if (c.backOnly) return;
    // front panel follows front knee
    const fh = [s.fk[0] + 10, s.fk[1] + 16];
    poly(ctx, [[wx + 2, wy], [wx + 16 * w, wy], fh, [s.fk[0] - 10, s.fk[1] + 20]], c.color, OUT, 2.5);
    ctx.strokeStyle = c.lining; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wx + 15 * w, wy + 2); ctx.lineTo(fh[0] - 1, fh[1] - 2); ctx.stroke();
  }

  function drawCape(ctx, k, s, p, t) {
    const c = k.look.cape; if (!c) return;
    const n = s.neck;
    const flap = Math.sin(t * 0.07) * 8;
    poly(ctx, [[n[0] - 4, n[1] + 4], [n[0] - 30 + flap * 0.3, n[1] + 60], [n[0] - 52 + flap, -6], [n[0] - 6, -10], [n[0] + 8, n[1] + 10]], c.inner, OUT, 2.5);
    poly(ctx, [[n[0] - 2, n[1] + 4], [n[0] - 22 + flap * 0.3, n[1] + 60], [n[0] - 40 + flap, -4], [n[0] - 12, -8]], c.color, OUT, 2);
  }

  /* ───────── head ───────── */
  function hairCap(ctx, color, top, back, front) {
    ctx.beginPath();
    ctx.moveTo(front, -12);
    ctx.quadraticCurveTo(14, -24 - top, 0, -24 - top);
    ctx.quadraticCurveTo(-22, -24 - top, -21, -4);
    ctx.lineTo(-18, back);
    ctx.quadraticCurveTo(-12, back - 2, -10, -6);
    ctx.quadraticCurveTo(2, -16, front, -12);
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke();
  }
  function drawHairBack(ctx, lk) {
    const h = lk.hair, c = h.color;
    if (h.style === 'messy') {
      poly(ctx, [[-14, -20], [-24, -6], [-26, 14], [-22, 30], [-16, 22], [-12, 32], [-6, 20], [-4, 8]], c, OUT, 2.5);
    } else if (h.style === 'flow') {
      poly(ctx, [[-10, -20], [-22, -6], [-22, 16], [-14, 22], [-8, 10]], c, OUT, 2.5);
    } else if (h.style === 'puff') {
      ctx.beginPath(); ctx.ellipse(-6, -22, 28, 20, -0.15, 0, Math.PI * 2);
      ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-20, -2, 12, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(200,200,200,0.35)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-6 + i * 3 - 8, -28 + (i % 2) * 6, 7, 3.6, 5.4); ctx.stroke(); }
    } else if (h.style === 'wavy') {
      ctx.fillStyle = c; ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
      [[-18, -4, 9], [-19, 8, 8], [-14, -18, 10], [-4, -24, 10]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); });
    }
  }
  function drawHairFront(ctx, lk) {
    const h = lk.hair, c = h.color;
    switch (h.style) {
      case 'spiky':
        hairCap(ctx, c, 2, 4, 16);
        poly(ctx, [[14, -16], [20, -30], [6, -24], [8, -36], [-4, -26], [-6, -38], [-14, -24], [-22, -30], [-20, -14], [-4, -18]], c, OUT, 2.5);
        break;
      case 'flow':
        hairCap(ctx, c, 4, 10, 18);
        poly(ctx, [[18, -14], [22, -22], [8, -28], [-6, -28], [2, -20], [10, -18]], shade(c, 0.12), OUT, 2);
        break;
      case 'wavy':
        hairCap(ctx, c, 6, 10, 15);
        ctx.fillStyle = c; ctx.strokeStyle = OUT; ctx.lineWidth = 2;
        [[12, -20, 6], [4, -26, 7], [-6, -27, 7], [-15, -20, 7]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.fill(); ctx.stroke(); });
        break;
      case 'parted':
        hairCap(ctx, c, 2, 2, 17);
        ctx.strokeStyle = shade(c, 0.35); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-2, -25); ctx.quadraticCurveTo(6, -20, 16, -14); ctx.stroke();
        break;
      case 'curly':
        hairCap(ctx, c, 3, 8, 16);
        ctx.fillStyle = c;
        for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-18 + (i % 2) * 3, -12 + i * 5, 4, 0, 7); ctx.fill(); }
        break;
      case 'thick':
        hairCap(ctx, c, 7, 4, 17);
        poly(ctx, [[17, -13], [18, -24], [6, -32], [-10, -30], [-4, -24], [8, -22]], shade(c, 0.1), OUT, 2);
        break;
      case 'short':
        hairCap(ctx, c, 3, 0, 17);
        poly(ctx, [[16, -14], [18, -22], [12, -20], [12, -28], [4, -22], [2, -29], [-4, -22]], c, OUT, 2);
        break;
      case 'messy':
        hairCap(ctx, c, 5, 14, 15);
        poly(ctx, [[15, -12], [20, -22], [10, -20], [8, -32], [0, -24], [-6, -34], [-10, -22], [-20, -26], [-16, -14]], c, OUT, 2);
        break;
      case 'puff':
        hairCap(ctx, c, 6, 4, 15);
        break;
      case 'buzz':
        ctx.save(); ctx.globalAlpha *= 0.8; hairCap(ctx, c, -2, -4, 15); ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        for (let i = 0; i < 12; i++) ctx.fillRect(-16 + (i * 7) % 28, -22 + (i * 5) % 12, 1.5, 1.5);
        break;
      case 'turban': {
        // patka/turban: tall wrapped dome, peaked over the forehead, diagonal folds
        ctx.beginPath();
        ctx.moveTo(19, -10); ctx.lineTo(10, -40); ctx.quadraticCurveTo(-4, -46, -16, -36);
        ctx.quadraticCurveTo(-26, -22, -21, 0); ctx.quadraticCurveTo(-14, -4, -10, -6);
        ctx.quadraticCurveTo(4, -16, 19, -10); ctx.closePath();
        ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.strokeStyle = shade(c, 0.3); ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-20 + i * 3, -6 - i * 8); ctx.quadraticCurveTo(-2 + i * 2, -14 - i * 7, 16 - i * 2, -14 - i * 7); ctx.stroke(); }
        ctx.strokeStyle = shade(c, -0.35); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(18, -11); ctx.lineTo(10, -39); ctx.stroke();
        break;
      }
    }
  }
  function drawGlasses(ctx, g) {
    const lens = g.type === 'aviator'
      ? (cx) => { ctx.beginPath(); ctx.moveTo(cx - 5, -6); ctx.lineTo(cx + 6, -6); ctx.quadraticCurveTo(cx + 7, 4, cx + 1, 4); ctx.quadraticCurveTo(cx - 6, 3, cx - 5, -6); }
      : (cx) => { ctx.beginPath(); ctx.rect(cx - 5, -6, 11, 7); };
    ctx.strokeStyle = g.frame; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(5, -4); ctx.stroke();
    lens(1); ctx.fillStyle = shade(g.lens, -0.2); ctx.fill(); ctx.stroke();
    lens(12); ctx.fillStyle = g.lens; ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(9, -5, 3, 2);
  }
  function drawHead(ctx, k, o) {
    const lk = k.look;
    const skin = lk.skin;
    drawHairBack(ctx, lk);
    // head
    ctx.beginPath(); ctx.ellipse(0, 0, 19, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = skin; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke();
    // jaw / chin forward
    poly(ctx, [[8, 10], [19, 8], [17, 18], [6, 21]], skin);
    ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(19, 9); ctx.quadraticCurveTo(19, 19, 7, 21); ctx.stroke();
    // ear
    ctx.beginPath(); ctx.ellipse(-5, 1, 4, 6, 0, 0, 7); ctx.fillStyle = shade(skin, -0.1); ctx.fill(); ctx.stroke();
    // beard
    if (lk.beard === 'scruffy') {
      ctx.fillStyle = shade(lk.hair.color, 0.05);
      poly(ctx, [[-4, 6], [2, 14], [10, 15], [18, 12], [19, 20], [12, 27], [2, 26], [-8, 16]], ctx.fillStyle, OUT, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      for (let i = 0; i < 14; i++) ctx.fillRect(-4 + (i * 7) % 22, 14 + (i * 5) % 10, 2, 2);
    } else if (lk.beard === 'stubble') {
      ctx.fillStyle = 'rgba(20,14,10,0.22)';
      ctx.beginPath(); ctx.moveTo(-3, 6); ctx.quadraticCurveTo(4, 20, 18, 14); ctx.lineTo(18, 20); ctx.quadraticCurveTo(6, 25, -4, 12); ctx.fill();
    }
    // eyes
    const glow = lk.eyes && lk.eyes.glow && o.power;
    const eye = (x, sc) => {
      ctx.beginPath(); ctx.ellipse(x, -3, 4 * sc, 3 * sc, 0, 0, 7);
      ctx.fillStyle = glow ? lk.eyes.glow : '#fff'; ctx.fill();
      if (lk.kohl) { ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke(); }
      if (!glow) circle(ctx, x + 2 * sc, -3, 1.9 * sc, '#1a0f08');
    };
    if (glow) { ctx.save(); ctx.shadowColor = lk.eyes.glow; ctx.shadowBlur = 14; }
    eye(1, 0.75); eye(11, 1);
    if (glow) ctx.restore();
    // brows
    ctx.strokeStyle = lk.brows; ctx.lineWidth = lk.kohl ? 4.5 : 3.2; ctx.lineCap = 'round';
    const browUp = o.hurt ? -2 : 0;
    ctx.beginPath(); ctx.moveTo(6, -10 + browUp); ctx.lineTo(16, -7 - browUp * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3, -9); ctx.lineTo(4, -9); ctx.stroke();
    // nose
    ctx.strokeStyle = shade(skin, -0.35); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(16, -3); ctx.lineTo(21, 5); ctx.lineTo(16, 7); ctx.stroke();
    // mouth
    const m = o.mouth || 0;
    if (m > 0.05) {
      ctx.beginPath(); ctx.ellipse(13, 14, 4.5, 1.5 + m * 4.5, 0, 0, 7);
      ctx.fillStyle = '#3a0b0b'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = lk.teeth || '#f3efe6'; ctx.fillRect(9.5, 12.2 - m * 2.5, 7, 2);
    } else {
      ctx.strokeStyle = '#4a1f15'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(8, 14); ctx.quadraticCurveTo(12, o.hurt ? 12 : 15.5, 16, 13.5); ctx.stroke();
    }
    // moustache
    if (lk.mustache === 'thick') {
      ctx.fillStyle = lk.hair.color;
      ctx.beginPath(); ctx.moveTo(5, 11); ctx.quadraticCurveTo(12, 6, 20, 9); ctx.quadraticCurveTo(21, 13, 18, 13);
      ctx.quadraticCurveTo(12, 10, 6, 14); ctx.closePath(); ctx.fill();
    } else if (lk.mustache === 'thin') {
      ctx.strokeStyle = lk.hair.color; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(8, 10.5); ctx.quadraticCurveTo(13, 8.5, 18, 10.5); ctx.stroke();
    }
    // robot damage (Chitti)
    if (lk.robot && o.damaged) {
      poly(ctx, [[4, -14], [17, -12], [19, 2], [12, 8], [3, 4]], '#c3c9d1', OUT, 1.5);
      ctx.strokeStyle = '#6d7480'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(14, -6); ctx.moveTo(8, 0); ctx.lineTo(16, 0); ctx.stroke();
      ctx.save(); ctx.shadowColor = '#ff2020'; ctx.shadowBlur = 12; circle(ctx, 11, -3, 3.2, '#ff2a2a'); ctx.restore();
    }
    // mask (Krrish)
    if (lk.mask) {
      ctx.beginPath();
      ctx.moveTo(-20, -12); ctx.quadraticCurveTo(4, -18, 20, -12);
      ctx.lineTo(22, 2); ctx.quadraticCurveTo(18, 4, 15, 3);
      ctx.quadraticCurveTo(4, 7, -20, 4); ctx.closePath();
      ctx.fillStyle = lk.mask.color; ctx.fill(); ctx.strokeStyle = lk.mask.trim; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, -6); ctx.quadraticCurveTo(12, -9, 17, -5); ctx.quadraticCurveTo(12, -1, 6, -3); ctx.closePath();
      ctx.fillStyle = '#fff'; ctx.fill(); circle(ctx, 13, -4.5, 1.8, '#1a0f08');
    }
    if (lk.glasses && !(lk.robot && o.damaged)) drawGlasses(ctx, lk.glasses);
    drawHairFront(ctx, lk);
    if (lk.hat) {
      const hc = lk.hat.color;
      poly(ctx, [[-16, -16], [-13, -36], [-2, -40], [12, -37], [15, -16]], hc, OUT, 2.5);
      ctx.fillStyle = shade(hc, 0.1); ctx.fillRect(-12, -38, 22, 3);
      poly(ctx, [[-15, -22], [15, -22], [15, -16], [-16, -16]], lk.hat.band, OUT, 1.5);
      ctx.beginPath(); ctx.ellipse(2, -16, 30, 5.5, -0.06, 0, Math.PI * 2);
      ctx.fillStyle = shade(hc, -0.1); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke();
    }
  }
  BMK.drawHead = drawHead;

  /* ───────── fighter ───────── */
  /**
   * o: { char, pose, x, y (feet on screen), facing, scale, t, alpha, mouth, damaged, power, hurt,
   *      noArms, rot (whole-body rotation), lying, flash }
   */
  BMK.drawFighter = function (ctx, o) {
    const k = o.char, lk = k.look, p = o.pose;
    const hs = ((lk.build && lk.build.h) || 1) * (o.scale || 1);
    const s = skeleton(p);
    const t = o.t || 0;
    ctx.save();
    ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    ctx.translate(o.x, o.y);
    ctx.scale(o.facing * hs, hs);
    if (o.rot) ctx.rotate(o.rot);
    if (o.lying) ctx.translate(0, -10);
    if (o.flash && 'filter' in ctx) ctx.filter = 'brightness(2.2) saturate(0.4)';

    // shadow
    if (!o.noShadow) {
      ctx.save(); ctx.globalAlpha *= 0.35; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(0, (o.air || 0) / hs, 46, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    drawCape(ctx, k, s, p, t);
    if (!o.noArms) drawArm(ctx, p, k, s.bs, s.be, s.bh, p.ba1, true);
    drawLeg(ctx, k, s.hip, s.bk, s.bf, p.bl1, true);
    drawLeg(ctx, k, s.hip, s.fk, s.ff, p.fl1, false);
    drawCoatSkirt(ctx, k, s, p, t);
    drawTorso(ctx, k, s, p, o);
    // neck
    seg(ctx, s.neck, add(s.neck, up(p.lean, 10)), 13, lk.skin, false);
    // collar shades hanging at back (Chulbul)
    if (lk.collarShades) {
      ctx.save(); ctx.translate(s.neck[0] - 9, s.neck[1] + 6); ctx.rotate(p.lean + 0.25);
      drawGlasses(ctx, { type: 'aviator', frame: lk.collarShades.frame, lens: lk.collarShades.lens });
      ctx.restore();
    }
    // head
    ctx.save(); ctx.translate(s.head[0], s.head[1]); ctx.rotate(p.lean * 0.5 + p.head);
    drawHead(ctx, k, o);
    ctx.restore();
    if (!o.noArms) drawArm(ctx, p, k, s.fs, s.fe, s.fh, p.fa1, false);
    else {
      // tiny sleeve stubs
      seg(ctx, s.fs, add(s.fs, [4, 10]), 15, lk.sleeve || lk.skin);
    }
    ctx.restore();
    return s;
  };

  /** Head-and-shoulders portrait inside a box. */
  BMK.drawPortrait = function (ctx, char, x, y, w, h, opts) {
    opts = opts || {};
    const sc = (h / 120) * 1.45 * (opts.zoom || 1);
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const pose = BMK.copyPose(POSES.portrait);
    pose.head = opts.tilt || 0;
    BMK.drawFighter(ctx, {
      char, pose, x: x + w / 2 - (opts.facing === -1 ? -8 : 8) * sc, y: y + h * 0.56 + 217 * sc, facing: opts.facing || 1,
      scale: sc, t: opts.t || 0, mouth: opts.mouth || 0, power: true, noShadow: true, damaged: opts.damaged
    });
    ctx.restore();
  };

  /* ───────── projectiles & effects ───────── */
  BMK.drawProjectile = function (ctx, pr, t) {
    ctx.save(); ctx.translate(pr.x, pr.y);
    const c = pr.color;
    switch (pr.shape) {
      case 'orb': {
        ctx.shadowColor = c; ctx.shadowBlur = 30;
        const g = ctx.createRadialGradient(0, 0, 2, 0, 0, pr.r);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, c); g.addColorStop(1, 'rgba(0,120,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, pr.r * 1.3, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(200,250,255,0.8)'; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, pr.r * 0.8, t * 0.3 + i * 2, t * 0.3 + i * 2 + 1); ctx.stroke(); }
        // trail
        ctx.globalAlpha = 0.4; ctx.fillStyle = c;
        ctx.beginPath(); ctx.ellipse(-Math.sign(pr.vx) * pr.r * 1.4, 0, pr.r * 1.2, pr.r * 0.5, 0, 0, 7); ctx.fill();
        break;
      }
      case 'bolt':
        ctx.rotate(pr.vx < 0 ? Math.PI : 0);
        ctx.shadowColor = '#9fe7ff'; ctx.shadowBlur = 10;
        poly(ctx, [[-16, -3], [8, -4], [14, 0], [8, 4], [-16, 3]], '#d6dde6', '#4a525c', 1.5);
        ctx.strokeStyle = '#9fe7ff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-30, -5); ctx.lineTo(-36, 3); ctx.stroke();
        break;
      case 'glasses':
        ctx.rotate(t * 0.5);
        ctx.scale(1.6, 1.6);
        drawGlasses(ctx, { type: 'aviator', frame: '#c9a24a', lens: '#2a2219' });
        break;
      case 'bullet':
        ctx.rotate(pr.vx < 0 ? Math.PI : 0);
        ctx.fillStyle = 'rgba(255,240,180,0.5)'; ctx.fillRect(-40, -1.5, 34, 3);
        poly(ctx, [[-6, -4], [4, -4], [9, 0], [4, 4], [-6, 4]], '#d4a640', OUT, 1.5);
        break;
      case 'acid': {
        ctx.shadowColor = c; ctx.shadowBlur = 20;
        ctx.fillStyle = c;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r = pr.r * (0.8 + 0.25 * Math.sin(t * 0.4 + i * 2)); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill();
        circle(ctx, -4, -5, 4, 'rgba(255,255,255,0.6)');
        break;
      }
      case 'wave': {
        ctx.shadowColor = c; ctx.shadowBlur = 20;
        const dir = Math.sign(pr.vx);
        ctx.fillStyle = c; ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.moveTo(-30 * dir, 0);
        for (let i = 0; i <= 6; i++) ctx.lineTo((-30 + i * 10) * dir, -10 - Math.abs(Math.sin(t * 0.6 + i)) * 40 * (i / 6));
        ctx.lineTo(30 * dir, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#8a6a3a';
        for (let i = 0; i < 5; i++) ctx.fillRect((i * 13 - 30) * dir, -18 - ((t * 3 + i * 11) % 30), 5, 5);
        break;
      }
    }
    ctx.restore();
  };

  BMK.drawJeep = function (ctx, x, y, dir, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    // body
    poly(ctx, [[-110, -20], [100, -20], [112, -52], [60, -58], [40, -100], [-80, -100], [-100, -60], [-112, -55]], '#f3f3f0', OUT, 4);
    poly(ctx, [[-110, -48], [112, -48], [110, -38], [-110, -36]], '#1b4fb3', null);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px "Bungee", Impact, sans-serif'; ctx.save(); ctx.scale(dir, 1); ctx.textAlign = 'center';
    ctx.fillText('POLICE', 0, -26); ctx.restore();
    poly(ctx, [[-70, -92], [-6, -92], [-6, -62], [-86, -62]], '#9cc8e6', OUT, 2.5);
    poly(ctx, [[2, -92], [36, -92], [52, -62], [2, -62]], '#9cc8e6', OUT, 2.5);
    ctx.fillStyle = '#ffd34a'; ctx.fillRect(100, -50, 12, 10);
    // siren
    const blink = Math.floor(t / 6) % 2;
    ctx.save(); ctx.shadowBlur = 25;
    ctx.shadowColor = '#ff2020'; ctx.fillStyle = blink ? '#ff2020' : '#661010'; ctx.fillRect(-40, -112, 22, 12);
    ctx.shadowColor = '#2060ff'; ctx.fillStyle = blink ? '#1a2a66' : '#2a6aff'; ctx.fillRect(-18, -112, 22, 12);
    ctx.restore();
    // wheels
    for (const wx of [-70, 70]) {
      circle(ctx, wx, -16, 22, '#111', OUT, 3); circle(ctx, wx, -16, 10, '#888');
      ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(wx + Math.cos(t) * 10, -16 + Math.sin(t) * 10); ctx.lineTo(wx - Math.cos(t) * 10, -16 - Math.sin(t) * 10); ctx.stroke();
    }
    // dust
    ctx.fillStyle = 'rgba(180,150,110,0.5)';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-120 - i * 18, -8 - (i % 3) * 8, 12 + i * 2, 0, 7); ctx.fill(); }
    ctx.restore();
  };

  BMK.drawTornado = function (ctx, x, y, h, color, t) {
    ctx.save(); ctx.translate(x, y);
    ctx.shadowColor = color; ctx.shadowBlur = 25;
    for (let i = 0; i < 10; i++) {
      const yy = -i * (h / 10), r = 22 + i * 7;
      ctx.strokeStyle = i % 2 ? color : 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(Math.sin(t * 0.3 + i) * 6, yy, r, 8, 0, t * 0.4 + i, t * 0.4 + i + 4.2); ctx.stroke();
    }
    ctx.restore();
  };

  /* ───────── stages ───────── */
  const stageCache = {};
  function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

  function buildStage(id, W, H, G) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const r = rng(42 + id.length * 7);
    if (id === 'marine') {
      const sky = g.createLinearGradient(0, 0, 0, 440);
      sky.addColorStop(0, '#070a24'); sky.addColorStop(0.6, '#24194a'); sky.addColorStop(1, '#5a2c5e');
      g.fillStyle = sky; g.fillRect(0, 0, W, 460);
      for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.8})`; g.fillRect(r() * W, r() * 300, 1.5, 1.5); }
      circle(g, 1060, 110, 38, '#fff6d8'); circle(g, 1074, 100, 34, '#20184a');
      // skyline across the bay
      for (let x = 0; x < W; x += 18 + r() * 30) {
        const bw = 20 + r() * 46, bh = 40 + r() * 170 * (0.5 + 0.5 * Math.sin(x / 200));
        const by = 440 - bh - Math.sin((x / W) * Math.PI) * 30;
        g.fillStyle = '#121433'; g.fillRect(x, by, bw, 440 - by);
        for (let wy = by + 6; wy < 430; wy += 9) for (let wx = x + 4; wx < x + bw - 4; wx += 7) if (r() < 0.35) { g.fillStyle = r() < 0.7 ? '#ffd27a' : '#9fd0ff'; g.fillRect(wx, wy, 3, 4); }
      }
      // Queen's necklace road
      g.fillStyle = '#0d0f22'; g.beginPath(); g.moveTo(0, 452); g.quadraticCurveTo(W / 2, 410, W, 452); g.lineTo(W, 462); g.quadraticCurveTo(W / 2, 422, 0, 462); g.fill();
      // sea
      const sea = g.createLinearGradient(0, 455, 0, 590);
      sea.addColorStop(0, '#1a2050'); sea.addColorStop(1, '#070a1c');
      g.fillStyle = sea; g.fillRect(0, 458, W, 135);
      // sea wall & tetrapods
      g.fillStyle = '#3c3a40'; g.fillRect(0, 585, W, 22);
      for (let x = -20; x < W; x += 46) {
        g.fillStyle = '#56535a'; g.beginPath(); g.moveTo(x, 585); g.lineTo(x + 22, 560 + r() * 8); g.lineTo(x + 44, 585); g.fill();
      }
      g.fillStyle = '#6a6670'; g.fillRect(0, 600, W, 8);
      // promenade tiles
      const fl = g.createLinearGradient(0, 608, 0, H); fl.addColorStop(0, '#5d5a63'); fl.addColorStop(1, '#2a2830');
      g.fillStyle = fl; g.fillRect(0, 608, W, H - 608);
      g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1;
      for (let y = 620; y < H; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, 608); g.lineTo(x - 40, H); g.stroke(); }
    } else if (id === 'ramgarh') {
      const sky = g.createLinearGradient(0, 0, 0, 480);
      sky.addColorStop(0, '#5a2a6e'); sky.addColorStop(0.45, '#e8603a'); sky.addColorStop(1, '#ffc46b');
      g.fillStyle = sky; g.fillRect(0, 0, W, 500);
      const sun = g.createRadialGradient(430, 380, 10, 430, 380, 120); sun.addColorStop(0, '#fff3b0'); sun.addColorStop(0.4, '#ffcb5c'); sun.addColorStop(1, 'rgba(255,160,60,0)');
      g.fillStyle = sun; g.fillRect(250, 220, 360, 320);
      // far hills
      g.fillStyle = '#8a4a3f'; g.beginPath(); g.moveTo(0, 470);
      for (let x = 0; x <= W; x += 40) g.lineTo(x, 430 - Math.sin(x / 130) * 30 - r() * 15); g.lineTo(W, 520); g.lineTo(0, 520); g.fill();
      // boulders (Sholay rocks)
      const rock = (x, y, w, h, col) => {
        g.fillStyle = col; g.beginPath(); g.ellipse(x, y, w, h, 0, Math.PI, 0); g.lineTo(x + w, y + 10); g.lineTo(x - w, y + 10); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(x + w * 0.3, y, w * 0.7, h * 0.85, 0, Math.PI * 1.3, 0); g.fill();
        g.fillStyle = 'rgba(255,220,160,0.15)'; g.beginPath(); g.ellipse(x - w * 0.4, y - h * 0.6, w * 0.35, h * 0.2, -0.3, 0, 7); g.fill();
      };
      rock(140, 560, 150, 170, '#9a5f3a'); rock(300, 590, 110, 90, '#86502f'); rock(70, 600, 90, 60, '#7a4a2c');
      rock(1180, 570, 150, 150, '#9a5f3a'); rock(1000, 600, 90, 60, '#86502f');
      // water tanki
      g.strokeStyle = '#3a2a22'; g.lineWidth = 6;
      [[790, 600, 830, 330], [930, 600, 890, 330], [810, 470, 910, 470], [800, 540, 920, 400], [920, 540, 800, 400]].forEach(([a, b, c2, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c2, d); g.stroke(); });
      g.fillStyle = '#6a5a4f'; g.fillRect(800, 240, 120, 95); g.fillStyle = '#4e4038'; g.fillRect(800, 240, 120, 10); g.fillRect(800, 320, 120, 15);
      g.beginPath(); g.moveTo(796, 240); g.lineTo(860, 205); g.lineTo(924, 240); g.fillStyle = '#4e4038'; g.fill();
      g.strokeStyle = '#2a1d17'; g.lineWidth = 2; for (let y = 340; y < 600; y += 16) { g.beginPath(); g.moveTo(835, y); g.lineTo(855, y); g.stroke(); }
      g.beginPath(); g.moveTo(835, 335); g.lineTo(835, 600); g.moveTo(855, 335); g.lineTo(855, 600); g.stroke();
      // ground
      const fl = g.createLinearGradient(0, 590, 0, H); fl.addColorStop(0, '#c28a4f'); fl.addColorStop(1, '#7a5030');
      g.fillStyle = fl; g.fillRect(0, 600, W, H - 600);
      for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(60,35,15,${r() * 0.4})`; g.fillRect(r() * W, 605 + r() * 115, 2 + r() * 4, 2); }
      // shrubs
      for (let i = 0; i < 6; i++) { const x = r() * W; g.fillStyle = '#4c5a2a'; g.beginPath(); g.ellipse(x, 606, 26, 12, 0, Math.PI, 0); g.fill(); }
    } else if (id === 'filmcity') {
      g.fillStyle = '#17141c'; g.fillRect(0, 0, W, H);
      // painted Switzerland backdrop
      const bx = 160, by = 70, bw = 960, bh = 470;
      const sky = g.createLinearGradient(0, by, 0, by + bh); sky.addColorStop(0, '#5fb6f0'); sky.addColorStop(1, '#cdeaff');
      g.fillStyle = sky; g.fillRect(bx, by, bw, bh);
      const mtn = (pts, col, snow) => { poly(g, pts, col); if (snow) { g.fillStyle = '#fff'; g.beginPath(); const p0 = pts[1]; g.moveTo(p0[0] - 40, p0[1] + 60); g.lineTo(p0[0], p0[1]); g.lineTo(p0[0] + 45, p0[1] + 65); g.lineTo(p0[0] + 15, p0[1] + 45); g.lineTo(p0[0] - 10, p0[1] + 70); g.fill(); } };
      mtn([[bx, by + 360], [bx + 260, by + 110], [bx + 520, by + 360]], '#7b8fa8', true);
      mtn([[bx + 380, by + 360], [bx + 650, by + 80], [bx + 960, by + 360]], '#6d819c', true);
      g.fillStyle = '#5fbf4a'; g.beginPath(); g.moveTo(bx, by + 330); g.quadraticCurveTo(bx + 480, by + 260, bx + bw, by + 330); g.lineTo(bx + bw, by + bh); g.lineTo(bx, by + bh); g.fill();
      for (let i = 0; i < 40; i++) { g.fillStyle = ['#ffe05a', '#ff7aa8', '#fff'][i % 3]; g.beginPath(); g.arc(bx + r() * bw, by + 360 + r() * 100, 3, 0, 7); g.fill(); }
      // backdrop frame
      g.strokeStyle = '#6b4a2a'; g.lineWidth = 14; g.strokeRect(bx, by, bw, bh);
      g.fillStyle = '#6b4a2a'; g.fillRect(bx + 60, by + bh, 14, 70); g.fillRect(bx + bw - 74, by + bh, 14, 70);
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.font = '14px monospace'; g.fillText('PROP — DO NOT TOUCH — "SWITZERLAND" (Set No. 7)', bx + 20, by + bh - 12);
      // light stands
      const stand = (x, dir) => {
        g.strokeStyle = '#222'; g.lineWidth = 5;
        g.beginPath(); g.moveTo(x, 610); g.lineTo(x, 300); g.moveTo(x, 610); g.lineTo(x - 40, 625); g.moveTo(x, 610); g.lineTo(x + 40, 625); g.stroke();
        g.save(); g.translate(x, 290); g.rotate(dir * 0.5);
        poly(g, [[-30, -25], [30, -25], [26, 25], [-26, 25]], '#2c2c30', '#000', 3);
        g.fillStyle = '#fff8d0'; g.fillRect(-22, 18, 44, 7); g.restore();
      };
      stand(70, 1); stand(1210, -1);
      // floor planks
      g.fillStyle = '#5a3d27'; g.fillRect(0, 605, W, H - 605);
      g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2;
      for (let y = 620; y < H; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.fillStyle = '#e9d64a'; g.fillRect(380, 650, 40, 6); g.fillRect(397, 633, 6, 40); g.fillRect(860, 650, 40, 6); g.fillRect(877, 633, 6, 40);
      // director's chair
      g.fillStyle = '#2a1a10'; g.fillRect(1080, 540, 8, 70); g.fillRect(1140, 540, 8, 70);
      g.fillStyle = '#b3201a'; g.fillRect(1074, 530, 80, 14); g.fillRect(1078, 486, 72, 26);
      g.fillStyle = '#fff'; g.font = 'bold 13px sans-serif'; g.fillText('DIRECTOR', 1083, 504);
      // clapboard
      g.save(); g.translate(230, 590); g.rotate(-0.15);
      g.fillStyle = '#111'; g.fillRect(0, 0, 70, 46); g.fillStyle = '#fff'; g.font = 'bold 10px monospace'; g.fillText('SCENE 420', 6, 22); g.fillText('TAKE 69', 6, 36);
      g.translate(0, -2); g.rotate(-0.35);
      for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#fff' : '#111'; g.fillRect(i * 10, -12, 10, 12); }
      g.restore();
    } else if (id === 'lair') {
      const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0b0710'); bg.addColorStop(1, '#22121c');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      // rock wall blocks
      for (let y = 0; y < 560; y += 40) for (let x = (y / 40) % 2 ? -40 : 0; x < W; x += 80) {
        g.fillStyle = `rgba(${40 + r() * 20},${25 + r() * 10},${35 + r() * 15},1)`; g.fillRect(x + 2, y + 2, 76, 36);
      }
      // banners
      const banner = (x) => {
        poly(g, [[x, 40], [x + 120, 40], [x + 120, 330], [x + 60, 300], [x, 330]], '#8a0f1c', '#000', 3);
        g.fillStyle = '#d4a017'; g.fillRect(x, 40, 120, 10);
        g.save(); g.translate(x + 60, 180); g.fillStyle = '#d4a017'; g.font = 'bold 22px "Bungee", Impact, sans-serif'; g.textAlign = 'center';
        g.fillText('HAIL', 0, -30); g.fillText('MOGAMBO', 0, 0);
        g.beginPath(); g.arc(0, 60, 26, 0, 7); g.strokeStyle = '#d4a017'; g.lineWidth = 4; g.stroke();
        g.beginPath(); g.moveTo(-14, 50); g.lineTo(0, 76); g.lineTo(14, 50); g.stroke(); g.restore();
      };
      banner(140); banner(1020);
      // acid tank
      g.fillStyle = '#2b2b2b'; g.fillRect(380, 430, 520, 140);
      g.fillStyle = '#4a4a4a'; g.fillRect(370, 420, 540, 14);
      g.strokeStyle = '#555'; g.lineWidth = 4;
      for (let x = 390; x < 900; x += 40) { g.beginPath(); g.moveTo(x, 330); g.lineTo(x, 420); g.stroke(); }
      g.beginPath(); g.moveTo(380, 340); g.lineTo(900, 340); g.stroke();
      // floor grating
      g.fillStyle = '#1a1a1e'; g.fillRect(0, 590, W, H - 590);
      g.strokeStyle = '#2e2e36'; g.lineWidth = 2;
      for (let x = 0; x < W; x += 28) { g.beginPath(); g.moveTo(x, 590); g.lineTo(x, H); g.stroke(); }
      for (let y = 600; y < H; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.fillStyle = '#d4a017'; for (let x = 0; x < W; x += 60) { g.fillRect(x, 590, 30, 8); }
    }
    return c;
  }

  BMK.drawStage = function (ctx, id, W, H, G, t) {
    if (!stageCache[id]) stageCache[id] = buildStage(id, W, H, G);
    ctx.drawImage(stageCache[id], 0, 0);
    // animated layers
    if (id === 'marine') {
      for (let i = 0; i < 46; i++) {
        const x = (i / 45) * W, y = 452 - Math.sin((x / W) * Math.PI) * 38 + 2;
        const tw = 0.6 + 0.4 * Math.sin(t * 0.05 + i);
        ctx.fillStyle = `rgba(255,214,120,${tw})`; ctx.beginPath(); ctx.arc(x, y - 6, 3, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(255,200,100,${0.25 * tw})`;
        ctx.fillRect(x - 1.5, y + 4 + Math.sin(t * 0.08 + i) * 3, 3, 40 + Math.sin(t * 0.05 + i * 3) * 15);
      }
      ctx.strokeStyle = 'rgba(160,180,255,0.18)'; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const y = 490 + i * 16; ctx.beginPath();
        for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin(x / 50 + t * 0.04 + i) * 3);
        ctx.stroke();
      }
    } else if (id === 'ramgarh') {
      ctx.fillStyle = 'rgba(255,220,170,0.35)';
      for (let i = 0; i < 25; i++) { const x = (i * 97 + t * (0.6 + (i % 3) * 0.3)) % W, y = 560 + ((i * 37) % 120) + Math.sin(t * 0.03 + i) * 8; ctx.fillRect(x, y, 3, 3); }
    } else if (id === 'filmcity') {
      const fl = 0.08 + 0.03 * Math.sin(t * 0.2);
      for (const [x, d] of [[70, 1], [1210, -1]]) {
        const gr = ctx.createRadialGradient(x, 300, 10, x + d * 320, 620, 420);
        gr.addColorStop(0, `rgba(255,248,210,${fl + 0.12})`); gr.addColorStop(1, 'rgba(255,248,210,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x + d * 640, 640); ctx.lineTo(x + d * 60, 720); ctx.fill();
      }
      if (Math.floor(t / 30) % 2) { circle(ctx, 1190, 40, 8, '#ff2020'); ctx.fillStyle = '#ff4040'; ctx.font = 'bold 20px monospace'; ctx.fillText('REC', 1206, 47); }
    } else if (id === 'lair') {
      const ac = ctx.createLinearGradient(0, 436, 0, 570); ac.addColorStop(0, '#9dff4a'); ac.addColorStop(1, '#2a7a10');
      ctx.fillStyle = ac; ctx.fillRect(386, 436, 508, 130);
      ctx.fillStyle = 'rgba(220,255,180,0.7)';
      for (let i = 0; i < 14; i++) { const x = 400 + ((i * 71) % 480), ph = (t * 0.03 + i * 0.37) % 1; ctx.beginPath(); ctx.arc(x, 560 - ph * 120, 3 + ph * 6, 0, 7); ctx.globalAlpha = 1 - ph; ctx.fill(); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(120,255,60,0.07)'; ctx.fillRect(0, 300, W, 300);
      for (const x of [60, 330, 950, 1220]) {
        ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x - 5, 360, 10, 60);
        const fh = 26 + Math.sin(t * 0.3 + x) * 6;
        ctx.save(); ctx.shadowColor = '#ff9a2a'; ctx.shadowBlur = 30;
        ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.moveTo(x - 10, 360); ctx.quadraticCurveTo(x, 360 - fh * 2, x + 10, 360); ctx.fill();
        ctx.fillStyle = '#fff1a0'; ctx.beginPath(); ctx.moveTo(x - 5, 360); ctx.quadraticCurveTo(x, 360 - fh, x + 5, 360); ctx.fill();
        ctx.restore();
      }
    }
  };
})();
