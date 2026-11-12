/**
 * Alpha Provisionsanalyse-System - Hierarchie Manager
 * ====================================================
 * Verwaltung von Strukturvertrieb, Hierarchien und Superprovisionen
 */

class HierarchieManager {
  constructor() {
    this.hierarchien = this._initHierarchien();
    this.fachlicheVorgaben = this._initFachlicheVorgaben();
  }

  /**
   * Initialisiert Hierarchie-Strukturen
   */
  _initHierarchien() {
    return {
      // HAUPTVERMITTLER / TEAMLEITER
      '0300/0005': {
        name: 'Thomas Meyer',
        rolle: 'Hauptvermittler / Teamleiter',
        stufe: 1,
        provisionssatz_eigen: 80,
        superprovision_aktiv: true,
        untervermittler: ['0300/0187', '0300/0211', '0300/0289'],
        agentur_id: '001'
      },

      // UNTERVERMITTLER (für Superprovisions-Szenarien)
      '0300/0187': {
        name: 'Frank Müller',
        rolle: 'Vermittler',
        stufe: 5,
        provisionssatz_eigen: 60,
        vorgesetzter: '0300/0005',
        differenz_zum_vorgesetzten: 20, // 80% - 60%
        agentur_id: '001'
      },

      '0300/0211': {
        name: 'Andrea Schmidt',
        rolle: 'Vermittler',
        stufe: 5,
        provisionssatz_eigen: 60,
        vorgesetzter: '0300/0005',
        differenz_zum_vorgesetzten: 20,
        agentur_id: '001'
      },

      '0300/0289': {
        name: 'Peter Wagner',
        rolle: 'Vermittler',
        stufe: 5,
        provisionssatz_eigen: 60,
        vorgesetzter: '0300/0005',
        differenz_zum_vorgesetzten: 20,
        agentur_id: '001'
      },

      // VERMITTLER MIT STORNO-PROBLEMEN
      '0300/0156': {
        name: 'Frank Meier',
        rolle: 'Untervermittler',
        stufe: 6,
        provisionssatz_eigen: 55,
        vorgesetzter: null,
        agentur_id: '003',
        problematisch: true,
        problem_typ: 'storno_clustering'
      },

      // VERMITTLER MIT UMDECKUNGS-PROBLEMEN
      '0300/0102': {
        name: 'Lisa Weber',
        rolle: 'Vermittler',
        stufe: 5,
        provisionssatz_eigen: 65,
        vorgesetzter: null,
        agentur_id: '002',
        problematisch: true,
        problem_typ: 'umdeckungen'
      },

      // MAKLER (für Omnikanal-Szenario)
      '9999/0001': {
        name: 'Hanseatischer Finanzservice GmbH',
        rolle: 'Großmakler / Pool',
        typ: 'makler',
        provisionssatz_eigen: 100,
        leitet_weiter_an: '0300/0005',
        kickback_verdacht: true
      }
    };
  }

  /**
   * Fachliche Vorgaben für Provisionen
   */
  _initFachlicheVorgaben() {
    return {
      'KV': {
        max_prozent: 75,
        bezeichnung: 'Krankenversicherung',
        basis: 'prozent_jahresbeitrag'
      },
      'SACH': {
        max_prozent: 65,
        bezeichnung: 'Sachversicherung',
        basis: 'prozent_jahresbeitrag'
      },
      'LV': {
        max_jahresbeitraege: 5,
        bezeichnung: 'Lebensversicherung',
        basis: 'anzahl_jahresbeitraege'
      },
      'BU': {
        max_jahresbeitraege: 5,
        bezeichnung: 'Berufsunfähigkeitsversicherung',
        basis: 'anzahl_jahresbeitraege'
      }
    };
  }

  /**
   * Prüft ob Vermittler einen Vorgesetzten hat
   */
  hatVorgesetzten(vermittlerNummer) {
    const vermittler = this.hierarchien[vermittlerNummer];
    return vermittler && vermittler.vorgesetzter !== null;
  }

  /**
   * Holt Vorgesetzten-Daten
   */
  getVorgesetzter(vermittlerNummer) {
    const vermittler = this.hierarchien[vermittlerNummer];
    if (!vermittler || !vermittler.vorgesetzter) return null;
    return this.hierarchien[vermittler.vorgesetzter];
  }

  /**
   * Holt Untervermittler eines Vorgesetzten
   */
  getUntervermittler(vermittlerNummer) {
    const vermittler = this.hierarchien[vermittlerNummer];
    if (!vermittler || !vermittler.untervermittler) return [];

    return vermittler.untervermittler.map(uvNummer => ({
      nummer: uvNummer,
      ...this.hierarchien[uvNummer]
    }));
  }

  /**
   * Berechnet Superprovision für einen Vertrag
   */
  berechneSuperProvision(vertrag, vermittlerNummer) {
    const vermittler = this.hierarchien[vermittlerNummer];
    if (!vermittler) return null;

    const vorgesetzter = this.getVorgesetzter(vermittlerNummer);
    if (!vorgesetzter) return null;

    const jahresbeitrag = vertrag.jahresbeitrag || vertrag.berechnungsbasis || 0;
    const differenzProzent = vorgesetzter.provisionssatz_eigen - vermittler.provisionssatz_eigen;
    const superprovision = jahresbeitrag * (differenzProzent / 100);

    return {
      vorgesetzter_nummer: vermittler.vorgesetzter,
      vorgesetzter_name: vorgesetzter.name,
      differenz_prozent: differenzProzent,
      superprovision_betrag: superprovision,
      vertrag_vsnr: vertrag.vsnr,
      vertrag_kunde: vertrag.kunde,
      jahresbeitrag: jahresbeitrag
    };
  }

  /**
   * Prüft Compliance für Gesamtprovision
   */
  pruefeCompliance(vertrag, vermittlerProvisionProzent, superprovisionProzent = 0) {
    const sparte = this._ermittleSparte(vertrag);
    const vorgabe = this.fachlicheVorgaben[sparte];

    if (!vorgabe) {
      return {
        compliant: true,
        warnung: 'Keine Vorgabe für Sparte verfügbar'
      };
    }

    const gesamtProzent = vermittlerProvisionProzent + superprovisionProzent;

    if (vorgabe.basis === 'prozent_jahresbeitrag') {
      const ueberschreitung = gesamtProzent - vorgabe.max_prozent;

      return {
        compliant: gesamtProzent <= vorgabe.max_prozent,
        sparte: vorgabe.bezeichnung,
        vermittler_prozent: vermittlerProvisionProzent,
        superprovision_prozent: superprovisionProzent,
        gesamt_prozent: gesamtProzent,
        max_erlaubt: vorgabe.max_prozent,
        ueberschreitung: ueberschreitung,
        ueberschreitung_prozent: vorgabe.max_prozent > 0
          ? (ueberschreitung / vorgabe.max_prozent * 100).toFixed(1)
          : 0,
        schweregrad: this._bewerteSchweregrad(ueberschreitung, vorgabe.max_prozent)
      };
    }

    return { compliant: true };
  }

  /**
   * Ermittelt Sparte aus Vertrag
   */
  _ermittleSparte(vertrag) {
    const produkt = (vertrag.produkt || '').toLowerCase();

    if (produkt.includes('kv') || produkt.includes('kranken') || produkt.includes('zahn')) {
      return 'KV';
    }
    if (produkt.includes('bu') || produkt.includes('berufsunfähig')) {
      return 'BU';
    }
    if (produkt.includes('leben') || produkt.includes('risikoleben') || produkt.includes('rente')) {
      return 'LV';
    }
    return 'SACH';
  }

  /**
   * Bewertet Schweregrad der Überschreitung
   */
  _bewerteSchweregrad(ueberschreitung, maxErlaubt) {
    if (ueberschreitung <= 0) return 'keine';

    const prozent = (ueberschreitung / maxErlaubt) * 100;

    if (prozent < 10) return 'niedrig';
    if (prozent < 20) return 'mittel';
    if (prozent < 30) return 'hoch';
    return 'kritisch';
  }

  /**
   * Findet überlappende Verträge zwischen Vermittler und Vorgesetztem
   */
  findeUeberlappung(vermittlerVertraege, vorgesetzterSuperprovisionen) {
    const ueberlappung = [];

    for (const vVertrag of vermittlerVertraege) {
      for (const vSuper of vorgesetzterSuperprovisionen) {
        if (vVertrag.vsnr === vSuper.vertrag_vsnr) {
          ueberlappung.push({
            vsnr: vVertrag.vsnr,
            kunde: vVertrag.kunde,
            produkt: vVertrag.produkt,
            jahresbeitrag: vVertrag.jahresbeitrag,
            provision_vermittler: vVertrag.provision,
            provision_vermittler_prozent: vVertrag.provision_prozent ||
              (vVertrag.provision / vVertrag.jahresbeitrag * 100),
            superprovision_vorgesetzter: vSuper.superprovision_betrag,
            superprovision_vorgesetzter_prozent: vSuper.differenz_prozent,
            gesamt_provision: vVertrag.provision + vSuper.superprovision_betrag,
            gesamt_prozent: (vVertrag.provision / vVertrag.jahresbeitrag * 100) +
                           vSuper.differenz_prozent
          });
        }
      }
    }

    return ueberlappung;
  }

  /**
   * Generiert Superprovisionen für einen Vorgesetzten
   */
  generiereSuperprovisionen(vorgesetzterNummer, periode, vermittlerVertraege) {
    const vorgesetzter = this.hierarchien[vorgesetzterNummer];
    if (!vorgesetzter || !vorgesetzter.superprovision_aktiv) return [];

    const superprovisionen = [];

    for (const untervermittlerNummer of vorgesetzter.untervermittler) {
      const untervermittler = this.hierarchien[untervermittlerNummer];

      // Filtere Verträge des Untervermittlers
      const uvVertraege = vermittlerVertraege.filter(v =>
        v.vermittler_nummer === untervermittlerNummer
      );

      for (const vertrag of uvVertraege) {
        const differenzProzent = vorgesetzter.provisionssatz_eigen -
                                 untervermittler.provisionssatz_eigen;
        const jahresbeitrag = vertrag.jahresbeitrag || 0;
        const superprovision = jahresbeitrag * (differenzProzent / 100);

        superprovisionen.push({
          untervermittler_nummer: untervermittlerNummer,
          untervermittler_name: untervermittler.name,
          kunde: vertrag.kunde,
          vsnr: vertrag.vsnr,
          produkt: vertrag.produkt,
          jahresbeitrag: jahresbeitrag,
          superprovision_prozent: differenzProzent,
          superprovision_betrag: superprovision,
          vertrag_vsnr: vertrag.vsnr
        });
      }
    }

    return superprovisionen;
  }

  /**
   * Prüft alle Compliance-Verstöße für überlappende Verträge
   */
  pruefeAlleComplianceVerstoesse(ueberlappung) {
    const verstoesse = [];

    for (const vertrag of ueberlappung) {
      const compliance = this.pruefeCompliance(
        vertrag,
        vertrag.provision_vermittler_prozent,
        vertrag.superprovision_vorgesetzter_prozent
      );

      if (!compliance.compliant) {
        verstoesse.push({
          ...vertrag,
          compliance: compliance
        });
      }
    }

    return verstoesse;
  }

  /**
   * Holt Vermittler-Info
   */
  getVermittlerInfo(vermittlerNummer) {
    return this.hierarchien[vermittlerNummer] || null;
  }

  /**
   * Prüft ob Vermittler problematisch ist
   */
  istProblematisch(vermittlerNummer) {
    const vermittler = this.hierarchien[vermittlerNummer];
    return vermittler && vermittler.problematisch === true;
  }

  /**
   * Holt Problem-Typ
   */
  getProblemTyp(vermittlerNummer) {
    const vermittler = this.hierarchien[vermittlerNummer];
    return vermittler ? vermittler.problem_typ : null;
  }
}

// Singleton-Instanz
const hierarchieManager = new HierarchieManager();
