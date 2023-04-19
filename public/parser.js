async function parseFilesIntoBlocks() {
  const filesToParse = getFilesToParse();

  for (const file_id of filesToParse) {
    const file = files_data[file_id];
    addProcessorLog(
      "info",
      `Parsing file #${file_id} (${files_data[file_id].name})`
    );
    await parseFile(file_id, file.content, getFileLanguage(file.extension));
    file.status = "complete";
    setFileListToLocalStorage();
    evalProcessPause();
  }

  processor_steps.parse.status = "complete";
  processorStep = "abstract";
  processCode();
}

function getFilesToParse() {
  // iterate over files_data for which the key is not in the parsed_files_blocks object the parsed object : { file_id : {} }
  // get all files_data not in parsed_files_blocks or file.status = "pending"
  const files_to_parse = Object.keys(files_data).filter((file_id) => {
    if (files_data[file_id].status == "pending") {
      addProcessorLog(
        "info",
        `Adding file #${file_id} (${files_data[file_id].name}) to parsing queue`
      );
      return true;
    }

    addProcessorLog(
      "info",
      `File #${file_id} (${files_data[file_id].name}) has already been parsed`
    );
    return false;
  });

  // remove all parsed_blocks from parsed_files_blocks object that are from files no longer in files_data
  Object.keys(processor_steps.parse.parsed_files_blocks).forEach(
    (parsed_files_block_id) => {
      let context_file_id =
        processor_steps.parse.parsed_files_blocks[parsed_files_block_id][
          "file_id"
        ];
      if (!files_data[context_file_id]) {
        delete processor_steps.parse.parsed_files_blocks[parsed_files_block_id];
      }
    }
  );

  return files_to_parse;
}

async function parseFile(file_id, file_content, language) {
  const max_token = 1500;
  const length = getTokenSize(file_content);
  const number_of_parts = Math.ceil(length / max_token);
  const file_parts = splitFileString(file_content, number_of_parts);
  let n = 0;
  for (const file_part of file_parts) {
    n++;
    addProcessorLog(
      "info",
      `Sending parse request ${n}/${number_of_parts} with tokens ${Math.min(
        n * max_token,
        length
      )}/${length}.`
    );
    await parseFilePart(file_id, getParsePrompt(file_part, language));
  }
}

function splitFileString(str, n) {
  const len = str.length;
  const size = Math.ceil(len / n);
  const parts = [];

  for (let i = 0; i < len; i += size) {
    parts.push(str.substring(i, i + size));
  }

  return parts;
}

function getParsePrompt(promptContent, language) {
  return (
    "Given the following string of " +
    language +
    " code : \n\n" +
    promptContent +
    '\n\n Split it into smaller strings representing distinct functional groups, separate each group by "[BLOCK]" and end response by "[BLOCK]":'
  );
}

async function parseFilePart(file_id, prompt) {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/engines/text-davinci-003/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          temperature: 0,
          max_tokens: 2000,
          stop: "aaaaaaaaaaaaaaaaaaaaaaabaaaaaaaa.aaaaaaa",
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(`${data.error.message}`);
    }

    let splitted_blocks = data.choices[0].text.split("[BLOCK]");
    if (!splitted_blocks.length) {
      throw new Error("No functional groups returned");
    }

    splitted_blocks.map((code_block) => {
      handleParseResponse(file_id, code_block);
    });
  } catch (error) {
    console.log(error);
    pauseProcess(error);
  }
}

function handleParseResponse(file_id, code_block) {
  if (block.trim() !== "") {
    let parsed_file_block_id = Math.max(
      Math.max(
        ...Object.keys(processor_steps.parse.parsed_files_blocks).map(
          (key) => key * 1
        )
      ),
      0
    );
    parsed_file_block_id++;
    processor_steps.parse.parsed_files_blocks[parsed_file_block_id] = {
      file_id: file_id,
      code: code_block,
      status: "pending",
    };
    addProcessorLog(
      "info",
      `Parsed file #${file_id} (${
        files_data[file_id].name
      }) to functional group #${parsed_file_block_id} with token size (${getTokenSize(
        code_block
      )})`
    );
  }
}
