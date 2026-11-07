(function () {
  var DAYS = [
    { key: "mon", date: "2026-11-09", short: "Mon", label: "Monday", file: "monday.html", title: "Drive down, tennis arvo" },
    { key: "tue", date: "2026-11-10", short: "Tue", label: "Tuesday", file: "tuesday.html", title: "Big jump day" },
    { key: "wed", date: "2026-11-11", short: "Wed", label: "Wednesday", file: "wednesday.html", title: "First loads, storm watch" },
    { key: "thu", date: "2026-11-12", short: "Thu", label: "Thursday", file: "thursday.html", title: "Climb Bingie Point" },
    { key: "fri", date: "2026-11-13", short: "Fri", label: "Friday", file: "friday.html", title: "Early loads, drive home" }
  ];

  function sydneyDate() {
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(new Date()); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  var today = sydneyDate();
  var idx = DAYS.findIndex(function (d) { return d.date === today; });
  var phase = idx >= 0 ? "during" : (today < DAYS[0].date ? "before" : "after");
  var nowI = phase === "during" ? idx : (phase === "before" ? 0 : DAYS.length - 1);
  var nextI = phase === "after" ? -1 : (phase === "before" ? 1 : (idx + 1 < DAYS.length ? idx + 1 : -1));
  var page = document.body.getAttribute("data-day") || "week";
  var pageI = DAYS.findIndex(function (d) { return d.key === page; });

  // Tab bar
  var nowLabel = phase === "before" ? "Day 1" : (phase === "after" ? "Last day" : "Today");
  var tabs = [
    { href: "index.html", top: "Week", sub: "Overview", on: page === "week" },
    { href: DAYS[nowI].file, top: nowLabel, sub: DAYS[nowI].short + " " + DAYS[nowI].date.slice(8).replace(/^0/, ""), on: pageI === nowI },
    nextI >= 0 ? { href: DAYS[nextI].file, top: phase === "before" ? "Then" : "Next", sub: DAYS[nextI].short + " " + DAYS[nextI].date.slice(8), on: pageI === nextI } : null
  ].filter(Boolean);
  var bar = document.createElement("nav");
  bar.className = "app-bar";
  bar.setAttribute("aria-label", "App");
  tabs.forEach(function (t) {
    var a = document.createElement("a");
    a.href = t.href;
    if (t.on) { a.className = "on"; a.setAttribute("aria-current", "page"); }
    var b = document.createElement("b"); b.textContent = t.top;
    var s = document.createElement("span"); s.textContent = t.sub;
    a.appendChild(b); a.appendChild(s);
    bar.appendChild(a);
  });
  document.body.appendChild(bar);

  // Day pages: "Today" badge
  if (pageI >= 0 && phase === "during" && pageI === idx) {
    var eb = document.querySelector(".eyebrow");
    if (eb) { var badge = document.createElement("span"); badge.className = "today-badge"; badge.textContent = "Today"; eb.appendChild(badge); }
  }

  // Overview: Now panel and today highlight
  var now = document.getElementById("now");
  if (now) {
    var h = document.getElementById("now-h"), p = document.getElementById("now-p"), go = document.getElementById("now-go"), nx = document.getElementById("now-next");
    if (phase === "before") {
      var ms = new Date(DAYS[0].date + "T00:00:00+11:00") - new Date(today + "T00:00:00+11:00");
      var n = Math.round(ms / 86400000);
      h.textContent = n === 1 ? "Trip starts tomorrow" : "Trip starts in " + n + " days";
      p.textContent = "Monday 9 November. Leave Randwick 7:45am after the daycare drop.";
      go.textContent = "Open Monday"; go.href = DAYS[0].file;
      nx.textContent = "Then Tuesday"; nx.href = DAYS[1].file;
    } else if (phase === "during") {
      h.textContent = "Today: " + DAYS[idx].label;
      p.textContent = DAYS[idx].title + ".";
      go.textContent = "Open today"; go.href = DAYS[idx].file;
      if (nextI >= 0) { nx.textContent = "Tomorrow: " + DAYS[nextI].label; nx.href = DAYS[nextI].file; } else { nx.hidden = true; }
      var tile = document.querySelector('.tile[data-key="' + DAYS[idx].key + '"]');
      if (tile) tile.classList.add("is-today");
      var card = document.getElementById(DAYS[idx].key);
      if (card) card.classList.add("is-today");
    } else {
      h.textContent = "Trip done";
      p.textContent = "Hope the jumps were good. The day plans stay here for reference.";
      go.textContent = "Open Friday"; go.href = DAYS[4].file;
      nx.hidden = true;
    }
    now.hidden = false;
  }

  // Swipe between pages (day pages only)
  if (pageI >= 0) {
    var x0 = null, y0 = null;
    document.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      if (e.target.closest && e.target.closest("input, button, label, .band, .stats")) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0 && pageI < DAYS.length - 1) location.href = DAYS[pageI + 1].file;
      if (dx > 0) location.href = pageI > 0 ? DAYS[pageI - 1].file : "index.html";
    }, { passive: true });
  }

  // Offline support
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
