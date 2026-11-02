import { chromium } from '/tmp/claude-0/-home-user-kiarbeitsplatz/f661452e-e109-5f2a-a280-eeeab59cad16/scratchpad/node_modules/playwright/index.mjs';
const dir = '/tmp/claude-0/-home-user-kiarbeitsplatz/f661452e-e109-5f2a-a280-eeeab59cad16/scratchpad/briefing/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage();
await p.goto('file://' + dir + 'briefing.html');
await p.pdf({
  path: dir + 'Briefing_Reminder-und-Hinweis-Analyse_09.09.2026.pdf',
  format: 'A4', printBackground: true, preferCSSPageSize: false,
  margin: { top: '20mm', bottom: '15mm', left: '15mm', right: '15mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div style="width:100%;font-family:Arial,sans-serif;font-size:7pt;color:#8C8286;padding:0 15mm;margin-top:7mm;display:flex;justify-content:space-between;"><span>Briefing Reminder- und Hinweis-Analyse · Stand 09.09.2026</span><span>Erstellt für HSB4K, Makler BÜ meets KI</span></div>',
  footerTemplate: '<div style="width:100%;font-family:Arial,sans-serif;font-size:7pt;color:#8C8286;padding:0 15mm;margin-bottom:6mm;display:flex;justify-content:space-between;"><span>Quelle: Reminder-und-Hinweis-Analyse_17.06.-09.09.2026.xlsx</span><span>Seite <span class="pageNumber"></span> von <span class="totalPages"></span></span></div>',
});
await b.close();
console.log('pdf ok');
