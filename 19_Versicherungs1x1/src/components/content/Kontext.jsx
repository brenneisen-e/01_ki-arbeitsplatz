// ===========================================================================
// Kontext.jsx — was alle Blöcke einer Lerneinheit gemeinsam wissen müssen:
// Kapitel (für chartData, decisionTrees), Einheit und die Nummerierung der
// Quellen je Einheit (gleicher Quellentext = gleiche Nummer, Reihenfolge des
// Auftretens). ContentBlocks stellt ihn bereit; Absätze, Callouts und
// Tabellen lesen ihn über useBlockKontext().
// ===========================================================================
import { createContext, useContext } from 'react';

export const BlockKontext = createContext({
  kapitel: null,
  einheit: null,
  /** Nummer eines Quellentexts in dieser Einheit oder null (dann gilt die Nummer aus den Daten). */
  nummerFuer: () => null,
});

export function useBlockKontext() {
  return useContext(BlockKontext);
}
