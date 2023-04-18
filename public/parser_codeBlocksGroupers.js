function groupCodeBlocksUsingCurlyBraces(splitCode) {
  const groupedBlocks = [];
  let currentBlock = [];
  let braceDepth = 0;
  let insideString = false;
  let currentStringChar = null;

  for (const line of splitCode) {
    currentBlock.push(line);
    for (let i = 0; i < line.length; i++) {
      if (
        (line[i] === '"' || line[i] === "'") &&
        (i === 0 || line[i - 1] !== "\\")
      ) {
        if (insideString && currentStringChar === line[i]) {
          insideString = false;
        } else if (!insideString) {
          insideString = true;
          currentStringChar = line[i];
        }
      }

      if (!insideString) {
        if (line[i] === "{") {
          braceDepth++;
        } else if (line[i] === "}") {
          braceDepth--;
        }
      }
    }

    if (braceDepth === 0 && currentBlock.length > 0) {
      groupedBlocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }
  }

  if (currentBlock.length > 0) {
    groupedBlocks.push(currentBlock.join("\n"));
  }

  return groupedBlocks;
}

function groupJavascriptCodeBlocks(splitCode) {
  const blockPattern =
    /^(function\s+[\w_$]+\s*\(|\w+\s*=\s*function\s*\(|\w+\s*=\s*\(\s*\)\s*=>\s*{|\w+\s*=\s*{|\w+\s*:\s*function\s*\(|\w+\s*:\s*\(\s*\)\s*=>\s*{|\w+\s*:\s*{)/;

  let codeBlocks = [];
  let currentBlock = "";

  splitCode.forEach((line) => {
    if (blockPattern.test(line.trim())) {
      if (currentBlock) {
        codeBlocks.push(currentBlock);
        currentBlock = "";
      }
    }
    currentBlock += line + "\n";
  });

  if (currentBlock) {
    codeBlocks.push(currentBlock);
  }

  return codeBlocks;
}

function groupPythonCodeBlocks(splitCode) {
  const groupedBlocks = [];
  let currentBlock = [];
  let blockDepth = 0;

  const blockStartRegex =
    /(?:^|\s)(?:def|class|if|elif|else|for|while|try|except|finally|with)(?:\s|$)/;
  const blockEndRegex = /(?:^|\s)(?:return|break|continue|raise)(?:\s|$)/;

  for (const line of splitCode) {
    const trimmedLine = line.trim();
    if (trimmedLine === "") {
      continue;
    }

    currentBlock.push(line);

    if (trimmedLine.match(blockStartRegex)) {
      blockDepth += 1;
    }

    if (trimmedLine.match(blockEndRegex)) {
      blockDepth -= 1;
    }

    if (blockDepth === 0 && currentBlock.length > 0) {
      groupedBlocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }
  }

  if (currentBlock.length > 0) {
    groupedBlocks.push(currentBlock.join("\n"));
  }

  return groupedBlocks;
}

function groupYamlCodeBlocks(splitCode) {
  const groupedBlocks = [];
  let currentBlock = [];
  let minIndent = Infinity;

  for (const line of splitCode) {
    if (line.trim() === "") {
      if (currentBlock.length > 0) {
        groupedBlocks.push(currentBlock.join("\n"));
        currentBlock = [];
        minIndent = Infinity;
      }
      continue;
    }

    const currentIndent = line.search(/\S/);
    if (currentIndent < minIndent) {
      if (currentBlock.length > 0) {
        groupedBlocks.push(currentBlock.join("\n"));
        currentBlock = [];
      }
      minIndent = currentIndent;
    }

    currentBlock.push(line);
  }

  if (currentBlock.length > 0) {
    groupedBlocks.push(currentBlock.join("\n"));
  }

  return groupedBlocks;
}

function groupRubyCodeBlocks(splitCode) {
  const groupedBlocks = [];
  let currentBlock = [];
  let blockDepth = 0;

  for (const line of splitCode) {
    const trimmedLine = line.trim();
    currentBlock.push(line);

    if (trimmedLine.match(/(?:^|[^a-zA-Z0-9_])do(?:[^a-zA-Z0-9_]|$)/)) {
      blockDepth += 1;
    }

    if (trimmedLine.match(/(?:^|[^a-zA-Z0-9_])end(?:[^a-zA-Z0-9_]|$)/)) {
      blockDepth -= 1;
    }

    if (blockDepth === 0 && currentBlock.length > 0) {
      groupedBlocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }
  }

  return groupedBlocks;
}

function groupHtmlCodeBlocks(splitCode) {
  let groupedBlocks = [];
  let currentBlock = [];
  let tagStack = [];

  const openingTagPattern = /<([a-zA-Z0-9]+)(?=[\s>]|$)/;
  const closingTagPattern = /<\/([a-zA-Z0-9]+)(?=[\s>]|$)/;
  const selfClosingTagPattern = /^<([a-zA-Z0-9]+)(?=\s|\/>)/;

  for (const line of splitCode) {
    let trimmedLine = line.trim();
    currentBlock.push(line);

    let openingMatch = trimmedLine.match(openingTagPattern);
    let closingMatch = trimmedLine.match(closingTagPattern);
    let selfClosingMatch = trimmedLine.match(selfClosingTagPattern);

    if (openingMatch) {
      tagStack.push(openingMatch[1]);
    }

    if (
      closingMatch &&
      tagStack.length > 0 &&
      closingMatch[1] === tagStack[tagStack.length - 1]
    ) {
      tagStack.pop();
    }

    if (selfClosingMatch && trimmedLine.endsWith("/>")) {
      // Do not push or pop the self-closing tag from the tagStack
    } else if (tagStack.length === 0 && currentBlock.length > 0) {
      groupedBlocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }
  }

  console.log(groupedBlocks);

  return groupedBlocks;
}

function groupJuliaCodeBlocks(splitCode) {
  const groupedBlocks = [];
  let currentBlock = [];
  let blockDepth = 0;

  const blockStartPattern =
    /(?:^|[^a-zA-Z0-9_])(function|if|for|while|let|quote|try|begin|macro)(?![a-zA-Z0-9_])/;
  const blockEndPattern = /(?:^|[^a-zA-Z0-9_])end(?![a-zA-Z0-9_])/;

  for (const line of splitCode) {
    const trimmedLine = line.trim();
    currentBlock.push(line);

    if (trimmedLine.match(blockStartPattern)) {
      blockDepth += 1;
    }

    if (trimmedLine.match(blockEndPattern)) {
      blockDepth -= 1;
    }

    if (blockDepth === 0 && currentBlock.length > 0) {
      groupedBlocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }
  }

  return groupedBlocks;
}

function groupRCodeBlocks(splitCode) {
  const groupedBlocks = [];
  let currentBlock = [];
  let blockDepth = 0;

  const blockStartPattern =
    /(?:^|[^a-zA-Z0-9_])(function|if|for|while)(?![a-zA-Z0-9_])/;
  const blockEndPattern = /(?:^|[^a-zA-Z0-9_])({|})/;

  for (const line of splitCode) {
    const trimmedLine = line.trim();
    currentBlock.push(line);

    if (trimmedLine.match(blockStartPattern)) {
      blockDepth += 1;
    }

    blockDepth += (trimmedLine.match(/{/g) || []).length;
    blockDepth -= (trimmedLine.match(/}/g) || []).length;

    if (blockDepth === 0 && currentBlock.length > 0) {
      groupedBlocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }
  }

  return groupedBlocks;
}

function groupMatlabCodeBlocks(splitCode) {
  const groupedBlocks = [];
  let currentBlock = [];
  let blockDepth = 0;

  const blockStartPattern =
    /(?:^|[^a-zA-Z0-9_])(function|if|for|while|switch|case|otherwise)(?![a-zA-Z0-9_])/;
  const blockEndPattern = /(?:^|[^a-zA-Z0-9_])end(?![a-zA-Z0-9_])/;

  for (const line of splitCode) {
    const trimmedLine = line.trim();
    currentBlock.push(line);

    if (trimmedLine.match(blockStartPattern)) {
      blockDepth += 1;
    }

    if (trimmedLine.match(blockEndPattern)) {
      blockDepth -= 1;
    }

    if (blockDepth === 0 && currentBlock.length > 0) {
      groupedBlocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }
  }

  return groupedBlocks;
}

function groupLuaCodeBlocks(splitCode) {
  const groupedBlocks = [];
  let currentBlock = [];
  let blockDepth = 0;

  const blockStartPattern =
    /(?:^|[^a-zA-Z0-9_])(function|if|for|while|repeat|do)(?![a-zA-Z0-9_])/;
  const blockEndPattern = /(?:^|[^a-zA-Z0-9_])(end|until)(?![a-zA-Z0-9_])/;

  for (const line of splitCode) {
    const trimmedLine = line.trim();
    currentBlock.push(line);

    if (trimmedLine.match(blockStartPattern)) {
      blockDepth += 1;
    }

    if (trimmedLine.match(blockEndPattern)) {
      blockDepth -= 1;
    }

    if (blockDepth === 0 && currentBlock.length > 0) {
      groupedBlocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }
  }

  return groupedBlocks;
}

function groupShellCodeBlocks(splitCode) {
  const groupedBlocks = [];
  let currentBlock = [];

  const blockStartPattern =
    /(?:^|[^a-zA-Z0-9_])(if|while|until|for|case|function)(?![a-zA-Z0-9_])/;
  const blockEndPattern = /(?:^|[^a-zA-Z0-9_])(fi|done|esac)(?![a-zA-Z0-9_])/;

  for (const line of splitCode) {
    const trimmedLine = line.trim();
    currentBlock.push(line);

    if (
      trimmedLine.match(blockStartPattern) ||
      trimmedLine.match(blockEndPattern)
    ) {
      groupedBlocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }
  }

  return groupedBlocks;
}

function groupPerlCodeBlocks(splitCode) {
  const groupedBlocks = [];
  let currentBlock = [];
  let braceDepth = 0;

  for (const line of splitCode) {
    const trimmedLine = line.trim();
    currentBlock.push(line);

    braceDepth += (trimmedLine.match(/{/g) || []).length;
    braceDepth -= (trimmedLine.match(/}/g) || []).length;

    if (braceDepth === 0) {
      groupedBlocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }
  }

  return groupedBlocks;
}

function groupXmlCodeBlocks(splitCode) {
  const groupedBlocks = [];
  let currentBlock = [];
  let tagDepth = 0;

  for (const line of splitCode) {
    const trimmedLine = line.trim();
    currentBlock.push(line);

    const openTags = (trimmedLine.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (trimmedLine.match(/<\/[^>]*>/g) || []).length;

    tagDepth += openTags;
    tagDepth -= closeTags;

    if (tagDepth === 0) {
      groupedBlocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }
  }

  return groupedBlocks;
}
