/**
 * ObjektUnterlagen -- Upload und KI-Auslesen der Objektunterlagen einer
 * Immobiliensicherheit (analog zum Dokumentenupload in "Kreditantrag stellen").
 *
 * Checkliste je Unterlagentyp: Energieausweis, Mieterliste, Objekt-Cashflow
 * und optional Verkehrswertgutachten und Grundbuchauszug. Dateien werden
 * beim Hochladen gelesen und ihrem Typ zugeordnet; "KI-Auslesen starten"
 * extrahiert die Werte und befüllt die Felder der Objektkarte.
 *
 * Demo: Jede Zeile kann eine zum Objekt passende Beispielunterlage als PDF
 * erzeugen und einspielen (oder herunterladen, um den echten Upload zu
 * testen). Beide Wege laufen durch denselben Leseweg.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Banknote, CircleCheck, CircleDashed, CloudUpload, Download, Eye, FileText, Gauge,
  Landmark, LoaderCircle, Scale, Sparkles, TriangleAlert, Upload, Users, X,
} from 'lucide-react';
import { UNTERLAGEN_TYPEN } from '../../data/objektunterlagen';
import { erstelleObjektprofil } from '../../utils/immobilienProfil';
import { erzeugeDemoUnterlage, ladeDemoUnterlageHerunter } from '../../utils/immobilienPdf';
import {
  erkenneTyp, extrahiereWerte, fuehreZusammen, leseUnterlage, pruefeObjekt,
} from '../../utils/objektunterlagenParser';
import { formatiereFeld } from './objektFormat';

const ICONS = { energieausweis: Gauge, mieterliste: Users, cashflow: Banknote, gutachten: Scale, grundbuch: Landmark };

const SCHRITTE = {
  energieausweis: 'Energieausweis: Effizienzklasse, Endenergie und Gültigkeit werden gelesen …',
  mieterliste: 'Mieterliste: Flächen, Mieten und Leerstand werden summiert …',
  cashflow: 'Objekt-Cashflow: Mieterträge und Bewirtschaftungskosten werden zugeordnet …',
  gutachten: 'Verkehrswertgutachten: Marktwert, Stichtag und Verfahren werden übernommen …',
  grundbuch: 'Grundbuchauszug: Vorlasten in Abteilung III werden ermittelt …',
};

const ERLAUBT = '.pdf,.xlsx,.xlsm,.csv,.txt,.docx';
const MAX_GROESSE = 30 * 1024 * 1024;
const OHNE_GEBAEUDE = ['energieausweis', 'mieterliste', 'cashflow'];

let zaehler = 0;
const neueId = () => `unterlage-${Date.now()}-${(zaehler += 1)}`;
const endung = (name) => (String(name).toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1] || '';
const groesse = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Quellen, die auf eine entfernte Unterlage zeigen, fallen weg -- die Werte bleiben. */
const ohneQuellenVon = (quellen, id) =>
  Object.fromEntries(Object.entries(quellen || {}).filter(([, q]) => q.unterlageId !== id));

export default function ObjektUnterlagen({ item, company, andereAdressen, aktualisiere, onVorschau }) {
  const [laeuft, setLaeuft] = useState(false);
  const [schritte, setSchritte] = useState([]);
  const [schritt, setSchritt] = useState(0);
  const [ziehen, setZiehen] = useState(false);
  const [meldung, setMeldung] = useState('');
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const ausstehendRef = useRef(null);

  const unterlagen = item.unterlagen || [];
  const ohneGebaeude = /unbebaut/i.test(item.art);
  const slot = (typ) => unterlagen.find((u) => u.typ === typ);
  const zuordnen = unterlagen.filter((u) => !u.typ);
  const bereit = unterlagen.filter((u) => u.status === 'bereit');
  const lesend = unterlagen.some((u) => u.status === 'lesen');

  // Ergebnisse übernehmen: Werte je Unterlage lesen, nach Vorrang verteilen, plausibilisieren
  const anwenden = useCallback(() => {
    aktualisiere((it) => {
      const neu = (it.unterlagen || []).map((u) =>
        u.status === 'bereit' ? { ...u, status: 'ausgelesen', ergebnis: extrahiereWerte(u.typ, u.dok) } : u
      );
      const zwischen = { ...it, unterlagen: neu };
      const { sicherheit, objekt, quellen, uebernommen } = fuehreZusammen(zwischen);
      const ergebnis = {
        ...zwischen,
        ...sicherheit,
        objekt: { ...it.objekt, ...objekt },
        quellen: { ...it.quellen, ...quellen },
      };
      const ausgelesen = neu.filter((u) => u.status === 'ausgelesen');
      return {
        ...ergebnis,
        auslesung: {
          zeitpunkt: new Date().toISOString(),
          felder: Object.keys(ergebnis.quellen).length,
          neu: uebernommen.length,
          unterlagen: ausgelesen.length,
          hinweise: [...ausgelesen.flatMap((u) => u.ergebnis.hinweise || []), ...pruefeObjekt(ergebnis)],
        },
      };
    });
  }, [aktualisiere]);

  // Verlässt man die Ansicht mitten im Auslesen, werden die Werte sofort übernommen
  useEffect(() => {
    ausstehendRef.current = anwenden;
  }, [anwenden]);
  useEffect(() => () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      ausstehendRef.current?.();
    }
  }, []);

  const nimmAuf = useCallback(async (dateien) => {
    setMeldung('');
    const eintraege = dateien.map((d) => ({
      id: neueId(),
      name: d.name,
      groesse: d.bytes.byteLength,
      format: endung(d.name) || 'datei',
      herkunft: d.herkunft,
      status: 'lesen',
      typ: null,
      bytes: d.bytes,
    }));
    aktualisiere((it) => ({ ...it, unterlagen: [...(it.unterlagen || []), ...eintraege] }));

    await Promise.all(dateien.map(async (d, i) => {
      const id = eintraege[i].id;
      let update;
      try {
        const dok = await leseUnterlage({ name: d.name, bytes: d.bytes, type: d.type });
        const typ = dok.lesbar ? erkenneTyp(dok, d.name) || d.erwartet || null : null;
        update = {
          dok,
          format: dok.format,
          typ,
          status: !dok.lesbar ? 'unlesbar' : typ ? 'bereit' : 'unbekannt',
          fehler: dok.grund,
        };
      } catch (err) {
        console.warn('Unterlage nicht lesbar', d.name, err);
        update = { status: 'fehler', fehler: 'Die Datei konnte nicht gelesen werden.' };
      }
      aktualisiere((it) => {
        // Eine neue Unterlage ersetzt die bisherige desselben Typs
        const alt = update.typ ? (it.unterlagen || []).find((u) => u.typ === update.typ && u.id !== id) : null;
        return {
          ...it,
          unterlagen: (it.unterlagen || []).filter((u) => u.id !== alt?.id).map((u) => (u.id === id ? { ...u, ...update } : u)),
          quellen: alt ? ohneQuellenVon(it.quellen, alt.id) : it.quellen,
        };
      });
    }));
  }, [aktualisiere]);

  const dateienGewaehlt = async (liste) => {
    const dateien = Array.from(liste || []);
    if (!dateien.length) return;
    const zuGross = dateien.filter((f) => f.size > MAX_GROESSE);
    const passend = dateien.filter((f) => f.size <= MAX_GROESSE);
    if (zuGross.length) setMeldung(`${zuGross.map((f) => f.name).join(', ')}: größer als 30 MB.`);
    const gelesen = await Promise.all(passend.map(async (f) => ({ name: f.name, type: f.type, bytes: await f.arrayBuffer(), herkunft: 'upload' })));
    nimmAuf(gelesen);
  };

  // Demo-Profil einmal bilden und an der Sicherheit merken, damit alle Unterlagen zusammenpassen
  const profil = () => {
    if (item.demoProfil) return item.demoProfil;
    const p = erstelleObjektprofil(item, company, { vermeideAdressen: andereAdressen() });
    aktualisiere((it) => (it.demoProfil ? it : { ...it, demoProfil: p }));
    return p;
  };

  const demoEinspielen = (typen) => {
    const p = profil();
    nimmAuf(typen.map((typ) => {
      const { name, bytes } = erzeugeDemoUnterlage(typ, p);
      return { name, bytes, type: 'application/pdf', herkunft: 'demo', erwartet: typ };
    }));
  };

  const entfernen = (id) => {
    aktualisiere((it) => ({
      ...it,
      unterlagen: (it.unterlagen || []).filter((u) => u.id !== id),
      quellen: ohneQuellenVon(it.quellen, id),
    }));
  };

  const typSetzen = (id, typ) => {
    aktualisiere((it) => {
      const alt = (it.unterlagen || []).find((u) => u.typ === typ && u.id !== id);
      return {
        ...it,
        unterlagen: (it.unterlagen || [])
          .filter((u) => u.id !== alt?.id)
          .map((u) => (u.id === id ? { ...u, typ, status: 'bereit', ergebnis: null } : u)),
        quellen: alt ? ohneQuellenVon(it.quellen, alt.id) : it.quellen,
      };
    });
  };

  const starten = () => {
    const liste = [
      'Unterlagen werden gelesen und zugeordnet …',
      ...UNTERLAGEN_TYPEN.filter((t) => bereit.some((u) => u.typ === t.id)).map((t) => SCHRITTE[t.id]),
      'Plausibilisierung über alle Unterlagen …',
      'Felder werden vorbefüllt …',
    ];
    setSchritte(liste);
    setSchritt(0);
    setLaeuft(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      setSchritt(i);
      if (i >= liste.length) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        anwenden();
        setLaeuft(false);
      }
    }, 550);
  };

  const fehlend = UNTERLAGEN_TYPEN.filter((t) => !slot(t.id) && !(ohneGebaeude && OHNE_GEBAEUDE.includes(t.id))).map((t) => t.id);
  const uebernommenVon = (u) => Object.values(item.quellen || {}).filter((q) => q.unterlageId === u.id).length;

  return (
    <div className="@container rounded-xl border border-border bg-surface">
      {/* Kopf */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold font-headline text-text-primary">Objektunterlagen</h4>
          <p className="text-xs text-text-secondary mt-0.5 max-w-2xl">
            Energieausweis, Mieterliste und Objekt-Cashflow hochladen – die KI liest Cashflow, Mieterträge,
            Leerstandsquote und Energiekennwerte aus und befüllt die Felder unten.
          </p>
        </div>
      </div>

      {/* Checkliste */}
      <div className="mx-5 rounded-lg border border-border bg-surface-card divide-y divide-border">
        {UNTERLAGEN_TYPEN.map((t) => {
          const u = slot(t.id);
          const Icon = ICONS[t.id];
          const entfaellt = ohneGebaeude && OHNE_GEBAEUDE.includes(t.id);
          return (
            <div key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5">
              <div className="flex items-center gap-3 @2xl:w-48 shrink-0 order-1 mr-auto @2xl:mr-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${u?.status === 'ausgelesen' ? 'bg-emerald-50 text-emerald-700' : 'bg-primary/5 text-primary'}`}>
                  <Icon size={16} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary leading-tight">{t.label}</p>
                  <p className="text-[11px] text-text-muted leading-tight">{t.kern ? 'Kernunterlage' : 'optional'}</p>
                </div>
              </div>

              {u ? (
                <>
                  <button
                    type="button"
                    onClick={() => u.dok && onVorschau(u.id)}
                    disabled={!u.dok}
                    className="flex items-center gap-2 min-w-0 basis-full @2xl:basis-0 @2xl:flex-1 order-4 @2xl:order-2 pl-11 @2xl:pl-0 text-left group"
                    title="Unterlage ansehen"
                  >
                    <FileText size={14} className="text-text-muted shrink-0" />
                    <span className="text-xs text-text-primary truncate group-hover:text-primary group-hover:underline">{u.name}</span>
                    <span className="text-[11px] text-text-muted shrink-0">
                      {groesse(u.groesse)}
                      {u.herkunft === 'demo' && ' · Demo'}
                    </span>
                  </button>
                  <div className="order-2 @2xl:order-3 shrink-0">
                    <StatusChip unterlage={u} uebernommen={uebernommenVon(u)} />
                  </div>
                  <div className="flex items-center gap-1 shrink-0 order-3 @2xl:order-4">
                    <button
                      type="button"
                      onClick={() => onVorschau(u.id)}
                      disabled={!u.dok}
                      className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary/5 disabled:opacity-40 transition-colors"
                      title="Unterlage ansehen"
                    >
                      <Eye size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => entfernen(u.id)}
                      disabled={laeuft}
                      className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-red-50 disabled:opacity-40 transition-colors"
                      title="Unterlage entfernen"
                    >
                      <X size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </>
              ) : entfaellt ? (
                <p className="text-xs text-text-muted basis-full @2xl:basis-0 @2xl:flex-1 order-4 @2xl:order-2 pl-11 @2xl:pl-0">entfällt bei einem unbebauten Grundstück</p>
              ) : (
                <>
                  <p className="text-xs text-text-muted basis-full @2xl:basis-0 @2xl:flex-1 order-4 @2xl:order-2 pl-11 @2xl:pl-0">
                    fehlt · liefert {t.liefert}
                  </p>
                  <div className="flex items-center gap-1 shrink-0 order-2 @2xl:order-3">
                    <button
                      type="button"
                      onClick={() => demoEinspielen([t.id])}
                      disabled={laeuft}
                      className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[var(--tint-ki)] text-xs font-medium text-[var(--ki)] hover:bg-violet-100 disabled:opacity-40 transition-colors"
                      title="Zum Objekt passende Demo-Unterlage erzeugen und hochladen"
                    >
                      <Upload size={12} strokeWidth={2} />
                      Demo-Unterlage
                    </button>
                    <button
                      type="button"
                      onClick={() => ladeDemoUnterlageHerunter(t.id, profil())}
                      className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
                      title="Demo-Unterlage als PDF herunterladen, um den Upload selbst zu testen"
                    >
                      <Download size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Nicht zugeordnete Dateien */}
      {zuordnen.length > 0 && (
        <div className="mx-5 mt-3 space-y-2">
          {zuordnen.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
              {u.status === 'lesen'
                ? <LoaderCircle size={14} className="text-amber-700 animate-spin shrink-0" />
                : <TriangleAlert size={14} className="text-amber-700 shrink-0" />}
              <span className="text-xs font-medium text-amber-900 truncate max-w-[260px]">{u.name}</span>
              <span className="text-xs text-amber-800 flex-1 min-w-[180px]">
                {u.status === 'lesen' && 'wird gelesen …'}
                {u.status === 'unbekannt' && 'Unterlagentyp nicht erkannt – bitte zuordnen:'}
                {(u.status === 'unlesbar' || u.status === 'fehler') && u.fehler}
              </span>
              {u.status === 'unbekannt' && (
                <select
                  value=""
                  onChange={(e) => e.target.value && typSetzen(u.id, e.target.value)}
                  className="rounded-md border border-amber-300 bg-white px-2 py-1 text-xs text-text-primary"
                >
                  <option value="">Typ wählen …</option>
                  {UNTERLAGEN_TYPEN.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              )}
              <button
                type="button"
                onClick={() => entfernen(u.id)}
                className="p-1 rounded-md text-amber-800 hover:text-danger transition-colors"
                title="Datei entfernen"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload */}
      <div className="px-5 pt-3 pb-4">
        <div className="flex flex-col @2xl:flex-row gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setZiehen(true); }}
          onDragLeave={() => setZiehen(false)}
          onDrop={(e) => { e.preventDefault(); setZiehen(false); dateienGewaehlt(e.dataTransfer?.files); }}
          disabled={laeuft}
          className={`flex-1 min-w-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-lg border-2 border-dashed px-4 py-4 text-center transition-colors ${
            ziehen ? 'border-primary bg-primary/5' : 'border-border hover:border-primary-light hover:bg-primary/5'
          } disabled:opacity-50`}
        >
          <CloudUpload size={20} strokeWidth={1.5} className="text-text-muted" />
          <span className="text-sm text-text-secondary">
            Unterlagen hierhin ziehen oder <span className="font-semibold text-primary">durchsuchen</span>
          </span>
          <span className="text-[11px] text-text-muted">PDF, Excel, CSV oder Word · mehrere Dateien möglich</span>
        </button>
        {fehlend.length > 0 && !laeuft && (
          <button
            type="button"
            onClick={() => demoEinspielen(fehlend)}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 min-h-12 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors"
            title="Zum Objekt passende Demo-Unterlagen erzeugen und hochladen"
          >
            <Upload size={16} strokeWidth={1.75} />
            {!UNTERLAGEN_TYPEN.some((t) => slot(t.id)) ? 'Alle Demo-Unterlagen hochladen' : `Fehlende Demo-Unterlagen hochladen (${fehlend.length})`}
          </button>
        )}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ERLAUBT}
          className="hidden"
          onChange={(e) => { dateienGewaehlt(e.target.files); e.target.value = ''; }}
        />
        {meldung && <p className="mt-2 text-xs text-danger">{meldung}</p>}

        {/* KI-Auslesen */}
        {(bereit.length > 0 || laeuft) && (
          <div className="mt-4">
            {laeuft ? (
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <LoaderCircle size={18} className="text-violet-700 animate-spin" />
                  <p className="text-sm font-semibold text-violet-900">KI liest die Objektunterlagen aus …</p>
                </div>
                <ul className="space-y-1.5">
                  {schritte.map((text, i) => (
                    <li key={text} className="flex items-center gap-2">
                      {i < schritt ? (
                        <CircleCheck size={14} className="text-emerald-600 shrink-0" />
                      ) : i === schritt ? (
                        <LoaderCircle size={14} className="text-violet-700 animate-spin shrink-0" />
                      ) : (
                        <CircleDashed size={14} className="text-text-muted shrink-0" />
                      )}
                      <span className={`text-xs ${i < schritt ? 'text-emerald-800' : i === schritt ? 'text-violet-900 font-semibold' : 'text-text-muted'}`}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <button
                type="button"
                onClick={starten}
                disabled={lesend}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-violet-700 text-white text-sm font-semibold hover:bg-violet-800 disabled:opacity-60 transition-colors shadow-sm"
              >
                <Sparkles size={17} />
                KI-Auslesen starten – {bereit.length === 1 ? '1 Unterlage' : `${bereit.length} Unterlagen`} auswerten und Felder befüllen
              </button>
            )}
          </div>
        )}

        {/* Ergebnis */}
        {item.auslesung && !laeuft && bereit.length === 0 && (
          <Ergebnis item={item} />
        )}
      </div>
    </div>
  );
}

function StatusChip({ unterlage: u, uebernommen }) {
  if (u.status === 'lesen') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted shrink-0">
        <LoaderCircle size={12} className="animate-spin" /> wird gelesen
      </span>
    );
  }
  if (u.status === 'bereit') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] font-medium text-violet-800 shrink-0"
        title="Unterlagentyp erkannt – bereit zum KI-Auslesen"
      >
        erkannt
      </span>
    );
  }
  if (u.status === 'ausgelesen') {
    const gelesen = Object.keys(u.ergebnis?.felder || {}).length;
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-800 shrink-0"
        title={`${gelesen} Werte gelesen, ${uebernommen} in die Felder übernommen`}
      >
        <CircleCheck size={12} />
        {uebernommen === 1 ? '1 Wert übernommen' : `${uebernommen} Werte übernommen`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-danger shrink-0">
      <TriangleAlert size={12} /> {u.fehler || 'nicht lesbar'}
    </span>
  );
}

const TON = {
  ok: { icon: CircleCheck, cls: 'text-emerald-800', iconCls: 'text-emerald-600' },
  info: { icon: Sparkles, cls: 'text-text-secondary', iconCls: 'text-violet-600' },
  warnung: { icon: TriangleAlert, cls: 'text-amber-900', iconCls: 'text-amber-600' },
};

function Ergebnis({ item }) {
  const a = item.auslesung;
  const o = item.objekt || {};
  const kacheln = [
    { key: 'cashflow', label: 'Jährlicher Cashflow' },
    { key: 'mietertraege', label: 'Mieterträge p.a.' },
    { key: 'leerstandsquote', label: 'Leerstandsquote' },
    { key: 'energieklasse', label: 'Energieeffizienzklasse' },
  ];
  return (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <CircleCheck size={16} className="text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-900">
            {a.felder} Felder aus {a.unterlagen === 1 ? '1 Unterlage' : `${a.unterlagen} Unterlagen`} vorbefüllt
          </p>
        </div>
        <p className="text-[11px] text-emerald-800">
          Stand {new Date(a.zeitpunkt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
        </p>
      </div>
      <div className="grid grid-cols-2 @3xl:grid-cols-4 gap-2.5">
        {kacheln.map((k) => (
          <div key={k.key} className="rounded-md border border-emerald-100 bg-white px-3 py-2">
            <p className="text-[11px] uppercase tracking-wider text-text-muted">{k.label}</p>
            <p className="text-sm font-mono font-semibold text-text-primary mt-0.5">{formatiereFeld(k.key, o[k.key])}</p>
          </div>
        ))}
      </div>
      {a.hinweise?.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {a.hinweise.map((h, i) => {
            const ton = TON[h.ton] || TON.info;
            const Icon = ton.icon;
            return (
              <li key={i} className="flex items-start gap-2">
                <Icon size={13} className={`${ton.iconCls} shrink-0 mt-0.5`} />
                <span className={`text-xs ${ton.cls}`}>{h.text}</span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-emerald-800 mt-3">
        Bitte prüfe die vorbefüllten Werte. Jedes Feld mit „KI-Quelle“ zeigt per Klick seine Fundstelle im Dokument.
      </p>
    </div>
  );
}

