// Exports data/characters.js (the game's dataset) to data/characters.json and data/dialogues.csv
// Usage: node tools/export-dataset.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync(new URL('../data/characters.js', import.meta.url), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(src, sandbox);
const data = sandbox.window.BMK_DATA;

writeFileSync(new URL('../data/characters.json', import.meta.url), JSON.stringify(data, null, 2) + '\n');

const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const rows = [['character_id', 'character', 'actor', 'text', 'text_devanagari', 'source', 'year', 'type', 'triggers'].join(',')];
for (const c of data.characters) {
  for (const d of c.dialogues) {
    rows.push([c.id, c.name, c.actor, d.text, d.hi, d.source, d.year ?? '', d.type, d.on.join('|')].map(esc).join(','));
  }
}
writeFileSync(new URL('../data/dialogues.csv', import.meta.url), rows.join('\n') + '\n');

const n = data.characters.reduce((a, c) => a + c.dialogues.length, 0);
console.log(`Exported ${data.characters.length} characters, ${n} dialogues, ${data.stages.length} stages.`);
