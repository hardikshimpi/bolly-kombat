// Builds the SEO layer from data/characters.js:
//   - the crawlable content section in index.html (between <!-- SEO:START --> and <!-- SEO:END -->)
//   - JSON-LD structured data (between <!-- JSONLD:START --> and <!-- JSONLD:END -->)
//   - sitemap.xml and robots.txt
//   - with --images: the social preview image and character portraits (needs Google Chrome)
// Usage: node tools/build-seo.mjs [--images]
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const SITE = 'https://bolly-kombat.vercel.app';
const root = fileURLToPath(new URL('..', import.meta.url));
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(root + 'data/characters.js', 'utf8'), sandbox);
const { characters: CH, stages } = sandbox.window.BMK_DATA;
const today = new Date().toISOString().slice(0, 10);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── images ── */
if (process.argv.includes('--images')) {
  const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const page = pathToFileURL(root + 'tools/og.html').href;
  const tmp = root + '.seo-tmp/';
  mkdirSync(tmp, { recursive: true }); mkdirSync(root + 'images/characters', { recursive: true });
  const shot = (url, w, h, out) => {
    execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
      `--window-size=${w},${h}`, '--virtual-time-budget=4000', `--screenshot=${out}`, url], { stdio: 'ignore' });
  };
  const jpeg = (src, dst, q) => execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(q), src, '--out', dst], { stdio: 'ignore' });
  shot(page, 1200, 630, tmp + 'og.png'); jpeg(tmp + 'og.png', root + 'images/og-image.jpg', 82);
  for (const c of CH) {
    shot(`${page}?portrait=${c.id}&size=320`, 320, 320, tmp + c.id + '.png');
    jpeg(tmp + c.id + '.png', root + `images/characters/${c.id}.jpg`, 80);
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log(`Rendered og-image.jpg and ${CH.length} portraits.`);
}

/* ── visible content ── */
const filmLines = (c, n) => c.dialogues.filter((d) => d.type === 'film' && !d.vs).slice(0, n);
const card = (c) => `
        <article class="card" id="char-${c.id}">
          <img src="images/characters/${c.id}.jpg" width="160" height="160" loading="lazy"
               alt="Cartoon portrait of ${esc(c.name)}, ${esc(c.actor)}'s character from ${esc(c.film)} (${c.year}), in Bolly Kombat">
          <h3>${esc(c.name)}${c.id === 'mogambo' ? ' <span class="tag">Final boss</span>' : ''}</h3>
          <p class="meta">${esc(c.actor)} · <em>${esc(c.film)}</em> (${c.year})</p>
          <p>${esc(c.bio)}</p>
          <p><strong>Look:</strong> ${esc(c.outfit.join('; '))}.</p>
          <p><strong>Moves:</strong> ${esc(c.special.name)} (special) · ${esc(c.super.name)} (superstar move) · ${esc(c.fatality.name)} (fatality)</p>
${(filmLines(c, 2).length ? filmLines(c, 2) : c.dialogues.slice(0, 1)).map((d) => `          <blockquote>“${esc(d.text)}” <cite>— ${esc(d.source)}${d.year ? ` (${d.year})` : ''}</cite></blockquote>`).join('\n')}
        </article>`;

const lineCount = CH.reduce((a, c) => a + c.dialogues.length, 0);
const heroNames = CH.filter((c) => c.id !== 'mogambo').map((c) => c.name);
const faq = [
  ['Is Bolly Kombat free to play?', 'Yes. It runs in your web browser with nothing to download or install, and there are no accounts or ads.'],
  ['Can I play with a friend?', 'Yes. Versus mode lets two players fight on one keyboard. Arcade mode pits you against the computer, ending with Mogambo as the final boss.'],
  ['Does it work on phones?', 'Not yet. Bolly Kombat needs a keyboard, so play it on a laptop or desktop computer.'],
  ['Are the dialogues real?', `The game has ${lineCount} dialogues. Lines marked as film quotes come from the movies they credit; the others are new parody jokes written in each character's style. Each line's source is shown in the speech bubble.`],
  ['How do I do a fatality?', 'Win the final round. When the announcer shouts “KHATAM KARO ISKO!”, walk up to your dizzy opponent and press the Super key (T for player 1) or Special — then it’s “PACKUP!”.'],
  ['Why can’t I hear the dialogues?', 'Click or press any key once to unlock sound — browsers block audio until you interact with the page. Voices use your browser’s text-to-speech, with a Hindi voice where one is installed.']
];

const content = `
    <header class="intro">
      <h1>Bolly Kombat — Bollywood Superhero Fighting Game</h1>
      <p class="lead">A free, Mortal Kombat-style fighting game where ${CH.length} Bollywood heroes and villains battle it out — and shout their most iconic filmy dialogues when they land a hard hit.</p>
      <a class="cta" href="#play">▶ Play now — free in your browser</a>
    </header>

    <section aria-labelledby="about-h">
      <h2 id="about-h">About the game</h2>
      <p>Bolly Kombat is a fan-made parody fighting game. Pick ${esc(heroNames.slice(0, -1).join(', '))} or ${esc(heroNames.at(-1))}, then fight through an arcade ladder to Mogambo, or challenge a friend on the same keyboard.</p>
      <ul class="features">
        <li><strong>${lineCount} filmy dialogues</strong> — from “Bade bade deshon mein…” to “Kitne aadmi the?” — spoken aloud in Hindi.</li>
        <li><strong>Specials, superstar moves and fatalities</strong> for every character, called “PACKUP”.</li>
        <li><strong>Bollywood-style announcer</strong>: “Lights… Camera… ACTION!”, “KHATAM KARO ISKO!”, and hits that go “DHISHOOM!”.</li>
        <li><strong>${stages.length} stages</strong> and a dhol-and-tabla soundtrack.</li>
      </ul>
    </section>

    <section id="characters" aria-labelledby="chars-h">
      <h2 id="chars-h">Characters (${CH.length} fighters)</h2>
      <div class="grid">${CH.map(card).join('\n')}
      </div>
    </section>

    <section id="how-to-play" aria-labelledby="howto-h">
      <h2 id="howto-h">How to play</h2>
      <table>
        <thead><tr><th>Action</th><th>Player 1</th><th>Player 2</th></tr></thead>
        <tbody>
          <tr><td>Move / jump / crouch</td><td>A D / W / S</td><td>← → / ↑ / ↓</td></tr>
          <tr><td>Punch</td><td>F</td><td>J</td></tr>
          <tr><td>Kick</td><td>G</td><td>K</td></tr>
          <tr><td>Special move</td><td>H</td><td>L</td></tr>
          <tr><td>Block (add down for a low block)</td><td>R</td><td>I</td></tr>
          <tr><td>Superstar move (when the meter is full)</td><td>T</td><td>O</td></tr>
          <tr><td>Pause</td><td colspan="2">Esc or P</td></tr>
        </tbody>
      </table>
      <p><strong>Combos:</strong> Punch, Punch, Kick for a 3-hit combo · Down + Kick to sweep · Jump + Kick for a flying kick. In 1-player Arcade mode the arrow keys and J K L also work.</p>
    </section>

    <section aria-labelledby="stages-h">
      <h2 id="stages-h">Stages</h2>
      <ul>
${stages.map((s) => `        <li><strong>${esc(s.name)}</strong> — ${esc(s.time)}</li>`).join('\n')}
      </ul>
    </section>

    <section id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">FAQ</h2>
${faq.map(([q, a]) => `      <h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n')}
    </section>

    <p class="disclaimer">Bolly Kombat is an unofficial, non-commercial fan parody. It is not affiliated with or endorsed by any actor, film, studio or broadcaster. Characters are original cartoon drawings made in code; film titles, character names and quoted dialogues belong to their respective owners.</p>
`;

/* ── structured data ── */
const jsonld = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: 'Bolly Kombat', inLanguage: 'en' },
    {
      '@type': 'VideoGame', '@id': SITE + '/#game', url: SITE + '/', name: 'Bolly Kombat',
      alternateName: 'Bolly Kombat — Dhishoom Edition',
      description: `A free browser fighting game where ${CH.length} Bollywood superheroes and villains battle and shout their iconic filmy dialogues.`,
      image: SITE + '/images/og-image.jpg',
      genre: ['Fighting game', 'Parody', 'Comedy'],
      gamePlatform: 'Web browser', operatingSystem: 'Any', applicationCategory: 'Game',
      playMode: ['SinglePlayer', 'MultiPlayer'],
      numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2 },
      inLanguage: ['en', 'hi'], isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      character: CH.map((c) => ({ '@type': 'Person', name: c.name, description: `${c.alterEgo} (${c.film}, ${c.year})` })),
      isPartOf: { '@id': SITE + '/#website' }
    }
  ]
};

/* ── write files ── */
let html = readFileSync(root + 'index.html', 'utf8');
const swap = (start, end, body) => {
  const re = new RegExp(`(<!-- ${start} -->)[\\s\\S]*?(\\s*<!-- ${end} -->)`);
  if (!re.test(html)) throw new Error(`markers ${start}/${end} missing in index.html`);
  html = html.replace(re, (_, a, b) => a + body + b);
};
swap('SEO:START', 'SEO:END', content.replace(/\s+$/, ''));
swap('JSONLD:START', 'JSONLD:END', `\n  <script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2).replace(/^/gm, '  ')}\n  </script>`);
writeFileSync(root + 'index.html', html);

writeFileSync(root + 'sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <image:image><image:loc>${SITE}/images/og-image.jpg</image:loc></image:image>
${CH.map((c) => `    <image:image><image:loc>${SITE}/images/characters/${c.id}.jpg</image:loc></image:image>`).join('\n')}
  </url>
</urlset>
`);
writeFileSync(root + 'robots.txt', `User-agent: *\nAllow: /\nDisallow: /tools/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`SEO content built: ${CH.length} characters, ${lineCount} dialogues, sitemap + robots written.`);
