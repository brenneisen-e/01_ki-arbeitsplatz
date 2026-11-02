// Tastaturhilfe — Dialog mit allen Kürzeln (Taste „?“). Liste aus
// store/tastenkuerzel.js, damit Dialog und Verhalten nicht auseinanderlaufen.
import { Fragment } from 'react';
import Dialog from './Dialog.jsx';
import { Tasten } from './Kbd.jsx';
import { KUERZEL } from '../../store/tastenkuerzel.js';

export default function Tastaturhilfe({ offen, onSchliessen }) {
  return (
    <Dialog offen={offen} onSchliessen={onSchliessen} titel="Tastaturkürzel" beschreibung="Kürzel gelten nicht, während du in ein Feld tippst." breite={520}>
      <table className="tasten-tabelle">
        <tbody>
          {KUERZEL.map((g) => (
            <Fragment key={g.gruppe}>
              <tr className="tasten-gruppe"><td colSpan={2}>{g.gruppe}</td></tr>
              {g.eintraege.map((e) => (
                <tr key={e.wirkung}>
                  <td>
                    {e.tasten.map((folge, i) => (
                      <Fragment key={i}>
                        {i > 0 && <span className="meta" style={{ margin: '0 6px' }}>{e.verbinder || 'oder'}</span>}
                        <Tasten tasten={folge} />
                      </Fragment>
                    ))}
                  </td>
                  <td>{e.wirkung}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </Dialog>
  );
}
