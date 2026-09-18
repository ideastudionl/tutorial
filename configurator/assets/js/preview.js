/*
 * ============================================================================
 *  FORTIS KOZIJNEN - OFFERTE CONFIGURATOR
 *  preview.js  ->  Live technische tekening (SVG) van het geconfigureerde
 *                  kozijn: vakverdeling, draairichting, ventilatierooster,
 *                  horren, muuraansluiting en maatvoering.
 * ============================================================================
 */

window.FortisPreview = (function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  var VB  = { w: 560, h: 470 };
  var PAD = { top: 30, right: 62, bottom: 66, left: 30 };

  function el(tag, attrs, parent) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(node);
    return node;
  }

  /** Nooit een negatieve maat in de tekening: SVG weigert die. */
  function nn(waarde) { return Math.max(0, waarde || 0); }

  function tekst(parent, x, y, inhoud, extra) {
    var attrs = {
      x: x, y: y, 'text-anchor': 'middle', 'font-size': 11.5,
      fill: '#475569', 'font-family': 'inherit'
    };
    Object.keys(extra || {}).forEach(function (k) { attrs[k] = extra[k]; });
    var t = el('text', attrs, parent);
    t.textContent = inhoud;
    return t;
  }

  /** hex-kleur lichter (pct > 0) of donkerder (pct < 0) maken. */
  function shade(hex, pct) {
    var c = String(hex || '#ffffff').replace('#', '');
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    var num = parseInt(c, 16);
    var r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
    function mix(v) { return Math.min(255, Math.max(0, Math.round(v + 255 * pct))); }
    return 'rgb(' + mix(r) + ',' + mix(g) + ',' + mix(b) + ')';
  }

  /* ========================================================== hoofdtekening */

  /**
   * @param {SVGElement} svg    doel-element
   * @param {Object}     item   configuratie van één kozijn
   * @param {Object}     opties { maatvoering: false } voor een thumbnail
   */
  function render(svg, item, opties) {
    opties = opties || {};
    var P = window.FortisPricing;
    var CAT = window.FORTIS_CATALOG;

    var kleurBuiten = P.byId(CAT.colors, item.colorOut) || CAT.colors[0];
    var glas        = P.byId(CAT.glazing, item.glass) || CAT.glazing[0];
    var aansluiting = P.byId(CAT.muuraansluitingen, item.muuraansluiting);
    var rooster     = P.byId(CAT.roosters, item.rooster);
    var muurKleur   = (item.muurRal && item.muurRal !== 'gelijk')
      ? (P.byId(CAT.colors, item.muurRal) || kleurBuiten)
      : kleurBuiten;

    svg.setAttribute('viewBox', '0 0 ' + VB.w + ' ' + VB.h);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Tekening van het kozijn: ' + P.samenvatting(item));
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var toonMaten = opties.maatvoering !== false;

    /* --- schaal: het kozijn past altijd binnen het tekenvlak ------------- */
    var vlakW = VB.w - PAD.left - PAD.right;
    var vlakH = VB.h - PAD.top - PAD.bottom;
    var schaal = Math.min(vlakW / item.width, vlakH / item.height);

    var W = item.width * schaal;
    var H = item.height * schaal;
    var X = PAD.left + (vlakW - W) / 2;
    var Y = PAD.top + (vlakH - H) / 2;

    var g = el('g', {}, svg);

    /* --- muuraansluiting: band rondom het kozijn ------------------------- */
    if (aansluiting && aansluiting.id !== 'geen') {
      var band = Math.max(5, Math.min(11, 45 * schaal));
      el('rect', {
        x: X - band, y: Y - band, width: nn(W + 2 * band), height: nn(H + band),
        fill: muurKleur.hex, stroke: shade(muurKleur.hex, -0.3), 'stroke-width': 0.8, rx: 1
      }, g);
    }

    /* --- profieldiktes --------------------------------------------------- */
    var kozijnDikte  = Math.max(6, Math.min(15, 68 * schaal));
    var vleugelDikte = Math.max(4, kozijnDikte * 0.72);
    var stijlDikte   = Math.max(5, kozijnDikte * 0.85);

    /* --- buitenkozijn ---------------------------------------------------- */
    el('rect', {
      x: X, y: Y, width: nn(W), height: nn(H),
      fill: kleurBuiten.hex, stroke: shade(kleurBuiten.hex, -0.3),
      'stroke-width': 1.2, rx: 2
    }, g);

    var binnenX = X + kozijnDikte;
    var binnenY = Y + kozijnDikte;
    var binnenW = nn(W - 2 * kozijnDikte);
    var binnenH = nn(H - 2 * kozijnDikte);

    var glasKleur = '#dcebf2';
    var glasOpacity = (glas.id === 'figuur') ? 0.95 : 0.85;

    var hoofdY = binnenY;
    var hoofdH = binnenH;

    /* --- ventilatierooster in het bovenkozijn ---------------------------- */
    if (rooster && rooster.id !== 'geen') {
      var rhBase = Math.max(7, Math.min(14, 90 * schaal));
      var rh = nn(Math.min(rhBase, binnenH * 0.2));
      tekenRooster(g, binnenX, hoofdY, binnenW, rh, kleurBuiten.hex);
      hoofdY += rh;
      hoofdH -= rh;
    }

    /* --- rijen: bovenlicht en hoofdvakken -------------------------------- */
    var rijen = [];
    if (item.bovenlicht) {
      var blDeel = item.bovenlichtHoogte / item.height;
      var blH = Math.min(nn(hoofdH - kozijnDikte - 8), Math.max(0, binnenH * blDeel));
      rijen.push({
        y: hoofdY, h: blH,
        vakken: [{ breedte: item.width, invulling: item.bovenlichtInvulling || 'vast' }]
      });
      el('rect', {
        x: binnenX, y: hoofdY + blH, width: binnenW, height: nn(kozijnDikte),
        fill: kleurBuiten.hex, stroke: shade(kleurBuiten.hex, -0.3), 'stroke-width': 1
      }, g);
      rijen.push({
        y: hoofdY + blH + kozijnDikte,
        h: nn(hoofdH - blH - kozijnDikte),
        vakken: item.vakken
      });
    } else {
      rijen.push({ y: hoofdY, h: nn(hoofdH), vakken: item.vakken });
    }

    /* --- vakken tekenen --------------------------------------------------- */
    var vakPosities = [];   // voor de maatvoering per vak

    rijen.forEach(function (rij) {
      var vakken = rij.vakken || [];
      var somMm = vakken.reduce(function (s, v) { return s + v.breedte; }, 0) || 1;
      var tussen = (vakken.length - 1) * stijlDikte;
      var beschikbaar = nn(binnenW - tussen);
      var x = binnenX;

      vakken.forEach(function (vak, i) {
        var vw = nn(beschikbaar * (vak.breedte / somMm));
        tekenVak(g, {
          x: x, y: rij.y, w: vw, h: rij.h,
          invulling: vak.invulling,
          kleur: kleurBuiten.hex,
          glasKleur: glasKleur,
          glasOpacity: glasOpacity,
          vleugelDikte: vleugelDikte,
          hor: item.hor && item.hor.type && item.hor.type !== 'geen' &&
               (item.hor.aantal || 0) > 0
        });

        if (rij.vakken === item.vakken) {
          vakPosities.push({ x: x, w: vw, mm: vak.breedte });
        }

        x += vw;
        if (i < vakken.length - 1) {
          el('rect', {
            x: x, y: rij.y, width: nn(stijlDikte), height: nn(rij.h),
            fill: kleurBuiten.hex, stroke: shade(kleurBuiten.hex, -0.3), 'stroke-width': 1
          }, g);
          x += stijlDikte;
        }
      });
    });

    /* --- maatvoering ------------------------------------------------------ */
    if (toonMaten) {
      var maten = el('g', { 'class': 'fk-maatvoering' }, svg);
      maatBreedte(maten, X, Y + H + 22, W, item.width + ' mm', 12);
      if (vakPosities.length > 1) {
        vakPosities.forEach(function (v) {
          maatBreedte(maten, v.x, Y + H + 44, v.w, v.mm, 10.5, '#94a3b8');
        });
      }
      maatHoogte(maten, X + W + 26, Y, H, item.height + ' mm');
    }
  }

  /* ---------------------------------------------------------------- een vak */

  function tekenVak(g, o) {
    var isOpen = o.invulling !== 'vast' && o.invulling !== 'paneel';
    var d = isOpen ? o.vleugelDikte : 1;
    o.w = nn(o.w);
    o.h = nn(o.h);

    if (o.invulling === 'paneel') {
      el('rect', {
        x: o.x, y: o.y, width: o.w, height: o.h,
        fill: shade(o.kleur, -0.06), stroke: shade(o.kleur, -0.28), 'stroke-width': 0.8
      }, g);
      /* paneelgroeven */
      for (var k = 1; k <= 3; k++) {
        var ly = o.y + (o.h * k) / 4;
        el('line', {
          x1: o.x + o.w * 0.12, y1: ly, x2: o.x + o.w * 0.88, y2: ly,
          stroke: shade(o.kleur, -0.2), 'stroke-width': 0.8, opacity: 0.7
        }, g);
      }
      return;
    }

    /* glasvlak */
    el('rect', {
      x: o.x, y: o.y, width: o.w, height: o.h,
      fill: o.glasKleur, opacity: o.glasOpacity,
      stroke: shade(o.kleur, -0.2), 'stroke-width': 0.8
    }, g);

    /* lichtinval */
    el('polygon', {
      points: [
        o.x + o.w * 0.08, o.y + o.h,
        o.x + o.w * 0.45, o.y,
        o.x + o.w * 0.66, o.y,
        o.x + o.w * 0.29, o.y + o.h
      ].join(' '),
      fill: '#ffffff', opacity: 0.2
    }, g);

    if (isOpen) {
      el('rect', {
        x: o.x, y: o.y, width: o.w, height: o.h,
        fill: 'none', stroke: o.kleur, 'stroke-width': d, rx: 1
      }, g);
      el('rect', {
        x: o.x + d / 2, y: o.y + d / 2, width: nn(o.w - d), height: nn(o.h - d),
        fill: 'none', stroke: shade(o.kleur, -0.28), 'stroke-width': 0.7
      }, g);

      /* hor: fijn raster over het te openen deel */
      if (o.hor) {
        el('rect', {
          x: o.x + d, y: o.y + d, width: nn(o.w - 2 * d), height: nn(o.h - 2 * d),
          fill: 'url(#fk-hor)', opacity: 0.5
        }, g);
      }
    }

    tekenSymbool(g, o, d);
  }

  /* ------------------------------------- symbolen voor de openingsrichting */

  function tekenSymbool(g, o, d) {
    var open = o.invulling;
    if (open === 'vast' || open === 'paneel') return;

    var x1 = o.x + d, y1 = o.y + d;
    var x2 = o.x + o.w - d, y2 = o.y + o.h - d;
    var midY = (y1 + y2) / 2;
    var midX = (x1 + x2) / 2;

    // In een kleine tekening moeten de streeplijnen wat steviger zijn,
    // anders is het verschil tussen draaien en draaikiepen niet te zien.
    var klein = o.w < 120;
    var lijn = {
      stroke: '#1f2937', 'stroke-width': klein ? 1.6 : 1.2,
      'stroke-dasharray': klein ? '4 3' : '5 4',
      fill: 'none', opacity: klein ? 0.9 : 0.75
    };

    /* De punt van de driehoek wijst altijd naar de scharnierzijde. */
    function draai(scharnierLinks) {
      var px = scharnierLinks ? x1 : x2;
      var bx = scharnierLinks ? x2 : x1;
      el('path', Object.assign({ d: 'M' + bx + ' ' + y1 + ' L' + px + ' ' + midY + ' L' + bx + ' ' + y2 }, lijn), g);
    }
    function kiep() {
      el('path', Object.assign({ d: 'M' + x1 + ' ' + y1 + ' L' + midX + ' ' + y2 + ' L' + x2 + ' ' + y1 }, lijn), g);
    }
    function uitzet() {
      el('path', Object.assign({ d: 'M' + x1 + ' ' + y2 + ' L' + midX + ' ' + y1 + ' L' + x2 + ' ' + y2 }, lijn), g);
    }
    function kruk(scharnierLinks) {
      var kx = scharnierLinks ? x2 - 4 : x1 + 4;
      el('rect', {
        x: kx - 2, y: midY - 9, width: 4, height: 18, rx: 2,
        fill: '#9aa3ad', stroke: '#6b7280', 'stroke-width': 0.6
      }, g);
    }
    function schuifpijl(naarLinks) {
      var y = y2 - 14;
      var lengte = Math.min(o.w * 0.55, 56);
      var sx = midX - lengte / 2, ex = midX + lengte / 2;
      var punt = naarLinks ? sx : ex;
      var staart = naarLinks ? ex : sx;
      el('line', { x1: staart, y1: y, x2: punt, y2: y, stroke: '#1f2937', 'stroke-width': 1.4, opacity: 0.8 }, g);
      var r = naarLinks ? 1 : -1;
      el('polygon', {
        points: [punt, y, punt + r * 8, y - 4, punt + r * 8, y + 4].join(' '),
        fill: '#1f2937', opacity: 0.8
      }, g);
    }

    switch (open) {
      case 'dk-l':     draai(true);  kiep(); kruk(true);  break;
      case 'dk-r':     draai(false); kiep(); kruk(false); break;
      case 'draai-l':  draai(true);  kruk(true);  break;
      case 'draai-r':  draai(false); kruk(false); break;
      case 'val':      uitzet(); break;
      case 'deur-l':   draai(true);  kruk(true);  break;
      case 'deur-r':   draai(false); kruk(false); break;
      case 'schuif-l': schuifpijl(true);  break;
      case 'schuif-r': schuifpijl(false); break;
    }
  }

  /* ------------------------------------------------------------- rooster */

  function tekenRooster(g, x, y, w, h, kleur) {
    w = nn(w); h = nn(h);
    el('rect', {
      x: x, y: y, width: w, height: h,
      fill: shade(kleur, -0.1), stroke: shade(kleur, -0.3), 'stroke-width': 0.8
    }, g);
    var stap = 6;
    for (var lx = x + 4; lx < x + w - 3; lx += stap) {
      el('line', {
        x1: lx, y1: y + 2.5, x2: lx, y2: y + h - 2.5,
        stroke: shade(kleur, -0.35), 'stroke-width': 1, opacity: 0.65
      }, g);
    }
  }

  /* ---------------------------------------------------------- maatvoering */

  function maatBreedte(g, x, y, breedte, label, fontSize, kleur) {
    var stijl = { stroke: kleur || '#94a3b8', 'stroke-width': 1 };
    el('line', Object.assign({ x1: x, y1: y, x2: x + breedte, y2: y }, stijl), g);
    el('line', Object.assign({ x1: x, y1: y - 4, x2: x, y2: y + 4 }, stijl), g);
    el('line', Object.assign({ x1: x + breedte, y1: y - 4, x2: x + breedte, y2: y + 4 }, stijl), g);
    tekst(g, x + breedte / 2, y + (fontSize || 12) + 3, label, {
      'font-size': fontSize || 12, fill: kleur || '#475569'
    });
  }

  function maatHoogte(g, x, y, hoogte, label) {
    var stijl = { stroke: '#94a3b8', 'stroke-width': 1 };
    el('line', Object.assign({ x1: x, y1: y, x2: x, y2: y + hoogte }, stijl), g);
    el('line', Object.assign({ x1: x - 4, y1: y, x2: x + 4, y2: y }, stijl), g);
    el('line', Object.assign({ x1: x - 4, y1: y + hoogte, x2: x + 4, y2: y + hoogte }, stijl), g);
    tekst(g, x + 14, y + hoogte / 2, label, {
      transform: 'rotate(90 ' + (x + 14) + ' ' + (y + hoogte / 2) + ')'
    });
  }

  /* ------------------------------------------------- patroon voor horgaas */

  /** Voegt eenmalig de <defs> met het horpatroon toe aan een svg-element. */
  function zorgVoorDefs(svg) {
    if (svg.querySelector('#fk-hor')) return;
    var defs = el('defs', {}, svg);
    var pat = el('pattern', {
      id: 'fk-hor', width: 4, height: 4, patternUnits: 'userSpaceOnUse'
    }, defs);
    el('path', {
      d: 'M0 0 H4 M0 2 H4 M0 0 V4 M2 0 V4',
      stroke: '#5b6875', 'stroke-width': 0.4, fill: 'none'
    }, pat);
  }

  function renderMet(svg, item, opties) {
    render(svg, item, opties);
    zorgVoorDefs(svg);
  }

  /** Kleine tekening voor de offerteregels (zonder maatvoering). */
  function renderThumb(svg, item) {
    var bewaar = { top: PAD.top, right: PAD.right, bottom: PAD.bottom, left: PAD.left };
    PAD.top = PAD.right = PAD.bottom = PAD.left = 8;
    try {
      renderMet(svg, item, { maatvoering: false });
    } finally {
      PAD.top = bewaar.top; PAD.right = bewaar.right;
      PAD.bottom = bewaar.bottom; PAD.left = bewaar.left;
    }
  }

  return { render: renderMet, renderThumb: renderThumb };
})();
