import { useCallback, useEffect, useState } from 'react';

// Profil des aktiven Vermittlers / Beraters. Wird in localStorage persistiert,
// damit Nutzer ihr eigenes Foto + ihren Namen hinterlegen können (wie im
// Vertriebsarbeitsplatz). Die Keys `kia_user_fullname` und `kia_user_photo`
// werden absichtlich mit dem Vertriebsarbeitsplatz geteilt, sodass ein einmal
// hinterlegtes Profil in beiden Apps gilt.

const DEFAULTS = {
  name: 'Thomas Bergmann',
  vermittlerNr: 'VM-48291',
  agentur: 'Bergmann & Partner Versicherungsmakler',
  email: 't.bergmann@bergmann-makler.de',
  foto: null,
};

const KEYS = {
  name: 'kia_user_fullname',
  vermittlerNr: 'kia_prov_vermittlerNr',
  agentur: 'kia_prov_agentur',
  email: 'kia_prov_email',
  foto: 'kia_user_photo',
};

function read() {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    return {
      name: localStorage.getItem(KEYS.name) || DEFAULTS.name,
      vermittlerNr: localStorage.getItem(KEYS.vermittlerNr) || DEFAULTS.vermittlerNr,
      agentur: localStorage.getItem(KEYS.agentur) || DEFAULTS.agentur,
      email: localStorage.getItem(KEYS.email) || DEFAULTS.email,
      foto: localStorage.getItem(KEYS.foto) || DEFAULTS.foto,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export default function useBeraterProfil() {
  const [profil, setProfil] = useState(() => read());

  // Sync bei Storage-Events zwischen Tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e) => {
      if (Object.values(KEYS).includes(e.key)) setProfil(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const updateField = useCallback((field, value) => {
    setProfil(prev => ({ ...prev, [field]: value }));
    try {
      const key = KEYS[field];
      if (!key) return;
      if (value === null || value === '') {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      /* localStorage nicht verfügbar */
    }
  }, []);

  const resetFoto = useCallback(() => updateField('foto', null), [updateField]);

  const reset = useCallback(() => {
    Object.values(KEYS).forEach(k => {
      try { localStorage.removeItem(k); } catch { /* ignore */ }
    });
    setProfil({ ...DEFAULTS });
  }, []);

  return { profil, updateField, resetFoto, reset };
}
