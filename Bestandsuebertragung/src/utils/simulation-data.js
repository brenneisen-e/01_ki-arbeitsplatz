// Anonymisierte Vermittler-Daten basierend auf BGAV-Struktur
// Namen verfremdet, Daten aus echtem Datenbestand abgeleitet

export const SPARTEN = ['S/HU ohne Kfz', 'Tier-KV', 'Kfz', 'LV Biometrie', 'LV Direkt', 'LV Invest', 'KV Sonstige', 'KV Voll', 'KV Zusatz', 'KV Pflegepflicht']

export const PROD_STUFEN = ['keine', 'EPL', 'MPL', '1. LS', '2. LS', '3. LS', '3. dLS']

export const PROD_STUFEN_ORDER = { 'keine': 0, 'EPL': 1, 'MPL': 2, '1. LS': 3, '2. LS': 4, '3. LS': 5, '3. dLS': 6 }

// Provisionssatz-Bereiche je Sparte (Prozent)
export const PROV_RANGES = {
  ap_satz_su:         { label: 'AP S/HU (ohne Kfz)', min: 30, max: 100, step: 5, unit: '%' },
  prov_satz_tier:     { label: 'Prov. Tier-KV',      min: 15, max: 30,  step: 0.5, unit: '%' },
  ap_fp_satz_kfz:     { label: 'AP/FP Kfz',          min: 5,  max: 15,  step: 0.5, unit: '%' },
  ap_satz_leben:      { label: 'AP Leben',            min: 15, max: 40,  step: 1, unit: '‰' },
  fp_satz_shu:        { label: 'FP S/HU (ohne Kfz)',  min: 8,  max: 18,  step: 0.5, unit: '%' },
  fp_satz_leben:      { label: 'FP Leben',            min: 0.5, max: 4,  step: 0.25, unit: '‰' },
  ap_satz_kv:         { label: 'AP KV',               min: 2,  max: 8,   step: 0.5, unit: 'MB' },
  fp_satz_kranken:    { label: 'FP Kranken',          min: 1,  max: 3,   step: 0.25, unit: 'MB' },
}

// 20 anonymisierte Test-Vermittler
export const VERMITTLER = [
  {
    id: 'V001', name: 'Richter, Thomas', klassifizierung: 'Agenturverbund',
    ae: 1105265, gesamt: 9174123,
    produktion: { shu: 2841550, tier: 445200, kfz: 1205300, lv_bio: 3850200, lv_direkt: 8520100, lv_invest: 4210500, kv_sonst: 85200, kv_voll: 152300, kv_zusatz: 42100, kv_pflege: 18500 },
    bestand: { shu: 4520300, tier: 680100, kfz: 2105400, lv_bio: 12500200, lv_direkt: 28400500, lv_invest: 15200300, kv_sonst: 125400, kv_voll: 320500, kv_zusatz: 95200, kv_pflege: 42100 },
    provisionssaetze: { ap_satz_su: 90, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 32, fp_satz_shu: 14, fp_satz_leben: 2, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: '3. dLS', kfz: 'keine', lv: 'keine', kv: '3. dLS' },
    zuschlaege: { garantie: 0, buerokosten: 24000, allg_zuschuss: 12000, shu_bonus: 8500 },
  },
  {
    id: 'V002', name: 'Bergmann, Alexander', klassifizierung: 'Agenturleiter (AGL)',
    ae: 20562, gesamt: 197116,
    produktion: { shu: 42500, tier: 8200, kfz: 18500, lv_bio: 185200, lv_direkt: 425100, lv_invest: 312500, kv_sonst: 2850, kv_voll: 8500, kv_zusatz: 3200, kv_pflege: 950 },
    bestand: { shu: 85200, tier: 15200, kfz: 42500, lv_bio: 520300, lv_direkt: 1250400, lv_invest: 850200, kv_sonst: 4200, kv_voll: 18500, kv_zusatz: 5200, kv_pflege: 2100 },
    provisionssaetze: { ap_satz_su: 80, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 30, fp_satz_shu: 14, fp_satz_leben: 2, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: '1. LS', kfz: 'keine', lv: '2. LS', kv: '3. dLS' },
    zuschlaege: { garantie: 0, buerokosten: 4800, allg_zuschuss: 4800, shu_bonus: 2500 },
  },
  {
    id: 'V003', name: 'Hoffmann, Stefan', klassifizierung: 'nicht klassifiziert',
    ae: 9383, gesamt: 144822,
    produktion: { shu: 25800, tier: 12500, kfz: 15200, lv_bio: 82500, lv_direkt: 195200, lv_invest: 125400, kv_sonst: 1850, kv_voll: 5200, kv_zusatz: 2100, kv_pflege: 420 },
    bestand: { shu: 52400, tier: 22500, kfz: 35200, lv_bio: 285400, lv_direkt: 620500, lv_invest: 425200, kv_sonst: 3500, kv_voll: 12500, kv_zusatz: 4200, kv_pflege: 1850 },
    provisionssaetze: { ap_satz_su: 70, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 25, fp_satz_shu: 12, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: '1. LS', kfz: '1. LS', lv: 'MPL', kv: '3. LS' },
    zuschlaege: { garantie: 0, buerokosten: 4800, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V004', name: 'Weber, Markus', klassifizierung: 'nicht klassifiziert',
    ae: 2353, gesamt: 112679,
    produktion: { shu: 3200, tier: 1250, kfz: 2800, lv_bio: 8500, lv_direkt: 185200, lv_invest: 52400, kv_sonst: 520, kv_voll: 1850, kv_zusatz: 850, kv_pflege: 180 },
    bestand: { shu: 8500, tier: 2800, kfz: 5200, lv_bio: 42500, lv_direkt: 520400, lv_invest: 185200, kv_sonst: 1200, kv_voll: 4200, kv_zusatz: 1850, kv_pflege: 520 },
    provisionssaetze: { ap_satz_su: 40, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'keine', kfz: 'keine', lv: 'EPL', kv: '1. LS' },
    zuschlaege: { garantie: 24000, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V005', name: 'Fischer, Aydin', klassifizierung: 'nicht klassifiziert',
    ae: 9516, gesamt: 94172,
    produktion: { shu: 18500, tier: 8200, kfz: 12500, lv_bio: 52400, lv_direkt: 85200, lv_invest: 42500, kv_sonst: 2100, kv_voll: 4800, kv_zusatz: 1850, kv_pflege: 520 },
    bestand: { shu: 42500, tier: 15200, kfz: 28500, lv_bio: 185200, lv_direkt: 285400, lv_invest: 125200, kv_sonst: 3800, kv_voll: 12500, kv_zusatz: 3500, kv_pflege: 1200 },
    provisionssaetze: { ap_satz_su: 80, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 12, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: '2. LS', kfz: 'EPL', lv: 'keine', kv: '3. LS' },
    zuschlaege: { garantie: 0, buerokosten: 4800, allg_zuschuss: 0, shu_bonus: 1200 },
  },
  {
    id: 'V006', name: 'Lang, Manuel', klassifizierung: 'nicht klassifiziert',
    ae: 7292, gesamt: 80046,
    produktion: { shu: 12500, tier: 5200, kfz: 18500, lv_bio: 42500, lv_direkt: 52400, lv_invest: 85200, kv_sonst: 1250, kv_voll: 3500, kv_zusatz: 1200, kv_pflege: 350 },
    bestand: { shu: 28500, tier: 9500, kfz: 42500, lv_bio: 125200, lv_direkt: 185400, lv_invest: 285200, kv_sonst: 2500, kv_voll: 8500, kv_zusatz: 2800, kv_pflege: 850 },
    provisionssaetze: { ap_satz_su: 60, prov_satz_tier: 22, ap_fp_satz_kfz: 10, ap_satz_leben: 23, fp_satz_shu: 11, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'EPL', kfz: 'MPL', lv: '1. LS', kv: '1. LS' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 4800, shu_bonus: 0 },
  },
  {
    id: 'V007', name: 'Braun, Carolin', klassifizierung: 'nicht klassifiziert',
    ae: 7938, gesamt: 67257,
    produktion: { shu: 22500, tier: 3500, kfz: 8500, lv_bio: 35200, lv_direkt: 42500, lv_invest: 28500, kv_sonst: 1520, kv_voll: 2800, kv_zusatz: 950, kv_pflege: 280 },
    bestand: { shu: 45200, tier: 6200, kfz: 18500, lv_bio: 105200, lv_direkt: 152400, lv_invest: 85200, kv_sonst: 2800, kv_voll: 6500, kv_zusatz: 2200, kv_pflege: 620 },
    provisionssaetze: { ap_satz_su: 80, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 12, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: '2. LS', kfz: 'keine', lv: 'keine', kv: '1. LS' },
    zuschlaege: { garantie: 0, buerokosten: 4800, allg_zuschuss: 0, shu_bonus: 800 },
  },
  {
    id: 'V008', name: 'Klein, Patrick', klassifizierung: 'nicht klassifiziert',
    ae: 6914, gesamt: 59397,
    produktion: { shu: 8500, tier: 2200, kfz: 5200, lv_bio: 18500, lv_direkt: 85200, lv_invest: 42500, kv_sonst: 850, kv_voll: 2500, kv_zusatz: 750, kv_pflege: 210 },
    bestand: { shu: 18500, tier: 4200, kfz: 12500, lv_bio: 52400, lv_direkt: 285400, lv_invest: 125200, kv_sonst: 1500, kv_voll: 5200, kv_zusatz: 1850, kv_pflege: 520 },
    provisionssaetze: { ap_satz_su: 40, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 25, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'keine', kfz: 'keine', lv: '2. LS', kv: '1. LS' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V009', name: 'Neumann, Christian', klassifizierung: 'nicht klassifiziert',
    ae: 10001, gesamt: 50670,
    produktion: { shu: 5200, tier: 1850, kfz: 3500, lv_bio: 12500, lv_direkt: 25800, lv_invest: 185200, kv_sonst: 420, kv_voll: 1200, kv_zusatz: 520, kv_pflege: 150 },
    bestand: { shu: 12500, tier: 3200, kfz: 8500, lv_bio: 42500, lv_direkt: 85200, lv_invest: 520400, kv_sonst: 850, kv_voll: 2800, kv_zusatz: 1200, kv_pflege: 350 },
    provisionssaetze: { ap_satz_su: 60, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'keine', kfz: 'keine', lv: '3. LS', kv: 'keine' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 4800, shu_bonus: 0 },
  },
  {
    id: 'V010', name: 'Schuster, Jürgen', klassifizierung: 'nicht klassifiziert',
    ae: 4790, gesamt: 41617,
    produktion: { shu: 8500, tier: 3200, kfz: 5200, lv_bio: 22500, lv_direkt: 42500, lv_invest: 18500, kv_sonst: 850, kv_voll: 1850, kv_zusatz: 620, kv_pflege: 180 },
    bestand: { shu: 22500, tier: 5800, kfz: 12500, lv_bio: 62400, lv_direkt: 125200, lv_invest: 52400, kv_sonst: 1500, kv_voll: 4200, kv_zusatz: 1500, kv_pflege: 420 },
    provisionssaetze: { ap_satz_su: 60, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'EPL', kfz: 'keine', lv: 'keine', kv: '3. LS' },
    zuschlaege: { garantie: 0, buerokosten: 4800, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V011', name: 'Meyer, Katharina', klassifizierung: 'nicht klassifiziert',
    ae: 3174, gesamt: 34722,
    produktion: { shu: 5200, tier: 1850, kfz: 2800, lv_bio: 15200, lv_direkt: 28500, lv_invest: 12500, kv_sonst: 620, kv_voll: 1500, kv_zusatz: 520, kv_pflege: 150 },
    bestand: { shu: 12500, tier: 3500, kfz: 8500, lv_bio: 42500, lv_direkt: 85200, lv_invest: 35200, kv_sonst: 1200, kv_voll: 3200, kv_zusatz: 1200, kv_pflege: 350 },
    provisionssaetze: { ap_satz_su: 60, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'EPL', kfz: 'keine', lv: 'keine', kv: '1. LS' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V012', name: 'Wagner, Stephanie', klassifizierung: 'nicht klassifiziert',
    ae: 5053, gesamt: 29004,
    produktion: { shu: 12500, tier: 2800, kfz: 5200, lv_bio: 18500, lv_direkt: 25800, lv_invest: 8500, kv_sonst: 520, kv_voll: 1200, kv_zusatz: 420, kv_pflege: 120 },
    bestand: { shu: 25800, tier: 5200, kfz: 12500, lv_bio: 52400, lv_direkt: 85200, lv_invest: 25800, kv_sonst: 1050, kv_voll: 2800, kv_zusatz: 950, kv_pflege: 280 },
    provisionssaetze: { ap_satz_su: 70, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 12, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: '1. LS', kfz: 'keine', lv: 'EPL', kv: '1. LS' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V013', name: 'Schmitt, Kai', klassifizierung: 'nicht klassifiziert',
    ae: 3138, gesamt: 25635,
    produktion: { shu: 3500, tier: 1500, kfz: 2200, lv_bio: 12500, lv_direkt: 22500, lv_invest: 8500, kv_sonst: 420, kv_voll: 1050, kv_zusatz: 380, kv_pflege: 110 },
    bestand: { shu: 8500, tier: 2800, kfz: 5200, lv_bio: 35200, lv_direkt: 62400, lv_invest: 25800, kv_sonst: 850, kv_voll: 2200, kv_zusatz: 850, kv_pflege: 250 },
    provisionssaetze: { ap_satz_su: 40, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'keine', kfz: 'keine', lv: 'EPL', kv: '1. LS' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V014', name: 'Becker, Jonas', klassifizierung: 'nicht klassifiziert',
    ae: 1707, gesamt: 23477,
    produktion: { shu: 2200, tier: 850, kfz: 1500, lv_bio: 8500, lv_direkt: 35200, lv_invest: 12500, kv_sonst: 280, kv_voll: 850, kv_zusatz: 280, kv_pflege: 85 },
    bestand: { shu: 5200, tier: 1500, kfz: 3500, lv_bio: 22500, lv_direkt: 105200, lv_invest: 35200, kv_sonst: 520, kv_voll: 1850, kv_zusatz: 620, kv_pflege: 180 },
    provisionssaetze: { ap_satz_su: 40, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'keine', kfz: 'keine', lv: 'EPL', kv: 'keine' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V015', name: 'Krüger, Frank', klassifizierung: 'Agenturleiter (AGL)',
    ae: 2364, gesamt: 19930,
    produktion: { shu: 5200, tier: 2200, kfz: 3500, lv_bio: 8500, lv_direkt: 12500, lv_invest: 5200, kv_sonst: 420, kv_voll: 1200, kv_zusatz: 420, kv_pflege: 120 },
    bestand: { shu: 12500, tier: 4200, kfz: 8500, lv_bio: 25800, lv_direkt: 42500, lv_invest: 15200, kv_sonst: 850, kv_voll: 2500, kv_zusatz: 950, kv_pflege: 280 },
    provisionssaetze: { ap_satz_su: 60, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 11, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'EPL', kfz: 'keine', lv: 'keine', kv: 'MPL' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V016', name: 'Wolf, Weibing', klassifizierung: 'nicht klassifiziert',
    ae: 2909, gesamt: 18140,
    produktion: { shu: 3500, tier: 1200, kfz: 2500, lv_bio: 8500, lv_direkt: 15200, lv_invest: 8500, kv_sonst: 350, kv_voll: 950, kv_zusatz: 350, kv_pflege: 95 },
    bestand: { shu: 8500, tier: 2200, kfz: 5800, lv_bio: 22500, lv_direkt: 42500, lv_invest: 25800, kv_sonst: 680, kv_voll: 2200, kv_zusatz: 850, kv_pflege: 220 },
    provisionssaetze: { ap_satz_su: 40, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'keine', kfz: 'keine', lv: 'EPL', kv: '1. LS' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V017', name: 'Sommer, Christiane', klassifizierung: 'nicht klassifiziert',
    ae: 1952, gesamt: 12831,
    produktion: { shu: 3200, tier: 1500, kfz: 2200, lv_bio: 5200, lv_direkt: 12500, lv_invest: 5200, kv_sonst: 280, kv_voll: 850, kv_zusatz: 280, kv_pflege: 85 },
    bestand: { shu: 8500, tier: 2800, kfz: 5200, lv_bio: 15200, lv_direkt: 35200, lv_invest: 15200, kv_sonst: 520, kv_voll: 1850, kv_zusatz: 620, kv_pflege: 180 },
    provisionssaetze: { ap_satz_su: 60, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'EPL', kfz: 'keine', lv: 'keine', kv: '1. LS' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V018', name: 'Frank, Matthias', klassifizierung: 'nicht klassifiziert',
    ae: 2644, gesamt: 7919,
    produktion: { shu: 2200, tier: 850, kfz: 1500, lv_bio: 3500, lv_direkt: 5200, lv_invest: 2200, kv_sonst: 180, kv_voll: 520, kv_zusatz: 180, kv_pflege: 55 },
    bestand: { shu: 5200, tier: 1500, kfz: 3500, lv_bio: 8500, lv_direkt: 15200, lv_invest: 5200, kv_sonst: 350, kv_voll: 1200, kv_zusatz: 420, kv_pflege: 120 },
    provisionssaetze: { ap_satz_su: 60, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 15, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'EPL', kfz: 'keine', lv: 'EPL', kv: 'keine' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V019', name: 'Schulz, Ludwig', klassifizierung: 'nicht klassifiziert',
    ae: 465, gesamt: 2821,
    produktion: { shu: 850, tier: 280, kfz: 520, lv_bio: 1200, lv_direkt: 2200, lv_invest: 850, kv_sonst: 55, kv_voll: 180, kv_zusatz: 55, kv_pflege: 18 },
    bestand: { shu: 1850, tier: 520, kfz: 1200, lv_bio: 3500, lv_direkt: 5200, lv_invest: 2200, kv_sonst: 120, kv_voll: 420, kv_zusatz: 150, kv_pflege: 45 },
    provisionssaetze: { ap_satz_su: 40, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'keine', kfz: 'keine', lv: 'keine', kv: 'keine' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
  {
    id: 'V020', name: 'Hartmann, Granit', klassifizierung: 'nicht klassifiziert',
    ae: 1, gesamt: 3,
    produktion: { shu: 5, tier: 0, kfz: 2, lv_bio: 0, lv_direkt: 0, lv_invest: 0, kv_sonst: 0, kv_voll: 0, kv_zusatz: 0, kv_pflege: 0 },
    bestand: { shu: 12, tier: 0, kfz: 5, lv_bio: 0, lv_direkt: 0, lv_invest: 0, kv_sonst: 0, kv_voll: 0, kv_zusatz: 0, kv_pflege: 0 },
    provisionssaetze: { ap_satz_su: 40, prov_satz_tier: 22, ap_fp_satz_kfz: 8, ap_satz_leben: 20, fp_satz_shu: 10, fp_satz_leben: 1, ap_satz_kv: 5, fp_satz_kranken: 1.5 },
    produktionsstufen: { su: 'keine', kfz: 'keine', lv: 'keine', kv: 'keine' },
    zuschlaege: { garantie: 0, buerokosten: 0, allg_zuschuss: 0, shu_bonus: 0 },
  },
]

/**
 * Berechnet die Gesamteinnahmen eines Vermittlers basierend auf Provisionssätzen
 * AP = Abschlussprovision (auf Produktion)
 * FP = Folgeprovision / Bestandsprovision (auf Bestand)
 */
export function berechneEinnahmen(vermittler, provSaetze) {
  const p = vermittler.produktion
  const b = vermittler.bestand
  const z = vermittler.zuschlaege

  // AP auf Produktion (Promille → /1000 für LV, Prozent → /100 für S/HU)
  const ap_shu = p.shu * (provSaetze.ap_satz_su / 100)
  const ap_tier = (p.tier + p.kv_sonst) * (provSaetze.prov_satz_tier / 100)
  const ap_kfz = p.kfz * (provSaetze.ap_fp_satz_kfz / 100)
  const ap_lv = (p.lv_bio + p.lv_direkt + p.lv_invest) * (provSaetze.ap_satz_leben / 1000)
  const ap_kv = (p.kv_voll + p.kv_zusatz + p.kv_pflege) * provSaetze.ap_satz_kv

  // FP auf Bestand
  const fp_shu = b.shu * (provSaetze.fp_satz_shu / 100)
  const fp_tier = b.tier * (provSaetze.prov_satz_tier / 100)
  const fp_kfz = b.kfz * (provSaetze.ap_fp_satz_kfz / 100)
  const fp_lv = (b.lv_bio + b.lv_direkt + b.lv_invest) * (provSaetze.fp_satz_leben / 1000)
  const fp_kv = (b.kv_voll + b.kv_zusatz + b.kv_pflege) * provSaetze.fp_satz_kranken

  const provisionen = ap_shu + ap_tier + ap_kfz + ap_lv + ap_kv + fp_shu + fp_tier + fp_kfz + fp_lv + fp_kv
  const zuschlaege = (z.garantie || 0) + (z.buerokosten || 0) + (z.allg_zuschuss || 0) + (z.shu_bonus || 0)

  return {
    ap: { shu: ap_shu, tier: ap_tier, kfz: ap_kfz, lv: ap_lv, kv: ap_kv, gesamt: ap_shu + ap_tier + ap_kfz + ap_lv + ap_kv },
    fp: { shu: fp_shu, tier: fp_tier, kfz: fp_kfz, lv: fp_lv, kv: fp_kv, gesamt: fp_shu + fp_tier + fp_kfz + fp_lv + fp_kv },
    zuschlaege,
    gesamt: provisionen + zuschlaege,
  }
}

/**
 * Optimierung: Findet Provisionssätze, bei denen die Gesamtauszahlung
 * möglichst nah am Ist-Wert bleibt, aber individuell umverteilt wird.
 * Ziel: Gesamtsumme aller Vermittler bleibt gleich (±1%)
 */
export function optimiereProvSaetze(vermittlerListe, zielGesamt) {
  // Aktuelle Gesamteinnahmen als Referenz
  const istGesamt = vermittlerListe.reduce((sum, v) => sum + v.gesamt, 0)
  const ziel = zielGesamt ?? istGesamt

  // Start mit Durchschnittswerten
  let best = {
    ap_satz_su: 65,
    prov_satz_tier: 22,
    ap_fp_satz_kfz: 8,
    ap_satz_leben: 22,
    fp_satz_shu: 11,
    fp_satz_leben: 1.5,
    ap_satz_kv: 5,
    fp_satz_kranken: 1.5,
  }

  let bestDiff = Infinity

  // Iterative Optimierung
  for (let iter = 0; iter < 200; iter++) {
    const candidate = { ...best }
    // Zufällige Anpassung eines Parameters
    const keys = Object.keys(PROV_RANGES)
    const key = keys[Math.floor(Math.random() * keys.length)]
    const range = PROV_RANGES[key]
    const delta = (Math.random() - 0.5) * range.step * 4
    candidate[key] = Math.max(range.min, Math.min(range.max, candidate[key] + delta))
    // Auf Schrittweite runden
    candidate[key] = Math.round(candidate[key] / range.step) * range.step

    const totalNew = vermittlerListe.reduce((sum, v) => {
      return sum + berechneEinnahmen(v, candidate).gesamt
    }, 0)

    const diff = Math.abs(totalNew - ziel)
    if (diff < bestDiff) {
      best = candidate
      bestDiff = diff
    }
  }

  return best
}
