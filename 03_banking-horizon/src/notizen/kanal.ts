// Kopplung zwischen Strukturbild und Notizfenster über einen BroadcastChannel:
// gleiche Origin, kein Fensterbezug nötig, das Notizfenster kann auch per URL
// geöffnet worden sein. Das Strukturbild schickt Rad-Bewegungen als „scroll",
// das Notizfenster meldet sich per Herzschlag („offen") und beim Schließen („zu").
export const NOTIZEN_KANAL = 'bh-notizen'
export const STAND_KEY = 'bh-vortrag-stand'
export const HERZSCHLAG_MS = 2000

export type NotizenNachricht =
  | { typ: 'scroll'; deltaY: number }
  | { typ: 'offen' }
  | { typ: 'zu' }
