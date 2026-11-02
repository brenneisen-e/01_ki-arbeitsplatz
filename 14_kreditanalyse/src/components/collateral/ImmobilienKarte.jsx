/**
 * ImmobilienKarte -- eine Immobiliensicherheit mit Objektunterlagen und den
 * Feldern, die aus ihnen befüllt werden:
 *
 *   Objektunterlagen            Upload, Demo-Unterlagen, KI-Auslesen
 *   Grundpfandrecht & Bewertung Art, Objekt, Marktwert, Stichtag, Verfahren, Vorlasten, Rang
 *   Objektdaten                 aus dem Energieausweis
 *   Mieterliste                 Einheiten, Flächen, Leerstandsquote, WALT
 *   Objekt-Cashflow             Mieterträge, Bewirtschaftungskosten, jährlicher Cashflow
 *
 * Von der KI befüllte Felder tragen "KI-Quelle"; ein Klick öffnet die
 * Unterlage mit markierter Fundstelle. Eine Änderung von Hand löst das Feld
 * von der Quelle, erneutes Auslesen überschreibt es dann nicht mehr.
 */

import { Fragment, useState } from 'react';
import { Building2, ChevronDown, ChevronUp, CircleCheck, CircleDashed, Trash2 } from 'lucide-react';
import { OBJEKT_FELDER } from '../../data/objektunterlagen';
import { NUTZUNGSARTEN, ENERGIE_KLASSEN } from '../../utils/immobilienProfil';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  AuswahlFeld, DatumFeld, EuroFeld, Feld, TextFeld, ZahlFeld,
} from './Eingaben';
import ObjektUnterlagen from './ObjektUnterlagen';
import QuellenVorschau from './QuellenVorschau';
import {
  BEWERTUNGSVERFAHREN_IMMOBILIEN, IMMOBILIEN_ARTEN, RANG_OPTIONS, displayArt,
} from './sicherheitenArten';

const kurzArt = (art) => (displayArt(art).match(/\(([^)]+)\)/) || [])[1] || displayArt(art);
const ART_OPTIONEN = IMMOBILIEN_ARTEN.map((a) => ({ value: a, label: `Grundschuld – ${kurzArt(a)}` }));
const VERFAHREN_OPTIONEN = BEWERTUNGSVERFAHREN_IMMOBILIEN.map((v) => ({
  value: v,
  label: v.replace(/^Gutachten \((\w+)wertverfahren\)$/, 'Gutachten – $1wert'),
}));

function Abschnitt({ titel, untertitel, unterlage, children }) {
  return (
    <section className="pt-5 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
        <div>
          <h4 className="text-sm font-semibold font-headline text-text-primary">{titel}</h4>
          {untertitel && <p className="text-[11px] text-text-muted">{untertitel}</p>}
        </div>
        {unterlage !== undefined && (
          unterlage?.status === 'ausgelesen' ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700">
              <CircleCheck size={12} /> aus {unterlage.name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted">
              <CircleDashed size={12} /> {unterlage ? 'Unterlage liegt vor, noch nicht ausgelesen' : 'Unterlage fehlt noch'}
            </span>
          )
        )}
      </div>
      {children}
    </section>
  );
}

function Kennzahl({ label, wert, hinweis }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-1 min-h-[20px]">
        <span className="text-xs font-medium font-body text-text-secondary truncate">{label}</span>
      </div>
      <div className="rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-sm font-mono text-text-primary" title={hinweis}>
        {wert}
      </div>
      <p className="mt-1 text-[11px] text-text-muted">abgeleitet</p>
    </div>
  );
}

export default function ImmobilienKarte({ item, nummer, company, andereAdressen, aktualisiere, onEntfernen }) {
  const [offen, setOffen] = useState(true);
  const [vorschau, setVorschau] = useState(null);

  const o = item.objekt || {};
  const quellen = item.quellen || {};
  const slot = (typ) => (item.unterlagen || []).find((u) => u.typ === typ);

  // Änderung von Hand: Feld verliert seine KI-Quelle und bleibt beim nächsten Auslesen stehen
  const vonHand = (it, key) => {
    if (!OBJEKT_FELDER[key]) return it;
    const rest = { ...(it.quellen || {}) };
    delete rest[key];
    return { ...it, quellen: rest, manuell: [...new Set([...(it.manuell || []), key])] };
  };
  const setze = (key, wert) => aktualisiere((it) => vonHand({ ...it, [key]: wert }, key));
  const setzeObjekt = (key, wert) => aktualisiere((it) => vonHand({ ...it, objekt: { ...it.objekt, [key]: wert } }, key));

  const quelleOeffnen = (key) => {
    const q = quellen[key];
    if (q) setVorschau({ unterlageId: q.unterlageId, feld: key });
  };

  // Feld mit Label und KI-Quelle; als Funktion aufgerufen, damit Eingaben beim Tippen nicht neu montiert werden
  const feld = (key, inhalt, { label, className = '' } = {}) => (
    <Feld
      key={key}
      label={label || OBJEKT_FELDER[key]?.label || key}
      htmlFor={`${item.id}-${key}`}
      quelle={quellen[key]}
      onQuelle={() => quelleOeffnen(key)}
      className={className}
    >
      {inhalt}
    </Feld>
  );
  const ki = (key) => Boolean(quellen[key]);
  const id = (key) => `${item.id}-${key}`;

  const heute = new Date().toISOString().slice(0, 10);
  const ausweisAbgelaufen = o.ausweisGueltigBis && o.ausweisGueltigBis < heute;
  const nar = Number(o.cashflow) > 0 && Number(item.wert) > 0 ? (Number(o.cashflow) / Number(item.wert)) * 100 : null;
  const faktor = Number(o.mietertraege) > 0 && Number(item.wert) > 0 ? Number(item.wert) / Number(o.mietertraege) : null;

  const zusammenfassung = [
    item.wert > 0 && `Marktwert ${formatCurrency(item.wert)}`,
    o.cashflow !== '' && o.cashflow != null && `Cashflow ${formatCurrency(Number(o.cashflow))} p.a.`,
    o.leerstandsquote !== '' && o.leerstandsquote != null && `Leerstand ${formatNumber(Number(o.leerstandsquote), 1)} %`,
    o.energieklasse && `Effizienzklasse ${o.energieklasse}`,
  ].filter(Boolean);
  const vorhanden = (item.unterlagen || []).filter((u) => u.typ).length;
  const vorschauUnterlage = vorschau && (item.unterlagen || []).find((u) => u.id === vorschau.unterlageId);

  return (
    <div className="@container rounded-xl border border-border bg-surface-card shadow-sm">
      {/* Kopf */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOffen((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOffen((v) => !v); } }}
        className="flex items-start gap-4 px-5 py-4 cursor-pointer select-none"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Building2 size={20} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono uppercase tracking-wide text-text-muted">
            Immobilie {nummer} · {kurzArt(item.art)}
          </p>
          <p className="text-sm font-semibold text-text-primary truncate mt-0.5">
            {item.bezeichnung || 'Neues Objekt – Bezeichnung folgt aus den Unterlagen'}
          </p>
          {zusammenfassung.length > 0 && (
            <p className="text-xs text-text-secondary mt-1">
              {zusammenfassung.map((teil, i) => (
                <Fragment key={teil}>
                  {i > 0 && ' · '}
                  <span className="whitespace-nowrap">{teil}</span>
                </Fragment>
              ))}
            </p>
          )}
        </div>
        <span className="hidden @xl:inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary shrink-0">
          Unterlagen {vorhanden}/5
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEntfernen(); }}
          className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-red-50 transition-colors shrink-0"
          title="Immobiliensicherheit entfernen"
        >
          <Trash2 size={16} strokeWidth={1.5} />
        </button>
        <span className="p-1.5 text-text-muted shrink-0" aria-hidden="true">
          {offen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {offen && (
        <div className="px-5 pb-5 space-y-5 border-t border-border pt-5">
          <ObjektUnterlagen
            item={item}
            company={company}
            andereAdressen={andereAdressen}
            aktualisiere={aktualisiere}
            onVorschau={(unterlageId) => setVorschau({ unterlageId, feld: null })}
          />

          <div className="divide-y divide-border [&>section]:pb-5 [&>section:last-child]:pb-0">
            <Abschnitt titel="Grundpfandrecht & Bewertung" untertitel="Marktwert und Stichtag aus dem Verkehrswertgutachten, Vorlasten und Rang aus dem Grundbuch">
              <div className="grid grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3 gap-4 mb-4">
                <div className="min-w-0">
                  <div className="mb-1 min-h-[20px]">
                    <label htmlFor={id('art')} className="text-xs font-medium font-body text-text-secondary">Sicherheitenart</label>
                  </div>
                  <AuswahlFeld
                    id={id('art')}
                    value={item.art}
                    onChange={(v) => aktualisiere((it) => ({ ...it, art: v }))}
                    optionen={ART_OPTIONEN}
                  />
                </div>
                {feld('bezeichnung', (
                  <TextFeld id={id('bezeichnung')} value={item.bezeichnung} onChange={(v) => setze('bezeichnung', v)} placeholder="z. B. Bürogebäude Hauptstraße 12, Frankfurt" ki={ki('bezeichnung')} />
                ), { className: '@5xl:col-span-2' })}
              </div>
              <div className="grid grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3 gap-4">
                {feld('wert', (
                  <EuroFeld id={id('wert')} value={item.wert || ''} onChange={(v) => setze('wert', v === '' ? 0 : v)} ki={ki('wert')} />
                ))}
                {feld('datum', (
                  <DatumFeld id={id('datum')} value={item.datum} onChange={(v) => setze('datum', v)} ki={ki('datum')} />
                ))}
                {feld('bewertung', (
                  <AuswahlFeld id={id('bewertung')} value={item.bewertung} onChange={(v) => setze('bewertung', v)} optionen={VERFAHREN_OPTIONEN} ki={ki('bewertung')} />
                ))}
                {feld('vorlasten', (
                  <EuroFeld id={id('vorlasten')} value={item.vorlasten ?? ''} onChange={(v) => setze('vorlasten', v === '' ? 0 : v)} ki={ki('vorlasten')} />
                ))}
                {feld('rang', (
                  <AuswahlFeld
                    id={id('rang')}
                    value={item.rang}
                    onChange={(v) => setze('rang', parseInt(v, 10) || 1)}
                    optionen={RANG_OPTIONS}
                    ki={ki('rang')}
                  />
                ))}
              </div>
            </Abschnitt>

            <Abschnitt titel="Objektdaten" untertitel="aus dem Energieausweis" unterlage={slot('energieausweis') ?? null}>
              <div className="grid grid-cols-2 @2xl:grid-cols-3 gap-4">
                {feld('nutzung', (
                  <AuswahlFeld id={id('nutzung')} value={o.nutzung} onChange={(v) => setzeObjekt('nutzung', v)} optionen={NUTZUNGSARTEN} leerText="–" ki={ki('nutzung')} />
                ))}
                {feld('baujahr', (
                  <ZahlFeld id={id('baujahr')} value={o.baujahr} onChange={(v) => setzeObjekt('baujahr', v)} ohneTausender ki={ki('baujahr')} />
                ))}
                {feld('flaeche', (
                  <ZahlFeld id={id('flaeche')} value={o.flaeche} onChange={(v) => setzeObjekt('flaeche', v)} einheit="m²" ki={ki('flaeche')} />
                ))}
                {feld('energieklasse', (
                  <AuswahlFeld id={id('energieklasse')} value={o.energieklasse} onChange={(v) => setzeObjekt('energieklasse', v)} optionen={ENERGIE_KLASSEN} leerText="–" ki={ki('energieklasse')} />
                ))}
                {feld('energiekennwert', (
                  <ZahlFeld id={id('energiekennwert')} value={o.energiekennwert} onChange={(v) => setzeObjekt('energiekennwert', v)} stellen={1} einheit="kWh/(m²·a)" ki={ki('energiekennwert')} />
                ))}
                {feld('ausweisGueltigBis', (
                  <DatumFeld
                    id={id('ausweisGueltigBis')}
                    value={o.ausweisGueltigBis}
                    onChange={(v) => setzeObjekt('ausweisGueltigBis', v)}
                    ki={ki('ausweisGueltigBis')}
                    hinweis={ausweisAbgelaufen ? 'abgelaufen' : null}
                    hinweisTon="text-danger"
                  />
                ))}
              </div>
            </Abschnitt>

            <Abschnitt titel="Mieterliste" untertitel="Flächen, Leerstand und Restlaufzeit der Mietverträge" unterlage={slot('mieterliste') ?? null}>
              <div className="grid grid-cols-2 @2xl:grid-cols-3 gap-4">
                {feld('einheiten', (
                  <ZahlFeld id={id('einheiten')} value={o.einheiten} onChange={(v) => setzeObjekt('einheiten', v)} ki={ki('einheiten')} />
                ))}
                {feld('vermieteteFlaeche', (
                  <ZahlFeld id={id('vermieteteFlaeche')} value={o.vermieteteFlaeche} onChange={(v) => setzeObjekt('vermieteteFlaeche', v)} einheit="m²" ki={ki('vermieteteFlaeche')} />
                ))}
                {feld('leerstandFlaeche', (
                  <ZahlFeld id={id('leerstandFlaeche')} value={o.leerstandFlaeche} onChange={(v) => setzeObjekt('leerstandFlaeche', v)} einheit="m²" ki={ki('leerstandFlaeche')} />
                ))}
                {feld('leerstandsquote', (
                  <ZahlFeld id={id('leerstandsquote')} value={o.leerstandsquote} onChange={(v) => setzeObjekt('leerstandsquote', v)} stellen={1} einheit="%" ki={ki('leerstandsquote')} />
                ))}
                {feld('walt', (
                  <ZahlFeld id={id('walt')} value={o.walt} onChange={(v) => setzeObjekt('walt', v)} stellen={1} einheit="Jahre" ki={ki('walt')} />
                ), { label: 'WALT (Restlaufzeit)' })}
              </div>
            </Abschnitt>

            <Abschnitt titel="Objekt-Cashflow" untertitel="Ist-Werte des letzten Geschäftsjahres, vor Kapitaldienst" unterlage={slot('cashflow') ?? null}>
              <div className="grid grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3 gap-4">
                {feld('mietertraege', (
                  <EuroFeld id={id('mietertraege')} value={o.mietertraege} onChange={(v) => setzeObjekt('mietertraege', v)} ki={ki('mietertraege')} />
                ))}
                {feld('bewirtschaftung', (
                  <EuroFeld id={id('bewirtschaftung')} value={o.bewirtschaftung} onChange={(v) => setzeObjekt('bewirtschaftung', v)} ki={ki('bewirtschaftung')} />
                ))}
                {feld('cashflow', (
                  <EuroFeld id={id('cashflow')} value={o.cashflow} onChange={(v) => setzeObjekt('cashflow', v)} ki={ki('cashflow')} />
                ))}
                <Kennzahl
                  label="Nettoanfangsrendite"
                  wert={nar != null ? `${formatNumber(nar, 2)} %` : '–'}
                  hinweis="Jährlicher Cashflow geteilt durch Marktwert"
                />
                <Kennzahl
                  label="Mietmultiplikator"
                  wert={faktor != null ? `${formatNumber(faktor, 1)}-fach` : '–'}
                  hinweis="Marktwert geteilt durch Mieterträge p.a."
                />
              </div>
            </Abschnitt>
          </div>
        </div>
      )}

      {vorschauUnterlage && (
        <QuellenVorschau
          unterlage={vorschauUnterlage}
          feld={vorschau.feld}
          quellen={quellen}
          werte={Object.fromEntries(Object.keys(OBJEKT_FELDER).map((k) => [k, OBJEKT_FELDER[k].ziel === 'sicherheit' ? item[k] : o[k]]))}
          onClose={() => setVorschau(null)}
        />
      )}
    </div>
  );
}

