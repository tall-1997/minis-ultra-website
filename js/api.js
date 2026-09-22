/* GitHub 数据：版本 / 体积 / SHA-256 / 下载直链 / Star。
   API 受未认证限流影响，因此同时准备发行说明和站内配置回退。
   localStorage 只用于首屏占位；每次打开页面都会后台请求最新数据。 */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG;
  var LS_KEY = "minis-ultra-live-v4";
  var TTL = 60 * 1000;
  var REL_KEY = "minis-ultra-releases-v2";
  var REL_TTL = 60 * 1000;
  var listeners = [];

  function getJSON(url, ms) {
    ms = ms || 9000;
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, ms);
    return fetch(url, {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      cache: "no-store",
      signal: ctrl.signal
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).finally(function () { clearTimeout(timer); });
  }

  function buildUrl(tag) {
    return "https://github.com/" + CFG.repo + "/releases/download/" + encodeURIComponent(tag || CFG.tag) + "/" + CFG.apk;
  }

  function findApkAsset(rel) {
    if (!rel || !Array.isArray(rel.assets)) return null;
    var i, hit = null;
    for (i = 0; i < rel.assets.length; i++) {
      if (rel.assets[i].name === CFG.apk) return rel.assets[i];
      if (!hit && String(rel.assets[i].name || "").toLowerCase().indexOf(".apk") >= 0) hit = rel.assets[i];
    }
    return hit;
  }

  function parseReleaseMeta(body) {
    var text = String(body || "").replace(/<[^>]+>/g, " ");
    var name = "";
    var code = "";
    var m1 = text.match(/versionName:\s*`?([0-9A-Za-z._+-]+)`?/);
    var m2 = text.match(/versionCode[:\s*]*(\d+)/);
    if (m1) name = m1[1];
    if (m2) code = m2[1];
    return { versionName: name, versionCode: code };
  }

  function assetTime(rel) {
    var apk = findApkAsset(rel);
    return (apk && (apk.updated_at || apk.created_at)) || (rel && rel.updated_at) || (rel && rel.published_at) || "";
  }

  function wrapMirror(prefix, url) {
    return (prefix || "") + url;
  }

  function mirrorLinks(directUrl) {
    if (!directUrl) return [];
    return (CFG.mirrors || []).map(function (m) {
      return { name: m.name, prefix: m.prefix || "", url: wrapMirror(m.prefix, directUrl) };
    });
  }

  function bindMirrorMenuOnce() {
    if (bindMirrorMenuOnce.done) return;
    bindMirrorMenuOnce.done = true;
    document.addEventListener("click", function (e) {
      document.querySelectorAll("details.mirror-menu[open]").forEach(function (d) {
        if (!d.contains(e.target)) d.open = false;
      });
    });
    document.addEventListener("toggle", function (e) {
      var t = e.target;
      if (!t || !t.classList || !t.classList.contains("mirror-menu") || !t.open) return;
      document.querySelectorAll("details.mirror-menu[open]").forEach(function (d) {
        if (d !== t) d.open = false;
      });
    }, true);
  }

  function renderMirrorMenu(directUrl) {
    var links = mirrorLinks(directUrl).filter(function (m) { return m.prefix; });
    if (!directUrl || !links.length) return null;
    bindMirrorMenuOnce();
    var details = document.createElement("details");
    details.className = "mirror-menu";
    var sum = document.createElement("summary");
    sum.textContent = "镜像下载";
    details.appendChild(sum);
    var list = document.createElement("div");
    list.className = "mirror-menu-list";
    links.forEach(function (m) {
      var a = document.createElement("a");
      a.href = m.url;
      a.textContent = m.name;
      list.appendChild(a);
    });
    details.appendChild(list);
    return details;
  }

  function syncMirrorMenu(anchor) {
    if (!anchor || !anchor.parentNode) return;
    var parent = anchor.parentNode;
    var existing = parent.querySelector(":scope > .mirror-menu");
    var menu = renderMirrorMenu(anchor.href);
    if (!menu) {
      if (existing) existing.remove();
      return;
    }
    if (existing) parent.replaceChild(menu, existing);
    else parent.appendChild(menu);
  }

  function isFormalTag(t) {
    t = String(t || "");
    if (!t || t === CFG.rollingTag) return false;
    return /-linux$/.test(t);
  }

  function tagParts(t) {
    var m = String(t || "").match(/(\d+(?:\.\d+)*)/);
    return (m ? m[1] : "0").split(".").map(function (x) { return parseInt(x, 10) || 0; });
  }

  function tagNewer(a, b) {
    var A = tagParts(a), B = tagParts(b);
    var n = Math.max(A.length, B.length);
    for (var i = 0; i < n; i++) {
      var x = A[i] || 0, y = B[i] || 0;
      if (x !== y) return x > y;
    }
    return false;
  }

  function pickFormal(releases) {
    var list = [];
    (releases || []).forEach(function (r, i) {
      if (r && isFormalTag(r.tag_name)) list.push({ r: r, i: i });
    });
    list.sort(function (a, b) {
      var at = String(a.r.tag_name || "");
      var bt = String(b.r.tag_name || "");
      if (at !== bt) {
        if (tagNewer(at, bt)) return -1;
        if (tagNewer(bt, at)) return 1;
      }
      var ta = Date.parse(a.r.published_at || a.r.created_at || 0) || 0;
      var tb = Date.parse(b.r.published_at || b.r.created_at || 0) || 0;
      if (tb !== ta) return tb - ta;
      return a.i - b.i;
    });
    return list.length ? list[0].r : null;
  }

  function parseNotesReleases(md) {
    var parts = String(md || "").split(/^# /m);
    var out = [];
    for (var p = 0; p < parts.length; p++) {
      var part = parts[p].trim();
      if (!part) continue;
      var nl = part.indexOf("\n");
      var title = (nl < 0 ? part : part.slice(0, nl)).trim();
      var rest = nl < 0 ? "" : part.slice(nl + 1);
      var tm = title.match(/(\d[\w.\-]*-linux)/);
      if (!tm) continue;
      var tag = tm[1];
      var dm = rest.slice(0, 600).match(/(20\d{2})[-年/.](\d{1,2})[-月/.](\d{1,2})/);
      var date = "";
      if (dm) {
        date = dm[1] + "-" + (dm[2].length < 2 ? "0" + dm[2] : dm[2]) + "-" + (dm[3].length < 2 ? "0" + dm[3] : dm[3]);
      }
      out.push({
        tag_name: tag,
        name: title,
        body: rest.trim(),
        html_url: "https://github.com/" + CFG.repo + "/releases/tag/" + encodeURIComponent(tag),
        published_at: date,
        assets: [{
          name: CFG.apk,
          browser_download_url: buildUrl(tag),
          size: 0
        }]
      });
    }
    return out;
  }

  function rememberTag(data) {
    if (data && data.version && !tagNewer(String(CFG.tag), String(data.version))) CFG.tag = data.version;
    if (data && data.versionCode && (!CFG.versionCode || Number(data.versionCode) >= Number(CFG.versionCode))) {
      CFG.versionCode = data.versionCode;
    }
    return data;
  }

  function isCurrent(data) {
    return !!(data && data.version && !tagNewer(String(CFG.tag), String(data.version)));
  }

  /* releases 数据来源：api = GitHub API（含体积/digest/滚动包）；
     alt = 远程仓库发行说明（tags/正文/versionCode，体积与日期可能缺）；static = 全失败。 */
  var releasesSource = "static";
  var notesFileSource = "static";

  function saveReleases(list, source) {
    releasesSource = source;
    try {
      localStorage.setItem(REL_KEY, JSON.stringify({ fetchedAt: (new Date()).toISOString(), source: source, releases: list }));
    } catch (e) { /* 忽略 */ }
    return list;
  }

  function mergeNotesInto(list) {
    return loadReleasesFromNotes().then(function (notes) {
      var seen = {};
      var merged = (notes || []).concat(list).filter(function (r) {
        var t = String(r && r.tag_name || "");
        if (!t || seen[t]) return false;
        seen[t] = 1;
        return true;
      });
      return merged;
    });
  }

  function loadReleasesFromApi() {
    return getJSON("https://api.github.com/repos/" + CFG.repo + "/releases?per_page=100", 8000).then(function (rels) {
      var list = Array.isArray(rels) ? rels : [];
      if (!list.length) throw new Error("empty releases");
      var formal = pickFormal(list);
      if (formal && !tagNewer(String(CFG.tag), formal.tag_name)) return saveReleases(list, "api");
      return mergeNotesInto(list)
        .then(function (merged) { return saveReleases(merged, "api"); })
        .catch(function () { return saveReleases(list, "api"); });
    });
  }

  /* API 不可用（限流/被墙）时：远程发行说明本身就是一份完整的版本清单，
     标签、正文、versionCode、约定直链都有；体积/digest/日期缺失时 UI 显示 —。
     若只拿到站内本地副本则按离线处理（static），不冒充在线数据。 */
  function loadReleasesFromAlt() {
    return loadReleasesFromNotes().then(function (list) {
      if (notesFileSource !== "live" || !list || !list.length) throw new Error("notes offline only");
      return saveReleases(list, "alt");
    });
  }

  function loadReleases(force) {
    if (!force) {
      try {
        var cached = JSON.parse(localStorage.getItem(REL_KEY));
        var cachedFormal = cached && Array.isArray(cached.releases) ? pickFormal(cached.releases) : null;
        if (cached && cached.fetchedAt && Array.isArray(cached.releases) && cached.releases.length &&
            cachedFormal && !tagNewer(String(CFG.tag), String(cachedFormal.tag_name)) &&
            (Date.now() - new Date(cached.fetchedAt).getTime()) < REL_TTL) {
          releasesSource = cached.source || "api";
          return Promise.resolve(cached.releases);
        }
      } catch (e) { /* 忽略 */ }
    }
    return loadReleasesFromApi().catch(function () { return loadReleasesFromAlt(); });
  }

  function decodeB64(b64) {
    var bin = atob(String(b64 || "").replace(/\s/g, ""));
    if (typeof TextDecoder !== "undefined") {
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new TextDecoder("utf-8").decode(bytes);
    }
    return decodeURIComponent(escape(bin));
  }

  function fetchText(url, ms) {
    ms = ms || 12000;
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, ms);
    return fetch(url, { cache: "no-store", signal: ctrl.signal }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    }).finally(function () { clearTimeout(timer); });
  }

  /* 仓库文件多通道回退：raw → jsDelivr 多节点 → gh 加速代理 → 本地副本。
     各远程通道均带 Access-Control-Allow-Origin: *，浏览器跨域可读；
     api.github.com 被限流或 raw 被 DNS 污染时仍能拿到发行说明 / LINUX.md。 */
  function repoFileChannels(path) {
    return [
      "https://raw.githubusercontent.com/" + CFG.repo + "/main/" + path,
      "https://ghfast.top/https://raw.githubusercontent.com/" + CFG.repo + "/main/" + path,
      "https://gh-proxy.com/https://raw.githubusercontent.com/" + CFG.repo + "/main/" + path,
      "https://gcore.jsdelivr.net/gh/" + CFG.repo + "@main/" + path,
      "https://fastly.jsdelivr.net/gh/" + CFG.repo + "@main/" + path,
      "https://cdn.jsdelivr.net/gh/" + CFG.repo + "@main/" + path
    ];
  }

  function fetchRepoFile(path, localFallback) {
    path = String(path || "").replace(/^\/+/, "");
    var channels = repoFileChannels(path);
    var chain = Promise.reject();
    channels.forEach(function (u) {
      chain = chain.catch(function () {
        return fetchText(u, 8000).then(function (t) { return { text: t, source: "live" }; });
      });
    });
    return chain.catch(function () {
      if (!localFallback) throw new Error("missing " + path);
      return fetchText(localFallback).then(function (t) { return { text: t, source: "static" }; });
    });
  }

  function buildStatic() {
    var f = CFG.fallback || {};
    return {
      source: "static",
      fetchedAt: (new Date()).toISOString(),
      version: f.version || CFG.tag,
      versionCode: CFG.versionCode,
      size: f.size || 0,
      sha256: f.sha256 || "",
      url: buildUrl(CFG.tag),
      releaseUrl: "https://github.com/" + CFG.repo + "/releases/tag/" + encodeURIComponent(CFG.tag),
      rollingUrl: buildUrl(CFG.rollingTag),
      updated: f.updated || "",
      rollingUpdated: "",
      rollingVersion: "",
      starsFork: (f.starsFork != null ? f.starsFork : null),
      starsUp: (f.starsUp != null ? f.starsUp : null)
    };
  }

  function packLive(rel, roll, forkStars, upStars) {
    var f = CFG.fallback || {};
    var asset = findApkAsset(rel);
    var rollAsset = findApkAsset(roll);
    var sha = "";
    if (asset && asset.digest && String(asset.digest).indexOf(":") >= 0) {
      sha = String(asset.digest).slice(String(asset.digest).indexOf(":") + 1).trim().toLowerCase();
    }
    var meta = parseReleaseMeta(rel && rel.body);
    var rollMeta = parseReleaseMeta(roll && roll.body);
    var rollingVersion = rollMeta.versionName || "";
    if (rollMeta.versionCode) {
      rollingVersion = rollingVersion
        ? rollingVersion + " · versionCode " + rollMeta.versionCode
        : "versionCode " + rollMeta.versionCode;
    }
    var tag = (rel && rel.tag_name) || f.version || CFG.tag;
    return {
      source: releasesSource === "api" ? "live" : (releasesSource === "alt" ? "live-alt" : "static"),
      fetchedAt: (new Date()).toISOString(),
      version: tag,
      versionCode: meta.versionCode || CFG.versionCode,
      size: asset ? asset.size : (f.size || 0),
      sha256: sha || (f.sha256 || ""),
      url: asset ? asset.browser_download_url : (f.url || buildUrl(tag)),
      releaseUrl: (rel && rel.html_url) || ("https://github.com/" + CFG.repo + "/releases/tag/" + encodeURIComponent(tag)),
      rollingUrl: (rollAsset && rollAsset.browser_download_url) || buildUrl(CFG.rollingTag),
      updated: (rel && rel.published_at) || "",
      rollingUpdated: assetTime(roll),
      rollingVersion: rollingVersion,
      starsFork: (forkStars != null ? forkStars : (f.starsFork != null ? f.starsFork : null)),
      starsUp: (upStars != null ? upStars : (f.starsUp != null ? f.starsUp : null))
    };
  }

  function loadReleasesFromNotes() {
    return fetchRepoFile("docs/RELEASE-NOTES.zh.md", "docs/RELEASE-NOTES.zh.md").then(function (res) {
      notesFileSource = res.source;
      return parseNotesReleases(res.text);
    });
  }

  /* GitHub API 限流时，shields.io 的 JSON 徽章（CORS 开放）仍能给出 Star 数；
     "4.6k" 这类缩写按千/百万还原，取不到就返回 null（UI 显示 —）。 */
  function shieldsStars(repo) {
    return fetchText("https://img.shields.io/github/stars/" + repo + ".json", 7000)
      .then(function (t) {
        var j = JSON.parse(t);
        var m = String(j.value || "").match(/([\d.]+)\s*([kKmM]?)/);
        if (!m) return null;
        var n = parseFloat(m[1]);
        if (!isFinite(n)) return null;
        var suf = (m[2] || "").toLowerCase();
        if (suf === "k") n *= 1000;
        else if (suf === "m") n *= 1000000;
        return Math.round(n);
      })
      .catch(function () { return null; });
  }

  function fetchAll(force) {
    return Promise.all([
      loadReleases(force).catch(function () { return null; }),
      getJSON("https://api.github.com/repos/" + CFG.repo).catch(function () { return null; }),
      getJSON("https://api.github.com/repos/" + CFG.upstream).catch(function () { return null; })
    ]).then(function (res) {
      var rels = res[0], fork = res[1], up = res[2];
      var formalNow = pickFormal(rels);
      var needNotes = !formalNow || tagNewer(String(CFG.tag), formalNow.tag_name);
      var next = needNotes
        ? loadReleasesFromNotes().catch(function () { return []; })
        : Promise.resolve(null);
      return next.then(function (notesRels) {
        if (notesRels && notesRels.length && notesFileSource === "live") {
          var apiFormal = pickFormal(rels);
          var notesFormal = pickFormal(notesRels);
          if (!apiFormal) rels = notesRels;
          else if (notesFormal && tagNewer(notesFormal.tag_name, apiFormal.tag_name)) {
            rels = notesRels.concat(Array.isArray(rels) ? rels : []);
          }
        }
        if (!Array.isArray(rels)) rels = [];
        var rel = pickFormal(rels);
        var roll = null;
        for (var i = 0; i < rels.length; i++) {
          if (String(rels[i].tag_name) === CFG.rollingTag) { roll = rels[i]; break; }
        }
        var apiForkStars = fork && fork.stargazers_count != null ? fork.stargazers_count : null;
        var apiUpStars = up && up.stargazers_count != null ? up.stargazers_count : null;
        var starsP = Promise.all([
          apiForkStars != null ? Promise.resolve(apiForkStars) : shieldsStars(CFG.repo),
          apiUpStars != null ? Promise.resolve(apiUpStars) : shieldsStars(CFG.upstream)
        ]);
        return starsP.then(function (st) {
          var forkStars = st[0], upStars = st[1];
          if (!rel) {
            var fb = buildStatic();
            if (forkStars != null) fb.starsFork = forkStars;
            if (upStars != null) fb.starsUp = upStars;
            return fb;
          }
          return packLive(rel, roll, forkStars, upStars);
        });
      });
    });
  }

  function readLiveCache() {
    try {
      var c = JSON.parse(localStorage.getItem(LS_KEY));
      if (c && c.version) return c;
    } catch (e) { /* 忽略 */ }
    return null;
  }

  function notify(data) {
    rememberTag(data);
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](data); } catch (e) { /* 忽略 */ }
    }
  }

  function load(force) {
    var cached = readLiveCache();
    var usableCache = isCurrent(cached) ? cached : null;
    if (usableCache) rememberTag(usableCache);
    var age = usableCache && usableCache.fetchedAt ? (Date.now() - new Date(usableCache.fetchedAt).getTime()) : Infinity;
    /* 有缓存也强制重新验证，避免新 Release 发布后被旧 release 列表挡住。 */
    var net = fetchAll(!!force || !!usableCache).then(function (data) {
      rememberTag(data);
      try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) { /* 存储满则忽略 */ }
      return data;
    });

    if (!force && usableCache) {
      net.then(function (data) {
        if (data) notify(data);
      }).catch(function () { /* 后台刷新失败保留缓存 */ });
      return Promise.resolve(usableCache);
    }

    return net.catch(function () { return rememberTag(usableCache || buildStatic()); });
  }

  function subscribe(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }

  function fmtSize(bytes) {
    if (!bytes) return "—";
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
    return Math.round(bytes / 1024) + " KB";
  }

  /* 历史版本列表：复用 releases 缓存，只保留 -linux / android-latest。 */
  function loadHistory(force) {
    return loadReleases(force).then(function (rels) {
      var list = (rels || []).filter(function (r) {
        var t = String(r.tag_name || "");
        return t === CFG.rollingTag || /-linux$/.test(t);
      });
      list.sort(function (a, b) {
        var at = String(a.tag_name || "");
        var bt = String(b.tag_name || "");
        if (at !== bt) {
          if (tagNewer(at, bt)) return -1;
          if (tagNewer(bt, at)) return 1;
        }
        var ta = Date.parse(assetTime(a) || 0);
        var tb = Date.parse(assetTime(b) || 0);
        if (isNaN(ta)) ta = 0;
        if (isNaN(tb)) tb = 0;
        return tb - ta;
      });
      return { source: "live", fetchedAt: (new Date()).toISOString(), releases: list };
    }).catch(function () {
      return { source: "static", fetchedAt: (new Date()).toISOString(), releases: [] };
    });
  }

  window.LiveData = {
    load: load,
    subscribe: subscribe,
    loadHistory: loadHistory,
    fetchRepoFile: fetchRepoFile,
    buildUrl: buildUrl,
    fmtSize: fmtSize,
    findApkAsset: findApkAsset,
    parseReleaseMeta: parseReleaseMeta,
    assetTime: assetTime,
    mirrorLinks: mirrorLinks,
    renderMirrorMenu: renderMirrorMenu,
    syncMirrorMenu: syncMirrorMenu
  };
})();