/* 沙箱页：把仓库 LINUX.md 渲到 #linux-doc。对照/问答无对应仓库文件，保持页内文案。 */
(function () {
  "use strict";
  var box = document.getElementById("linux-doc");
  if (!box || !window.LiveData || !window.Md) return;
  LiveData.fetchRepoFile("LINUX.md", null)
    .then(function (res) {
      var note = document.createElement("p");
      note.className = "history-note";
      note.textContent = res.source === "live" ? "以下为仓库 LINUX.md 原文。" : "以下为缓存/本地副本。";
      box.innerHTML = Md.renderDoc(res.text);
      box.insertBefore(note, box.firstChild);
    })
    .catch(function () {
      box.innerHTML = '<p class="note">未能拉取 LINUX.md，以上卡片仍有效。可到 GitHub 仓库查看原文。</p>';
    });
})();
