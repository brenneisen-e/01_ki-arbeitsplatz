/**
 * Demo-Vorgänge für die Prüfstrecke.
 *
 * Jeder Vorgang besteht aus drei Ebenen:
 *   mail      – der unstrukturierte Eingang, so wie ihn ein Vermittler schreibt
 *   deckblatt – die daraus gelesenen Felder (Ergebnis der Dokumentanalyse)
 *   bestand   – was die Bestandsführung zu Vertrag und Vermittler zurückgibt
 *
 * Die Prüf-Engine arbeitet ausschließlich auf deckblatt und bestand. Die Mail
 * bleibt daneben stehen, damit im Detail sichtbar ist, woher ein Wert stammt.
 */

function baue(spec) {
  const k = spec.kunde
  const m = spec.makler

  const deckblatt = {
    vermittlerTyp: 'Makler',
    kundeNachname: k.nachname,
    kundeVorname: k.vorname,
    kundeGebdat: k.gebdat,
    kundeStrasse: k.strasse,
    kundePlz: k.plz,
    kundeOrt: k.ort,
    vnr: spec.vnr,
    sparte: spec.sparte,
    mvVnNachname: k.nachname,
    mvVnVorname: k.vorname,
    pool: m.pool || '',
    vermittlerName: m.firma,
    agenturNr: m.agenturNr || '',
    vermittlerNr: m.vermittlerNr || '',
    maklerEmail: m.email,
    maklerStrasse: m.strasse,
    maklerPlz: m.plz,
    maklerOrt: m.ort,
    klassifikation: 'BÜ-Vorgang',
    wunschVorhanden: 'ja',
    pruefungUnterlagen: 'Vollständig',
    reminder: 'nein',
    mvEnthalten: 'ja',
    mvStatus: 'OK',
    mvAufMakler: 'ja',
    mvVollumfaenglich: 'ja',
    mvUnterschriftKunde: 'ja',
    uvErteilt: m.pool ? 'ja' : 'nein',
    uvFehlt: 'nein',
    mvUnterschriftsdatum: spec.mvDatum,
    mvEingangsdatum: spec.eingang,
    anfUnterlagen: 'nein',
    artUnterlagen: '',
    ...(spec.deckblatt || {})
  }

  const bestand = {
    vertragGefunden: true,
    vertragsstatus: 'aktiv',
    nachname: k.nachname,
    vorname: k.vorname,
    gebdat: k.gebdat,
    strasse: k.strasse,
    plz: k.plz,
    bereitsUebertragen: false,
    agenturInhaber: spec.abgebend || 'Agentur 600045112',
    vermittlerGefunden: true,
    anbindung: 'aktiv',
    zusammenarbeit: true,
    courtagefortzahler: false,
    vertriebskanal: spec.vertriebskanal || 'Makler',
    ...(spec.bestand || {})
  }

  return {
    id: spec.id,
    eingang: spec.eingang,
    sparte: spec.sparte,
    postkorb: spec.postkorb || (spec.sparte === 'Kranken' ? 'Gesundheit' : 'Komposit / Leben'),
    kunde: `${k.nachname}, ${k.vorname}`,
    mail: {
      von: m.email,
      vonName: m.name,
      an: 'maklerservice@versicherer.de',
      datum: spec.eingang,
      betreff: spec.mail.betreff,
      text: spec.mail.text,
      anhaenge: spec.mail.anhaenge || []
    },
    deckblatt,
    bestand
  }
}

const MV = (kunde, datum) => ({ name: `Maklervollmacht_${kunde}.pdf`, typ: 'Vollmacht', info: `unterschrieben am ${datum}` })

const SPECS = [
  // ------------------------------------------------ sauber durchgelaufen
  {
    id: 'BUE-2026-1041', eingang: '03.08.2026', sparte: 'Kfz', vnr: 'KH-4471902', mvDatum: '28.07.2026',
    kunde: { nachname: 'Haug', vorname: 'Benjamin', gebdat: '07.07.1988', strasse: 'Wiesenstr. 8', plz: '64331', ort: 'Weiterstadt' },
    makler: { name: 'Thomas Meier', firma: 'Meier Versicherungsmakler GmbH', email: 'meier@meier-makler.de', agenturNr: '600042497', strasse: 'Aachener Str. 88', plz: '50674', ort: 'Köln' },
    mail: {
      betreff: 'Bestandsübertragung Kfz – Haug, KH-4471902',
      text: `Sehr geehrte Damen und Herren,

hiermit beantragen wir die Übertragung des folgenden Vertrages in unsere Betreuung:

Versicherungsnehmer: Benjamin Haug, geb. 07.07.1988
Anschrift: Wiesenstr. 8, 64331 Weiterstadt
Versicherungsnummer: KH-4471902
Sparte: Kfz

Die unterschriebene Maklervollmacht liegt bei.

Mit freundlichen Grüßen
Thomas Meier
Meier Versicherungsmakler GmbH, Vermittlernummer 600042497`,
      anhaenge: [MV('Haug', '28.07.2026')]
    }
  },
  {
    id: 'BUE-2026-1042', eingang: '03.08.2026', sparte: 'Hausrat', vnr: 'SH-2290418', mvDatum: '30.07.2026',
    kunde: { nachname: 'Özdemir', vorname: 'Aylin', gebdat: '12.11.1979', strasse: 'Gartenweg 14', plz: '45127', ort: 'Essen' },
    makler: { name: 'Sandra Müller', firma: 'VSM Versicherungsservice Müller e.K.', email: 'mueller@vsm-versicherung.de', agenturNr: '600118803', strasse: 'Rüttenscheider Str. 40', plz: '45130', ort: 'Essen' },
    mail: {
      betreff: 'BÜ Hausrat Özdemir SH-2290418',
      text: `Hallo zusammen,

anbei die Vollmacht von Frau Özdemir (geb. 12.11.1979, Gartenweg 14, 45127 Essen).
Vertrag SH-2290418, Hausrat. Bitte auf uns umschreiben.

Danke und Grüße
S. Müller
VSM Versicherungsservice Müller e.K. | 600118803`,
      anhaenge: [MV('Oezdemir', '30.07.2026')]
    }
  },
  {
    id: 'BUE-2026-1043', eingang: '04.08.2026', sparte: 'Leben', vnr: 'LF-70902206', mvDatum: '21.07.2026',
    kunde: { nachname: 'Brandt', vorname: 'Kerstin', gebdat: '03.03.1971', strasse: 'Lindenallee 3', plz: '20144', ort: 'Hamburg' },
    makler: { name: 'Nils Petersen', firma: 'Petersen & Partner Assekuranzmakler', email: 'petersen@petersen-partner.de', agenturNr: '600203441', pool: 'Fonds Finanz Maklerservice GmbH', strasse: 'Rothenbaumchaussee 12', plz: '20148', ort: 'Hamburg' },
    mail: {
      betreff: 'Antrag auf Bestandsübertragung – Frau Kerstin Brandt',
      text: `Sehr geehrte Damen und Herren,

im Auftrag unserer Kundin beantragen wir die Bestandsübertragung.

  Versicherungsnehmerin: Kerstin Brandt, geboren am 03.03.1971
  Wohnhaft: Lindenallee 3, 20144 Hamburg
  Vertrag: LF-70902206 (Lebensversicherung)

Wir sind über die Fonds Finanz Maklerservice GmbH angebunden; die Untervollmacht
haben wir dem Schreiben ebenfalls beigefügt.

Mit freundlichen Grüßen
Nils Petersen
Petersen & Partner Assekuranzmakler
Vermittlernummer 600203441`,
      anhaenge: [MV('Brandt', '21.07.2026'), { name: 'Untervollmacht_Fonds_Finanz.pdf', typ: 'Untervollmacht', info: 'Poolanbindung' }]
    }
  },
  {
    id: 'BUE-2026-1044', eingang: '04.08.2026', sparte: 'Kranken', vnr: 'KV-88120347', mvDatum: '25.07.2026', postkorb: 'Gesundheit',
    kunde: { nachname: 'Lindqvist', vorname: 'Ole', gebdat: '19.09.1984', strasse: 'Am Stadtpark 27', plz: '30159', ort: 'Hannover' },
    makler: { name: 'Christine Fischer', firma: 'Fischer Assekuranzkontor GmbH', email: 'c.fischer@fischer-makler.de', agenturNr: '600330711', strasse: 'Georgstr. 5', plz: '30159', ort: 'Hannover' },
    mail: {
      betreff: 'Bestandsübertragung Krankenvollversicherung – Lindqvist',
      text: `Guten Tag,

wir übernehmen ab sofort die Betreuung von Herrn Ole Lindqvist (geb. 19.09.1984,
Am Stadtpark 27, 30159 Hannover). Betroffen ist die Krankenvollversicherung
KV-88120347.

Vollmacht im Anhang, unterschrieben am 25.07.2026.

Viele Grüße
Christine Fischer
Fischer Assekuranzkontor GmbH – 600330711`,
      anhaenge: [MV('Lindqvist', '25.07.2026')]
    }
  },
  {
    id: 'BUE-2026-1045', eingang: '05.08.2026', sparte: 'Haftpflicht', vnr: 'PH-6612088', mvDatum: '01.08.2026',
    kunde: { nachname: 'Wieczorek', vorname: 'Marek', gebdat: '02.02.1990', strasse: 'Bahnhofstr. 51', plz: '90402', ort: 'Nürnberg' },
    makler: { name: 'Stefan Bauer', firma: 'Bauer Finanz- und Versicherungsmakler', email: 'bauer@makler-bauer.de', agenturNr: '600445290', strasse: 'Königstr. 2', plz: '90402', ort: 'Nürnberg' },
    mail: {
      betreff: 'Vollmacht Wieczorek – Übertragung PH-6612088',
      text: `Moin,

Kunde Marek Wieczorek, 02.02.1990, Bahnhofstr. 51 in 90402 Nürnberg.
Privathaftpflicht PH-6612088 bitte auf unsere Nummer 600445290 übertragen.
Vollmacht hängt dran.

Beste Grüße
St. Bauer`,
      anhaenge: [MV('Wieczorek', '01.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1046', eingang: '05.08.2026', sparte: 'Wohngebäude', vnr: 'WG-3390155', mvDatum: '29.07.2026', vertriebskanal: 'AO', abgebend: 'Agentur 700188420 (Ausschließlichkeit)',
    kunde: { nachname: 'Ferreira', vorname: 'Ana', gebdat: '24.05.1968', strasse: 'Talstr. 19', plz: '70794', ort: 'Filderstadt' },
    makler: { name: 'Peter Wagner', firma: 'VFB Versicherungsmakler Wagner GmbH', email: 'pwagner@vfb-versicherung.de', agenturNr: '600512034', strasse: 'Marktplatz 7', plz: '70794', ort: 'Filderstadt' },
    mail: {
      betreff: 'Bestandsübertragung Wohngebäude, VN Ferreira, WG-3390155',
      text: `Sehr geehrte Damen und Herren,

Frau Ana Ferreira (geb. 24.05.1968, Talstr. 19, 70794 Filderstadt) hat uns mit der
Betreuung ihrer Verträge beauftragt. Wir bitten um Übertragung des Vertrages
WG-3390155 (Wohngebäude).

Die Maklervollmacht ist beigefügt.

Freundliche Grüße
Peter Wagner
VFB Versicherungsmakler Wagner GmbH, 600512034`,
      anhaenge: [MV('Ferreira', '29.07.2026')]
    }
  },
  {
    id: 'BUE-2026-1047', eingang: '06.08.2026', sparte: 'Unfall', vnr: 'UN-1180944', mvDatum: '31.07.2026',
    kunde: { nachname: 'Sassenberg', vorname: 'Ute', gebdat: '08.12.1975', strasse: 'Kirchweg 6', plz: '48143', ort: 'Münster' },
    makler: { name: 'Sabine Koch', firma: 'SKV Maklerkontor Koch', email: 'koch@skv-makler.de', vermittlerNr: '811774', strasse: 'Prinzipalmarkt 22', plz: '48143', ort: 'Münster' },
    mail: {
      betreff: 'BÜ Unfallversicherung Sassenberg',
      text: `Sehr geehrtes Team,

bitte übertragen Sie den Unfallvertrag UN-1180944 von Frau Ute Sassenberg
(geb. 08.12.1975, Kirchweg 6, 48143 Münster) auf uns.

Personalnummer 811774. Vollmacht anbei.

Mit besten Grüßen
Sabine Koch
SKV Maklerkontor`,
      anhaenge: [MV('Sassenberg', '31.07.2026')]
    }
  },
  {
    id: 'BUE-2026-1048', eingang: '06.08.2026', sparte: 'Kfz', vnr: 'KH-5520773', mvDatum: '30.07.2026',
    kunde: { nachname: 'Bergmann', vorname: 'Jonas', gebdat: '14.04.1995', strasse: 'Schillerstr. 44', plz: '04109', ort: 'Leipzig' },
    makler: { name: 'Klaus Becker', firma: 'Becker Assekuranz OHG', email: 'becker@becker-assekuranz.de', agenturNr: '600607318', strasse: 'Nikolaistr. 10', plz: '04109', ort: 'Leipzig' },
    mail: {
      betreff: 'WG: Vollmacht Bergmann / Kfz KH-5520773',
      text: `Sehr geehrte Damen und Herren,

weitergeleitet aus unserem Kundenpostfach – Herr Bergmann hat die Vollmacht
unterschrieben zurückgesendet.

Daten zum Vertrag:
VN: Jonas Bergmann, 14.04.1995
Adresse: Schillerstr. 44, 04109 Leipzig
Vertrag: KH-5520773, Kfz

Bitte um Übertragung auf 600607318.

Viele Grüße
Klaus Becker`,
      anhaenge: [MV('Bergmann', '30.07.2026')]
    }
  },
  {
    id: 'BUE-2026-1049', eingang: '07.08.2026', sparte: 'Rechtsschutz', vnr: 'RS-7741023', mvDatum: '24.07.2026',
    kunde: { nachname: 'Novak', vorname: 'Petra', gebdat: '30.06.1982', strasse: 'Uferstr. 2', plz: '60329', ort: 'Frankfurt am Main' },
    makler: { name: 'Martina Hoffmann', firma: 'MH Versicherungsmakler GmbH', email: 'hoffmann@mh-versicherungen.de', agenturNr: '600714556', pool: 'BCA AG', strasse: 'Taunusanlage 8', plz: '60329', ort: 'Frankfurt am Main' },
    mail: {
      betreff: 'Bestandsübertragung Rechtsschutz Novak RS-7741023',
      text: `Guten Morgen,

anbei Vollmacht und Untervollmacht für Frau Petra Novak
(geb. 30.06.1982, Uferstr. 2, 60329 Frankfurt am Main).

Vertrag RS-7741023. Anbindung über die BCA AG, unsere Nummer 600714556.

Freundliche Grüße
Martina Hoffmann`,
      anhaenge: [MV('Novak', '24.07.2026'), { name: 'Untervollmacht_BCA.pdf', typ: 'Untervollmacht', info: 'Poolanbindung' }]
    }
  },
  {
    id: 'BUE-2026-1050', eingang: '07.08.2026', sparte: 'Leben', vnr: 'LF-70855104', mvDatum: '02.08.2026',
    kunde: { nachname: 'Ivanović', vorname: 'Milan', gebdat: '17.10.1966', strasse: 'Rosenstr. 30', plz: '80331', ort: 'München' },
    makler: { name: 'Julia Richter', firma: 'Richter Finanzkonzepte GmbH', email: 'j.richter@richter-finanz.de', agenturNr: '600820119', strasse: 'Sendlinger Str. 15', plz: '80331', ort: 'München' },
    mail: {
      betreff: 'Übertragung Lebensversicherung Ivanović',
      text: `Sehr geehrte Damen und Herren,

wir bitten um Bestandsübertragung des Vertrages LF-70855104.

Versicherungsnehmer: Milan Ivanović
Geburtsdatum: 17.10.1966
Anschrift: Rosenstr. 30, 80331 München

Vollmacht vom 02.08.2026 im Anhang.

Mit freundlichen Grüßen
Julia Richter
Richter Finanzkonzepte GmbH, 600820119`,
      anhaenge: [MV('Ivanovic', '02.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1051', eingang: '10.08.2026', sparte: 'Kranken', vnr: 'KV-88450210', mvDatum: '04.08.2026', postkorb: 'Gesundheit',
    kunde: { nachname: 'Achebe', vorname: 'Chidi', gebdat: '05.01.1992', strasse: 'Hafenstr. 61', plz: '28217', ort: 'Bremen' },
    makler: { name: 'Frank Schulz', firma: 'Schulz Versicherungsmakler', email: 'schulz@schulz-makler.de', agenturNr: '600901744', strasse: 'Am Wall 100', plz: '28195', ort: 'Bremen' },
    mail: {
      betreff: 'Krankenzusatz KV-88450210 – Betreuungswechsel',
      text: `Hallo,

Herr Chidi Achebe (05.01.1992, Hafenstr. 61, 28217 Bremen) wechselt zu uns.
Es geht um die Krankenzusatzversicherung KV-88450210.

Unterschriebene Vollmacht anbei, 600901744.

Gruß
F. Schulz`,
      anhaenge: [MV('Achebe', '04.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1052', eingang: '10.08.2026', sparte: 'Hausrat', vnr: 'SH-2310665', mvDatum: '03.08.2026',
    kunde: { nachname: 'Grabowski', vorname: 'Lena', gebdat: '23.08.1987', strasse: 'Poststr. 12', plz: '01067', ort: 'Dresden' },
    makler: { name: 'Petra Wolf', firma: 'Wolf Assekuranz GmbH', email: 'p.wolf@wolf-assekuranz.de', agenturNr: '601011238', strasse: 'Wilsdruffer Str. 4', plz: '01067', ort: 'Dresden' },
    mail: {
      betreff: 'Bestandsübertragung Hausrat, Grabowski, SH-2310665',
      text: `Sehr geehrte Damen und Herren,

anbei die Maklervollmacht für Frau Lena Grabowski, geboren am 23.08.1987,
wohnhaft Poststr. 12, 01067 Dresden.

Wir bitten um Übertragung des Hausratvertrages SH-2310665 auf unsere
Vermittlernummer 601011238.

Für Rückfragen stehen wir gerne zur Verfügung.

Mit freundlichen Grüßen
Petra Wolf
Wolf Assekuranz GmbH`,
      anhaenge: [MV('Grabowski', '03.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1053', eingang: '11.08.2026', sparte: 'Kfz', vnr: 'KH-4610937', mvDatum: '05.08.2026',
    kunde: { nachname: 'Tan', vorname: 'Mei-Ling', gebdat: '11.03.1993', strasse: 'Ringstr. 8', plz: '76133', ort: 'Karlsruhe' },
    makler: { name: 'Ralf Schäfer', firma: 'RS Versicherungsmakler e.K.', email: 'schaefer@rs-versicherungen.de', agenturNr: '601122907', strasse: 'Kaiserstr. 60', plz: '76133', ort: 'Karlsruhe' },
    mail: {
      betreff: 'BÜ Kfz Tan',
      text: `Guten Tag,

bitte Vertrag KH-4610937 (Kfz) von Frau Mei-Ling Tan, geb. 11.03.1993,
Ringstr. 8, 76133 Karlsruhe, auf uns übertragen. Nummer 601122907.

Vollmacht im Anhang.

Danke!
Ralf Schäfer`,
      anhaenge: [MV('Tan', '05.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1054', eingang: '11.08.2026', sparte: 'Leben', vnr: 'LF-70611488', mvDatum: '06.08.2026', vertriebskanal: 'AO', abgebend: 'Agentur 700455018 (Ausschließlichkeit)',
    kunde: { nachname: 'Baumgartner', vorname: 'Roland', gebdat: '27.02.1959', strasse: 'Feldweg 21', plz: '93047', ort: 'Regensburg' },
    makler: { name: 'Monika Neumann', firma: 'Neumann Maklerbüro', email: 'neumann@neumann-makler.de', agenturNr: '601233470', strasse: 'Maximilianstr. 3', plz: '93047', ort: 'Regensburg' },
    mail: {
      betreff: 'Übertragung LF-70611488 Baumgartner',
      text: `Sehr geehrte Damen und Herren,

Herr Roland Baumgartner, geb. 27.02.1959, Feldweg 21, 93047 Regensburg,
möchte künftig von uns betreut werden.

Vertrag: LF-70611488
Unsere Nummer: 601233470

Die Vollmacht vom 06.08.2026 liegt bei.

Mit freundlichen Grüßen
Monika Neumann`,
      anhaenge: [MV('Baumgartner', '06.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1055', eingang: '12.08.2026', sparte: 'Haftpflicht', vnr: 'PH-6790321', mvDatum: '07.08.2026',
    kunde: { nachname: 'Deniz', vorname: 'Ferhat', gebdat: '09.09.1981', strasse: 'Lange Reihe 55', plz: '20099', ort: 'Hamburg' },
    makler: { name: 'Jürgen Schwarz', firma: 'JSM Versicherungsmakler GmbH', email: 'schwarz@jsm-versicherung.de', agenturNr: '601344602', strasse: 'Ballindamm 9', plz: '20095', ort: 'Hamburg' },
    mail: {
      betreff: 'Maklerwechsel Deniz – PH-6790321',
      text: `Hallo liebes Team,

Herr Ferhat Deniz (09.09.1981) aus der Lange Reihe 55, 20099 Hamburg,
hat uns beauftragt. Bitte Vertrag PH-6790321 umschreiben auf 601344602.

Vollmacht ist dabei.

Schöne Grüße
Jürgen Schwarz`,
      anhaenge: [MV('Deniz', '07.08.2026')]
    }
  },

  // -------------------------------------------- weiche Business Exceptions
  {
    id: 'BUE-2026-1056', eingang: '12.08.2026', sparte: 'Kfz', vnr: 'KH-4702551', mvDatum: '01.08.2026',
    kunde: { nachname: 'Krämer', vorname: 'Sophie', gebdat: '16.05.1986', strasse: 'Blumenstr. 9', plz: '55116', ort: 'Mainz' },
    makler: { name: 'Angelika Braun', firma: 'AB Finanzservice GmbH', email: 'braun@ab-finanzservice.de', agenturNr: '601455139', strasse: 'Schillerplatz 1', plz: '55116', ort: 'Mainz' },
    deckblatt: { kundeGebdat: '' },
    mail: {
      betreff: 'Bestandsübertragung Krämer KH-4702551',
      text: `Sehr geehrte Damen und Herren,

bitte übertragen Sie den Kfz-Vertrag KH-4702551 von Frau Sophie Krämer,
Blumenstr. 9, 55116 Mainz, auf uns (601455139).

Vollmacht anbei.

Mit freundlichen Grüßen
Angelika Braun
AB Finanzservice GmbH`,
      anhaenge: [MV('Kraemer', '01.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1057', eingang: '13.08.2026', sparte: 'Leben', vnr: 'LF-70344871', mvDatum: '28.07.2026',
    kunde: { nachname: 'Hoffmann', vorname: 'Andrea', gebdat: '04.04.1974', strasse: 'Domstr. 17', plz: '50668', ort: 'Köln' },
    makler: { name: 'Werner Zimmermann', firma: 'WZ Maklerkontor', email: 'zimmermann@wz-makler.de', agenturNr: '601566284', strasse: 'Hohenzollernring 30', plz: '50672', ort: 'Köln' },
    deckblatt: { mvVnNachname: 'Hoffmann', mvVnVorname: 'Michael' },
    bestand: { vorname: 'Andrea' },
    mail: {
      betreff: 'BÜ Lebensversicherung Hoffmann',
      text: `Sehr geehrte Damen und Herren,

anbei die Maklervollmacht der Familie Hoffmann. Es geht um den Vertrag
LF-70344871, Versicherungsnehmerin ist Frau Andrea Hoffmann,
geb. 04.04.1974, Domstr. 17, 50668 Köln.

Unsere Vermittlernummer: 601566284.

Mit freundlichen Grüßen
Werner Zimmermann
WZ Maklerkontor`,
      anhaenge: [{ name: 'Maklervollmacht_Hoffmann.pdf', typ: 'Vollmacht', info: 'unterschrieben von Michael Hoffmann' }]
    }
  },
  {
    id: 'BUE-2026-1058', eingang: '13.08.2026', sparte: 'Hausrat', vnr: 'SH-2088740', mvDatum: '05.08.2026',
    kunde: { nachname: 'Reinhardt', vorname: 'Til', gebdat: '21.01.1990', strasse: 'Parkstr. 4', plz: '39104', ort: 'Magdeburg' },
    makler: { name: 'Elisabeth Hartmann', firma: 'Hartmann Versicherungsmakler GmbH', email: 'hartmann@hartmann-versicherungen.de', agenturNr: '601677395', pool: 'Fonds Finanz Maklerservice GmbH', strasse: 'Breiter Weg 200', plz: '39104', ort: 'Magdeburg' },
    deckblatt: { uvFehlt: 'ja', uvErteilt: 'nein', mvStatus: 'MV unvollständig' },
    mail: {
      betreff: 'Bestandsübertragung Reinhardt, SH-2088740',
      text: `Guten Tag,

wir übernehmen die Betreuung von Herrn Til Reinhardt (21.01.1990,
Parkstr. 4, 39104 Magdeburg), Vertrag SH-2088740.

Anbindung über Fonds Finanz. Vollmacht ist beigefügt.

Mit freundlichen Grüßen
Elisabeth Hartmann
Hartmann Versicherungsmakler GmbH, 601677395`,
      anhaenge: [MV('Reinhardt', '05.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1059', eingang: '14.08.2026', sparte: 'Kfz', vnr: 'KH-4288016', mvDatum: '22.07.2026',
    kunde: { nachname: 'Steinbach', vorname: 'Marius', gebdat: '13.07.1983', strasse: 'Hauptstr. 78', plz: '69117', ort: 'Heidelberg' },
    makler: { name: 'Hans Klein', firma: 'Klein Maklerbüro', email: 'klein@klein-makler.de', agenturNr: '601788401', strasse: 'Bergheimer Str. 5', plz: '69115', ort: 'Heidelberg' },
    bestand: { vertragsstatus: 'storniert zum 30.06.2026' },
    mail: {
      betreff: 'Übertragung Kfz-Vertrag Steinbach',
      text: `Sehr geehrte Damen und Herren,

Herr Marius Steinbach (13.07.1983, Hauptstr. 78, 69117 Heidelberg) hat uns
mandatiert. Bitte den Vertrag KH-4288016 auf uns übertragen, 601788401.

Vollmacht liegt bei.

Mit freundlichen Grüßen
Hans Klein`,
      anhaenge: [MV('Steinbach', '22.07.2026')]
    }
  },
  {
    id: 'BUE-2026-1060', eingang: '14.08.2026', sparte: 'Unfall', vnr: 'UN-1244390', mvDatum: '08.08.2026',
    kunde: { nachname: 'Vogel', vorname: 'Ilona', gebdat: '02.10.1965', strasse: 'Seestr. 11', plz: '78462', ort: 'Konstanz' },
    makler: { name: 'Andrea Weber', firma: 'Finanzkonzepte Weber', email: 'weber@finanzkonzepte.de', agenturNr: '601899572', strasse: 'Marktstätte 14', plz: '78462', ort: 'Konstanz' },
    bestand: { zusammenarbeit: false },
    mail: {
      betreff: 'BÜ Unfall Vogel UN-1244390',
      text: `Hallo,

Frau Ilona Vogel, geb. 02.10.1965, Seestr. 11, 78462 Konstanz, wechselt zu uns.
Vertrag UN-1244390 bitte übertragen. Vollmacht anbei.

Grüße
A. Weber
Finanzkonzepte Weber, 601899572`,
      anhaenge: [MV('Vogel', '08.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1061', eingang: '17.08.2026', sparte: 'Wohngebäude', vnr: 'WG-3477201', mvDatum: '11.08.2026',
    kunde: { nachname: 'Kowalczyk', vorname: 'Bernd', gebdat: '06.06.1978', strasse: 'Ahornweg 2', plz: '33098', ort: 'Paderborn' },
    makler: { name: 'Michael Schmidt', firma: 'Schmidt Finanz- und Versicherungskontor', email: 'm.schmidt@schmidt-finanz.de', agenturNr: '602011663', strasse: 'Westernstr. 40', plz: '33098', ort: 'Paderborn' },
    deckblatt: { kundeStrasse: 'Ahornweg 2', kundePlz: '33098', anfUnterlagen: 'ja', artUnterlagen: 'Police; Nachtrag zur Gebäudeversicherung; Schadenaufstellung der letzten 5 Jahre' },
    bestand: { strasse: 'Lindenstr. 9', plz: '33100' },
    mail: {
      betreff: 'Bestandsübertragung Kowalczyk + Unterlagenanforderung',
      text: `Sehr geehrte Damen und Herren,

wir bitten um Übertragung des Vertrages WG-3477201 auf unsere Nummer 602011663.

Versicherungsnehmer: Bernd Kowalczyk, geb. 06.06.1978
Anschrift (neu): Ahornweg 2, 33098 Paderborn

Bitte senden Sie uns zusätzlich die Police, den Nachtrag zur
Gebäudeversicherung sowie eine Schadenaufstellung der letzten fünf Jahre zu.

Mit freundlichen Grüßen
Michael Schmidt
Schmidt Finanz- und Versicherungskontor`,
      anhaenge: [MV('Kowalczyk', '11.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1062', eingang: '17.08.2026', sparte: 'Leben', vnr: 'LF-70129553', mvDatum: '30.07.2026',
    kunde: { nachname: 'Bauer', vorname: 'Katharina', gebdat: '15.12.1972', strasse: 'Mühlgasse 3', plz: '99084', ort: 'Erfurt' },
    makler: { name: 'Dieter Lehmann', firma: 'Lehmann Assekuranz', email: 'lehmann@lehmann-assekuranz.de', agenturNr: '602122774', strasse: 'Anger 50', plz: '99084', ort: 'Erfurt' },
    bestand: { bereitsUebertragen: true, agenturInhaber: 'Lehmann Assekuranz (602122774)' },
    mail: {
      betreff: 'Nachfrage Bestandsübertragung Bauer LF-70129553',
      text: `Sehr geehrte Damen und Herren,

wir hatten die Übertragung des Vertrages LF-70129553 für Frau Katharina Bauer
(15.12.1972, Mühlgasse 3, 99084 Erfurt) bereits im Juni beantragt und bislang
keine Bestätigung erhalten. Zur Sicherheit reichen wir die Vollmacht erneut ein.

Bitte um kurze Rückmeldung zum Stand.

Mit freundlichen Grüßen
Dieter Lehmann
Lehmann Assekuranz, 602122774`,
      anhaenge: [MV('Bauer', '30.07.2026')]
    },
    deckblatt: { reminder: 'ja' }
  },
  {
    id: 'BUE-2026-1063', eingang: '18.08.2026', sparte: 'Kranken', vnr: 'KV-88771205', mvDatum: '', postkorb: 'Gesundheit',
    kunde: { nachname: 'Solberg', vorname: 'Anne', gebdat: '28.03.1989', strasse: 'Nordring 7', plz: '24103', ort: 'Kiel' },
    makler: { name: 'Birgit Krause', firma: 'Krause Versicherungsmakler', email: 'krause@krause-makler.de', agenturNr: '602233885', strasse: 'Holstenstr. 12', plz: '24103', ort: 'Kiel' },
    deckblatt: { mvUnterschriftKunde: 'nicht prüfbar', mvUnterschriftsdatum: '', mvStatus: 'MV unvollständig' },
    mail: {
      betreff: 'Vollmacht Solberg – Krankenversicherung',
      text: `Guten Tag,

anbei der Scan der Vollmacht von Frau Anne Solberg (28.03.1989,
Nordring 7, 24103 Kiel) für den Vertrag KV-88771205.

Bitte um Übertragung auf 602233885.

Viele Grüße
Birgit Krause`,
      anhaenge: [{ name: 'Vollmacht_Solberg_Scan.pdf', typ: 'Vollmacht', info: 'Unterschriftsfeld nicht lesbar, kein Datum' }]
    }
  },
  {
    id: 'BUE-2026-1064', eingang: '18.08.2026', sparte: 'Kfz', vnr: 'KH-4915662', mvDatum: '12.08.2026',
    kunde: { nachname: 'Yildiz', vorname: 'Emre', gebdat: '19.07.1994', strasse: 'Industriestr. 45', plz: '44137', ort: 'Dortmund' },
    makler: { name: 'Oliver Schmitz', firma: 'Schmitz & Co. Assekuranzmakler', email: 'schmitz@schmitz-assekuranz.de', agenturNr: '602344996', strasse: 'Hansastr. 6', plz: '44137', ort: 'Dortmund' },
    bestand: { courtagefortzahler: true },
    mail: {
      betreff: 'Bestandsübertragung Yildiz KH-4915662',
      text: `Sehr geehrte Damen und Herren,

bitte übertragen Sie den Kfz-Vertrag KH-4915662 von Herrn Emre Yildiz
(19.07.1994, Industriestr. 45, 44137 Dortmund) auf unsere Nummer 602344996.

Die unterschriebene Vollmacht ist beigefügt.

Mit freundlichen Grüßen
Oliver Schmitz
Schmitz & Co. Assekuranzmakler`,
      anhaenge: [MV('Yildiz', '12.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1065', eingang: '19.08.2026', sparte: 'Haftpflicht', vnr: 'PH-6033889', mvDatum: '09.08.2026',
    kunde: { nachname: 'Fuchs', vorname: 'Gisela', gebdat: '01.11.1961', strasse: 'Rathausplatz 8', plz: '86150', ort: 'Augsburg' },
    makler: { name: 'Karin Lehmann', firma: 'KL Versicherungsvermittlung', email: '', agenturNr: '', vermittlerNr: '', strasse: 'Maximilianstr. 22', plz: '86150', ort: 'Augsburg' },
    deckblatt: { maklerEmail: '', agenturNr: '', vermittlerNr: '' },
    bestand: { vermittlerGefunden: false },
    mail: {
      betreff: 'Vollmacht',
      text: `Sehr geehrte Damen und Herren,

anbei die Vollmacht für Frau Gisela Fuchs, Rathausplatz 8, 86150 Augsburg,
geb. 01.11.1961.

Vertrag PH-6033889.

Mit freundlichen Grüßen
K. Lehmann`,
      anhaenge: [MV('Fuchs', '09.08.2026')]
    }
  },

  // ------------------------------------------ harte Kriterien nicht erfüllt
  {
    id: 'BUE-2026-1066', eingang: '19.08.2026', sparte: 'Leben', vnr: 'LF-70988112', mvDatum: '',
    kunde: { nachname: 'Wendt', vorname: 'Gregor', gebdat: '25.02.1977', strasse: 'Eichenweg 15', plz: '18055', ort: 'Rostock' },
    makler: { name: 'Susanne Werner', firma: 'Werner Assekuranzservice', email: 'werner@werner-assekuranz.de', agenturNr: '602456007', strasse: 'Kröpeliner Str. 30', plz: '18055', ort: 'Rostock' },
    deckblatt: { mvEnthalten: 'nein', mvStatus: 'kein Anhang', mvAufMakler: 'nicht prüfbar', mvVollumfaenglich: 'nicht prüfbar', mvUnterschriftKunde: 'nicht prüfbar', mvUnterschriftsdatum: '' },
    mail: {
      betreff: 'Bestandsübertragung Wendt LF-70988112 – Vollmacht folgt',
      text: `Sehr geehrte Damen und Herren,

wir beantragen die Bestandsübertragung für Herrn Gregor Wendt
(25.02.1977, Eichenweg 15, 18055 Rostock), Vertrag LF-70988112.

Die Maklervollmacht wurde vom Kunden unterschrieben und geht Ihnen in den
nächsten Tagen per Post zu. Bitte merken Sie den Vorgang bereits vor.

Mit freundlichen Grüßen
Susanne Werner
Werner Assekuranzservice, 602456007`,
      anhaenge: []
    }
  },
  {
    id: 'BUE-2026-1067', eingang: '20.08.2026', sparte: 'Kfz', vnr: '', mvDatum: '13.08.2026',
    kunde: { nachname: 'Mahler', vorname: 'Doris', gebdat: '07.05.1969', strasse: 'Grüner Weg 3', plz: '34117', ort: 'Kassel' },
    makler: { name: 'Bernd Schmitt', firma: 'Schmitt Maklerkontor', email: 'schmitt@schmitt-makler.de', agenturNr: '602567118', strasse: 'Obere Königsstr. 20', plz: '34117', ort: 'Kassel' },
    deckblatt: { vnr: '' },
    bestand: { vertragGefunden: false },
    mail: {
      betreff: 'Neue Kundin – Betreuungsübernahme Mahler',
      text: `Hallo zusammen,

Frau Doris Mahler (07.05.1969, Grüner Weg 3, 34117 Kassel) hat uns beauftragt.
Sie hat mehrere Verträge bei Ihnen, die Nummern liegen uns leider nicht vor.

Können Sie uns bitte mitteilen, welche Verträge bestehen? Die Vollmacht
haben wir beigefügt.

Danke und viele Grüße
Bernd Schmitt
Schmitt Maklerkontor, 602567118`,
      anhaenge: [MV('Mahler', '13.08.2026')]
    }
  },
  {
    id: 'BUE-2026-1068', eingang: '20.08.2026', sparte: 'Hausrat', vnr: 'SH-2455901', mvDatum: '14.08.2026',
    kunde: { nachname: 'Pohl', vorname: 'Nadine', gebdat: '18.06.1985', strasse: 'Weststr. 27', plz: '52062', ort: 'Aachen' },
    makler: { name: 'Roland Huber', firma: 'Huber Versicherungsmakler', email: 'huber@huber-makler.de', agenturNr: '602678229', strasse: 'Markt 3', plz: '52062', ort: 'Aachen' },
    deckblatt: { klassifikation: 'Anfrage-Rücksprache', wunschVorhanden: 'nein' },
    mail: {
      betreff: 'Frage zum Vertrag SH-2455901',
      text: `Guten Tag,

unsere Kundin Frau Nadine Pohl (18.06.1985, Weststr. 27, 52062 Aachen)
überlegt, den Hausratvertrag SH-2455901 anzupassen.

Können Sie uns vorab mitteilen, welche Deckungssummen aktuell hinterlegt
sind und ob eine Fahrraddeckung eingeschlossen ist? Eine Übertragung ist
zum jetzigen Zeitpunkt noch nicht gewünscht.

Mit freundlichen Grüßen
Roland Huber
Huber Versicherungsmakler, 602678229`,
      anhaenge: [MV('Pohl', '14.08.2026')]
    }
  }
]

export const VORGAENGE = SPECS.map(baue)

export const SPARTEN_FILTER = [...new Set(VORGAENGE.map(v => v.sparte))].sort()

/** Leeres Deckblatt – alle Felder, die die Prüfungen lesen. */
export const LEERES_DECKBLATT = {
  vermittlerTyp: 'Makler',
  kundeNachname: '', kundeVorname: '', kundeGebdat: '',
  kundeStrasse: '', kundePlz: '', kundeOrt: '',
  vnr: '', sparte: '',
  mvVnNachname: '', mvVnVorname: '',
  pool: '', vermittlerName: '', agenturNr: '', vermittlerNr: '',
  maklerEmail: '', maklerStrasse: '', maklerPlz: '', maklerOrt: '',
  klassifikation: '', wunschVorhanden: 'nein', pruefungUnterlagen: '', reminder: 'nein',
  mvEnthalten: 'nein', mvStatus: '', mvAufMakler: 'nicht prüfbar',
  mvVollumfaenglich: 'nicht prüfbar', mvUnterschriftKunde: 'nicht prüfbar',
  uvErteilt: 'nein', uvFehlt: 'nein',
  mvUnterschriftsdatum: '', mvEingangsdatum: '',
  anfUnterlagen: 'nein', artUnterlagen: ''
}

/**
 * Baut einen Vorgang aus selbst eingelesenen Feldern.
 * Die Rückgaben der Bestandsführung sind im Showcase nicht real abrufbar; sie
 * werden mit den gelesenen Werten vorbelegt und lassen sich im Panel ändern,
 * damit sich einzelne Business Exceptions gezielt vorführen lassen.
 */
export function baueEigenenVorgang({ mail, deckblatt, bestand = {} }) {
  const d = { ...LEERES_DECKBLATT, ...deckblatt }
  const kunde = [d.kundeNachname, d.kundeVorname].filter(Boolean).join(', ') || 'Unbekannt'
  return {
    id: 'Eigener Eingang',
    eingang: mail.datum,
    sparte: d.sparte || 'Sonstige',
    postkorb: d.sparte === 'Kranken' ? 'Gesundheit' : 'Komposit / Leben',
    kunde,
    mail,
    deckblatt: d,
    bestand: {
      vertragGefunden: true,
      vertragsstatus: 'aktiv',
      nachname: d.kundeNachname,
      vorname: d.kundeVorname,
      gebdat: d.kundeGebdat,
      strasse: d.kundeStrasse,
      plz: d.kundePlz,
      bereitsUebertragen: false,
      agenturInhaber: 'abgebender Vermittler',
      vermittlerGefunden: Boolean(d.agenturNr || d.vermittlerNr),
      anbindung: 'aktiv',
      zusammenarbeit: true,
      courtagefortzahler: false,
      vertriebskanal: 'Makler',
      ...bestand
    }
  }
}
