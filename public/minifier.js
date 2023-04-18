// const singleLineCommentDelimiters = {
//   python: "#",
//   javascript: "//",
//   java: "//",
//   c: "//",
//   cpp: "//",
//   csharp: "//",
//   php: "//",
//   ruby: "#",
//   swift: "//",
//   go: "//",
//   rust: "//",
//   kotlin: "//",
//   typescript: "//",
//   scala: "//",
//   perl: "#",
//   shell: "#",
//   lua: "--",
//   matlab: "%",
//   r: "#",
//   julia: "#",
//   powershell: "#",
//   groovy: "//",
//   dart: "//",
//   fsharp: "//",
// };

// const multiLineCommentDelimiters = {
//   python: { start: "'''", end: "'''" },
//   javascript: { start: "/*", end: "*/" },
//   java: { start: "/*", end: "*/" },
//   c: { start: "/*", end: "*/" },
//   cpp: { start: "/*", end: "*/" },
//   csharp: { start: "/*", end: "*/" },
//   php: { start: "/*", end: "*/" },
//   ruby: { start: "=begin", end: "=end" },
//   swift: { start: "/*", end: "*/" },
//   go: { start: "/*", end: "*/" },
//   rust: { start: "/*", end: "*/" },
//   kotlin: { start: "/*", end: "*/" },
//   typescript: { start: "/*", end: "*/" },
//   scala: { start: "/*", end: "*/" },
//   perl: { start: "=pod", end: "=cut" },
//   shell: { start: ": '", end: "' " },
//   lua: { start: "--[[", end: "]]" },
//   matlab: { start: "%{", end: "%}" },
//   r: { start: "/*", end: "*/" },
//   julia: { start: "#=", end: "=#" },
//   powershell: { start: "<#", end: "#>" },
//   groovy: { start: "/*", end: "*/" },
//   dart: { start: "/*", end: "*/" },
//   fsharp: { start: "(*", end: "*)" },
// };

// function removeComments(content, language) {
//   const singleLineDelimiter = singleLineCommentDelimiters[language];
//   const multilineDelimiters = multiLineCommentDelimiters[language];

//   // Remove single-line comments
//   if (singleLineDelimiter) {
//     const singleLinePattern = new RegExp(`\\s*${singleLineDelimiter}.*$`, "gm");
//     content = content.replace(singleLinePattern, "");
//   }

//   // Remove multiline comments
//   //   if (multilineDelimiters) {
//   //     const multilinePattern = new RegExp(
//   //       `${multilineDelimiters.start}([\\s\\S]*?)${multilineDelimiters.end}`,
//   //       "gm"
//   //     );
//   //     content = content.replace(multilinePattern, "");
//   //   }

//   return content;
// }

// function trimSpacesAroundOperators(code) {
//   const pattern = /\s*([{}\[\]=+\-*/%<>!&|^])\s*/g;

//   let insideString = false;
//   let currentStringChar = null;
//   let result = "";

//   for (let i = 0; i < code.length; i++) {
//     if (
//       (code[i] === '"' || code[i] === "'") &&
//       (i === 0 || code[i - 1] !== "\\")
//     ) {
//       if (insideString && currentStringChar === code[i]) {
//         insideString = false;
//       } else if (!insideString) {
//         insideString = true;
//         currentStringChar = code[i];
//       }
//     }

//     if (!insideString && pattern.test(code.slice(i, i + 2))) {
//       result += code[i].trim();
//       pattern.lastIndex = 0;
//     } else {
//       result += code[i];
//     }
//   }

//   return result;
// }

// function removeDoubleNewlines(text) {
//   const pattern = /\n{2,}/g;
//   return text.replace(pattern, "\n");
// }
