function getTokenSize(text) {
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

  return languageByExtension[extension.toLowerCase()] || null;
}

const codeSplitRegex = {
  python: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  yaml: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  javascript: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  json: /(?:\r\n|\r|\n)/g,
  java: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  c: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  cpp: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  csharp: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  php: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  ruby: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  swift: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  go: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  rust: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  kotlin: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  typescript: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  scala: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  perl: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  shell: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  lua: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  matlab: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  r: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  julia: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  powershell: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  groovy: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  dart: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  fsharp: /(?<!['"`])(?:\r\n|\r|\n)(?!['"`])/g,
  html: /(?<!['"`])\s*(?:\r\n|\r|\n)\s*(?!['"`])/g,
  xml: /(?:\r\n|\r|\n)/g,
  css: /(?:\r\n|\r|\n)/g,
};

function getGroupCodeBlocksFunction(language) {
  const groupFunctions = {
    python: groupPythonCodeBlocks,
    yaml: groupYamlCodeBlocks,
    javascript: groupCodeBlocksUsingCurlyBraces,
    json: groupCodeBlocksUsingCurlyBraces,
    java: groupCodeBlocksUsingCurlyBraces,
    c: groupCodeBlocksUsingCurlyBraces,
    cpp: groupCodeBlocksUsingCurlyBraces,
    csharp: groupCodeBlocksUsingCurlyBraces,
    php: groupCodeBlocksUsingCurlyBraces,
    ruby: groupRubyCodeBlocks,
    swift: groupCodeBlocksUsingCurlyBraces,
    go: groupCodeBlocksUsingCurlyBraces,
    rust: groupCodeBlocksUsingCurlyBraces,
    kotlin: groupCodeBlocksUsingCurlyBraces,
    typescript: groupCodeBlocksUsingCurlyBraces,
    scala: groupCodeBlocksUsingCurlyBraces,
    perl: groupPerlCodeBlocks,
    shell: groupShellCodeBlocks,
    lua: groupLuaCodeBlocks,
    matlab: groupMatlabCodeBlocks,
    r: groupRCodeBlocks,
    julia: groupJuliaCodeBlocks,
    powershell: groupCodeBlocksUsingCurlyBraces,
    groovy: groupCodeBlocksUsingCurlyBraces,
    dart: groupCodeBlocksUsingCurlyBraces,
    fsharp: groupCodeBlocksUsingCurlyBraces,
    html: groupHtmlCodeBlocks,
    xml: groupXmlCodeBlocks,
    css: groupCodeBlocksUsingCurlyBraces,
  };

  return groupFunctions[language] ?? null;
}

function parseFile(file_content, file_extension) {
  const language = getFileLanguage(file_extension);
  if (!language) {
    throw new Error(`Unsupported file extension: ${file_extension}`);
  }

  return getGroupCodeBlocksFunction(language)(
    file_content.split(codeSplitRegex[language])
  );
}

function getFilesToParse() {
  // iterate over files_data for which the key is not in the parsed_files object the parsed object : { file_id : {} }
  // get all files_data not in or status = "pending"
  const files_to_parse = Object.keys(files_data).filter((file_id) => {
    return true;
  });

  // remove all files from parsed_files object that are not in files_data
  Object.keys(processor_steps.parse.parsed_files).forEach((file_id) => {
    if (!files_data[file_id]) {
      delete processor_steps.parse.parsed_files[file_id];
    }
  });

  return files_to_parse;
}

function parseFiles() {
  const files_to_parse = getFilesToParse();

  files_to_parse.forEach((file_id) => {
    const file = files_data[file_id];
    let parsed_file_id = 0;

    let parsed_file_content = parseFile(
      file.fileContent,
      file.fileExtension
    ).reduce((acc, curr) => {
      if (curr.trim() !== "") {
        console.log(getTokenSize(curr), curr);
        acc[file_id + "_" + parsed_file_id] = curr;
        parsed_file_id++;
      }
      return acc;
    }, {});

    processor_steps.parse.parsed_files[file_id] = parsed_file_content;
    file.status = "complete";
    evalProcessPause();
  });

  processor_steps.parse.status = "complete";
  processCode("abstract");
}
