(function () {
  "use strict";
  var box = document.getElementById("notes-root");
  if (!box || !window.LiveData || !window.Md) return;

  function paint(text, source) {
    var r = Md.renderReleaseNotes(text);
    var head = document.createElement("p");
    head.className = "history-note";
    head.textContent = source === "live"
      ? "正文实时取自仓库 docs/RELEASE-NOTES.zh.md"
      : "网络不可用，显示站内副本";
    box.innerHTML = (r.toc ? '<nav class="toc" aria-label="版本目录">' + r.toc + "</nav>" : "") + r.articles;
    box.insertBefore(head, box.firstChild);
  }

  LiveData.fetchRepoFile("docs/RELEASE-NOTES.zh.md", "docs/RELEASE-NOTES.zh.md")
    .then(function (res) { paint(res.text, res.source); })
    .catch(function () {
      box.innerHTML = '<p class="warn">暂时拉不到发行说明。请稍后刷新，或到 GitHub 仓库查看 docs/RELEASE-NOTES.zh.md。</p>';
    });
})();
