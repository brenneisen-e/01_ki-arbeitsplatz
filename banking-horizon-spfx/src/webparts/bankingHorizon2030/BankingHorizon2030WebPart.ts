import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneSlider
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'BankingHorizon2030WebPartStrings';
import { APP_ENTRY_JS, APP_ENTRY_CSS } from './generated/appFiles';
import { APP_VERSION } from './version';

export interface IBankingHorizon2030WebPartProps {
  /**
   * Optional: absolute URL einer extern gehosteten Instanz der App.
   * Bleibt das Feld leer, werden die im .sppkg mitgelieferten Assets
   * (ClientSideAssets/app/) verwendet — die App läuft dann komplett
   * aus SharePoint heraus, ohne externes Hosting.
   */
  externalUrl: string;
  fullHeight: boolean;
  fixedHeight: number;
}

export default class BankingHorizon2030WebPart extends BaseClientSideWebPart<IBankingHorizon2030WebPartProps> {

  private _watchdog: number | undefined;

  public render(): void {
    if (this._watchdog !== undefined) {
      clearInterval(this._watchdog);
      this._watchdog = undefined;
    }

    const height: string = this.properties.fullHeight
      ? 'calc(100vh - 120px)'
      : `${this.properties.fixedHeight || 900}px`;

    const wrap: HTMLDivElement = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.style.width = '100%';
    wrap.style.height = height;
    wrap.style.background = '#0b1410';

    const iframe: HTMLIFrameElement = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.setAttribute('allow', 'fullscreen; clipboard-write');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.title = 'Banking Horizon 2030';
    wrap.appendChild(iframe);

    // Host-Badge im WebPart-DOM (außerhalb des iframes): belegt zweifelsfrei,
    // welches WebPart-Bundle die Seite wirklich ausliefert — der SPFx-Loader
    // cached aggressiv und serviert nach Updates gern das alte Bundle weiter.
    const badge: HTMLDivElement = document.createElement('div');
    badge.textContent = `SPFx v${APP_VERSION}`;
    badge.style.cssText = 'position:absolute;left:8px;bottom:8px;z-index:20;pointer-events:none;'
      + 'color:rgba(232,243,209,0.6);background:rgba(11,20,16,0.6);border-radius:4px;'
      + 'padding:2px 7px;font-family:monospace;font-size:11px';
    wrap.appendChild(badge);

    // Host-seitiges Status-/Fehlerpanel — funktioniert auch dann, wenn im
    // iframe gar kein Skript ausgeführt werden kann.
    const status: HTMLDivElement = document.createElement('div');
    status.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;'
      + 'justify-content:center;text-align:center;padding:24px;color:#e8f3d1;'
      + 'background:#0b1410;font-family:sans-serif;font-size:14px;line-height:1.6;z-index:10';
    wrap.appendChild(status);

    this.domElement.innerHTML = '';
    this.domElement.appendChild(wrap);

    const externalUrl: string = (this.properties.externalUrl || '').trim();
    if (externalUrl) {
      iframe.src = externalUrl;
      return;
    }

    const appBase: string = this._resolveAppBaseUrl();
    iframe.addEventListener('load', () => this._bootApp(iframe, appBase, status));
    iframe.srcdoc = this._buildSrcdoc(appBase);
  }

  /**
   * Startet die App im iframe: Das App-Skript wird vom Host aus als
   * <script>-Element ins iframe-Dokument injiziert (das srcdoc selbst ist
   * bewusst skriptfrei, damit eine etwaige CSP gegen Inline-Skripte nicht
   * greift), und ein Host-seitiger Watchdog meldet Ladefehler sichtbar.
   */
  private _bootApp(iframe: HTMLIFrameElement, appBase: string, status: HTMLDivElement): void {
    let doc: Document | null = null;
    try {
      doc = iframe.contentDocument;
    } catch { /* Zugriff verweigert — unten behandelt */ }
    // Initiales about:blank-load ignorieren; unser Dokument hat #root
    if (!doc || !doc.body || !doc.getElementById('root')) {
      if (!doc) {
        this._showError(status, ['Kein Zugriff auf das iframe-Dokument (Browser-/CSP-Einschränkung).'], appBase);
      }
      return;
    }

    // Fehler nur SAMMELN — angezeigt wird erst, wenn die App wirklich nicht
    // startet (script.onerror oder Watchdog-Timeout). Ein einzelner uncaught
    // Error muss den Start nicht verhindern; mountet die App trotzdem,
    // landen die Details nur in der Konsole.
    const problems: string[] = [];
    const win: Window | null = iframe.contentWindow;
    if (win) {
      // In srcdoc-iframes (about:srcdoc) werfen history.pushState/replaceState
      // SecurityErrors (die App nutzt sie für Hash-Deep-Links, z. B.
      // BankExplorer). Hier in No-Throw-Wrapper einpacken — Deep-Links gibt es
      // innerhalb von SharePoint ohnehin nicht.
      try {
        const hist: History = win.history;
        const wrapHistory = (name: 'replaceState' | 'pushState'): void => {
          const original: (data: unknown, unused: string, url?: string | null) => void =
            hist[name].bind(hist);
          Object.defineProperty(hist, name, {
            value: (data: unknown, unused: string, url?: string | null): void => {
              try {
                original(data, unused, url);
              } catch { /* about:srcdoc erlaubt keine URL-Änderung — ignorieren */ }
            }
          });
        };
        wrapHistory('replaceState');
        wrapHistory('pushState');
      } catch { /* history nicht überschreibbar — App-Fehler werden gesammelt */ }
      win.addEventListener('error', (e: ErrorEvent) => {
        const parts: string[] = [];
        if (e.message) { parts.push(e.message); }
        if (e.filename) { parts.push(`${e.filename}:${e.lineno}:${e.colno}`); }
        const err: Error | undefined = e.error as Error | undefined;
        if (err && err.stack) { parts.push(String(err.stack).slice(0, 500)); }
        problems.push(parts.join(' — ') || 'Unbekannter Fehler (leere Fehlermeldung)');
      });
      win.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
        problems.push(`Unbehandelte Promise-Rejection: ${String(e.reason).slice(0, 300)}`);
      });
    }

    const script: HTMLScriptElement = doc.createElement('script');
    script.src = `${appBase}${APP_ENTRY_JS}`;
    script.onerror = () => this._showError(status, [`App-Bundle nicht erreichbar: ${script.src}`], appBase);
    doc.body.appendChild(script);

    let tries: number = 0;
    this._watchdog = window.setInterval(() => {
      let mounted: boolean = false;
      try {
        const innerDoc: Document | null = iframe.contentDocument;
        const root: HTMLElement | null = innerDoc ? innerDoc.getElementById('root') : null;
        mounted = !!root && root.childElementCount > 0;
        if (mounted && innerDoc) {
          const overlay: HTMLElement | null = innerDoc.getElementById('bh-status');
          if (overlay) {
            overlay.style.display = 'none';
          }
        }
      } catch { /* iframe kurzzeitig nicht lesbar — weiter versuchen */ }
      if (mounted) {
        clearInterval(this._watchdog);
        this._watchdog = undefined;
        status.style.display = 'none';
        if (problems.length > 0) {
          // eslint-disable-next-line no-console
          console.warn(`[BankingHorizon2030] App läuft, aber es gab uncaught Errors:\n${problems.join('\n')}`);
        }
      } else if (++tries > 150) {
        clearInterval(this._watchdog);
        this._watchdog = undefined;
        const details: string[] = problems.length > 0
          ? problems.slice(0, 3)
          : ['Zeitüberschreitung beim Start der App, keine Fehlerdetails erfasst (F12-Konsole prüfen).'];
        this._showError(status, details, appBase);
      }
    }, 200);
  }

  private _showError(status: HTMLDivElement, messages: string[], appBase: string): void {
    status.innerHTML = '';
    const inner: HTMLDivElement = document.createElement('div');
    inner.style.maxWidth = '1100px';
    const strong: HTMLElement = document.createElement('strong');
    strong.textContent = `Banking Horizon 2030 (SPFx v${APP_VERSION}) konnte nicht geladen werden.`;
    inner.appendChild(strong);
    for (const message of messages) {
      const msg: HTMLDivElement = document.createElement('div');
      msg.textContent = message;
      msg.style.marginTop = '10px';
      msg.style.wordBreak = 'break-word';
      msg.style.whiteSpace = 'pre-wrap';
      msg.style.textAlign = 'left';
      msg.style.fontFamily = 'monospace';
      msg.style.fontSize = '12px';
      inner.appendChild(msg);
    }
    const base: HTMLDivElement = document.createElement('div');
    base.textContent = `Asset-Basis: ${appBase}`;
    base.style.opacity = '0.7';
    base.style.marginTop = '12px';
    inner.appendChild(base);
    status.appendChild(inner);
    status.style.display = 'flex';
  }

  /**
   * Basis-URL der im Paket mitgelieferten App-Assets. SPFx stellt die
   * Auslieferungs-URL der ClientSideAssets (App-Katalog oder Office-365-CDN)
   * über die loaderConfig des Komponenten-Manifests bereit. Die App-Dateien
   * liegen flach (versionspräfixiert) direkt auf dieser Wurzelebene —
   * Unterordner des Pakets werden nicht in jedem Tenant ausgeliefert.
   */
  private _resolveAppBaseUrl(): string {
    const loaderConfig: { internalModuleBaseUrls: string[] } =
      this.context.manifest.loaderConfig as unknown as { internalModuleBaseUrls: string[] };
    let base: string = (loaderConfig && loaderConfig.internalModuleBaseUrls
      && loaderConfig.internalModuleBaseUrls[0]) || '';
    if (base && base.lastIndexOf('/') !== base.length - 1) {
      base += '/';
    }
    return base;
  }

  /**
   * Baut das komplette HTML-Dokument der App für das iframe. Der <base>-Tag
   * sorgt dafür, dass alle relativen Pfade der App ('./assets/…', './images/…')
   * gegen die ClientSideAssets-URL aufgelöst werden — exakt so, als würde die
   * App von ihrem eigenen index.html ausgeliefert. Das srcdoc ist bewusst
   * skriptfrei: Das App-Bundle (klassisches IIFE-Skript, kein ES-Modul —
   * Module scheitern am CORS des Office-365-CDN) wird von _bootApp aus dem
   * Host injiziert, der auch Ladefehler sichtbar meldet.
   */
  private _buildSrcdoc(appBaseUrl: string): string {
    return [
      '<!doctype html>',
      '<html lang="de">',
      '<head>',
      '<meta charset="UTF-8" />',
      `<base href="${appBaseUrl}" />`,
      '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      '<title>Banking Horizon 2030 — begehbares Strukturbild</title>',
      `<link rel="stylesheet" href="./${APP_ENTRY_CSS}">`,
      '</head>',
      '<body style="margin:0;background:#0b1410">',
      '<div id="root"></div>',
      `<div id="bh-status" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;color:#e8f3d1;background:#0b1410;font-family:sans-serif;font-size:15px;line-height:1.5;z-index:9999">Banking Horizon 2030 wird geladen … (v${APP_VERSION})</div>`,
      `<div style="position:fixed;right:8px;bottom:8px;z-index:10000;pointer-events:none;color:rgba(232,243,209,0.55);background:rgba(11,20,16,0.55);border-radius:4px;padding:2px 7px;font-family:monospace;font-size:11px">v${APP_VERSION}</div>`,
      '</body>',
      '</html>'
    ].join('');
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.DisplayGroupName,
              groupFields: [
                PropertyPaneToggle('fullHeight', {
                  label: strings.FullHeightFieldLabel,
                  onText: strings.ToggleOn,
                  offText: strings.ToggleOff
                }),
                PropertyPaneSlider('fixedHeight', {
                  label: strings.FixedHeightFieldLabel,
                  min: 400,
                  max: 2000,
                  step: 50,
                  disabled: this.properties.fullHeight
                })
              ]
            },
            {
              groupName: strings.SourceGroupName,
              groupFields: [
                PropertyPaneTextField('externalUrl', {
                  label: strings.ExternalUrlFieldLabel,
                  description: strings.ExternalUrlFieldDescription
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
