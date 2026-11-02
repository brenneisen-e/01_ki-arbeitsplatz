// ===========================================================================
// Start — Hero mit Suchfeld und Kennzahlen aus den Daten, Weiterlernen bzw.
// Hier starten, Dein Stand, Lernpfad (eine Karte je Kapitel), Begriff des Tages,
// Einstiegspfad „Erste Woche“, Fußzeile. Brief §6.
// ===========================================================================
import { useMemo, useState } from 'react';
import { Search, Play, ArrowRight, CircleCheck, Circle, ListChecks, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useWissen } from '../store/Wissen.jsx';
import { getIconComponent } from '../components/ui/Icons.jsx';
import CountUp from '../components/ui/CountUp.jsx';
import Karte from '../components/ui/Karte.jsx';
import Knopf from '../components/ui/Knopf.jsx';
import Chip from '../components/ui/Chip.jsx';
import Fortschrittsring from '../components/ui/Fortschrittsring.jsx';
import Popover from '../components/ui/Popover.jsx';
import Kbd, { Tasten } from '../components/ui/Kbd.jsx';
import { datum, datumRelativ, minuten, mehrzahl, zahl, anteil as anteilFormat } from '../lib/format.js';
import { nummer } from '../lib/text.js';
import { lade, speichere, SCHLUESSEL } from '../lib/speicher.js';

const TAGE = 5;
const SUCH_BEISPIELE = 'Combined Ratio, Solvency II, Provisionssätze';
/** Höchstlänge eines Begriffs, der als Suchbeispiel noch in die Zeile passt. */
const BEISPIEL_LAENGE = 22;

/**
 * Unterzeile aus den Daten (die Kapitelzahl folgt dem Umfang, deshalb kein
 * fester Text). Der Bogen „von … bis …“ passt nur zum ganzen Stoff.
 */
function unterzeile(anzahlKapitel, ganzerStoff) {
  const kapitel = mehrzahl(anzahlKapitel, 'Kapitel', 'Kapiteln');
  return ganzerStoff
    ? `Der deutsche Versicherungsmarkt in ${kapitel} – von der Marktstruktur bis zu den Zukunftsthemen. Zum Nachschlagen zwischen zwei Terminen und zum Lernen in der ersten Woche.`
    : `Der deutsche Versicherungsmarkt in ${kapitel} – zum Nachschlagen zwischen zwei Terminen und zum Lernen in der ersten Woche.`;
}

/** Teilt die Kapitel (in Reihenfolge) in `k` Tage mit möglichst gleicher Lesezeit (lineare Partition). */
function teileInTage(minutenJeKapitel, k) {
  const n = minutenJeKapitel.length;
  if (n === 0) return [];
  const teile = Math.min(k, n);
  const praefix = [0];
  for (const m of minutenJeKapitel) praefix.push(praefix[praefix.length - 1] + m);
  const summe = (i, j) => praefix[j] - praefix[i];
  // dp[i][t] = bestes Maximum für die ersten i Kapitel in t Tagen
  const dp = Array.from({ length: n + 1 }, () => Array(teile + 1).fill(Infinity));
  const schnitt = Array.from({ length: n + 1 }, () => Array(teile + 1).fill(0));
  dp[0][0] = 0;
  for (let i = 1; i <= n; i += 1) {
    for (let t = 1; t <= teile; t += 1) {
      for (let j = t - 1; j < i; j += 1) {
        const wert = Math.max(dp[j][t - 1], summe(j, i));
        if (wert < dp[i][t]) { dp[i][t] = wert; schnitt[i][t] = j; }
      }
    }
  }
  const gruppen = [];
  let i = n;
  for (let t = teile; t >= 1; t -= 1) {
    const j = schnitt[i][t];
    gruppen.unshift(Array.from({ length: i - j }, (_, x) => j + x));
    i = j;
  }
  return gruppen;
}

function Kennzahl({ wert, label, kennung }) {
  return (
    <div className="start-kennzahl">
      <span className="start-kennzahl-wert"><CountUp wert={wert} dezimalen={0} kennung={kennung} /></span>
      <span className="start-kennzahl-label">{label}</span>
    </div>
  );
}

export default function Start() {
  const {
    daten, kapitelListe, glossar, kennzahlen, fortschritt, fortschrittGesamt, fortschrittKapitel,
    lesezeitKapitel, lesezeitEinheit, istGelesen, einheitenFolge, naechsteEinheit,
    faelligeFragen, oeffneSuche, routeZuHash, umfang,
  } = useWissen();

  const [wocheAusgeblendet, setWocheAusgeblendet] = useState(() => Boolean(lade(SCHLUESSEL.ersteWoche, {}).ausgeblendet));
  const wocheUmschalten = () => {
    const neu = !wocheAusgeblendet;
    setWocheAusgeblendet(neu);
    speichere(SCHLUESSEL.ersteWoche, { ausgeblendet: neu });
  };

  // Weiterlernen: letzte Position — ist sie gelesen, die nächste Einheit
  const weiter = useMemo(() => {
    const z = fortschritt.zuletzt;
    if (!z) return null;
    const pos = einheitenFolge.find((e) => e.kapitel.id === z.kapitelId && e.einheit.id === z.einheitId);
    if (!pos) return null;
    const gelesen = istGelesen(z.kapitelId, z.einheitId);
    const ziel = gelesen ? (naechsteEinheit(z.kapitelId, z.einheitId) || pos) : pos;
    return { ...ziel, zeit: z.zeit, weiterMit: gelesen && ziel !== pos };
  }, [fortschritt.zuletzt, einheitenFolge, istGelesen, naechsteEinheit]);
  const ersteEinheit = einheitenFolge[0] || null;

  const letzterCheck = fortschritt.quiz.verlauf[0] || null;
  const faellig = faelligeFragen().length;
  const bestandene = kapitelListe.filter((k) => fortschritt.bestanden[k.id]).length;

  // Schwächste Kapitel aus den Leitner-Karten (nur mit Versuchen, unter 80 %)
  const schwaechste = useMemo(() => {
    const je = new Map();
    for (const [id, k] of Object.entries(fortschritt.quiz.karten)) {
      const kapitelId = id.split('#')[0];
      const e = je.get(kapitelId) || { versuche: 0, richtig: 0 };
      e.versuche += k.versuche || 0;
      e.richtig += k.richtig || 0;
      je.set(kapitelId, e);
    }
    return kapitelListe
      .map((k, i) => ({ kapitel: k, index: i, ...(je.get(k.id) || { versuche: 0, richtig: 0 }) }))
      .filter((x) => x.versuche > 0 && x.richtig / x.versuche < 0.8)
      .sort((a, b) => a.richtig / a.versuche - b.richtig / b.versuche)
      .slice(0, 3);
  }, [fortschritt.quiz.karten, kapitelListe]);

  // Begriff des Tages: deterministisch aus dem Datum
  const begriffDesTages = useMemo(() => {
    if (!glossar.length) return null;
    const tag = Math.floor(Date.now() / 86400000);
    return glossar[tag % glossar.length];
  }, [glossar]);

  // Erste Woche
  const woche = useMemo(() => {
    const min = kapitelListe.map((k) => lesezeitKapitel(k.id));
    return teileInTage(min, TAGE).map((indizes, t) => {
      const kapitel = indizes.map((i) => kapitelListe[i]);
      let gesamt = 0;
      let rest = 0;
      for (const k of kapitel) for (const e of k.subChapters || []) {
        const m = lesezeitEinheit(k.id, e.id);
        gesamt += m;
        if (!istGelesen(k.id, e.id)) rest += m;
      }
      return { tag: t + 1, kapitel, indizes, gesamt, rest };
    });
  }, [kapitelListe, lesezeitKapitel, lesezeitEinheit, istGelesen]);

  const gesamtMinuten = kennzahlen.lesezeitMinuten;

  // Suchbeispiele: bei begrenztem Umfang aus den sichtbaren Begriffen, damit
  // die Zeile nichts nennt, was gar nicht zu finden ist.
  const suchBeispiele = useMemo(() => {
    if (!umfang.umfangAktiv) return SUCH_BEISPIELE;
    return glossar.filter((g) => g.term.length <= BEISPIEL_LAENGE).slice(0, 3).map((g) => g.term).join(', ');
  }, [umfang.umfangAktiv, glossar]);

  return (
    <div className="start">
      <section className="start-hero" aria-labelledby="start-titel">
        <div className="start-hero-innen">
          <div className="ueberschrift-meta">Monitor Deloitte Insurance · Wissen zum Nachschlagen und Lernen</div>
          <h1 id="start-titel">Das Versicherungs-1×1</h1>
          <p className="start-hero-unterzeile">{unterzeile(kennzahlen.kapitel, !umfang.umfangAktiv)}</p>
          <button type="button" className="start-suchfeld" onClick={() => oeffneSuche()} aria-label="Suche öffnen">
            <Search size={20} aria-hidden="true" />
            {/* Die Beispiele passen erst ab 768 px in die Zeile; darunter stand
                „Suchen: Combined R…“ — deshalb zwei Fassungen, eine je Breite. */}
            <span className="start-suchfeld-lang">{suchBeispiele ? `Suchen: ${suchBeispiele} …` : 'Suchen …'}</span>
            <span className="start-suchfeld-kurz">Suchen …</span>
            <Tasten tasten={['mod', 'K']} />
          </button>
          <div className="start-kennzahlen" role="list" aria-label="Umfang des Versicherungs-1×1">
            <div role="listitem"><Kennzahl wert={kennzahlen.kapitel} label="Kapitel" kennung="start-kapitel" /></div>
            <div role="listitem"><Kennzahl wert={kennzahlen.einheiten} label="Lerneinheiten" kennung="start-einheiten" /></div>
            <div role="listitem"><Kennzahl wert={gesamtMinuten} label="Minuten Lesezeit" kennung="start-lesezeit" /></div>
            <div role="listitem"><Kennzahl wert={kennzahlen.begriffe} label="Fachbegriffe" kennung="start-begriffe" /></div>
            <div role="listitem"><Kennzahl wert={kennzahlen.fragen} label="Quizfragen" kennung="start-fragen" /></div>
            {kennzahlen.quellen > 0 && <div role="listitem"><Kennzahl wert={kennzahlen.quellen} label="Quellenverweise" kennung="start-quellen" /></div>}
          </div>
        </div>
      </section>

      <div className="seite">
        <div className="start-raster">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Weiterlernen / Hier starten */}
            <Karte className="weiter-karte" als="section" aria-labelledby="weiter-titel">
              {weiter ? (
                <>
                  <div className="weiter-karte-kopf">
                    <span className="ueberschrift-meta">{weiter.weiterMit ? 'Weiter mit' : 'Weiterlernen'}</span>
                    <span className="meta">Zuletzt {datumRelativ(weiter.zeit)}</span>
                  </div>
                  <div>
                    <div className="weiter-kapitel">Kapitel {nummer(weiter.kapitelIndex)} · {weiter.kapitel.title}</div>
                    <h2 id="weiter-titel" className="weiter-titel">{weiter.einheit.title}</h2>
                    {weiter.einheit.subtitle && <p className="nebentext" style={{ marginTop: 4 }}>{weiter.einheit.subtitle}</p>}
                  </div>
                  <div className="weiter-fuss">
                    <span className="weiter-meta">
                      <Fortschrittsring anteil={fortschrittKapitel(weiter.kapitel.id).anteil} groesse={24} />
                      {fortschrittKapitel(weiter.kapitel.id).gelesen} von {fortschrittKapitel(weiter.kapitel.id).gesamt} Lerneinheiten gelesen · {minuten(lesezeitEinheit(weiter.kapitel.id, weiter.einheit.id))}
                    </span>
                    <Knopf variante="primaer" symbol={Play} href={routeZuHash({ name: 'kapitel', kapitelId: weiter.kapitel.id, einheitId: weiter.einheit.id })}>
                      Weiterlernen
                    </Knopf>
                  </div>
                </>
              ) : (
                <>
                  <div className="weiter-karte-kopf">
                    <span className="ueberschrift-meta">Hier starten</span>
                    {ersteEinheit && <span className="meta">{minuten(lesezeitKapitel(ersteEinheit.kapitel.id))} für Kapitel 01</span>}
                  </div>
                  {ersteEinheit ? (
                    <>
                      <div>
                        <div className="weiter-kapitel">Kapitel 01 · {ersteEinheit.kapitel.title}</div>
                        <h2 id="weiter-titel" className="weiter-titel">{ersteEinheit.einheit.title}</h2>
                        <p className="nebentext" style={{ marginTop: 4 }}>{ersteEinheit.einheit.subtitle || ersteEinheit.kapitel.subtitle}</p>
                      </div>
                      <div className="weiter-fuss">
                        <span className="weiter-meta">Dein Stand bleibt auf diesem Gerät gespeichert – ohne Anmeldung.</span>
                        <Knopf variante="primaer" symbol={Play} href={routeZuHash({ name: 'kapitel', kapitelId: ersteEinheit.kapitel.id, einheitId: ersteEinheit.einheit.id })}>
                          Kapitel 01 beginnen
                        </Knopf>
                      </div>
                    </>
                  ) : <h2 id="weiter-titel" className="weiter-titel">Noch keine Inhalte</h2>}
                </>
              )}
            </Karte>

            {/* Begriff des Tages */}
            {begriffDesTages && (
              <Karte className="begriff-karte" als="section" aria-labelledby="begriff-titel">
                <div className="weiter-karte-kopf">
                  <span className="ueberschrift-meta">Begriff des Tages</span>
                  <span className="meta">{datum(new Date())}</span>
                </div>
                <h2 id="begriff-titel" className="begriff-karte-term">{begriffDesTages.term}</h2>
                <p className="begriff-karte-definition">{begriffDesTages.definition}</p>
                <div className="begriff-karte-fuss">
                  <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {begriffDesTages.tags.map((t) => <Chip key={t} href={routeZuHash({ name: 'glossar' })}>{t}</Chip>)}
                  </span>
                  <Knopf variante="still" symbolRechts={ArrowRight} href={routeZuHash({ name: 'glossar', slug: begriffDesTages.slug })}>Im Glossar öffnen</Knopf>
                </div>
              </Karte>
            )}
          </div>

          {/* Dein Stand */}
          <Karte als="section" aria-labelledby="stand-titel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="weiter-karte-kopf">
              <h2 id="stand-titel" style={{ fontSize: 16 }}>Dein Stand</h2>
              <Popover
                titel="So zählt dein Stand"
                seite="unten"
                ausrichtung="ende"
                ausloeser={<Knopf variante="still" groesse="klein" nurSymbol symbol={Info} aria-label="Wie zählt der Stand?" />}
              >
                <strong>So zählt dein Stand</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Eine Lerneinheit gilt als gelesen, wenn du sie zu 80 % gescrollt und mindestens 15 Sekunden offen hattest – oder per Knopf.</li>
                  <li>Ein Kapitel gilt als bestanden, wenn du seinen Wissenscheck mit 80 % oder mehr abschließt.</li>
                  <li>Falsch beantwortete Fragen kommen nach 1, 3 und 7 Tagen wieder (Wiederholen).</li>
                  <li>Alles bleibt nur auf diesem Gerät gespeichert.</li>
                </ul>
              </Popover>
            </div>
            <div className="stand-kopf">
              <Fortschrittsring anteil={fortschrittGesamt.anteil} groesse={40} />
              <div className="stand-kopf-text">
                <span className="stand-kopf-wert">{anteilFormat(fortschrittGesamt.anteil)}</span>
                <span className="stand-kopf-label">{fortschrittGesamt.gelesen} von {mehrzahl(fortschrittGesamt.gesamt, 'Lerneinheit', 'Lerneinheiten')} gelesen</span>
              </div>
            </div>
            <div className="stand-liste">
              <div className="stand-zeile"><span>Bestandene Wissenschecks</span><strong>{bestandene} von {kapitelListe.length} Kapiteln</strong></div>
              <div className="stand-zeile">
                <span>Letzter Wissenscheck</span>
                <strong>{letzterCheck ? `${datum(letzterCheck.zeit)} · ${letzterCheck.richtig} von ${letzterCheck.gesamt}` : '–'}</strong>
              </div>
              <div className="stand-zeile">
                <span>Fällige Wiederholungen</span>
                <strong>{faellig > 0 ? mehrzahl(faellig, 'Frage', 'Fragen') : 'keine'}</strong>
              </div>
            </div>
            {schwaechste.length > 0 ? (
              <div>
                <div className="meta" style={{ marginBottom: 6 }}>Schwächste Kapitel</div>
                <div className="stand-luecken">
                  {schwaechste.map((s) => (
                    <Chip key={s.kapitel.id} href={routeZuHash({ name: 'wissenscheck', kapitelId: s.kapitel.id })} title={`${s.richtig} von ${s.versuche} richtig`}>
                      {nummer(s.index)} {s.kapitel.title}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : (
              <p className="nebentext" style={{ marginTop: 'auto' }}>
                {letzterCheck ? 'Keine Lücken unter 80 % – weiter so.' : 'Noch kein Wissenscheck. Ein Schnellcheck hat zehn Fragen und dauert etwa fünf Minuten.'}
              </p>
            )}
            <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Knopf symbol={ListChecks} href={schwaechste[0] ? routeZuHash({ name: 'wissenscheck', kapitelId: schwaechste[0].kapitel.id }) : '#/wissenscheck'}>
                {schwaechste.length > 0 ? 'Lücken schließen' : 'Wissenscheck starten'}
              </Knopf>
            </div>
          </Karte>
        </div>

        {/* Lernpfad */}
        <section className="abschnitt" aria-labelledby="lernpfad-titel">
          <div className="abschnitt-kopf">
            <h2 id="lernpfad-titel">Lernpfad</h2>
            <span className="nebentext">{mehrzahl(kapitelListe.length, 'Kapitel', 'Kapitel')} · {mehrzahl(kennzahlen.einheiten, 'Lerneinheit', 'Lerneinheiten')} · {minuten(gesamtMinuten)}</span>
          </div>
          <div className="lernpfad">
            {kapitelListe.map((k, i) => {
              const Symbol = getIconComponent(k.icon);
              const f = fortschrittKapitel(k.id);
              const erste = (k.subChapters || [])[0];
              const href = erste ? routeZuHash({ name: 'kapitel', kapitelId: k.id, einheitId: erste.id }) : '#/';
              return (
                <Karte key={k.id} href={href} className="kapitel-karte" aria-label={`Kapitel ${nummer(i)} ${k.title}`}>
                  <div className="kapitel-karte-kopf">
                    <span className="kapitel-karte-symbol"><Symbol size={20} aria-hidden="true" /></span>
                    <Fortschrittsring anteil={f.anteil} groesse={24} prozent fertig={f.bestanden} />
                  </div>
                  <div>
                    <div className="kapitel-karte-nummer">KAPITEL {nummer(i)}</div>
                    <div className="kapitel-karte-titel">{k.title}</div>
                    <p className="kapitel-karte-unter">{k.subtitle}</p>
                  </div>
                  <div className="kapitel-karte-fuss">
                    <span>{mehrzahl((k.subChapters || []).length, 'Lerneinheit', 'Lerneinheiten')} · {minuten(lesezeitKapitel(k.id))}</span>
                    <span className="meta">{f.gelesen > 0 ? `${f.gelesen} von ${f.gesamt} gelesen` : ''}</span>
                  </div>
                </Karte>
              );
            })}
          </div>
        </section>

        {/* Erste Woche */}
        {woche.length > 0 && (
          <section className="abschnitt" aria-labelledby="woche-titel">
            <div className="abschnitt-kopf">
              <div>
                <h2 id="woche-titel">Einstiegspfad: Erste Woche</h2>
                <p className="nebentext">{mehrzahl(woche.length, 'Tag', 'Tage')} à rund {minuten(Math.round(gesamtMinuten / Math.max(1, woche.length)))} – eine empfohlene Reihenfolge, kein Zwang.</p>
              </div>
              <Knopf variante="still" symbol={wocheAusgeblendet ? ChevronDown : ChevronUp} onClick={wocheUmschalten} aria-expanded={!wocheAusgeblendet} aria-controls="woche-inhalt">
                {wocheAusgeblendet ? 'Einblenden' : 'Ausblenden'}
              </Knopf>
            </div>
            {!wocheAusgeblendet && (
              <div className="woche" id="woche-inhalt">
                {woche.map((t) => (
                  <Karte key={t.tag} className="woche-tag" als="article" aria-label={`Tag ${t.tag}`}>
                    <div className="woche-tag-kopf">
                      <span className="woche-tag-titel">Tag {t.tag}</span>
                      <span className="woche-tag-zeit">{minuten(t.gesamt)}</span>
                    </div>
                    {t.kapitel.map((k, ki) => (
                      <div key={k.id}>
                        <div className="woche-kapitel">{nummer(t.indizes[ki])} {k.title}</div>
                        <ul className="woche-liste">
                          {(k.subChapters || []).map((e) => {
                            const gelesen = istGelesen(k.id, e.id);
                            return (
                              <li key={e.id}>
                                <a className="woche-einheit" href={routeZuHash({ name: 'kapitel', kapitelId: k.id, einheitId: e.id })} data-gelesen={gelesen ? 'true' : 'false'} title={e.title}>
                                  {gelesen ? <CircleCheck size={14} aria-label="gelesen" /> : <Circle size={14} aria-hidden="true" style={{ color: 'var(--neutral-300)' }} />}
                                  <span className="woche-einheit-titel">{e.title}</span>
                                  <span className="woche-einheit-zeit">{zahl(lesezeitEinheit(k.id, e.id), 0)}&nbsp;Min.</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                    <div className="woche-rest">{t.rest > 0 ? `Noch ${minuten(t.rest)}` : 'Erledigt'}</div>
                  </Karte>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="start-fuss">
          <span>
            {daten?.lastUpdated ? `Datenstand ${datum(daten.lastUpdated)}` : ''}
            {kennzahlen.quellen > 0 ? ` · ${mehrzahl(kennzahlen.quellen, 'Quellenverweis', 'Quellenverweise')}` : ''}
            {' · Monitor Deloitte Insurance'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Tastaturkürzel <Kbd>?</Kbd>
          </span>
        </footer>
      </div>
    </div>
  );
}
