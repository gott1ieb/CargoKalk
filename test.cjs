// Testy výpočtovej logiky CargoKalk: spustenie cez `npm test`
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const html = fs.readFileSync(__dirname + "/public/index.html", "utf8");
const code = html.match(/<script id="logic">([\s\S]*?)<\/script>/)[1];
const ctx = {}; ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(code, ctx);
const { DEFAULT_CARRIERS: C, estimateKm, checkCarrier, costBreakdown, transitHours, rankCarriers } = ctx.CK;

let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log("✓ " + name); };
const ship = (o) => ({ km: 400, kg: 2000, pallets: 5, cargo: "bezny", express: false, emptyReturn: false, ...o });

t("odhad vzdialenosti Bratislava–Praha je v rozumnom rozsahu", () => {
  const km = estimateKm("Bratislava", "Praha");
  assert.ok(km > 300 && km < 400, km);
});
t("rovnaké mesto dáva 0 km", () => assert.strictEqual(estimateKm("Košice", "Košice"), 0));
t("preťaženie vyradí dodávku aj sólo", () => {
  const s = ship({ kg: 7000 });
  assert.ok(checkCarrier(C[0], s).length > 0);
  assert.ok(checkCarrier(C[1], s).length > 0);
  assert.strictEqual(checkCarrier(C[2], s).length, 0);
});
t("príliš veľa paliet vyradí dopravcu", () => assert.ok(checkCarrier(C[0], ship({ kg: 500, pallets: 6 })).length > 0));
t("chladený tovar zvládne len chladiarenské vozidlo", () => {
  const ok = C.filter((c) => checkCarrier(c, ship({ cargo: "chladeny" })).length === 0);
  assert.strictEqual(ok.map((c) => c.name).join(), "Mráz Frigo");
});
t("ADR zvládne len dopravca s oprávnením", () => {
  const ok = C.filter((c) => checkCarrier(c, ship({ cargo: "adr" })).length === 0);
  assert.strictEqual(ok.map((c) => c.name).join(), "Karpaty Logistik");
});
t("rozpis ceny sedí na ručný výpočet", () => {
  const c = { base: 50, rate: 1, fuel: 10, toll: 0.2, speed: 60 };
  const r = costBreakdown(c, ship({ km: 100 }));
  // 50 + 100 + 10 + 20 = 180
  assert.strictEqual(r.net, 180);
  assert.strictEqual(r.vat, 41.4);
  assert.strictEqual(r.gross, 221.4);
});
t("príplatky sa počítajú zo základu", () => {
  const c = { base: 50, rate: 1, fuel: 10, toll: 0.2, speed: 60 };
  // základ 180 + prázdny návrat 50 = 230; expres 25 % = 57,5; ADR 20 % = 46 → 333,5
  const r = costBreakdown(c, ship({ km: 100, emptyReturn: true, express: true, cargo: "adr" }));
  assert.strictEqual(r.net, 333.5);
});
t("čas prepravy rešpektuje prestávky a odpočinok", () => {
  // 900 km / 60 = 15 h: 9 h + 0,75 + 11 h odpočinok + 6 h + 0,75 + 1,5 h nakládka = 29 h
  assert.strictEqual(transitHours(900, 60, false), 29);
  // expres: 15 h jazdy bez prestávok + 1,5 h = 16,5 h
  assert.strictEqual(transitHours(900, 60, true), 16.5);
  // krátka trasa bez prestávky: 120 km / 60 = 2 h + 1,5 h
  assert.strictEqual(transitHours(120, 60, false), 3.5);
});
t("pri dôraze na cenu je odporúčaný najlacnejší", () => {
  const rows = rankCarriers(C, ship({ kg: 5000, pallets: 10 }), 100);
  const ok = rows.filter((r) => r.ok);
  const cheapest = ok.reduce((m, r) => (r.cost.net < m.cost.net ? r : m));
  assert.strictEqual(ok[0].carrier.id, cheapest.carrier.id);
  assert.ok(ok[0].badges.includes("rec"));
});
t("nevyhovujúci dopravcovia sú na konci zoznamu", () => {
  const rows = rankCarriers(C, ship({ kg: 7000, pallets: 10 }), 50);
  const firstOff = rows.findIndex((r) => !r.ok);
  assert.ok(rows.slice(firstOff).every((r) => !r.ok));
});

console.log(`\nVšetkých ${passed} testov prešlo.`);
