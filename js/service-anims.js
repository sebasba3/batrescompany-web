document.addEventListener('DOMContentLoaded', function () {

  var INK      = '#1A1A1A';
  var SLATE    = '#2C2C2C';
  var CONCRETE = '#F5F5F5';
  var PAPER    = '#FFFFFF';
  var RUST     = '#C95A0F';
  var MUTED    = '#6B6B6B';

  function makeJagged(x0, y0, length) {
    var steps = 18;
    var dx = length / steps;
    var d = 'M ' + x0 + ' ' + y0;
    for (var i = 1; i <= steps; i++) {
      var x = x0 + i * dx;
      var y = y0 + (Math.sin(i * 1.3) * 6 + (i % 3 === 0 ? 8 : -4));
      d += ' L ' + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }

  /* ===========================================================
     01 — WORKFLOW AUTOMATION
     =========================================================== */
  function buildWFSvg() {
    var icons = [
      {
        x: 60, y: 40, r: -8, delay: 0,
        body: '<rect x="0" y="0" width="64" height="80" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
              '<line x1="12" y1="20" x2="52" y2="20" stroke="' + INK + '" stroke-width="1.5"/>' +
              '<line x1="12" y1="32" x2="52" y2="32" stroke="' + INK + '" stroke-width="1.5"/>' +
              '<line x1="12" y1="44" x2="40" y2="44" stroke="' + INK + '" stroke-width="1.5"/>' +
              '<line x1="12" y1="56" x2="48" y2="56" stroke="' + INK + '" stroke-width="1.5"/>'
      },
      {
        x: 190, y: 20, r: 6, delay: 0.4,
        body: '<rect x="0" y="0" width="80" height="56" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
              '<path d="M 0 0 L 40 32 L 80 0" fill="none" stroke="' + INK + '" stroke-width="2"/>'
      },
      {
        x: 330, y: 50, r: -4, delay: 0.8,
        body: '<rect x="0" y="0" width="72" height="72" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
              '<line x1="0" y1="18" x2="72" y2="18" stroke="' + INK + '" stroke-width="2"/>' +
              '<line x1="18" y1="0" x2="18" y2="10" stroke="' + INK + '" stroke-width="2"/>' +
              '<line x1="54" y1="0" x2="54" y2="10" stroke="' + INK + '" stroke-width="2"/>' +
              '<rect x="14" y="32" width="10" height="10" fill="' + INK + '"/>' +
              '<rect x="32" y="32" width="10" height="10" fill="' + INK + '"/>' +
              '<rect x="50" y="32" width="10" height="10" fill="' + INK + '"/>' +
              '<rect x="14" y="48" width="10" height="10" fill="' + INK + '"/>'
      },
      {
        x: 480, y: 30, r: 8, delay: 1.2,
        body: '<path d="M 0 0 L 90 0 L 90 50 L 30 50 L 18 64 L 18 50 L 0 50 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
              '<circle cx="22" cy="25" r="3" fill="' + INK + '"/>' +
              '<circle cx="45" cy="25" r="3" fill="' + INK + '"/>' +
              '<circle cx="68" cy="25" r="3" fill="' + INK + '"/>'
      },
      {
        x: 620, y: 50, r: -6, delay: 1.6,
        body: '<path d="M 30 0 C 14 0 4 12 4 30 L 4 50 L 0 56 L 60 56 L 56 50 L 56 30 C 56 12 46 0 30 0 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
              '<path d="M 22 60 Q 30 70 38 60" fill="none" stroke="' + INK + '" stroke-width="2"/>'
      },
      {
        x: 720, y: 30, r: 10, delay: 2.0,
        body: '<rect x="0" y="0" width="68" height="68" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
              '<line x1="10" y1="20" x2="58" y2="20" stroke="' + INK + '" stroke-width="1.5"/>' +
              '<line x1="10" y1="32" x2="50" y2="32" stroke="' + INK + '" stroke-width="1.5"/>' +
              '<line x1="10" y1="44" x2="44" y2="44" stroke="' + INK + '" stroke-width="1.5"/>'
      }
    ];

    var iconsHtml = icons.map(function (ic) {
      return '<g transform="translate(' + ic.x + ', ' + ic.y + ') rotate(' + ic.r + ')">' +
               ic.body +
               '<animateTransform attributeName="transform" type="translate" additive="sum"' +
               ' values="0 0; 0 -10; 0 6; 0 -4; 0 0" keyTimes="0; 0.25; 0.5; 0.75; 1"' +
               ' dur="3.6s" begin="' + ic.delay + 's" repeatCount="indefinite"/>' +
             '</g>';
    }).join('');

    return (
      '<svg viewBox="0 0 920 620" style="overflow:visible;width:100%;height:auto;display:block;">' +

        iconsHtml +

        '<g opacity="0.4">' +
          '<line x1="120" y1="160" x2="430" y2="270" stroke="' + INK + '" stroke-width="1" stroke-dasharray="3 4"/>' +
          '<line x1="780" y1="160" x2="490" y2="270" stroke="' + INK + '" stroke-width="1" stroke-dasharray="3 4"/>' +
        '</g>' +

        '<g transform="translate(0, 340)">' +
          '<line x1="60" y1="80" x2="860" y2="80" stroke="' + INK + '" stroke-width="2"/>' +

          '<g transform="translate(120, 80)">' +
            '<rect x="-44" y="-44" width="88" height="88" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
            '<path d="M -18 -16 L 18 -16 L 18 8 L 0 8 L -8 18 L -8 8 L -18 8 Z" fill="none" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<text y="76" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="11" letter-spacing="1.8" fill="' + INK + '" font-weight="600">WHATSAPP</text>' +
          '</g>' +

          '<g transform="translate(460, 80)">' +
            '<rect x="-44" y="-44" width="88" height="88" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
            '<rect x="-18" y="-18" width="36" height="36" fill="none" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<line x1="-18" y1="-8" x2="18" y2="-8" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<rect x="-12" y="-2" width="6" height="6" fill="' + INK + '"/>' +
            '<rect x="-3" y="-2" width="6" height="6" fill="' + INK + '"/>' +
            '<rect x="6" y="-2" width="6" height="6" fill="' + INK + '"/>' +
            '<text y="76" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="11" letter-spacing="1.8" fill="' + INK + '" font-weight="600">CALENDAR</text>' +
          '</g>' +

          '<g transform="translate(800, 80)">' +
            '<rect x="-44" y="-44" width="88" height="88" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
            '<rect x="-44" y="-44" width="88" height="6" fill="' + RUST + '"/>' +
            '<ellipse cx="0" cy="-14" rx="18" ry="6" fill="none" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<path d="M -18 -14 L -18 14 Q -18 20 0 20 Q 18 20 18 14 L 18 -14" fill="none" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<path d="M -18 0 Q -18 6 0 6 Q 18 6 18 0" fill="none" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<text y="76" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="11" letter-spacing="1.8" fill="' + INK + '" font-weight="600">DATABASE</text>' +
          '</g>' +

          '<g transform="translate(300, 80)"><path d="M -8 -6 L 0 0 L -8 6" fill="none" stroke="' + INK + '" stroke-width="2"/></g>' +
          '<g transform="translate(640, 80)"><path d="M -8 -6 L 0 0 L -8 6" fill="none" stroke="' + INK + '" stroke-width="2"/></g>' +

          '<circle r="9" fill="' + RUST + '">' +
            '<animateMotion dur="3.6s" repeatCount="indefinite" path="M 60 80 L 860 80" keyPoints="0;1" keyTimes="0;1" calcMode="linear"/>' +
          '</circle>' +
          '<circle r="18" fill="' + RUST + '" opacity="0.18">' +
            '<animateMotion dur="3.6s" repeatCount="indefinite" path="M 60 80 L 860 80" keyPoints="0;1" keyTimes="0;1" calcMode="linear"/>' +
          '</circle>' +
        '</g>' +

        '<text x="460" y="260" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="11" letter-spacing="2" fill="' + MUTED + '">' +
          'INPUT · UNSTRUCTURED → STRUCTURED · OUTPUT' +
        '</text>' +

      '</svg>'
    );
  }

  /* ===========================================================
     02 — CUSTOM AI AGENTS
     =========================================================== */
  function buildAGSvg() {
    // 12 gear spokes: angle = i * 30 degrees, r1=78, r2=92
    var gearSpokes = [
      [78.00, 0.00, 92.00, 0.00],
      [67.55, 39.00, 79.67, 46.00],
      [39.00, 67.55, 46.00, 79.67],
      [0.00, 78.00, 0.00, 92.00],
      [-39.00, 67.55, -46.00, 79.67],
      [-67.55, 39.00, -79.67, 46.00],
      [-78.00, 0.00, -92.00, 0.00],
      [-67.55, -39.00, -79.67, -46.00],
      [-39.00, -67.55, -46.00, -79.67],
      [0.00, -78.00, 0.00, -92.00],
      [39.00, -67.55, 46.00, -79.67],
      [67.55, -39.00, 79.67, -46.00]
    ];

    var spokesHtml = gearSpokes.map(function (s) {
      return '<line x1="' + s[0] + '" y1="' + s[1] + '" x2="' + s[2] + '" y2="' + s[3] + '" stroke="' + CONCRETE + '" stroke-width="3"/>';
    }).join('');

    // Pulse ring delays
    var pulseDelays = [0, 1.2, 2.4];
    var pulseRings = pulseDelays.map(function (delay) {
      return '<circle cx="0" cy="0" r="80" fill="none" stroke="' + RUST + '" stroke-width="1.5" opacity="0"' +
             ' style="animation:ag-pulse 3.6s ease-out ' + delay + 's infinite;transform-box:fill-box;transform-origin:center;"/>';
    }).join('');

    return (
      '<svg viewBox="0 0 760 620" style="overflow:visible;width:100%;height:auto;display:block;">' +

        '<defs>' +
          '<pattern id="sa-stipple" width="6" height="6" patternUnits="userSpaceOnUse">' +
            '<circle cx="3" cy="3" r="0.6" fill="' + MUTED + '" opacity="0.55"/>' +
          '</pattern>' +
          '<clipPath id="sa-agent-plate-clip">' +
            '<rect x="180" y="60" width="400" height="500"/>' +
          '</clipPath>' +
        '</defs>' +

        '<rect x="180" y="60" width="400" height="500" fill="' + SLATE + '"/>' +
        '<rect x="180" y="60" width="400" height="500" fill="url(#sa-stipple)" clip-path="url(#sa-agent-plate-clip)"/>' +
        '<rect x="180" y="60" width="400" height="500" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        '<rect x="180" y="60" width="400" height="36" fill="' + INK + '"/>' +
        '<text x="200" y="84" font-family="\'JetBrains Mono\', monospace" font-size="11" letter-spacing="2" fill="' + CONCRETE + '">UNIT / AG-002 · ACTIVE</text>' +
        '<circle cx="556" cy="78" r="5" fill="' + RUST + '">' +
          '<animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/>' +
        '</circle>' +

        '<g transform="translate(380, 320)">' +
          pulseRings +
          '<g style="animation:ag-gear 24s linear infinite;transform-origin:0px 0px;">' +
            spokesHtml +
            '<circle cx="0" cy="0" r="78" fill="none" stroke="' + CONCRETE + '" stroke-width="1.5" opacity="0.4"/>' +
          '</g>' +
          '<rect x="-46" y="-46" width="92" height="92" fill="' + CONCRETE + '" stroke="' + CONCRETE + '" stroke-width="2"/>' +
          '<rect x="-30" y="-12" width="60" height="6" fill="' + INK + '"/>' +
          '<text x="0" y="28" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="9" letter-spacing="2" fill="' + INK + '" font-weight="600">AG-002</text>' +
          '<circle cx="0" cy="42" r="3" fill="' + RUST + '">' +
            '<animate attributeName="r" values="3;5;3" dur="1.6s" repeatCount="indefinite"/>' +
          '</circle>' +
        '</g>' +

        '<g style="animation:ag-float 4.4s ease-in-out 0s infinite;">' +
          '<g transform="translate(90, 180)">' +
            '<rect x="-22" y="-18" width="44" height="28" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
            '<path d="M -10 10 L -14 18 L -2 10 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
            '<circle cx="-10" cy="-4" r="2" fill="' + INK + '"/>' +
            '<circle cx="0" cy="-4" r="2" fill="' + INK + '"/>' +
            '<circle cx="10" cy="-4" r="2" fill="' + INK + '"/>' +
          '</g>' +
        '</g>' +

        '<g style="animation:ag-float 4.4s ease-in-out 1.5s infinite;">' +
          '<g transform="translate(90, 460)">' +
            '<circle cx="0" cy="0" r="22" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
            '<line x1="0" y1="0" x2="0" y2="-14" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<line x1="0" y1="0" x2="10" y2="6" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<circle cx="0" cy="0" r="2" fill="' + INK + '"/>' +
          '</g>' +
        '</g>' +

        '<g style="animation:ag-float 4.4s ease-in-out 0.8s infinite;">' +
          '<g transform="translate(670, 180)">' +
            '<rect x="-22" y="-22" width="44" height="44" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
            '<path d="M -10 0 L -2 10 L 12 -8" fill="none" stroke="' + RUST + '" stroke-width="3.5" stroke-linecap="square"/>' +
          '</g>' +
        '</g>' +

        '<g style="animation:ag-float 4.4s ease-in-out 2.2s infinite;">' +
          '<g transform="translate(670, 460)">' +
            '<rect x="-22" y="-22" width="44" height="44" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
            '<line x1="0" y1="-12" x2="0" y2="12" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<line x1="-12" y1="0" x2="12" y2="0" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<line x1="-9" y1="-9" x2="9" y2="9" stroke="' + INK + '" stroke-width="2.5"/>' +
            '<line x1="-9" y1="9" x2="9" y2="-9" stroke="' + INK + '" stroke-width="2.5"/>' +
          '</g>' +
        '</g>' +

        '<g opacity="0.5">' +
          '<line x1="120" y1="180" x2="180" y2="180" stroke="' + INK + '" stroke-width="1" stroke-dasharray="3 4"/>' +
          '<line x1="120" y1="460" x2="180" y2="460" stroke="' + INK + '" stroke-width="1" stroke-dasharray="3 4"/>' +
          '<line x1="640" y1="180" x2="580" y2="180" stroke="' + INK + '" stroke-width="1" stroke-dasharray="3 4"/>' +
          '<line x1="640" y1="460" x2="580" y2="460" stroke="' + INK + '" stroke-width="1" stroke-dasharray="3 4"/>' +
        '</g>' +

        '<style>' +
          '@keyframes ag-pulse{0%{transform:scale(0.6);opacity:0.7;}80%{opacity:0;}100%{transform:scale(2.4);opacity:0;}}' +
          '@keyframes ag-gear{to{transform:rotate(360deg);}}' +
          '@keyframes ag-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}' +
        '</style>' +

      '</svg>'
    );
  }

  /* ===========================================================
     03 — SYSTEMS INTEGRATION
     =========================================================== */
  function buildSISvg() {
    // 8 radiating rays: angle = i * 45 degrees, inner=110, outer=280
    var rayData = [
      [110.00, 0.00, 280.00, 0.00, 0.00],
      [77.78, 77.78, 197.99, 197.99, 0.15],
      [0.00, 110.00, 0.00, 280.00, 0.30],
      [-77.78, 77.78, -197.99, 197.99, 0.45],
      [-110.00, 0.00, -280.00, 0.00, 0.60],
      [-77.78, -77.78, -197.99, -197.99, 0.75],
      [0.00, -110.00, 0.00, -280.00, 0.90],
      [77.78, -77.78, 197.99, -197.99, 1.05]
    ];

    var raysHtml = rayData.map(function (r) {
      return '<line x1="' + r[0] + '" y1="' + r[1] + '" x2="' + r[2] + '" y2="' + r[3] + '"' +
             ' stroke="' + INK + '" stroke-width="1" stroke-dasharray="6 6"' +
             ' style="animation:si-rays-appear 4.8s ease-in-out ' + r[4] + 's infinite,si-ray-flow 2.4s linear ' + r[4] + 's infinite;"/>';
    }).join('');

    return (
      '<svg viewBox="0 0 860 620" style="overflow:visible;width:100%;height:auto;display:block;">' +

        '<style>' +
          '.si-piece{transform-box:fill-box;transform-origin:center;}' +
          '@keyframes si-snap-left{0%,25%{transform:translate(-260px,-140px) rotate(-12deg);opacity:0.5;}55%,100%{transform:translate(-90px,-52px) rotate(0deg);opacity:1;}}' +
          '@keyframes si-snap-right{0%,25%{transform:translate(280px,-160px) rotate(14deg);opacity:0.5;}55%,100%{transform:translate(90px,-52px) rotate(0deg);opacity:1;}}' +
          '@keyframes si-snap-bottom{0%,25%{transform:translate(0px,220px) rotate(-8deg);opacity:0.5;}55%,100%{transform:translate(0px,100px) rotate(0deg);opacity:1;}}' +
          '.si-piece-left{animation:si-snap-left 4.8s ease-in-out infinite;}' +
          '.si-piece-right{animation:si-snap-right 4.8s ease-in-out infinite;}' +
          '.si-piece-bottom{animation:si-snap-bottom 4.8s ease-in-out infinite;}' +
          '@keyframes si-glow{0%,50%{opacity:0;}60%{opacity:0.9;}100%{opacity:0;}}' +
          '@keyframes si-glow-2{0%,55%{opacity:0;transform:scale(0.85);}70%{opacity:0.6;transform:scale(1);}100%{opacity:0;transform:scale(1.25);}}' +
          '.si-glow{animation:si-glow 4.8s ease-out infinite;transform-box:fill-box;transform-origin:center;}' +
          '.si-glow-2{animation:si-glow-2 4.8s ease-out infinite;transform-box:fill-box;transform-origin:center;}' +
          '@keyframes si-ray-flow{to{stroke-dashoffset:-24;}}' +
          '@keyframes si-rays-appear{0%,55%{opacity:0;}70%,95%{opacity:0.45;}100%{opacity:0;}}' +
        '</style>' +

        '<g transform="translate(430, 310)">' +
          raysHtml +
        '</g>' +

        '<g transform="translate(430, 310)">' +
          '<g class="si-piece si-piece-left">' +
            '<path d="M -50 -36 L 36 -36 L 36 -12 L 50 -12 L 50 12 L 36 12 L 36 36 L -50 36 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
            '<text y="6" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="13" letter-spacing="2" fill="' + INK + '" font-weight="700">CRM</text>' +
          '</g>' +
        '</g>' +

        '<g transform="translate(430, 310)">' +
          '<g class="si-piece si-piece-right">' +
            '<path d="M -50 -36 L 50 -36 L 50 36 L -50 36 L -50 12 L -36 12 L -36 -12 L -50 -12 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
            '<text y="6" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="13" letter-spacing="2" fill="' + INK + '" font-weight="700">EMAIL</text>' +
          '</g>' +
        '</g>' +

        '<g transform="translate(430, 310)">' +
          '<g class="si-piece si-piece-bottom">' +
            '<path d="M -50 -36 L -12 -36 L -12 -50 L 12 -50 L 12 -36 L 50 -36 L 50 36 L -50 36 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
            '<text y="6" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="13" letter-spacing="2" fill="' + INK + '" font-weight="700">SHEETS</text>' +
          '</g>' +
        '</g>' +

        '<g transform="translate(430, 310)">' +
          '<circle r="76" fill="none" stroke="' + RUST + '" stroke-width="2" opacity="0" class="si-glow"/>' +
          '<circle r="92" fill="none" stroke="' + RUST + '" stroke-width="1" opacity="0" class="si-glow-2"/>' +
          '<rect x="-52" y="-52" width="104" height="104" fill="' + INK + '"/>' +
          '<rect x="-52" y="-52" width="104" height="6" fill="' + RUST + '"/>' +
          '<rect x="-12" y="-12" width="24" height="24" fill="' + CONCRETE + '"/>' +
          '<rect x="-4" y="-4" width="8" height="8" fill="' + RUST + '"/>' +
          '<text y="76" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="11" letter-spacing="2.5" fill="' + INK + '" font-weight="700">HUB / SI-003</text>' +
        '</g>' +

      '</svg>'
    );
  }

  /* ===========================================================
     04 — AI DATA PROCESSING
     =========================================================== */
  function buildDPSvg() {
    var yValues = [160, 220, 280, 340, 400];

    var inputPathsHtml = yValues.map(function (y, i) {
      var d = makeJagged(40, y, 240);
      return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round" opacity="0">' +
               '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.7;1" dur="2.4s" begin="' + (i * 0.18) + 's" repeatCount="indefinite"/>' +
               '<animateTransform attributeName="transform" type="translate" values="-40 0;120 0" dur="2.4s" begin="' + (i * 0.18) + 's" repeatCount="indefinite"/>' +
             '</path>';
    }).join('');

    var outputRowsHtml = yValues.map(function (y, i) {
      var accentRect = (i % 2 === 0)
        ? '<rect x="200" y="-9" width="40" height="18" fill="' + RUST + '" opacity="0.9"/>'
        : '';
      return '<g transform="translate(580, ' + y + ')" opacity="0">' +
               '<line x1="0" y1="0" x2="40" y2="0" stroke="' + INK + '" stroke-width="2"/>' +
               '<rect x="48" y="-9" width="56" height="18" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.5"/>' +
               '<rect x="112" y="-9" width="80" height="18" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.5"/>' +
               '<rect x="200" y="-9" width="40" height="18" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.5"/>' +
               accentRect +
               '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.3;0.5;0.85;1" dur="2.4s" begin="' + (i * 0.18) + 's" repeatCount="indefinite"/>' +
               '<animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;120 0" dur="2.4s" begin="' + (i * 0.18) + 's" repeatCount="indefinite"/>' +
             '</g>';
    }).join('');

    return (
      '<svg viewBox="0 0 920 600" style="overflow:visible;width:100%;height:auto;display:block;">' +

        '<style>' +
          '@keyframes dp-scan{0%,100%{transform:translateY(0);}50%{transform:translateY(80px);}}' +
          '@keyframes dp-box-pulse{0%,100%{opacity:0;}50%{opacity:0.6;}}' +
        '</style>' +

        '<defs>' +
          '<clipPath id="sdp-in-clip"><rect x="40" y="140" width="320" height="280"/></clipPath>' +
          '<clipPath id="sdp-out-clip"><rect x="560" y="140" width="320" height="280"/></clipPath>' +
        '</defs>' +

        '<text x="120" y="120" font-family="\'JetBrains Mono\', monospace" font-size="11" letter-spacing="2.5" fill="' + MUTED + '" font-weight="600">IN / UNSTRUCTURED</text>' +
        '<text x="800" y="120" text-anchor="end" font-family="\'JetBrains Mono\', monospace" font-size="11" letter-spacing="2.5" fill="' + MUTED + '" font-weight="600">OUT / STRUCTURED</text>' +

        '<g clip-path="url(#sdp-in-clip)">' +
          inputPathsHtml +
        '</g>' +

        '<g transform="translate(460, 300)">' +
          '<rect x="-100" y="-130" width="200" height="260" fill="none" stroke="' + RUST + '" stroke-width="1" opacity="0" style="animation:dp-box-pulse 2.4s ease-in-out infinite;"/>' +
          '<rect x="-90" y="-120" width="180" height="240" fill="' + INK + '"/>' +
          '<rect x="-90" y="-120" width="180" height="6" fill="' + RUST + '"/>' +
          '<rect x="-72" y="-40" width="144" height="2" fill="' + RUST + '" opacity="0.85" style="animation:dp-scan 2.4s ease-in-out infinite;"/>' +
          '<text y="-70" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="10" letter-spacing="2.5" fill="' + CONCRETE + '" font-weight="600">DP-004</text>' +
          '<text y="92" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="9" letter-spacing="2" fill="' + MUTED + '">PARSE · CLEAN · TYPE</text>' +
          '<g stroke="' + CONCRETE + '" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6">' +
            '<line x1="-90" y1="-30" x2="-90" y2="30"/>' +
            '<line x1="90" y1="-30" x2="90" y2="30"/>' +
          '</g>' +
        '</g>' +

        '<g clip-path="url(#sdp-out-clip)">' +
          outputRowsHtml +
        '</g>' +

        '<text x="460" y="500" text-anchor="middle" font-family="\'JetBrains Mono\', monospace" font-size="11" letter-spacing="2.5" fill="' + MUTED + '" font-weight="600">NOISE · IN  →  SIGNAL · OUT</text>' +

      '</svg>'
    );
  }

  /* ===========================================================
     Inject animations into service cards
     =========================================================== */
  var animMap = {
    wf: buildWFSvg(),
    ag: buildAGSvg(),
    si: buildSISvg(),
    dp: buildDPSvg()
  };

  document.querySelectorAll('.service-anim[data-anim]').forEach(function (container) {
    var key = container.dataset.anim;
    if (animMap[key]) {
      container.innerHTML = animMap[key];
    }
  });

});
