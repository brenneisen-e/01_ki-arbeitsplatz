// Gemeinsame Sektionen der Kundenakte.
//
// GuV/Haushaltsrechnung, Open Finance und die Kommunikationshistorie lebten
// frueher im Kundenakten-Modal; seit der Zusammenlegung auf eine Akte werden
// sie hier gehalten und vom Vollprofil gerendert.

import { useState } from 'react';
import { clsx } from 'clsx';
import {
  AlertTriangle, Phone, Mail, ArrowDownLeft, ArrowUpRight, PhoneOff,
  ShieldCheck, ShieldAlert, ShieldOff, FileText,
} from 'lucide-react';
import { KOMMUNIKATION_REFERENZ } from '../../data/stammdaten';
import { useCollections } from '../../hooks/useCollections';
import { Badge, EmptyState } from '../../components/ui/primitives';
import { euro, zahl } from '../../utils/format';

export const SEGMENT_TON = {
  eskalation: { color: '#c2410c', bg: '#fff7ed', label: 'Eskalation' },
  prioritaet: { color: '#15803d', bg: '#f0fdf4', label: 'Priorität' },
  restrukturierung: { color: '#a16207', bg: '#fefce8', label: 'Restrukturierung' },
  abwicklung: { color: '#b91c1c', bg: '#fef2f2', label: 'Abwicklung' },
  stabil: { color: '#0369a1', bg: '#f0f9ff', label: 'Stabil' },
  abgeschlossen: { color: '#047857', bg: '#ecfdf5', label: 'Abgeschlossen' },
  unbekannt: { color: '#475569', bg: '#f1f5f9', label: 'Unbekannt' },
};

export function Feld({ label, wert, mono, badge, warnung }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 shrink-0 pt-0.5">{label}</span>
      {badge ? (
        <Badge color="#1e293b" bg="#f1f5f9">{wert}</Badge>
      ) : (
        <span className={clsx('text-[13px] text-right whitespace-pre-line',
          mono && 'font-mono text-xs',
          warnung ? 'text-red-600 font-medium' : 'text-slate-800')}>
          {wert}
        </span>
      )}
    </div>
  );
}

export function Block({ titel, children }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">{titel}</h4>
      {children}
    </div>
  );
}

export function KpiZelle({ label, wert, tone }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 leading-tight">{label}</div>
      <div className={clsx('text-base font-semibold mt-0.5 tabular-nums',
        tone === 'danger' ? 'text-red-600' : tone === 'success' ? 'text-emerald-600' : 'text-slate-900')}>
        {wert}
      </div>
    </div>
  );
}

export function HaushaltSection({ customer }) {
  const h = customer.haushalt;
  const gewerbe = customer.type === 'Gewerbe';
  if (!h) return <EmptyState text="Für diesen Fall liegt keine Haushaltsrechnung vor." />;

  const summe = obj => Object.values(obj).reduce((a, b) => a + b, 0);
  const einnahmen = summe(h.einnahmen);
  const fix = summe(h.fixkosten);
  const leben = summe(h.lebenshaltung);
  const frei = einnahmen - fix - leben;

  const zeilen = (titel, obj, labels) => (
    <Block titel={titel}>
      {Object.entries(obj).map(([k, v]) => (
        <Feld key={k} label={labels[k] || k} wert={euro(v)} />
      ))}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-200">
        <span className="text-xs font-semibold text-slate-700">Summe</span>
        <span className="text-[13px] font-semibold text-slate-900 tabular-nums">{euro(summe(obj))}</span>
      </div>
    </Block>
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-800">
          {gewerbe ? 'Gewinn- und Verlustrechnung' : 'Haushaltsrechnung'}
        </h3>
        <Badge color="#0369a1" bg="#f0f9ff">
          {gewerbe ? 'Jahresabschluss und Kontoanalyse' : 'PSD2 Kontoabfrage'}
        </Badge>
      </div>
      <p className="text-xs text-slate-500 -mt-3">
        Datenquellen: {gewerbe
          ? 'Jahresabschluss 2024 (eingereicht), BWA Q3/2025, PSD2-Kontoauszüge (letzte 6 Monate).'
          : 'PSD2-Kontoinformationsdienst, Kontobewegungen der letzten 6 Monate automatisch kategorisiert.'} Stand: 19.12.2025.
      </p>

      <div className="grid grid-cols-4 gap-3">
        <KpiZelle label={gewerbe ? 'Erträge (Monat)' : 'Einnahmen (Monat)'} wert={euro(einnahmen)} tone="success" />
        <KpiZelle label="Fixkosten" wert={euro(fix)} />
        <KpiZelle label={gewerbe ? 'Sonstige Aufwendungen' : 'Lebenshaltung'} wert={euro(leben)} />
        <KpiZelle label="Frei verfügbar" wert={euro(frei)} tone={frei < 0 ? 'danger' : 'success'} />
      </div>

      {frei < 0 && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" strokeWidth={1.9} />
          <p className="text-[13px] text-red-800 leading-relaxed">
            Negativer Saldo: Die monatlichen Ausgaben übersteigen die Einnahmen um {euro(Math.abs(frei))}.
            Ohne Anpassung von Rate oder Kostenstruktur ist eine dauerhafte Bedienung der Forderung nicht darstellbar.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {zeilen(gewerbe ? 'Erträge' : 'Einnahmen', h.einnahmen, {
          gehalt: gewerbe ? 'Umsatzerlöse' : 'Gehalt/Lohn', neben: 'Nebeneinkünfte',
          sozial: 'Sozialleistungen', sonstige: 'Sonstige Erträge',
        })}
        {zeilen('Fixkosten', h.fixkosten, {
          miete: gewerbe ? 'Miete/Pacht' : 'Miete', nebenkosten: 'Nebenkosten',
          versicherung: 'Versicherungen', kredite: 'Kreditraten', abos: 'Abonnements',
        })}
        {zeilen(gewerbe ? 'Sonstige Aufwendungen' : 'Lebenshaltung', h.lebenshaltung, {
          essen: 'Lebensmittel', mobilitaet: gewerbe ? 'Transport/Logistik' : 'Mobilität',
          gesundheit: 'Gesundheit', freizeit: 'Freizeit', sonstige: 'Sonstiges',
        })}
      </div>
    </div>
  );
}

export function OpenFinanceSection({ customer }) {
  const of = customer.openFinance;
  if (!of) return <EmptyState text="Für diesen Fall liegt keine Open-Finance-Freigabe vor." />;

  const eigene = customer.gesamtforderung || 0;
  const extern = (of.externeKonten || []).reduce((s, k) => s + Math.max(0, -k.saldo) + Math.max(0, k.saldo && k.produkt.match(/Leasing|Kredit|Finanzierung/i) ? k.saldo : 0), 0);
  const gesamt = eigene + extern;
  const dti = customer.einkommenMonatlich ? Math.round((gesamt / (customer.einkommenMonatlich * 12)) * 100) : 0;

  const consents = [
    { label: 'Konten (PSD2)', aktiv: of.consent.psd2, sub: of.consent.psd2 ? `Gültig bis ${of.consent.psd2Bis}` : 'Keine Freigabe' },
    { label: 'Versicherungen', aktiv: of.consent.versicherungen, sub: of.consent.versicherungen ? 'Freigabe erteilt' : 'Einwilligung angefragt' },
    { label: 'Investments', aktiv: of.consent.investments, sub: of.consent.investments ? 'Freigabe erteilt' : 'Keine Freigabe' },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Open Finance</h3>
        <Badge color="#0369a1" bg="#f0f9ff">FIDA-Datenabgleich</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {consents.map(c => {
          const Icon = c.aktiv ? ShieldCheck : c.label === 'Versicherungen' ? ShieldAlert : ShieldOff;
          return (
            <div
              key={c.label}
              className="rounded-xl border px-4 py-3 flex items-start gap-3"
              style={c.aktiv
                ? { background: '#ecfdf5', borderColor: '#a7f3d0' }
                : { background: '#f8fafc', borderColor: '#e2e8f0' }}
            >
              <Icon size={17} className={clsx('shrink-0 mt-0.5', c.aktiv ? 'text-emerald-600' : 'text-slate-400')} strokeWidth={1.9} />
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-slate-800">{c.label}</div>
                <div className="text-[11px] text-slate-500">{c.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <Block titel="Externe Konten und Verbindlichkeiten">
        {of.externeKonten?.length ? (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <th className="text-left py-1.5 font-semibold" scope="col">Institut</th>
                <th className="text-left py-1.5 font-semibold" scope="col">Produktart</th>
                <th className="text-right py-1.5 font-semibold" scope="col">Saldo/Restschuld</th>
                <th className="text-right py-1.5 font-semibold" scope="col">Rate/Monat</th>
                <th className="text-right py-1.5 font-semibold" scope="col">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {of.externeKonten.map((k, i) => (
                <tr key={i}>
                  <td className="py-2 text-slate-700">{k.institut}</td>
                  <td className="py-2 text-slate-600">{k.produkt}</td>
                  <td className={clsx('py-2 text-right font-semibold tabular-nums', k.saldo < 0 ? 'text-red-600' : 'text-slate-800')}>{euro(k.saldo)}</td>
                  <td className="py-2 text-right text-slate-600 tabular-nums">{k.rate ? euro(k.rate) : '–'}</td>
                  <td className="py-2 text-right text-slate-600">{k.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <EmptyState text="Keine externen Konten erkannt." />}
      </Block>

      <Block titel="Versicherungen (extern erkannt)">
        {of.externeVersicherungen?.length ? (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <th className="text-left py-1.5 font-semibold" scope="col">Anbieter</th>
                <th className="text-left py-1.5 font-semibold" scope="col">Produkt</th>
                <th className="text-right py-1.5 font-semibold" scope="col">Beitrag</th>
                <th className="text-right py-1.5 font-semibold" scope="col">Vertragsbeginn</th>
                <th className="text-left py-1.5 font-semibold pl-4" scope="col">Hinweis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {of.externeVersicherungen.map((v, i) => (
                <tr key={i}>
                  <td className="py-2 text-slate-700">{v.anbieter}</td>
                  <td className="py-2 text-slate-600">{v.produkt}</td>
                  <td className="py-2 text-right text-slate-800 tabular-nums">{euro(v.beitrag)}</td>
                  <td className="py-2 text-right text-slate-600">{v.beginn}</td>
                  <td className="py-2 pl-4 text-slate-500">{v.hinweis || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <EmptyState text="Keine externen Versicherungen erkannt." />}
      </Block>

      <div className="grid grid-cols-4 gap-3">
        <KpiZelle label="Eigene Bank" wert={euro(eigene)} />
        <KpiZelle label="Externe Institute" wert={euro(extern)} />
        <KpiZelle label="Gesamtverschuldung" wert={euro(gesamt)} tone="danger" />
        <KpiZelle label="Debt-to-Income Ratio" wert={`${zahl(dti)} %`} tone={dti > 100 ? 'danger' : undefined} />
      </div>
    </div>
  );
}

const KOMM_ICON = {
  ausgehend: { Icon: ArrowUpRight, color: '#2563eb', bg: '#eff6ff' },
  eingehend: { Icon: ArrowDownLeft, color: '#059669', bg: '#ecfdf5' },
  verpasst: { Icon: PhoneOff, color: '#dc2626', bg: '#fef2f2' },
};

export function KommunikationSection({ customer }) {
  const { toast } = useCollections();
  const [offen, setOffen] = useState(null);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Aktueller Status:</span>
          <Badge color="#b91c1c" bg="#fef2f2">{customer.workflowStatus}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: 'Notiz', icon: FileText, meldung: 'Notiz zur Akte gespeichert.' },
            { label: 'Rückruf', icon: Phone, meldung: 'Rückruf für morgen 10:00 Uhr eingeplant.' },
            { label: 'E-Mail', icon: Mail, meldung: 'E-Mail-Entwurf im Postausgang abgelegt.' },
          ].map(b => {
            const Icon = b.icon;
            return (
              <button
                key={b.label}
                onClick={() => toast(b.meldung, 'success')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Icon size={13} strokeWidth={1.9} /> {b.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-3">Kommunikationshistorie</h4>
        <div className="space-y-3">
          {KOMMUNIKATION_REFERENZ.map(k => {
            const cfg = KOMM_ICON[k.art];
            const Icon = cfg.Icon;
            const auf = offen === k.id;
            return (
              <div key={k.id} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon size={15} strokeWidth={1.9} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px] font-semibold text-slate-800">{k.titel}</span>
                      <span className="text-[11px] text-slate-500 shrink-0">{k.datum}</span>
                    </div>
                    {k.betreff && (
                      <div className="text-[12px] text-slate-600 mt-0.5">
                        <span className="text-slate-400">Betreff:</span> {k.betreff}
                      </div>
                    )}
                    <p className={clsx('text-[13px] text-slate-700 leading-relaxed mt-1.5 whitespace-pre-line', !auf && 'line-clamp-2')}>
                      {k.text}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => setOffen(auf ? null : k.id)}
                        className="text-[11px] font-semibold hover:underline"
                        style={{ color: 'var(--mode-primary)' }}
                      >
                        {auf ? 'Weniger anzeigen' : 'Vollständiges Schreiben anzeigen'}
                      </button>
                      <Badge color="#475569" bg="#f1f5f9">{k.status}</Badge>
                      <span className="text-[11px] text-slate-400">{k.kanal}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/** Kennzahlenzeilen der Forderung — im Vollprofil Teil der Transaktions-Sektion. */
export function ForderungsKpis({ customer }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-3">
        <KpiZelle label="Kredite" wert={zahl(customer.krediteAnzahl)} />
        <KpiZelle label="Gesamtforderung" wert={euro(customer.gesamtforderung)} />
        <KpiZelle label="Monatl. Rate" wert={euro(customer.monatsrate)} />
        <KpiZelle label="Überfällig" wert={euro(customer.ueberfaellig)} tone={customer.ueberfaellig > 0 ? 'danger' : undefined} />
        <KpiZelle label="Rückgabequote" wert={`${zahl(customer.rueckgabequote)} %`} tone={customer.rueckgabequote > 50 ? 'success' : customer.rueckgabequote > 0 ? 'danger' : undefined} />
      </div>
      <div className="grid grid-cols-4 gap-3">
        <KpiZelle label="Hauptforderung" wert={euro(customer.hauptforderung)} />
        <KpiZelle label="Zinsen" wert={euro(customer.zinsen)} />
        <KpiZelle label="Mahngebühren" wert={euro(customer.mahngebuehren)} />
        <KpiZelle label="Inkassokosten" wert={euro(customer.inkassokosten)} />
      </div>
    </div>
  );
}
