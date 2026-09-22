/* 下载区：实时数据 + 直链 + 加速镜像批量测速（HEAD no-cors 计时）。
   不依赖 CORS 读响应头，只区分「连通 + 延迟」与「不可达」。 */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG;
  var LiveData = window.LiveData;
  var TEST_MS = 10000;

  function testUrl(url) {
    var started = performance.now();
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, TEST_MS);
    return fetch(url, { method: "HEAD", mode: "no-cors", cache: "no-store", signal: ctrl.signal })
      .then(function () { return { ok: true, ms: Math.round(performance.now() - started) }; })
      .catch(function () { return { ok: false, ms: Math.round(performance.now() - started) }; })
      .finally(function () { clearTimeout(timer); });
  }

  function assetUrl(prefix) {
    return (prefix || "") + "https://github.com/" + CFG.repo + "/releases/download/" + CFG.tag + "/" + CFG.apk;
  }

  function renderRows(rows) {
    var box = document.getElementById("mirror-list");
    if (!box) return;
    box.textContent = "";
    box.className = "mirror-cards";
    rows.forEach(function (row) {
      var item = document.createElement("article");
      item.className = "mirror-card" + (row.fastest ? " is-fast" : "") + (row.ok ? " is-ok" : " is-down");
      var main = document.createElement("div");
      main.className = "mirror-card-main";
      var title = document.createElement("div");
      title.className = "mirror-card-title";
      var nameStrong = document.createElement("strong");
      nameStrong.textContent = row.name;
      title.appendChild(nameStrong);
      if (row.fastest) {
        var badge = document.createElement("span");
        badge.className = "fast-badge";
        badge.textContent = "最快";
        title.appendChild(badge);
      }
      main.appendChild(title);
      var meta = document.createElement("p");
      meta.className = "mirror-card-meta";
      var ping = document.createElement("span");
      ping.className = "ping";
      ping.textContent = row.ok ? (row.ms + " ms") : "—";
      var dot = document.createElement("span");
      dot.className = "dot " + (row.ok ? "ok" : "fail");
      meta.appendChild(ping);
      meta.appendChild(document.createTextNode(" "));
      meta.appendChild(dot);
      meta.appendChild(document.createTextNode(row.ok ? " 连通" : " 不可达"));
      main.appendChild(meta);
      item.appendChild(main);
      var a = document.createElement("a");
      a.className = "btn btn-sm mirror-dl" + (row.ok ? " btn-primary" : " btn-ghost");
      a.href = row.url;
      a.textContent = "下载";
      item.appendChild(a);
      box.appendChild(item);
    });

    var sum = document.getElementById("test-summary");
    if (sum) {
      var okRows = rows.filter(function (x) { return x.ok; });
      var direct = null, fast = null;
      okRows.forEach(function (r) {
        if (r.prefix === "") direct = r;
        if (!fast || r.ms < fast.ms) fast = r;
      });
      var parts = [];
      if (fast) parts.push("最快 " + fast.name + "（" + fast.ms + " ms）");
      if (direct) parts.push("直连 " + direct.ms + " ms");
      var down = rows.length - okRows.length;
      if (down > 0) parts.push(down + " 个不可达");
      sum.textContent = parts.join(" · ");
    }
  }

  function runSpeedtest() {
    var box = document.getElementById("mirror-list");
    var btn = document.querySelector("[data-action='speedtest']");
    if (!box) return Promise.resolve();
    if (btn) { btn.disabled = true; btn.textContent = "测速中…"; }
    var rows = (CFG.mirrors || []).map(function (m, i) {
      return { i: i, name: m.name, prefix: m.prefix, url: assetUrl(m.prefix), ok: false, ms: 0, fastest: false };
    });
    renderRows(rows);
    return Promise.all(rows.map(function (row) {
      return testUrl(row.url).then(function (res) { row.ok = res.ok; row.ms = res.ms; return row; });
    })).then(function (done) {
      var okRows = done.filter(function (x) { return x.ok; });
      var fast = null;
      okRows.forEach(function (r) { if (!fast || r.ms < fast.ms) fast = r; });
      if (fast) fast.fastest = true;
      done.sort(function (a, b) {
        if (a.ok !== b.ok) return a.ok ? -1 : 1;
        return a.ms - b.ms;
      });
      renderRows(done);
      if (btn) { btn.disabled = false; btn.textContent = "重新测速"; }
      return done;
    });
  }

  /* 实时数据写入 [data-live] 元素 */
  function each(sel, fn) {
    var list = document.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) fn(list[i]);
  }

  function setLive(key, val) {
    each("[data-live='" + key + "']", function (el) { el.textContent = val; });
  }

  function renderLive(data) {
    var map = {
      version: data.version,
      "version-code": data.versionCode || "—",
      size: LiveData.fmtSize(data.size),
      sha: data.sha256 || "—",
      "stars-up": data.starsUp == null ? "—" : data.starsUp.toLocaleString(),
      "stars-fork": data.starsFork == null ? "—" : data.starsFork.toLocaleString(),
      updated: data.updated ? new Date(data.updated).toLocaleString("zh-CN") : "—",
      "roll-updated": data.rollingUpdated ? new Date(data.rollingUpdated).toLocaleString("zh-CN") : "—",
      "roll-version": data.rollingVersion || "—"
    };
    for (var key in map) setLive(key, map[key]);
    var sourceText = data.source === "live"
      ? "实时数据在线（GitHub API）"
      : data.source === "live-alt"
        ? "实时数据在线（备用通道：仓库发行说明）"
        : "网络不可用，已回退静态值";
    var online = data.source === "live" || data.source === "live-alt";
    each("[data-live='source-text']", function (src) {
      src.textContent = sourceText;
      src.className = online ? "state-ok" : "state-fail";
    });
    var dot = document.getElementById("live-dot");
    if (dot) dot.className = "dot " + (online ? "ok" : "fail");
    var dl = document.querySelector("[data-role='dl']");
    if (dl && data.url) dl.setAttribute("href", data.url);
    var dlRoll = document.querySelector("[data-role='dl-roll']");
    if (dlRoll && data.rollingUrl) dlRoll.setAttribute("href", data.rollingUrl);
    each("[data-role='dl-release']", function (a) {
      if (data.releaseUrl) a.setAttribute("href", data.releaseUrl);
    });
    if (LiveData.syncMirrorMenu) {
      LiveData.syncMirrorMenu(dl);
      LiveData.syncMirrorMenu(dlRoll);
    }
    each("[data-live='url']", function (meta) {
      if (data.url) meta.textContent = data.url;
    });
    if (data.version && /下载/.test(document.title)) {
      document.title = "下载 — Minis Ultra " + data.version;
    }
  }

  function init() {
    var shownVer = "";
    function apply(data, retest) {
      if (!data) return;
      renderLive(data);
      var ver = data.version || "";
      if (retest || (ver && ver !== shownVer)) {
        shownVer = ver;
        if (document.getElementById("mirror-list")) runSpeedtest();
      }
    }
    var btnRefresh = document.querySelector("[data-action='refresh']");
    if (btnRefresh) btnRefresh.addEventListener("click", function () {
      btnRefresh.disabled = true;
      btnRefresh.textContent = "刷新中…";
      LiveData.load(true).then(function (data) {
        apply(data, true);
      }).catch(function () {
        var status = document.querySelector("[data-live='source-text']");
        if (status) {
          status.textContent = "刷新失败，保留当前版本";
          status.className = "state-fail";
        }
      }).finally(function () {
        btnRefresh.disabled = false;
        btnRefresh.textContent = "刷新数据";
      });
    });
    var btnTest = document.querySelector("[data-action='speedtest']");
    if (btnTest) btnTest.addEventListener("click", runSpeedtest);

    if (LiveData.subscribe) LiveData.subscribe(function (data) { apply(data, false); });
    LiveData.load(false).then(function (data) { apply(data, false); })
      .catch(function () {
        var status = document.querySelector("[data-live='source-text']");
        if (status) {
          status.textContent = "网络不可用，显示站内版本";
          status.className = "state-fail";
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();