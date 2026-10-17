/* Mission timeline. Month 0 = Aug 2023, 48 months to Aug 2027. NOW = mid Oct 2026.
   bars: [start, end, lane, color, continuing]   dots: [month, lane, color]   */
(function () {
  var el = document.getElementById('timeline');
  if (!el) return;
  var NOW = 38.5;
  var rows = [
    { name: 'School', lanes: 3,
      notes: [['Uni High, Aug 2023 – now', 'uni'], ['National Latin Exam gold, each spring', 'nle'], ['PHI 103 at Parkland, summer 2026', 'phi'], ['CS 124 at UIUC, fall 2026', 'cs']],
      bars: [[0, NOW, 0, 'uni', 1], [34, 37, 1, 'phi'], [36.75, NOW, 2, 'cs', 1]],
      dots: [[7.5, 0, 'nle'], [19.5, 0, 'nle'], [31.5, 0, 'nle']] },
    { name: 'Competition & clubs', lanes: 2,
      notes: [['Science Olympiad JV, 2025–26', 'jv'], ['Science Olympiad Varsity, 2026–27', 'var'],
              ['Clean-Up Club founder, 2026–27', 'club'], ['Presented at the <a class="text-link" href="https://undergradresearch.illinois.edu/events/research-week/symposium/" target="_blank" rel="noopener">Undergraduate Research Symposium</a>, spring 2026', 'sym']],
      bars: [[24, 34, 0, 'jv'], [36, NOW, 0, 'var', 1], [36, NOW, 1, 'club', 1]],
      dots: [[32.95, 1, 'sym']] },
    { name: 'Summer programs', lanes: 1,
      notes: [['Uni High Design Lab camp, summer 2025', 'lab'], ['UIUC Nuclear Camp, summer 2026', 'camp']],
      bars: [[22, 25, 0, 'lab'], [34, 37, 0, 'camp']], dots: [] },
    { name: 'Service & membership', lanes: 2,
      notes: [['Carle Hospital volunteer, winter 2025 – now, ~100 hours', 'carle'], ['American Nuclear Society, fall 2026 – now', 'ans']],
      bars: [[17, NOW, 0, 'carle', 1], [37, NOW, 1, 'ans', 1]], dots: [] }
  ];

  var h = '<div class="tl-row tl-axisrow"><div class="tl-lab"></div><div class="tl-axis" aria-hidden="true">' +
    '<span style="--at:0;padding-left:0"><span class="tl-long">Aug </span>’23</span><span style="--at:5"><span class="tl-yr">20</span><span class="tl-ap">’</span>24</span><span style="--at:17"><span class="tl-yr">20</span><span class="tl-ap">’</span>25</span>' +
    '<span style="--at:29"><span class="tl-yr">20</span><span class="tl-ap">’</span>26</span><span style="--at:41"><span class="tl-yr">20</span><span class="tl-ap">’</span>27</span></div></div>';
  rows.forEach(function (r) {
    var m = '';
    r.bars.forEach(function (x) {
      m += '<div class="tl-bar' + (x[4] ? ' go' : '') + '" style="--c:var(--c-' + x[3] + ');--lane:' + x[2] + ';--s:' + x[0] + ';--e:' + x[1] + '"></div>';
    });
    r.dots.forEach(function (x) {
      m += '<div class="tl-dot" style="--c:var(--c-' + x[2] + ');--lane:' + x[1] + ';--at:' + x[0] + '"></div>';
    });
    var n = r.notes.map(function (t) { return '<i style="--c:var(--c-' + t[1] + ')">' + t[0] + '</i>'; }).join('');
    h += '<div class="tl-row"><div class="tl-lab"><b>' + r.name + '</b>' + n + '</div><div class="tl-track" style="--lanes:' + r.lanes + '">' + m + '</div></div>';
  });
  el.insertAdjacentHTML('beforeend', h);
})();
