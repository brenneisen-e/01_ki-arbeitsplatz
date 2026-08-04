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
   * App von ihrem eigenen index.html ausgeliefert.
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
      `<script type="module" crossorigin src="./${APP_ENTRY_JS}"></script>`,
      `<link rel="stylesheet" href="./${APP_ENTRY_CSS}">`,
      '</head>',
      '<body style="margin:0">',
      '<div id="root"></div>',
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
