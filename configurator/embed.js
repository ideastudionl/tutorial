/*
 * ============================================================================
 *  FORTIS KOZIJNEN - OFFERTE CONFIGURATOR
 *  embed.js  ->  Plaatst de configurator met één regel op elke website
 *                (WordPress, Wix, Joomla, een eigen CMS, ...).
 * ============================================================================
 *
 *  Gebruik: zet dit op de pagina waar de configurator moet komen.
 *
 *    <div id="fortis-configurator"></div>
 *    <script src="https://www.fortiskozijnen.nl/configurator/embed.js"
 *            data-doel="#fortis-configurator"></script>
 *
 *  Het script laadt de configurator in een iframe en past de hoogte
 *  automatisch aan, zodat er geen scrollbalk in de pagina ontstaat.
 * ============================================================================
 */

(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var doelSelector = script.getAttribute('data-doel') || '#fortis-configurator';
  var bron = script.getAttribute('data-bron') ||
             script.src.replace(/embed\.js(\?.*)?$/, 'index.html');

  function plaats() {
    var doel = document.querySelector(doelSelector);
    if (!doel) {
      // Geen doel-element gevonden: direct onder het script plaatsen.
      doel = document.createElement('div');
      script.parentNode.insertBefore(doel, script);
    }

    var iframe = document.createElement('iframe');
    iframe.src = bron;
    iframe.title = 'Offerte configurator Fortis Kozijnen';
    iframe.loading = 'lazy';
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.style.cssText = 'width:100%;border:0;display:block;min-height:900px;overflow:hidden';
    doel.appendChild(iframe);

    window.addEventListener('message', function (e) {
      var data = e.data;
      if (!data || data.type !== 'fortis-configurator:hoogte') return;
      if (iframe.contentWindow !== e.source) return;      // alleen ons eigen iframe
      var hoogte = parseInt(data.hoogte, 10);
      if (hoogte > 200 && hoogte < 20000) iframe.style.height = hoogte + 'px';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', plaats);
  } else {
    plaats();
  }
})();
