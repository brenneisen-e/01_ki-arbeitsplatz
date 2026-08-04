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

  public render(): void {
    const iframe: HTMLIFrameElement = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.background = '#0b1410';
    iframe.style.height = this.properties.fullHeight
      ? 'calc(100vh - 120px)'
      : `${this.properties.fixedHeight || 900}px`;
    iframe.setAttribute('allow', 'fullscreen; clipboard-write');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.title = 'Banking Horizon 2030';

    const externalUrl: string = (this.properties.externalUrl || '').trim();
    if (externalUrl) {
      iframe.src = externalUrl;
    } else {
      iframe.srcdoc = this._buildSrcdoc(this._resolveAppBaseUrl());
    }

    this.domElement.innerHTML = '';
    this.domElement.appendChild(iframe);
  }

  /**
   * Basis-URL der im Paket mitgelieferten App-Assets. SPFx stellt die
   * Auslieferungs-URL der ClientSideAssets (App-Katalog oder Office-365-CDN)
   * über die loaderConfig des Komponenten-Manifests bereit; die App selbst
   * liegt darunter im Unterordner `app/`.
   */
  private _resolveAppBaseUrl(): string {
    const loaderConfig: { internalModuleBaseUrls: string[] } =
      this.context.manifest.loaderConfig as unknown as { internalModuleBaseUrls: string[] };
    let base: string = (loaderConfig && loaderConfig.internalModuleBaseUrls
      && loaderConfig.internalModuleBaseUrls[0]) || '';
    if (base && base.lastIndexOf('/') !== base.length - 1) {
      base += '/';
    }
    return `${base}app/`;
  }

  /**
   * Baut das komplette HTML-Dokument der App für das iframe. Der <base>-Tag
   * sorgt dafür, dass alle relativen Pfade der App ('./assets/…', './images/…')
   * gegen die ClientSideAssets-URL aufgelöst werden — exakt so, als würde die
   * App von ihrem eigenen index.html ausgeliefert. Das App-Bundle ist bewusst
   * ein klassisches IIFE-Skript (kein ES-Modul): Modul-Skripte werden immer
   * mit CORS geladen und scheitern, wenn das Office-365-CDN die Assets ohne
   * CORS-Header ausliefert. Ein Status-Overlay macht Ladefehler sichtbar,
   * statt einen schwarzen Bildschirm zu hinterlassen.
   */
  private _buildSrcdoc(appBaseUrl: string): string {
    const statusScript: string = [
      'var st=document.getElementById("bh-status");',
      'function bhFail(msg){if(st){st.innerHTML="<strong>Banking Horizon 2030 konnte nicht geladen werden.</strong><br>"+msg+"<br><br>Asset-Basis: "+document.baseURI;st.style.display="block";}}',
      'window.addEventListener("error",function(e){if(e&&e.message){bhFail(e.message);}},true);',
      'var tries=0;var t=setInterval(function(){var r=document.getElementById("root");',
      'if(r&&r.childElementCount>0){if(st){st.style.display="none";}clearInterval(t);}',
      'else if(++tries>150){bhFail("Zeitüberschreitung beim Start der App.");clearInterval(t);}},200);'
    ].join('');
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
      `<script>${statusScript}</script>`,
      `<script src="./${APP_ENTRY_JS}" onerror="bhFail('Bundle nicht erreichbar: ' + this.src)"></script>`,
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
