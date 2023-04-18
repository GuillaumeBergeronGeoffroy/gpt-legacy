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
