/*
 * Laufzeit-Hilfe für single.html (DEX-Einzeldatei).
 *
 * Vite bettet nur importierte Dateien ein. Dateien aus public/ (Fotos, JSON,
 * Vorlagen), die die App per Pfad anspricht ('images/x.jpeg', '/images/x.jpeg',
 * fetch('data/chapters.json')), fehlen in der Einzeldatei, und unter file://
 * darf der Browser sie ohnehin nicht nachladen. pack.mjs legt sie deshalb als
 * Tabelle in window.__DEX_DATEIEN ab ({ 'images/x.jpeg': ['image/jpeg', '<base64>'] }),
 * und dieses Skript lenkt jeden Zugriff darauf um:
 *   fetch, XMLHttpRequest, src/href/poster von Bild, Quelle, Video, Audio,
 *   Link und Anker (Eigenschaft und setAttribute), url(...) in Inline-Styles,
 *   dazu ein MutationObserver für alles, was trotzdem im DOM landet.
 * Die Tabelle wird von pack.mjs vor diesem Skript eingefügt.
 */
(function () {
  'use strict';
  var D = window.__DEX_DATEIEN || {};
  var ID = window.__DEX_ID || '';
  var leer = true;
  for (var k in D) { leer = false; break; }
  if (leer) return;

  var dataUrls = {};
  var basisPfad;
  try { basisPfad = decodeURIComponent(new URL('.', location.href).pathname); } catch (e) { basisPfad = '/'; }

  function schluessel(u) {
    if (u == null) return null;
    if (typeof u !== 'string') {
      if (typeof u.url === 'string') u = u.url;
      else if (typeof u.href === 'string') u = u.href;
      else u = String(u);
    }
    if (!u || /^(data|blob|javascript|mailto|tel|about):/i.test(u)) return null;
    var a;
    try { a = new URL(u, document.baseURI); } catch (e) { return null; }
    if (a.protocol !== 'file:' && a.origin !== location.origin) return null;
    var p;
    try { p = decodeURIComponent(a.pathname); } catch (e) { p = a.pathname; }
    var kandidaten = [];
    if (p.indexOf(basisPfad) === 0) kandidaten.push(p.slice(basisPfad.length));
    var ohne = p.replace(/^\/+/, '');
    kandidaten.push(ohne);
    if (ID) {
      var m = ohne.indexOf(ID + '/');
      if (m !== -1) {
        var rest = ohne.slice(m + ID.length + 1);
        kandidaten.push(rest, rest.replace(/^dist\//, ''));
      }
    }
    for (var i = 0; i < kandidaten.length; i++) {
      if (Object.prototype.hasOwnProperty.call(D, kandidaten[i])) return kandidaten[i];
    }
    return null;
  }

  function dataUrl(k) {
    if (!dataUrls[k]) dataUrls[k] = 'data:' + D[k][0] + ';base64,' + D[k][1];
    return dataUrls[k];
  }
  function umlenken(u) {
    var k = schluessel(u);
    return k ? dataUrl(k) : u;
  }
  function bytes(k) {
    var bin = atob(D[k][1]);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  var URL_RE = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  function cssUmlenken(v) {
    if (typeof v !== 'string' || v.indexOf('url(') === -1) return v;
    return v.replace(URL_RE, function (ganz, q, u) {
      var k = schluessel(u);
      return k ? 'url("' + dataUrl(k) + '")' : ganz;
    });
  }

  // fetch
  if (window.fetch) {
    var origFetch = window.fetch;
    window.fetch = function (eingabe, init) {
      var k = schluessel(eingabe);
      if (k) {
        return Promise.resolve(new Response(bytes(k), {
          status: 200,
          headers: { 'content-type': D[k][0] },
        }));
      }
      return origFetch.apply(this, arguments);
    };
  }

  // XMLHttpRequest
  if (window.XMLHttpRequest) {
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (methode, url) {
      var args = Array.prototype.slice.call(arguments);
      args[1] = umlenken(url);
      return origOpen.apply(this, args);
    };
  }

  // Eigenschaften src/href/poster
  function patchEigenschaft(Klasse, name) {
    if (!Klasse) return;
    var d = Object.getOwnPropertyDescriptor(Klasse.prototype, name);
    if (!d || !d.set) return;
    Object.defineProperty(Klasse.prototype, name, {
      configurable: true,
      enumerable: d.enumerable,
      get: d.get,
      set: function (v) { d.set.call(this, umlenken(v)); },
    });
  }
  [
    [window.HTMLImageElement, 'src'], [window.HTMLSourceElement, 'src'],
    [window.HTMLMediaElement, 'src'], [window.HTMLVideoElement, 'poster'],
    [window.HTMLLinkElement, 'href'], [window.HTMLAnchorElement, 'href'],
    [window.HTMLEmbedElement, 'src'], [window.HTMLObjectElement, 'data'],
  ].forEach(function (e) { patchEigenschaft(e[0], e[1]); });

  var ATTRS = { src: 1, href: 1, poster: 1, data: 1 };
  var origSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, wert) {
    var n = String(name).toLowerCase();
    if (ATTRS[n] && typeof wert === 'string') wert = umlenken(wert);
    else if (n === 'style' && typeof wert === 'string') wert = cssUmlenken(wert);
    return origSetAttribute.call(this, name, wert);
  };

  // Inline-Styles (React setzt style.backgroundImage bzw. setProperty)
  var CSSD = window.CSSStyleDeclaration && CSSStyleDeclaration.prototype;
  if (CSSD) {
    ['background', 'backgroundImage', 'cssText', 'maskImage', 'webkitMaskImage', 'listStyleImage', 'content'].forEach(function (name) {
      var d = Object.getOwnPropertyDescriptor(CSSD, name);
      if (!d || !d.set) return;
      Object.defineProperty(CSSD, name, {
        configurable: true,
        enumerable: d.enumerable,
        get: d.get,
        set: function (v) { d.set.call(this, cssUmlenken(v)); },
      });
    });
    var origSetProperty = CSSD.setProperty;
    CSSD.setProperty = function (name, wert, prio) {
      return origSetProperty.call(this, name, cssUmlenken(wert), prio);
    };
  }

  // Sicherheitsnetz für Markup, das ohne die Setter ins DOM kam (innerHTML, index.html)
  function pruefeElement(el) {
    if (!el || el.nodeType !== 1) return;
    for (var a in ATTRS) {
      var v = el.getAttribute(a);
      if (v) { var n = umlenken(v); if (n !== v) origSetAttribute.call(el, a, n); }
    }
    var s = el.getAttribute('style');
    if (s && s.indexOf('url(') !== -1) {
      var ns = cssUmlenken(s);
      if (ns !== s) origSetAttribute.call(el, 'style', ns);
    }
  }
  function pruefeBaum(wurzel) {
    pruefeElement(wurzel);
    if (wurzel.querySelectorAll) {
      var alle = wurzel.querySelectorAll('[src],[href],[poster],[data],[style]');
      for (var i = 0; i < alle.length; i++) pruefeElement(alle[i]);
    }
  }
  if (window.MutationObserver) {
    new MutationObserver(function (liste) {
      for (var i = 0; i < liste.length; i++) {
        var m = liste[i];
        if (m.type === 'attributes') pruefeElement(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) pruefeBaum(m.addedNodes[j]);
      }
    }).observe(document.documentElement, {
      subtree: true, childList: true, attributes: true,
      attributeFilter: ['src', 'href', 'poster', 'data', 'style'],
    });
  }
})();
