#!/usr/bin/env node
/**
 * ACCIDENT NETWORKS — Config Compiler
 * Reads master-data.js → writes one tiny config JS per city
 * Each config is ~2KB, loads inline, zero fetch cost
 *
 * Usage:
 *   node compile.js          → builds all 50
 *   node compile.js houston  → builds one city
 */

const fs   = require('fs');
const path = require('path');
const DATA = require('./master-data.js');

const outDir = './configs';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const targets = process.argv[2]
  ? DATA.filter(c => c.id === process.argv[2])
  : DATA;

targets.forEach(c => {
  const js = `/* Accident Networks — ${c.city}, ${c.stateCode} — AUTO-GENERATED */
window.AN_CITY = ${JSON.stringify(c, null, 0)};
`;
  fs.writeFileSync(path.join(outDir, `${c.id}.js`), js);
  process.stdout.write(`✓ ${c.city}, ${c.stateCode}  (${Buffer.byteLength(js)} bytes)\n`);
});

// Build hostname→cityId map for the loader
const map = {};
DATA.forEach(c => { map[`${c.id}.accidentnetworks.com`] = c.id; });
// Also support localhost testing: ?city=houston
const mapJs = `/* City hostname map — AUTO-GENERATED */\nwindow.AN_CITY_MAP = ${JSON.stringify(map, null, 0)};\n`;
fs.writeFileSync('./configs/_map.js', mapJs);

console.log(`\n✅  Built ${targets.length} city configs → ./configs/`);
