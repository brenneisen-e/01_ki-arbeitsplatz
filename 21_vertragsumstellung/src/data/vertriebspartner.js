// ============================================================
// Demodaten: Vertriebspartner der Sparkassen (Bankenvertrieb).
//
// Für drei Referenzinstitute (groß / mittel / klein) sind die
// Listen handkuratiert:
//   osd      Ostsächsische Sparkasse Dresden   14 Einträge, 22 % der Produktion
//   vogtland Sparkasse Vogtland                11 Einträge, 48 % der Produktion
//   doebeln  Kreissparkasse Döbeln              8 Einträge, 72 % der Produktion
//
// Für alle übrigen Institute erzeugt erzeugeVertriebspartner()
// die vollständige Liste deterministisch (mulberry32 mit festem
// Seed aus der Instituts-ID). Kein Math.random zur Laufzeit -
// die Zahlen sind bei jedem Laden identisch.
//
// Die Produktionssummen einer erzeugten Liste ergeben exakt das
// Neugeschäft des Instituts aus sparkassen.js (Restbetrag wird
// auf den größten Eintrag gebucht).
//
// Alle Personennamen sind frei erfundene Kunstnamen.
// ============================================================

import { rng, seedAus, normal, runde } from '../lib/rng'
import { institutNachId } from './sparkassen'
import {
  istParameterSparkassen as P, kompositMischsatz, apLebenIst, apKompositIst,
} from './modellParameterIst'

export const vertriebspartnerKuratiert = {
  osd: {
    abdeckungsgradProduktion: 0.22,
    eintraege: [
      {
        id: 'osd-vp-01',
        institutId: 'osd',
        name: 'Katrin Löffler',
        geschaeftsstelle: 'Dresden-Altmarkt',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2011,
        produktion: { lebenBeitragssumme: 2469388, lebenStueck: 102, kompositJahresbeitrag: 65135, kompositStueck: 307 },
        betreuterBestand: { lebenJahresbeitrag: 925993, kompositJahresbeitrag: 783543 },
        qualitaet: {
          stornoquoteLeben: 3.6,
          mittlereBeitragsdurationLeben: 21,
          weiterbildungsstunden: 92,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 24,
          zielerreichung: 1.14,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'laufendesModell',
        istVerguetungsbeitrag: { apLeben: 81243, apKomposit: 45269, bestandsprovision: 36356, bonusanteil: 9348, summe: 172216 },
      },
      {
        id: 'osd-vp-02',
        institutId: 'osd',
        name: 'Marcus Reinhardt',
        geschaeftsstelle: 'Dresden-Neustadt',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2014,
        produktion: { lebenBeitragssumme: 2321224, lebenStueck: 106, kompositJahresbeitrag: 59771, kompositStueck: 282 },
        betreuterBestand: { lebenJahresbeitrag: 870434, kompositJahresbeitrag: 719017 },
        qualitaet: {
          stornoquoteLeben: 4.4,
          mittlereBeitragsdurationLeben: 19,
          weiterbildungsstunden: 88,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 22,
          zielerreichung: 1.06,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 76368, apKomposit: 41541, bestandsprovision: 33362, bonusanteil: 8101, summe: 159372 },
      },
      {
        id: 'osd-vp-03',
        institutId: 'osd',
        name: 'Ines Naumann',
        geschaeftsstelle: 'Dresden-Striesen',
        rolle: 'Individualkundenberater',
        imVertriebSeit: 2009,
        produktion: { lebenBeitragssumme: 1506327, lebenStueck: 64, kompositJahresbeitrag: 78162, kompositStueck: 368 },
        betreuterBestand: { lebenJahresbeitrag: 564856, kompositJahresbeitrag: 940252 },
        qualitaet: {
          stornoquoteLeben: 3.9,
          mittlereBeitragsdurationLeben: 20.5,
          weiterbildungsstunden: 96,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 18,
          zielerreichung: 1.09,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'laufendesModell',
        istVerguetungsbeitrag: { apLeben: 49558, apKomposit: 54323, bestandsprovision: 43628, bonusanteil: 7339, summe: 154848 },
      },
      {
        id: 'osd-vp-04',
        institutId: 'osd',
        name: 'Thomas Grunert',
        geschaeftsstelle: 'Pirna',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2007,
        produktion: { lebenBeitragssumme: 2173061, lebenStueck: 108, kompositJahresbeitrag: 54407, kompositStueck: 256 },
        betreuterBestand: { lebenJahresbeitrag: 814874, kompositJahresbeitrag: 654490 },
        qualitaet: {
          stornoquoteLeben: 5.1,
          mittlereBeitragsdurationLeben: 17.5,
          weiterbildungsstunden: 74,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 16,
          zielerreichung: 0.96,
          qualitaetsstufeAuszahlungsgrad: 75,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 71494, apKomposit: 37813, bestandsprovision: 30368, bonusanteil: 6801, summe: 146476 },
      },
      {
        id: 'osd-vp-05',
        institutId: 'osd',
        name: 'Silke Habermann',
        geschaeftsstelle: 'Freital',
        rolle: 'Geschäftsstellenleiter',
        imVertriebSeit: 2005,
        produktion: { lebenBeitragssumme: 1160612, lebenStueck: 45, kompositJahresbeitrag: 50575, kompositStueck: 238 },
        betreuterBestand: { lebenJahresbeitrag: 435217, kompositJahresbeitrag: 608393 },
        qualitaet: {
          stornoquoteLeben: 3.2,
          mittlereBeitragsdurationLeben: 22.5,
          weiterbildungsstunden: 98,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 20,
          zielerreichung: 1.21,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'laufendesModell',
        istVerguetungsbeitrag: { apLeben: 38184, apKomposit: 35150, bestandsprovision: 28229, bonusanteil: 5751, summe: 107314 },
      },
      {
        id: 'osd-vp-06',
        institutId: 'osd',
        name: 'Ronny Kaltofen',
        geschaeftsstelle: 'Radeberg',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2018,
        produktion: { lebenBeitragssumme: 1950816, lebenStueck: 94, kompositJahresbeitrag: 72031, kompositStueck: 339 },
        betreuterBestand: { lebenJahresbeitrag: 731535, kompositJahresbeitrag: 866499 },
        qualitaet: {
          stornoquoteLeben: 4.8,
          mittlereBeitragsdurationLeben: 18,
          weiterbildungsstunden: 82,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 14,
          zielerreichung: 1.02,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 64182, apKomposit: 50062, bestandsprovision: 40206, bonusanteil: 7553, summe: 162003 },
      },
      {
        id: 'osd-vp-07',
        institutId: 'osd',
        name: 'Peggy Zschoche',
        geschaeftsstelle: 'Sebnitz',
        rolle: 'Individualkundenberater',
        imVertriebSeit: 2013,
        produktion: { lebenBeitragssumme: 1284082, lebenStueck: 57, kompositJahresbeitrag: 67434, kompositStueck: 318 },
        betreuterBestand: { lebenJahresbeitrag: 481517, kompositJahresbeitrag: 811199 },
        qualitaet: {
          stornoquoteLeben: 4.1,
          mittlereBeitragsdurationLeben: 19.5,
          weiterbildungsstunden: 90,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 17,
          zielerreichung: 1.04,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 42246, apKomposit: 46867, bestandsprovision: 37640, bonusanteil: 6007, summe: 132760 },
      },
      {
        id: 'osd-vp-08',
        institutId: 'osd',
        name: 'Dirk Wenzel',
        geschaeftsstelle: 'Dresden-Gorbitz',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2016,
        produktion: { lebenBeitragssumme: 2049592, lebenStueck: 115, kompositJahresbeitrag: 47510, kompositStueck: 224 },
        betreuterBestand: { lebenJahresbeitrag: 768575, kompositJahresbeitrag: 571523 },
        qualitaet: {
          stornoquoteLeben: 6.2,
          mittlereBeitragsdurationLeben: 15.5,
          weiterbildungsstunden: 61,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 12,
          zielerreichung: 0.87,
          qualitaetsstufeAuszahlungsgrad: 75,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 67432, apKomposit: 33019, bestandsprovision: 26519, bonusanteil: 5664, summe: 132634 },
      },
      {
        id: 'osd-vp-09',
        institutId: 'osd',
        name: 'Annett Kirsten',
        geschaeftsstelle: 'Heidenau',
        rolle: 'Vermögensberater',
        imVertriebSeit: 2010,
        produktion: { lebenBeitragssumme: 1753265, lebenStueck: 66, kompositJahresbeitrag: 26054, kompositStueck: 123 },
        betreuterBestand: { lebenJahresbeitrag: 657455, kompositJahresbeitrag: 313417 },
        qualitaet: {
          stornoquoteLeben: 2.9,
          mittlereBeitragsdurationLeben: 23,
          weiterbildungsstunden: 94,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 26,
          zielerreichung: 1.18,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'laufendesModell',
        istVerguetungsbeitrag: { apLeben: 57682, apKomposit: 18108, bestandsprovision: 14543, bonusanteil: 5797, summe: 96130 },
      },
      {
        id: 'osd-vp-10',
        institutId: 'osd',
        name: 'Uwe Schindler',
        geschaeftsstelle: 'Dippoldiswalde',
        rolle: 'Geschäftsstellenleiter',
        imVertriebSeit: 2003,
        produktion: { lebenBeitragssumme: 1086531, lebenStueck: 47, kompositJahresbeitrag: 44445, kompositStueck: 209 },
        betreuterBestand: { lebenJahresbeitrag: 407437, kompositJahresbeitrag: 534652 },
        qualitaet: {
          stornoquoteLeben: 3.8,
          mittlereBeitragsdurationLeben: 20,
          weiterbildungsstunden: 86,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 19,
          zielerreichung: 1.07,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'laufendesModell',
        istVerguetungsbeitrag: { apLeben: 35747, apKomposit: 30889, bestandsprovision: 24808, bonusanteil: 4621, summe: 96065 },
      },
      {
        id: 'osd-vp-11',
        institutId: 'osd',
        name: 'Franziska Bergmann',
        geschaeftsstelle: 'Dresden-Blasewitz',
        rolle: 'Vermögensberater',
        imVertriebSeit: 2019,
        produktion: { lebenBeitragssumme: 1679184, lebenStueck: 66, kompositJahresbeitrag: 23755, kompositStueck: 112 },
        betreuterBestand: { lebenJahresbeitrag: 629676, kompositJahresbeitrag: 285761 },
        qualitaet: {
          stornoquoteLeben: 3.1,
          mittlereBeitragsdurationLeben: 22,
          weiterbildungsstunden: 97,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 23,
          zielerreichung: 1.15,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'laufendesModell',
        istVerguetungsbeitrag: { apLeben: 55245, apKomposit: 16510, bestandsprovision: 13259, bonusanteil: 5348, summe: 90362 },
      },
      {
        id: 'osd-vp-12',
        institutId: 'osd',
        name: 'Steffen Malik',
        geschaeftsstelle: 'Dresden-Altmarkt',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2021,
        produktion: { lebenBeitragssumme: 1407551, lebenStueck: 74, kompositJahresbeitrag: 56706, kompositStueck: 267 },
        betreuterBestand: { lebenJahresbeitrag: 527816, kompositJahresbeitrag: 682146 },
        qualitaet: {
          stornoquoteLeben: 5.6,
          mittlereBeitragsdurationLeben: 16.5,
          weiterbildungsstunden: 78,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 11,
          zielerreichung: 0.92,
          qualitaetsstufeAuszahlungsgrad: 75,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 46308, apKomposit: 39411, bestandsprovision: 31652, bonusanteil: 5111, summe: 122482 },
      },
      {
        id: 'osd-vp-13',
        institutId: 'osd',
        name: 'Kerstin Pohlers',
        geschaeftsstelle: 'Bischofswerda',
        rolle: 'Individualkundenberater',
        imVertriebSeit: 2012,
        produktion: { lebenBeitragssumme: 1210000, lebenStueck: 57, kompositJahresbeitrag: 62070, kompositStueck: 293 },
        betreuterBestand: { lebenJahresbeitrag: 453737, kompositJahresbeitrag: 746673 },
        qualitaet: {
          stornoquoteLeben: 4.5,
          mittlereBeitragsdurationLeben: 18.5,
          weiterbildungsstunden: 84,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 15,
          zielerreichung: 1.01,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 39809, apKomposit: 43139, bestandsprovision: 34646, bonusanteil: 5430, summe: 123024 },
      },
      {
        id: 'osd-vp-14',
        institutId: 'osd',
        name: 'Robert Thieme',
        geschaeftsstelle: 'Dresden-Neustadt',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2023,
        produktion: { lebenBeitragssumme: 938367, lebenStueck: 58, kompositJahresbeitrag: 42146, kompositStueck: 199 },
        betreuterBestand: { lebenJahresbeitrag: 351877, kompositJahresbeitrag: 506996 },
        qualitaet: {
          stornoquoteLeben: 6.8,
          mittlereBeitragsdurationLeben: 14,
          weiterbildungsstunden: 69,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 9,
          zielerreichung: 0.83,
          qualitaetsstufeAuszahlungsgrad: 0,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 30872, apKomposit: 29291, bestandsprovision: 23525, bonusanteil: 3237, summe: 86925 },
      },
    ],
  },
  vogtland: {
    abdeckungsgradProduktion: 0.48,
    eintraege: [
      {
        id: 'svg-vp-01',
        institutId: 'vogtland',
        name: 'Heiko Zimmermann',
        geschaeftsstelle: 'Plauen-Hauptstelle',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2008,
        produktion: { lebenBeitragssumme: 1584783, lebenStueck: 67, kompositJahresbeitrag: 50055, kompositStueck: 239 },
        betreuterBestand: { lebenJahresbeitrag: 667976, kompositJahresbeitrag: 600734 },
        qualitaet: {
          stornoquoteLeben: 3.7,
          mittlereBeitragsdurationLeben: 20.5,
          weiterbildungsstunden: 94,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 23,
          zielerreichung: 1.16,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'laufendesModell',
        istVerguetungsbeitrag: { apLeben: 50951, apKomposit: 35539, bestandsprovision: 28355, bonusanteil: 6625, summe: 121470 },
      },
      {
        id: 'svg-vp-02',
        institutId: 'vogtland',
        name: 'Manuela Söllner',
        geschaeftsstelle: 'Plauen-Hauptstelle',
        rolle: 'Individualkundenberater',
        imVertriebSeit: 2011,
        produktion: { lebenBeitragssumme: 1141043, lebenStueck: 52, kompositJahresbeitrag: 56584, kompositStueck: 270 },
        betreuterBestand: { lebenJahresbeitrag: 480942, kompositJahresbeitrag: 679092 },
        qualitaet: {
          stornoquoteLeben: 4,
          mittlereBeitragsdurationLeben: 19,
          weiterbildungsstunden: 91,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 19,
          zielerreichung: 1.08,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 36685, apKomposit: 40175, bestandsprovision: 32053, bonusanteil: 5482, summe: 114395 },
      },
      {
        id: 'svg-vp-03',
        institutId: 'vogtland',
        name: 'Jörg Kretzschmar',
        geschaeftsstelle: 'Auerbach',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2006,
        produktion: { lebenBeitragssumme: 1362913, lebenStueck: 68, kompositJahresbeitrag: 41894, kompositStueck: 200 },
        betreuterBestand: { lebenJahresbeitrag: 574459, kompositJahresbeitrag: 502790 },
        qualitaet: {
          stornoquoteLeben: 4.9,
          mittlereBeitragsdurationLeben: 17.5,
          weiterbildungsstunden: 79,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 15,
          zielerreichung: 0.98,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 43818, apKomposit: 29745, bestandsprovision: 23732, bonusanteil: 4761, summe: 102056 },
      },
      {
        id: 'svg-vp-04',
        institutId: 'vogtland',
        name: 'Diana Feist',
        geschaeftsstelle: 'Reichenbach',
        rolle: 'Individualkundenberater',
        imVertriebSeit: 2015,
        produktion: { lebenBeitragssumme: 1014261, lebenStueck: 48, kompositJahresbeitrag: 45159, kompositStueck: 215 },
        betreuterBestand: { lebenJahresbeitrag: 427504, kompositJahresbeitrag: 541975 },
        qualitaet: {
          stornoquoteLeben: 4.3,
          mittlereBeitragsdurationLeben: 18.5,
          weiterbildungsstunden: 88,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 17,
          zielerreichung: 1.03,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 32608, apKomposit: 32063, bestandsprovision: 25581, bonusanteil: 4399, summe: 94651 },
      },
      {
        id: 'svg-vp-05',
        institutId: 'vogtland',
        name: 'Falk Oberländer',
        geschaeftsstelle: 'Oelsnitz',
        rolle: 'Geschäftsstellenleiter',
        imVertriebSeit: 2004,
        produktion: { lebenBeitragssumme: 808239, lebenStueck: 33, kompositJahresbeitrag: 37542, kompositStueck: 179 },
        betreuterBestand: { lebenJahresbeitrag: 340668, kompositJahresbeitrag: 450560 },
        qualitaet: {
          stornoquoteLeben: 3.4,
          mittlereBeitragsdurationLeben: 21.5,
          weiterbildungsstunden: 96,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 21,
          zielerreichung: 1.19,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'laufendesModell',
        istVerguetungsbeitrag: { apLeben: 25985, apKomposit: 26655, bestandsprovision: 21266, bonusanteil: 4137, summe: 78043 },
      },
      {
        id: 'svg-vp-06',
        institutId: 'vogtland',
        name: 'Simone Roth',
        geschaeftsstelle: 'Klingenthal',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2017,
        produktion: { lebenBeitragssumme: 1172739, lebenStueck: 64, kompositJahresbeitrag: 38630, kompositStueck: 184 },
        betreuterBestand: { lebenJahresbeitrag: 494302, kompositJahresbeitrag: 463617 },
        qualitaet: {
          stornoquoteLeben: 5.4,
          mittlereBeitragsdurationLeben: 16,
          weiterbildungsstunden: 72,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 13,
          zielerreichung: 0.94,
          qualitaetsstufeAuszahlungsgrad: 75,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 37704, apKomposit: 27427, bestandsprovision: 21883, bonusanteil: 4043, summe: 91057 },
      },
      {
        id: 'svg-vp-07',
        institutId: 'vogtland',
        name: 'Andreas Hüttner',
        geschaeftsstelle: 'Falkenstein',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2012,
        produktion: { lebenBeitragssumme: 1283674, lebenStueck: 62, kompositJahresbeitrag: 34821, kompositStueck: 166 },
        betreuterBestand: { lebenJahresbeitrag: 541060, kompositJahresbeitrag: 417904 },
        qualitaet: {
          stornoquoteLeben: 4.6,
          mittlereBeitragsdurationLeben: 18,
          weiterbildungsstunden: 85,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 16,
          zielerreichung: 1.01,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 41270, apKomposit: 24723, bestandsprovision: 19725, bonusanteil: 4402, summe: 90120 },
      },
      {
        id: 'svg-vp-08',
        institutId: 'vogtland',
        name: 'Yvonne Barth',
        geschaeftsstelle: 'Markneukirchen',
        rolle: 'Individualkundenberater',
        imVertriebSeit: 2019,
        produktion: { lebenBeitragssumme: 919174, lebenStueck: 41, kompositJahresbeitrag: 42982, kompositStueck: 205 },
        betreuterBestand: { lebenJahresbeitrag: 387426, kompositJahresbeitrag: 515848 },
        qualitaet: {
          stornoquoteLeben: 4.1,
          mittlereBeitragsdurationLeben: 19.5,
          weiterbildungsstunden: 90,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 14,
          zielerreichung: 1.05,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 29551, apKomposit: 30517, bestandsprovision: 24348, bonusanteil: 4165, summe: 88581 },
      },
      {
        id: 'svg-vp-09',
        institutId: 'vogtland',
        name: 'Christian Beyer',
        geschaeftsstelle: 'Rodewisch',
        rolle: 'Vermögensberater',
        imVertriebSeit: 2014,
        produktion: { lebenBeitragssumme: 1045957, lebenStueck: 41, kompositJahresbeitrag: 19587, kompositStueck: 93 },
        betreuterBestand: { lebenJahresbeitrag: 440864, kompositJahresbeitrag: 235073 },
        qualitaet: {
          stornoquoteLeben: 3.2,
          mittlereBeitragsdurationLeben: 22,
          weiterbildungsstunden: 93,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 24,
          zielerreichung: 1.13,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'laufendesModell',
        istVerguetungsbeitrag: { apLeben: 33628, apKomposit: 13907, bestandsprovision: 11095, bonusanteil: 3547, summe: 62177 },
      },
      {
        id: 'svg-vp-10',
        institutId: 'vogtland',
        name: 'Grit Neubert',
        geschaeftsstelle: 'Treuen',
        rolle: 'Geschäftsstellenleiter',
        imVertriebSeit: 2009,
        produktion: { lebenBeitragssumme: 681457, lebenStueck: 31, kompositJahresbeitrag: 33189, kompositStueck: 158 },
        betreuterBestand: { lebenJahresbeitrag: 287230, kompositJahresbeitrag: 398317 },
        qualitaet: {
          stornoquoteLeben: 3.9,
          mittlereBeitragsdurationLeben: 19,
          weiterbildungsstunden: 87,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 18,
          zielerreichung: 1.02,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 21909, apKomposit: 23564, bestandsprovision: 18801, bonusanteil: 3063, summe: 67337 },
      },
      {
        id: 'svg-vp-11',
        institutId: 'vogtland',
        name: 'Sven Kaiser',
        geschaeftsstelle: 'Adorf',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2022,
        produktion: { lebenBeitragssumme: 649761, lebenStueck: 39, kompositJahresbeitrag: 31557, kompositStueck: 151 },
        betreuterBestand: { lebenJahresbeitrag: 273870, kompositJahresbeitrag: 378731 },
        qualitaet: {
          stornoquoteLeben: 6.1,
          mittlereBeitragsdurationLeben: 14.5,
          weiterbildungsstunden: 68,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 10,
          zielerreichung: 0.86,
          qualitaetsstufeAuszahlungsgrad: 75,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 20890, apKomposit: 22405, bestandsprovision: 17876, bonusanteil: 2459, summe: 63630 },
      },
    ],
  },
  doebeln: {
    abdeckungsgradProduktion: 0.72,
    eintraege: [
      {
        id: 'ksd-vp-01',
        institutId: 'doebeln',
        name: 'Matthias Rölke',
        geschaeftsstelle: 'Döbeln-Hauptstelle',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2010,
        produktion: { lebenBeitragssumme: 853333, lebenStueck: 53, kompositJahresbeitrag: 25566, kompositStueck: 115 },
        betreuterBestand: { lebenJahresbeitrag: 174962, kompositJahresbeitrag: 203523 },
        qualitaet: {
          stornoquoteLeben: 5.9,
          mittlereBeitragsdurationLeben: 14,
          weiterbildungsstunden: 78,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 14,
          zielerreichung: 1.02,
          qualitaetsstufeAuszahlungsgrad: 75,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 28971, apKomposit: 16234, bestandsprovision: 8792, bonusanteil: 3547, summe: 57544 },
      },
      {
        id: 'ksd-vp-02',
        institutId: 'doebeln',
        name: 'Cornelia Jäckel',
        geschaeftsstelle: 'Döbeln-Hauptstelle',
        rolle: 'Individualkundenberater',
        imVertriebSeit: 2013,
        produktion: { lebenBeitragssumme: 631467, lebenStueck: 42, kompositJahresbeitrag: 27891, kompositStueck: 125 },
        betreuterBestand: { lebenJahresbeitrag: 129472, kompositJahresbeitrag: 222032 },
        qualitaet: {
          stornoquoteLeben: 6.4,
          mittlereBeitragsdurationLeben: 13,
          weiterbildungsstunden: 71,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 12,
          zielerreichung: 0.95,
          qualitaetsstufeAuszahlungsgrad: 75,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 21438, apKomposit: 17711, bestandsprovision: 9592, bonusanteil: 2861, summe: 51602 },
      },
      {
        id: 'ksd-vp-03',
        institutId: 'doebeln',
        name: 'Frank Uhlemann',
        geschaeftsstelle: 'Hartha',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2007,
        produktion: { lebenBeitragssumme: 691200, lebenStueck: 50, kompositJahresbeitrag: 20918, kompositStueck: 94 },
        betreuterBestand: { lebenJahresbeitrag: 141719, kompositJahresbeitrag: 166522 },
        qualitaet: {
          stornoquoteLeben: 7.1,
          mittlereBeitragsdurationLeben: 12,
          weiterbildungsstunden: 62,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 10,
          zielerreichung: 0.88,
          qualitaetsstufeAuszahlungsgrad: 0,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 23466, apKomposit: 13283, bestandsprovision: 7194, bonusanteil: 2488, summe: 46431 },
      },
      {
        id: 'ksd-vp-04',
        institutId: 'doebeln',
        name: 'Beate Schuricht',
        geschaeftsstelle: 'Waldheim',
        rolle: 'Geschäftsstellenleiter',
        imVertriebSeit: 2005,
        produktion: { lebenBeitragssumme: 477867, lebenStueck: 27, kompositJahresbeitrag: 18594, kompositStueck: 84 },
        betreuterBestand: { lebenJahresbeitrag: 97979, kompositJahresbeitrag: 148021 },
        qualitaet: {
          stornoquoteLeben: 5.4,
          mittlereBeitragsdurationLeben: 15.5,
          weiterbildungsstunden: 84,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 16,
          zielerreichung: 1.06,
          qualitaetsstufeAuszahlungsgrad: 75,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 16224, apKomposit: 11807, bestandsprovision: 6395, bonusanteil: 2286, summe: 36712 },
      },
      {
        id: 'ksd-vp-05',
        institutId: 'doebeln',
        name: 'Enrico Wagner',
        geschaeftsstelle: 'Roßwein',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2016,
        produktion: { lebenBeitragssumme: 588800, lebenStueck: 45, kompositJahresbeitrag: 23533, kompositStueck: 106 },
        betreuterBestand: { lebenJahresbeitrag: 120724, kompositJahresbeitrag: 187339 },
        qualitaet: {
          stornoquoteLeben: 7.6,
          mittlereBeitragsdurationLeben: 11.5,
          weiterbildungsstunden: 58,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 9,
          zielerreichung: 0.84,
          qualitaetsstufeAuszahlungsgrad: 0,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 19990, apKomposit: 14943, bestandsprovision: 8093, bonusanteil: 2257, summe: 45283 },
      },
      {
        id: 'ksd-vp-06',
        institutId: 'doebeln',
        name: 'Susann Meinhardt',
        geschaeftsstelle: 'Leisnig',
        rolle: 'Individualkundenberater',
        imVertriebSeit: 2018,
        produktion: { lebenBeitragssumme: 443733, lebenStueck: 31, kompositJahresbeitrag: 22371, kompositStueck: 100 },
        betreuterBestand: { lebenJahresbeitrag: 90980, kompositJahresbeitrag: 178089 },
        qualitaet: {
          stornoquoteLeben: 6.8,
          mittlereBeitragsdurationLeben: 12.5,
          weiterbildungsstunden: 66,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 11,
          zielerreichung: 0.91,
          qualitaetsstufeAuszahlungsgrad: 0,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 15065, apKomposit: 14206, bestandsprovision: 7693, bonusanteil: 2049, summe: 39013 },
      },
      {
        id: 'ksd-vp-07',
        institutId: 'doebeln',
        name: 'Lars Otto',
        geschaeftsstelle: 'Ostrau',
        rolle: 'S-Finanzberater',
        imVertriebSeit: 2020,
        produktion: { lebenBeitragssumme: 401067, lebenStueck: 33, kompositJahresbeitrag: 17141, kompositStueck: 77 },
        betreuterBestand: { lebenJahresbeitrag: 82232, kompositJahresbeitrag: 136454 },
        qualitaet: {
          stornoquoteLeben: 8.2,
          mittlereBeitragsdurationLeben: 10.5,
          weiterbildungsstunden: 54,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 8,
          zielerreichung: 0.79,
          qualitaetsstufeAuszahlungsgrad: 0,
        },
        wahlmodellPraeferenz: 'apFpModell',
        istVerguetungsbeitrag: { apLeben: 13616, apKomposit: 10885, bestandsprovision: 5895, bonusanteil: 1489, summe: 31885 },
      },
      {
        id: 'ksd-vp-08',
        institutId: 'doebeln',
        name: 'Antje Krause',
        geschaeftsstelle: 'Döbeln-Hauptstelle',
        rolle: 'Vermögensberater',
        imVertriebSeit: 2015,
        produktion: { lebenBeitragssumme: 520533, lebenStueck: 27, kompositJahresbeitrag: 9587, kompositStueck: 43 },
        betreuterBestand: { lebenJahresbeitrag: 106727, kompositJahresbeitrag: 76319 },
        qualitaet: {
          stornoquoteLeben: 4.8,
          mittlereBeitragsdurationLeben: 17,
          weiterbildungsstunden: 89,
          weiterbildungErfuellt: true,
          bestandsausschoepfungsquote: 19,
          zielerreichung: 1.11,
          qualitaetsstufeAuszahlungsgrad: 100,
        },
        wahlmodellPraeferenz: 'hybridModell',
        istVerguetungsbeitrag: { apLeben: 17672, apKomposit: 6088, bestandsprovision: 3297, bonusanteil: 2029, summe: 29086 },
      },
    ],
  },
}

/* ---------- Namens- und Standortpools für den Generator ---------- */

export const vornamenPool = [
  'Andrea', 'Bernd', 'Carola', 'Danilo', 'Elke', 'Frank', 'Gabriele', 'Heiko',
  'Ilka', 'Jens', 'Katja', 'Lutz', 'Manuela', 'Norbert', 'Ute', 'Peggy',
  'Ralf', 'Sabine', 'Torsten', 'Ulrike', 'Volker', 'Wenke', 'Anett', 'Björn',
  'Claudia', 'Dirk', 'Ellen', 'Falk', 'Grit', 'Holger', 'Ines', 'Jörg',
  'Kerstin', 'Maik', 'Nicole', 'Olaf', 'Petra', 'René', 'Silke', 'Uwe',
]

export const nachnamenPool = [
  'Hentschel', 'Bräuer', 'Wagner', 'Zschoche', 'Neubert', 'Lehmann', 'Richter', 'Uhlig',
  'Kretzschmar', 'Seifert', 'Baumann', 'Dietrich', 'Eichler', 'Förster', 'Gläser', 'Hübner',
  'Junghans', 'Krauß', 'Lindner', 'Meinhardt', 'Naumann', 'Oswald', 'Pfeifer', 'Queißer',
  'Reichel', 'Schubert', 'Thalheim', 'Ullrich', 'Vogel', 'Weigel', 'Zimmer', 'Barthel',
  'Claus', 'Drechsel', 'Engelmann', 'Fritzsche', 'Gruner', 'Heinig', 'Illgen', 'Jentzsch',
]

export const geschaeftsstellenNachInstitut = {
  osd: ['Dresden-Altmarkt', 'Dresden-Neustadt', 'Dresden-Striesen', 'Dresden-Blasewitz', 'Dresden-Gorbitz', 'Dresden-Prohlis', 'Dresden-Klotzsche', 'Pirna', 'Freital', 'Radeberg', 'Sebnitz', 'Heidenau', 'Dippoldiswalde', 'Bischofswerda', 'Neustadt in Sachsen', 'Wilsdruff'],
  leipzig: ['Leipzig-Zentrum', 'Leipzig-Gohlis', 'Leipzig-Plagwitz', 'Leipzig-Connewitz', 'Leipzig-Grünau', 'Leipzig-Südvorstadt', 'Markkleeberg', 'Taucha', 'Schkeuditz', 'Torgau', 'Oschatz', 'Delitzsch', 'Eilenburg', 'Böhlen'],
  erzgebirge: ['Annaberg-Buchholz', 'Aue', 'Schwarzenberg', 'Marienberg', 'Stollberg', 'Zschopau', 'Olbernhau', 'Ehrenfriedersdorf', 'Thum', 'Schneeberg', 'Lößnitz', 'Johanngeorgenstadt'],
  chemnitz: ['Chemnitz-Zentrum', 'Chemnitz-Kaßberg', 'Chemnitz-Sonnenberg', 'Chemnitz-Bernsdorf', 'Chemnitz-Rabenstein', 'Chemnitz-Röhrsdorf', 'Burgstädt', 'Limbach-Oberfrohna'],
  oberlausitz: ['Zittau', 'Görlitz', 'Weißwasser', 'Niesky', 'Löbau', 'Ebersbach-Neugersdorf', 'Reichenbach O.L.', 'Rothenburg', 'Bad Muskau'],
  vogtland: ['Plauen-Hauptstelle', 'Auerbach', 'Reichenbach', 'Oelsnitz', 'Klingenthal', 'Falkenstein', 'Markneukirchen', 'Rodewisch', 'Treuen', 'Adorf', 'Elsterberg', 'Mylau'],
  mittelsachsen: ['Freiberg', 'Mittweida', 'Brand-Erbisdorf', 'Flöha', 'Frankenberg', 'Hainichen', 'Rochlitz', 'Oederan', 'Penig'],
  meissen: ['Riesa', 'Meißen', 'Großenhain', 'Coswig', 'Radebeul', 'Nossen', 'Gröditz', 'Strehla'],
  zwickau: ['Zwickau-Hauptstelle', 'Werdau', 'Crimmitschau', 'Glauchau', 'Meerane', 'Wilkau-Haßlau', 'Kirchberg', 'Hohenstein-Ernstthal', 'Limbach'],
  bautzen: ['Bautzen', 'Hoyerswerda', 'Kamenz', 'Bischofswerda', 'Wittichenau', 'Pulsnitz', 'Elstra', 'Königswartha'],
  muldental: ['Grimma', 'Wurzen', 'Brandis', 'Naunhof', 'Trebsen', 'Colditz', 'Bad Lausick'],
  doebeln: ['Döbeln-Hauptstelle', 'Hartha', 'Waldheim', 'Roßwein', 'Leisnig', 'Ostrau'],
}

/** Rollenprofile: Anteil an Leben-/Komposit-Produktion relativ zum S-Finanzberater */
export const rollenProfile = {
  'S-Finanzberater': { gewichtLeben: 1.00, gewichtKomposit: 1.00 },
  'Individualkundenberater': { gewichtLeben: 0.55, gewichtKomposit: 0.90 },
  'Vermögensberater': { gewichtLeben: 0.62, gewichtKomposit: 0.34 },
  'Geschäftsstellenleiter': { gewichtLeben: 0.40, gewichtKomposit: 0.68 },
}

const klemme = (v, min, max) => Math.min(max, Math.max(min, v))

/**
 * Erzeugt die vollständige, deterministische Vertriebspartnerliste eines Instituts.
 * Ist eine kuratierte Liste hinterlegt, wird sie unverändert vorangestellt und der
 * Generator füllt nur den Rest (1 - abdeckungsgradProduktion) auf.
 *
 * @param {string} institutId  z. B. 'zwickau'
 * @returns {Array<object>}    Vertriebspartner, absteigend nach Leben-Produktion
 */
export function erzeugeVertriebspartner(institutId) {
  const institut = institutNachId[institutId]
  if (!institut) return []
  const kuratiert = vertriebspartnerKuratiert[institutId]
  const vorhandene = kuratiert ? kuratiert.eintraege : []

  const anzahl = institut.stammdaten.vertriebspartnerGesamt - vorhandene.length
  if (anzahl <= 0) return [...vorhandene]

  const next = rng(seedAus('svs-vertriebspartner-' + institutId))
  const standorte = geschaeftsstellenNachInstitut[institutId] || ['Hauptstelle']
  const kfz = institut.steuerung.kfzAnteilKomposit
  const apOnly = institut.steuerung.apOnlyQuote
  const q = institut.qualitaet

  // Rollenverteilung: erst Geschäftsstellenleiter, dann S-Finanzberater, dann der Rest
  const offeneBerater = Math.max(0, institut.stammdaten.sFinanzberater - vorhandene.filter(v => v.rolle === 'S-Finanzberater').length)
  const offeneLeiter = Math.max(0, standorte.length - vorhandene.filter(v => v.rolle === 'Geschäftsstellenleiter').length)

  const rohlinge = []
  const genutzteNamen = new Set(vorhandene.map(v => v.name))
  for (let n = 0; n < anzahl; n++) {
    const rolle = n < offeneLeiter ? 'Geschäftsstellenleiter'
      : n < offeneLeiter + offeneBerater ? 'S-Finanzberater'
        : (next() < 0.7 ? 'Individualkundenberater' : 'Vermögensberater')

    let name = ''
    for (let versuch = 0; versuch < 60; versuch++) {
      const v = vornamenPool[Math.floor(next() * vornamenPool.length) % vornamenPool.length]
      const nn = nachnamenPool[Math.floor(next() * nachnamenPool.length) % nachnamenPool.length]
      name = `${v} ${nn}`
      if (!genutzteNamen.has(name)) break
    }
    genutzteNamen.add(name)

    const profil = rollenProfile[rolle]
    const streuung = Math.exp(normal(next, 0, 0.42))     // lognormal, Pareto-artig
    const streuungK = Math.exp(normal(next, 0, 0.38))
    const seit = 2026 - Math.round(klemme(normal(next, 11, 6), 1, 34))

    rohlinge.push({
      id: `${institutId}-vp-${String(vorhandene.length + n + 1).padStart(2, '0')}`,
      institutId, name,
      geschaeftsstelle: standorte[n % standorte.length],
      rolle,
      imVertriebSeit: seit,
      _gewichtLeben: profil.gewichtLeben * streuung,
      _gewichtKomposit: profil.gewichtKomposit * streuungK,
      _storno: runde(klemme(normal(next, q.stornoquoteLeben, 1.15), 2.4, 9.2), 1),
      _duration: runde(klemme(normal(next, q.mittlereBeitragsdurationLeben, 2.4), 9.5, 26), 1),
      _weiterbildung: Math.round(klemme(normal(next, q.weiterbildungsquote * 0.34, 5.5), 4, 42)),
      _ausschoepfung: runde(klemme(normal(next, q.bestandsausschoepfungsquote, 4.2), 4, 34), 1),
      _ziel: runde(klemme(normal(next, institut.steuerung.zielerreichungVorjahr, 0.14), 0.62, 1.48), 2),
    })
  }

  // Produktion normieren: der Generator verteilt exakt das, was die
  // kuratierten Eintraege vom Institutsneugeschaeft uebrig lassen.
  const restLeben = institut.neugeschaeft.lebenBeitragssumme
    - vorhandene.reduce((a, v) => a + v.produktion.lebenBeitragssumme, 0)
  const restKomposit = institut.neugeschaeft.kompositJahresbeitrag
    - vorhandene.reduce((a, v) => a + v.produktion.kompositJahresbeitrag, 0)
  const summeGl = rohlinge.reduce((a, r) => a + r._gewichtLeben, 0)
  const summeGk = rohlinge.reduce((a, r) => a + r._gewichtKomposit, 0)

  const apKompSatz = kompositMischsatz(P.apKompositSach, P.apKompositKfz, kfz)
  const bpKompSatz = kompositMischsatz(P.bpKompositSach, P.bpKompositKfz, kfz)
  const bonusQuote = institut.istVerguetung.bonusstaffel /
    Math.max(1, institut.istVerguetung.apLeben + institut.istVerguetung.apKomposit)
  const oJbNgKomposit = institut.neugeschaeft.mittlererJahresbeitragKomposit

  const liste = rohlinge.map(r => {
    const bsLeben = Math.round(restLeben * r._gewichtLeben / summeGl)
    const jbKomposit = Math.round(restKomposit * r._gewichtKomposit / summeGk)
    return { ...r, _bsLeben: bsLeben, _jbKomposit: jbKomposit }
  })

  // Rundungsrest auf den größten Eintrag buchen -> Summe stimmt exakt
  const groesster = liste.reduce((a, b) => (b._bsLeben > a._bsLeben ? b : a), liste[0])
  groesster._bsLeben += restLeben - liste.reduce((a, r) => a + r._bsLeben, 0)
  groesster._jbKomposit += restKomposit - liste.reduce((a, r) => a + r._jbKomposit, 0)

  const fertig = liste.map(r => {
    const bsLeben = r._bsLeben
    const jbKomposit = r._jbKomposit
    const apLeben = apLebenIst(bsLeben, apOnly, P)
    const apKomposit = Math.round(jbKomposit * apKompSatz)
    const bestandKomposit = Math.round(institut.bestand.kompositJahresbeitrag *
      (jbKomposit / institut.neugeschaeft.kompositJahresbeitrag) * 0.92)
    const bestandLeben = Math.round(institut.bestand.lebenJahresbeitrag *
      (bsLeben / institut.neugeschaeft.lebenBeitragssumme) * 0.92)
    const bestandsprovision = Math.round(bestandKomposit * bpKompSatz)
    const bonusanteil = Math.round((apLeben + apKomposit) * bonusQuote * r._ziel /
      institut.steuerung.zielerreichungVorjahr)
    const qualitaetsstufe = r._storno <= 5.0 && r._weiterbildung >= 30 ? 100
      : (r._storno <= 6.5 && r._weiterbildung >= 20 ? 75 : 0)

    return {
      id: r.id, institutId, name: r.name, geschaeftsstelle: r.geschaeftsstelle,
      rolle: r.rolle, imVertriebSeit: r.imVertriebSeit,
      produktion: {
        lebenBeitragssumme: bsLeben,
        lebenStueck: Math.round(bsLeben / (1150 * r._duration)),
        kompositJahresbeitrag: jbKomposit,
        kompositStueck: Math.round(jbKomposit / oJbNgKomposit),
      },
      betreuterBestand: { lebenJahresbeitrag: bestandLeben, kompositJahresbeitrag: bestandKomposit },
      qualitaet: {
        stornoquoteLeben: r._storno,
        mittlereBeitragsdurationLeben: r._duration,
        weiterbildungsstunden: r._weiterbildung,
        weiterbildungErfuellt: r._weiterbildung >= 30,
        bestandsausschoepfungsquote: r._ausschoepfung,
        zielerreichung: r._ziel,
        qualitaetsstufeAuszahlungsgrad: qualitaetsstufe,
      },
      wahlmodellPraeferenz:
        r._storno > 6.0 ? 'apFpModell'
          : r._duration >= 20 && r._ausschoepfung >= 18 ? 'laufendesModell'
            : r._duration >= 17 ? 'hybridModell'
              : 'apFpModell',
      istVerguetungsbeitrag: {
        apLeben, apKomposit, bestandsprovision, bonusanteil,
        summe: apLeben + apKomposit + bestandsprovision + bonusanteil,
      },
    }
  })

  return [...vorhandene, ...fertig].sort(
    (a, b) => b.produktion.lebenBeitragssumme - a.produktion.lebenBeitragssumme)
}

/** Memoisierter Zugriff - die Liste wird je Institut nur einmal erzeugt. */
const cache = new Map()
export function vertriebspartnerFuer(institutId) {
  if (!cache.has(institutId)) cache.set(institutId, erzeugeVertriebspartner(institutId))
  return cache.get(institutId)
}

export function alleVertriebspartner() {
  return Object.keys(institutNachId).flatMap(id => vertriebspartnerFuer(id))
}
