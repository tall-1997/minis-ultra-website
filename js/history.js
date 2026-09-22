/* 历史版本 + 各版本更新日志。
   优先用 GitHub API 的 releases 列表（tag / 日期 / 体积 / digest / release body），
   离线时回退到 config.history 里的站内摘要。渲染进 #history-list。 */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG;
  var LiveData = window.LiveData;
  var CONTAINER = "history-list";
  var NOTES_RE = /(?:\.\.\/)?docs\/RELEASE-NOTES\.zh\.md/g;

  function notesHref(tag) {
    var t = String(tag || "").replace(/^v/, "");
    return t ? ("changelog.html#v-" + t) : "changelog.html#release-notes";
  }

  function appendLog(el, text) {
    var s = String(text || "");
    el.textContent = "";
    var last = 0, m;
    NOTES_RE.lastIndex = 0;
    while ((m = NOTES_RE.exec(s))) {
      if (m.index > last) el.appendChild(document.createTextNode(s.slice(last, m.index)));
      var a = document.createElement("a");
      a.href = "changelog.html#release-notes";
      a.textContent = "完整中文发行说明";
      el.appendChild(a);
      last = m.index + m[0].length;
    }
    if (last === 0) el.textContent = s;
    else if (last < s.length) el.appendChild(document.createTextNode(s.slice(last)));
  }

  function render(items, source) {
    var box = document.getElementById(CONTAINER);
    if (!box) return;
    box.textContent = "";
    var note = document.createElement("p");
    note.className = "history-note";
    note.textContent = source === "live" ? "数据来自 GitHub 在线通道（可点右上刷新）" : "离线：显示站内摘要（连接网络可看到实时版本与完整说明）";
    box.appendChild(note);
    var frag = document.createDocumentFragment();
    items.forEach(function (it) {
      var card = document.createElement("article");
      card.className = "ver" + (it.noApk ? " no-apk" : "");
      var left = document.createElement("div");
      var strong = document.createElement("strong");
      strong.textContent = it.rolling ? ("滚动包 " + it.tag) : it.tag;
      left.appendChild(strong);
      if (it.code) {
        var c = document.createElement("p");
        c.className = "meta";
        c.textContent = "versionCode " + it.code;
        left.appendChild(c);
      }
      if (it.date) {
        var d = document.createElement("p");
        d.className = "meta";
        d.textContent = it.date;
        left.appendChild(d);
      }
      if (it.sizeText) {
        var s = document.createElement("p");
        s.className = "meta";
        s.textContent = it.sizeText;
        left.appendChild(s);
      }
      card.appendChild(left);
      var right = document.createElement("div");
      var log = document.createElement("details");
      log.className = "log-toggle";
      var sum = document.createElement("summary");
      sum.textContent = "更新日志";
      log.appendChild(sum);
      var body = document.createElement("p");
      body.className = "log-body";
      appendLog(body, it.log || "—");
      log.appendChild(body);
      right.appendChild(log);
      var acts = document.createElement("div");
      acts.className = "actions";
      if (it.url) {
        var a = document.createElement("a");
        a.className = "btn btn-sm btn-primary";
        a.href = it.url;
        a.textContent = "下载 APK";
        acts.appendChild(a);
        var menu = LiveData.renderMirrorMenu(it.url);
        if (menu) acts.appendChild(menu);
      } else {
        var span = document.createElement("span");
        span.className = "no-apk-tag";
        span.textContent = "该版本无 APK 资产";
        acts.appendChild(span);
      }
      var full = document.createElement("a");
      full.className = "btn btn-sm btn-ghost";
      full.href = notesHref(it.tag);
      full.textContent = "完整说明";
      acts.appendChild(full);
      if (it.releaseUrl) {
        var r = document.createElement("a");
        r.className = "btn btn-sm btn-ghost";
        r.href = it.releaseUrl;
        r.textContent = "Release 页";
        acts.appendChild(r);
      }
      right.appendChild(acts);
      card.appendChild(right);
      frag.appendChild(card);
    });
    box.appendChild(frag);
  }

  function fmtWhen(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return isNaN(d.getTime()) ? String(iso).slice(0, 10) : d.toLocaleString("zh-CN");
  }

  function toItems(releases) {
    return releases.map(function (r) {
      var apk = LiveData.findApkAsset ? LiveData.findApkAsset(r) : null;
      if (!apk) {
        (r.assets || []).forEach(function (a) { if (String(a.name).indexOf(".apk") >= 0) apk = a; });
      }
      var when = (LiveData.assetTime && LiveData.assetTime(r)) || (apk && apk.updated_at) || r.published_at || "";
      var sizeText = apk ? LiveData.fmtSize(apk.size) : "";
      var tag = String(r.tag_name || "");
      var digest = (apk && apk.digest && String(apk.digest).indexOf(":") >= 0)
        ? String(apk.digest).slice(String(apk.digest).indexOf(":") + 1).toLowerCase() : "";
      var log = (r.body || "").trim();
      if (digest && log) log = "SHA-256: " + digest + "\n\n" + log;
      else if (digest) log = "SHA-256: " + digest;
      var meta = LiveData.parseReleaseMeta ? LiveData.parseReleaseMeta(r.body) : {};
      var code = meta.versionCode || "";
      return {
        tag: tag,
        rolling: tag === CFG.rollingTag,
        code: code,
        date: fmtWhen(when),
        sizeText: sizeText,
        url: apk ? apk.browser_download_url : "",
        releaseUrl: r.html_url,
        log: log,
        noApk: !apk
      };
    });
  }

  function toFallbackItems() {
    return (CFG.history || []).map(function (h) {
      return {
        tag: h.tag,
        code: h.code || "",
        date: h.date || "",
        sizeText: "",
        rolling: h.tag === CFG.rollingTag,
        url: h.noApk ? "" : LiveData.buildUrl(h.tag),
        releaseUrl: "https://github.com/" + CFG.repo + "/releases/tag/" + encodeURIComponent(h.tag),
        log: h.log || "—",
        noApk: !!h.noApk
      };
    });
  }

  function init() {
    var box = document.getElementById(CONTAINER);
    if (!box) return;
    var btnRefresh = document.querySelector("[data-action='history-refresh']");
    function load() {
      if (btnRefresh) {
        btnRefresh.disabled = true;
        btnRefresh.textContent = "刷新中…";
      }
      LiveData.loadHistory(true).then(function (res) {
        render(res.source === "live" ? toItems(res.releases) : toFallbackItems(), res.source);
      }).catch(function () {
        render(toFallbackItems(), "static");
      }).finally(function () {
        if (btnRefresh) {
          btnRefresh.disabled = false;
          btnRefresh.textContent = "刷新历史";
        }
      });
    }
    if (btnRefresh) btnRefresh.addEventListener("click", load);
    load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.History = { render: render };
})();