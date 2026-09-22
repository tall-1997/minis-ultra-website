/* 轻量 Markdown → HTML（发行说明 / LINUX.md）。文本全部转义。 */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || { repo: "tall-1997/OpenMinis-Linux" };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function absHref(url) {
    url = String(url || "").trim();
    if (/^https?:\/\//i.test(url)) return url;
    var p = url.replace(/^\.\.\//, "").replace(/^\.\//, "");
    return "https://github.com/" + CFG.repo + "/blob/main/" + p;
  }

  function inline(text) {
    var s = esc(text);
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
      var inner = label.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      return '<a href="' + esc(absHref(href)) + '" rel="noopener noreferrer">' + inner + "</a>";
    });
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return s;
  }

  function slugify(title) {
    var m = String(title || "").match(/(\d[\w.\-]*)/);
    return m ? "v-" + m[1].toLowerCase() : "v-sec";
  }

  function blocks(md) {
    var lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
    var out = [];
    var i = 0;
    var n = lines.length;

    function para(buf) {
      var t = buf.map(function (x) { return x.trim(); }).filter(Boolean).join(" ");
      if (t) out.push("<p>" + inline(t) + "</p>");
      buf.length = 0;
    }

    while (i < n) {
      var line = lines[i].replace(/\s+$/, "");
      if (!line.trim() || line.trim() === "---") { i++; continue; }
      if (line.indexOf("#### ") === 0) { out.push("<h4>" + inline(line.slice(5)) + "</h4>"); i++; continue; }
      if (line.indexOf("### ") === 0) { out.push("<h3>" + inline(line.slice(4)) + "</h3>"); i++; continue; }
      if (line.indexOf("## ") === 0) { out.push("<h3>" + inline(line.slice(3)) + "</h3>"); i++; continue; }
      if (/^[-*] /.test(line) || /^\d+\. /.test(line)) {
        var ordered = /^\d+\. /.test(line);
        out.push(ordered ? "<ol>" : "<ul>");
        while (i < n) {
          var cur = lines[i].replace(/\s+$/, "");
          if (!cur.trim() || cur.trim() === "---") {
            var j = i + 1;
            while (j < n && !lines[j].trim()) j++;
            if (j < n && (/^[-*] /.test(lines[j]) || /^\d+\. /.test(lines[j]) || /^  [-*] /.test(lines[j]))) {
              i++;
              continue;
            }
            break;
          }
          var mNum = cur.match(/^(\d+)\. (.*)$/);
          var mBul = cur.match(/^[-*] (.*)$/);
          if (!mNum && !mBul) break;
          var item = mNum ? mNum[2] : mBul[1];
          i++;
          var nested = [];
          while (i < n) {
            var nxt = lines[i].replace(/\s+$/, "");
            if (/^  [-*] /.test(nxt)) {
              nested.push(nxt.replace(/^  [-*] /, ""));
              i++;
              continue;
            }
            if (/^   /.test(nxt) && nxt.trim() && !/^[-*] /.test(nxt) && !/^\d+\. /.test(nxt)) {
              item += " " + nxt.trim();
              i++;
              continue;
            }
            break;
          }
          var htmlItem = inline(item);
          if (nested.length) {
            htmlItem += "<ul>" + nested.map(function (x) { return "<li>" + inline(x) + "</li>"; }).join("") + "</ul>";
          }
          out.push("<li>" + htmlItem + "</li>");
        }
        out.push(ordered ? "</ol>" : "</ul>");
        continue;
      }
      var buf = [line];
      i++;
      while (i < n) {
        var nx = lines[i].replace(/\s+$/, "");
        if (!nx.trim() || nx.trim() === "---" || nx.indexOf("#") === 0 || /^[-*] /.test(nx) || /^\d+\. /.test(nx)) break;
        buf.push(nx);
        i++;
      }
      para(buf);
    }
    return out.join("\n");
  }

  function renderReleaseNotes(md) {
    var parts = String(md || "").split(/^# /m);
    var toc = [];
    var articles = [];
    for (var p = 0; p < parts.length; p++) {
      var part = parts[p].trim();
      if (!part) continue;
      var nl = part.indexOf("\n");
      var title = (nl < 0 ? part : part.slice(0, nl)).trim();
      var rest = nl < 0 ? "" : part.slice(nl + 1);
      var sid = slugify(title);
      toc.push('<a href="#' + esc(sid) + '">' + esc(title.replace("OpenMinis-Linux ", "")) + "</a>");
      articles.push(
        '<article class="note-ver prose" id="' + esc(sid) + '"><h2>' + inline(title) + "</h2>" + blocks(rest) + "</article>"
      );
    }
    return { toc: toc.join(""), articles: articles.join("\n") };
  }

  function renderDoc(md) {
    var text = String(md || "").replace(/\r\n/g, "\n");
    if (text.indexOf("\n# ") < 0 && text.indexOf("# ") !== 0) {
      return '<div class="prose">' + blocks(text) + "</div>";
    }
    var r = renderReleaseNotes(text);
    if (!r.articles) return '<div class="prose">' + blocks(text) + "</div>";
    return r.articles;
  }

  window.Md = { renderReleaseNotes: renderReleaseNotes, renderDoc: renderDoc, inline: inline };
})();
