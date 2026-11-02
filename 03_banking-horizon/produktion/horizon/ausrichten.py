#!/usr/bin/env python3
"""Sub-Pixel-Ausrichtung einer Vorlage im Bild — Lucas-Kanade, invers
kompositionell, robust gewichtet.

Warum das noetig wurde: Der zurueckgeholte Bildschirmtext zitterte gegen
den Rahmen — 0,4 bis 0,8 Pixel im Mittel, Spitzen bis 4 Pixel (gemessen
mit zittern_horizon.py). Zwei Ursachen, beide im alten Verfahren:

  1. Die Lage wurde je Bild aus GANZZAHLIGEN Korrelationsmaxima an 25
     Punkten geschaetzt. Jeder Punkt hat einen halben Pixel Spiel; die
     Homographie daraus wackelt um ein paar Zehntel.
  2. Das Wackeln wurde dann zeitlich geglaettet — und damit auch das ECHTE
     Zittern des Takes weggeglaettet. Veo haelt die Kamera nicht
     vollkommen still; der Rahmen zittert ein wenig, der eingesetzte Text
     folgte einer glatten Bahn. Der Unterschied ist genau das, was man
     sieht: Text gegen Rahmen.

So machen es die Werkzeuge der Branche (Mocha, Resolve Planar Tracker,
OpenCVs findTransformECC): die ganze Flaeche wird als Ebene verfolgt,
intensitaetsbasiert, iterativ, mit Sub-Pixel-Genauigkeit — und die
gefundene Bahn wird NICHT geglaettet, sondern Bild fuer Bild uebernommen.
Genau das hier, in numpy und scipy:

  * Vorlage T (Standbild-Ausschnitt) und Bild I werden leicht verwischt
    (verdorbene Buchstaben stoeren dann weniger, die Kanten der Tafeln
    tragen die Messung).
  * Invers kompositionell (Baker & Matthews): Gradienten und Jacobi der
    Vorlage einmal vorrechnen; je Schritt nur das Bild neu abtasten.
  * Je Schritt werden beide Bilder photometrisch normiert (Helligkeit
    darf sich aendern) und die Residuen robust gewichtet (Cauchy):
    Menschen vor dem Schirm und Buchstabensalat fallen als Ausreisser
    heraus, statt die Lage zu verziehen.
  * Modell: affin (6 Parameter) fuer frontal gesehene Wandschirme,
    Homographie (8) fuer schraeg stehende Flaechen wie den Laptop,
    Aehnlichkeit (4) fuer kleine Schilder.

Genauigkeit in der Praxis: unter 0,1 Pixel, wenn die Vorlage Struktur hat.
"""
import numpy as np
from scipy.ndimage import gaussian_filter, map_coordinates


def _parameter_matrix(p, modell):
    if modell == "hom":
        return np.array([[1 + p[0], p[1], p[2]],
                         [p[3], 1 + p[4], p[5]],
                         [p[6], p[7], 1.0]])
    if modell == "affin":
        return np.array([[1 + p[0], p[1], p[2]],
                         [p[3], 1 + p[4], p[5]],
                         [0.0, 0.0, 1.0]])
    # Aehnlichkeit: (a, b, tx, ty) -> [[1+a, -b, tx], [b, 1+a, ty], [0, 0, 1]]
    return np.array([[1 + p[0], -p[1], p[2]],
                     [p[1], 1 + p[0], p[3]],
                     [0.0, 0.0, 1.0]])


def _jacobi(x, y, modell):
    """dW/dp an p = 0, fuer jeden Punkt: 2 x n."""
    n = x.size
    if modell == "hom":
        jx = np.stack([x, y, np.ones(n), np.zeros(n), np.zeros(n), np.zeros(n), -x * x, -x * y], 1)
        jy = np.stack([np.zeros(n), np.zeros(n), np.zeros(n), x, y, np.ones(n), -x * y, -y * y], 1)
    elif modell == "affin":
        # Sechs Freiheitsgrade. Fuer frontal gesehene Wandschirme reicht das —
        # und die zwei perspektivischen Parameter der Homographie rauschten,
        # wo grosse Teile der Flaeche (Menschen) ausgeblendet sind: in h5
        # zitterte die rechte untere Ecke um ein Pixel, waehrend oben alles
        # ruhig war.
        jx = np.stack([x, y, np.ones(n), np.zeros(n), np.zeros(n), np.zeros(n)], 1)
        jy = np.stack([np.zeros(n), np.zeros(n), np.zeros(n), x, y, np.ones(n)], 1)
    else:
        jx = np.stack([x, -y, np.ones(n), np.zeros(n)], 1)
        jy = np.stack([y, x, np.zeros(n), np.ones(n)], 1)
    return jx, jy


class Vorlage:
    """Alles, was sich fuer eine Vorlage einmal vorrechnen laesst."""

    def __init__(self, bild, maske=None, modell="hom", sigma=2.0, schritt=None):
        self.modell = modell
        self.sigma = sigma
        T = gaussian_filter(np.asarray(bild, dtype=np.float64), sigma)
        h, b = T.shape
        if schritt is None:
            schritt = 2 if h * b > 150_000 else 1
        ys, xs = np.mgrid[0:h:schritt, 0:b:schritt]
        gy, gx = np.gradient(T)
        gueltig = np.ones_like(T, dtype=bool) if maske is None else np.asarray(maske, dtype=bool)
        # Rand weglassen: dort sind Gradienten und Abtastung unsicher.
        gueltig[:3, :] = gueltig[-3:, :] = False
        gueltig[:, :3] = gueltig[:, -3:] = False
        g = gueltig[ys, xs]
        self.x = xs[g].astype(np.float64)
        self.y = ys[g].astype(np.float64)
        self.t = T[ys, xs][g]
        self.t_mittel = float(self.t.mean())
        self.t_streu = float(self.t.std()) + 1e-6
        self.t_n = (self.t - self.t_mittel) / self.t_streu
        # Eckpunkte der Vorlage, um Schrittweiten in Pixeln zu messen.
        self.ecken = np.array([[0, 0, 1], [b, 0, 1], [0, h, 1], [b, h, 1]], dtype=np.float64)
        jx, jy = _jacobi(self.x, self.y, modell)
        self.sd = gx[ys, xs][g][:, None] * jx + gy[ys, xs][g][:, None] * jy   # n x np
        self.hom = np.ones(3, dtype=np.float64)


def verfeinern(vorlage, bild, H0, schritte=60, eps=0.01, glatt=None):
    """Homographie H (Vorlage -> Bild) ab dem Startwert H0 verfeinern.

    Rueckgabe: (H, Guete, Schritte). Guete ist die normierte Korrelation
    zwischen Vorlage und ausgerichtetem Bild ueber die gueltigen Punkte —
    1 bei perfekter Deckung; unter 0,4 ist die Ausrichtung nicht zu trauen.
    """
    I = glatt if glatt is not None else gaussian_filter(np.asarray(bild, dtype=np.float64), vorlage.sigma)
    H = np.array(H0, dtype=np.float64) / H0[2, 2]
    x, y, t_n, sd = vorlage.x, vorlage.y, vorlage.t_n, vorlage.sd
    n_p = sd.shape[1]
    guete = 0.0
    for k in range(schritte):
        w = H[2, 0] * x + H[2, 1] * y + H[2, 2]
        u = (H[0, 0] * x + H[0, 1] * y + H[0, 2]) / w
        v = (H[1, 0] * x + H[1, 1] * y + H[1, 2]) / w
        drin = (u >= 1) & (u < I.shape[1] - 2) & (v >= 1) & (v < I.shape[0] - 2)
        if drin.sum() < 50 * n_p:
            return H, 0.0, k
        iw = map_coordinates(I, [v, u], order=1, mode="nearest")
        iw_n = (iw - iw[drin].mean()) / (iw[drin].std() + 1e-6)
        # Residuum in GRAUWERTEN der Vorlage, nicht normiert: die Gradienten
        # in sd sind Grauwerte je Pixel, und Gauss-Newton braucht beide in
        # derselben Einheit. Mit normiertem Residuum waren die Schritte um
        # den Faktor der Grauwertstreuung (~50) zu klein — die Ausrichtung
        # kroch dem Bild hinterher, holte an ffmpegs verdoppelten Bildern
        # (24 -> 25 fps) den Rueckstand auf, und der Text ruckte dort um
        # 0,3 px, waehrend der Rahmen stillstand.
        e = iw_n * vorlage.t_streu - (vorlage.t - vorlage.t_mittel)
        # Cauchy-Gewichte um den robusten Streuungsschaetzer der Residuen.
        mad = np.median(np.abs(e[drin] - np.median(e[drin]))) * 1.4826 + 1e-6
        c = 2.5 * mad
        gew = drin / (1.0 + (e / c) ** 2)
        sdw = sd * gew[:, None]
        hess = sd.T @ sdw
        rhs = sdw.T @ e
        try:
            dp = np.linalg.solve(hess, rhs)
        except np.linalg.LinAlgError:
            return H, 0.0, k
        # Invers kompositionell: W(x; p) <- W(x; p) o W(x; dp)^-1
        dH = _parameter_matrix(dp, vorlage.modell)
        H = H @ np.linalg.inv(dH)
        H = H / H[2, 2]
        guete = float((iw_n[drin] * t_n[drin]).mean())
        # Abbruch, wenn der Schritt keine Ecke der Vorlage mehr als eps
        # Pixel bewegt.
        pe = (dH @ vorlage.ecken.T)
        pe = (pe[:2] / pe[2]).T
        bewegung = float(np.abs(pe - vorlage.ecken[:, :2]).max())
        if bewegung < eps:
            break
    return H, guete, k + 1


def aehnlich(m, dx, dy):
    """Aehnlichkeit aus Massstab und Verschiebung."""
    return np.array([[m, 0.0, dx], [0.0, m, dy], [0.0, 0.0, 1.0]])
