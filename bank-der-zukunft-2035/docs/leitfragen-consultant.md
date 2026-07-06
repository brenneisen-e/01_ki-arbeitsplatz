# Leitfragen-Consultant (Mascot)

Der Consultant poppt unten rechts im Kapitel-Reader auf und stellt die Leitfrage
des aktuellen Schritts (im „Karl-Klammer"-Prinzip). Er ist ein **einfarbiger,
ikonischer Berater-Mascot** (SVG) — bei jeder Größe scharf lesbar, dezent
animiert.

## Bausteine

| Datei | Zweck |
| --- | --- |
| `src/consultant/ConsultantAvatar.tsx` | Dock, Sprechblase, Mascot-SVG (Idle-Schweben, „spricht"-Sprechwellen) |
| `src/consultant/ConsultantAvatar.module.css` | Papier-/Magazinstil, Kreis-Chip, Animationen |

Eingebunden wird er in `src/components/ChapterReader.tsx`.

## Design

- **Genau eine Farbe** (`var(--accent)`): Augen, Lächeln und Hemdkragen sind
  Aussparungen (SVG-Maske), durch die der helle Kreis-Hintergrund der
  `.avatarStage` scheint — kein zweiter Farbwert (siehe Icon-Regeln in der
  Repo-`CLAUDE.md`: einfarbige Icons, keine Emojis, keine Verläufe im Icon selbst;
  Hervorhebung nur über den Container-Hintergrund).
- **Zustände:** Idle-Schweben (`bob`) dauerhaft; beim geöffneten Sprechblasen-
  Zustand (`speaking`) erscheinen dezente Schallwellen neben dem Kopf
  (`speakWaves`). Beides respektiert `prefers-reduced-motion`.

## Warum kein 3D/Foto?

Ein früherer Ansatz renderte ein per Meshy erzeugtes, geriggtes 3D-Modell. Das
wurde bewusst verworfen:

- Im ~100-px-Chip ist eine fotorealistische Figur nicht als solche erkennbar —
  sie wird zum blassen Fleck. Ein ikonisches Icon liest sich sofort.
- Meshys Auto-Rigging verzerrte armhebende Animationen zu grotesken „Flügeln",
  und die PBR-Materialdefaults (metallicFactor 1, volles Emissive) wirkten ohne
  Environment-Map ausgewaschen.

Der Mascot braucht kein Modell, keinen Meshy-Key, keine three.js-Bühne und lädt
mit dem übrigen Bundle (wenige Bytes SVG).
