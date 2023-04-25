function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}

function getTokenSize(text) {
  if (!text) return 0;
  const tokenPattern = /[\p{L}\p{N}]+|[\p{P}\p{S}]/gu;
  const tokens = text.match(tokenPattern) || [];
  return tokens.length;
}

function getFileLanguage(extension) {
  const languageByExtension = {
    py: "python",
    yml: "yaml",
    js: "javascript",
    json: "json",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    swift: "swift",
    go: "go",
    rs: "rust",
    kt: "kotlin",
    ts: "typescript",
    sc: "scala",
    pl: "perl",
    sh: "shell",
    lua: "lua",
    m: "matlab",
    r: "r",
    jl: "julia",
    ps1: "powershell",
    groovy: "groovy",
    dart: "dart",
    fs: "fsharp",
    html: "html",
    xml: "xml",
    css: "css",
  };

  return languageByExtension[extension.toLowerCase()] || extension;
}

function getVisibleText(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  } else if (node.tagName == "BR") {
    return "\r";
  }
  var style = getComputedStyle(node);
  if (style && style.position === "absolute") return "";
  var text = "";
  for (var i = 0; i < node.childNodes.length; i++)
    text += getVisibleText(node.childNodes[i]);
  return text;
}

function showConfirmationPopUp(message, confirm = function () {}) {
  const popUp = document.createElement("div");
  popUp.classList.add("pop-up");
  popUp.innerHTML = /*html*/ `
    <div class="pop-up-content">
      <h1>${message}</h1>
      <div class="btn-group">
        <button class="btn btn-red active" onclick="confirm()">Yes</button>
        <button class="btn btn-primary active" onclick="document.querySelector('.pop-up').remove()">No</button>
      </div>
    </div>
  `;
  document.body.appendChild(popUp);
}
