async function abstractCodeBlocks() {
  const code_blocks_to_abstract = getCodeBlocksToAbstract();
  updateProcessorProgress(0, code_blocks_to_abstract.length * 3);
  console.log(processor_steps.parse.parsed_files_blocks);

  for (const parsed_files_block_id of code_blocks_to_abstract) {
    const code_block =
      processor_steps.parse.parsed_files_blocks[parsed_files_block_id];
    await abstractCodeBlock(code_block);
  }

  processorStep = "build_maps";
  processCode();
}

function getCodeBlocksToAbstract() {
  let parse_object = processor_steps.parse.parsed_files_blocks;
  const code_blocks_to_abstract = Object.keys(parse_object).filter(
    (parsed_files_block_id) => {
      if (parse_object[parsed_files_block_id].status == "pending") {
        addProcessorLog(
          "info",
          `Adding code block ${parse_object[parsed_files_block_id].log_string} to abstractor queue`
        );
        return true;
      }

      addProcessorLog(
        "info",
        `Code block ${parse_object[parsed_files_block_id].log_string} has already been abstracted`
      );
      return false;
    }
  );

  return code_blocks_to_abstract;
}

// Three step 1. retrieve short description 2. retrieve concepts in use 3. retrieve function calls/declarations and variables use/declarations/values ?
async function abstractCodeBlock(code_block) {
  addProcessorLog("info", `Abstracting code block ${code_block.log_string}`);
  await abstract(code_block, "description");
  await abstract(code_block, "concepts");
  await abstract(code_block, "objects");
  code_block.status = "abstract";
}

async function abstract(code_block, type) {
  evalProcessPause();
  if (code_block["abstract_" + type]) {
    addProcessorLog(
      "info",
      `Code block ${code_block.log_string} ${type} already abstracted`
    );
    return;
  }
  addProcessorLog(
    "info",
    `Abstracting ${type} for code block ${code_block.log_string}`
  );
  const prompt = getAbstractPrompt(code_block.code, code_block.language, type);

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

  if (!data.choices[0].text.length) {
    throw new Error(`No ${type} returned`);
  }

  addAbstractValue(
    code_block,
    data.choices[0].text,
    data.usage.completion_tokens,
    type
  );

  updateProcessorProgress(1);
}

function getAbstractPrompt(code_block, language, type) {
  switch (type) {
    case "description":
      return (
        "Given the following string of " +
        language +
        " code which is a part of a larger codebase: \n\n" +
        code_block +
        "\n\n Provide a short abstract description of what it does:"
      );
    case "concepts":
      return (
        code_block.abstract_description +
        "\n\n" +
        code_block +
        "\n\n Provide a single string of comma separated abstract concepts about its purpose:"
        // Provide a single string of comma separated verb and predicate about the different purposes of this piece of code:
      );
    case "objects":
      return (
        code_block.abstract_description +
        "\n\n" +
        code_block +
        "\n\n Provide a single of comma separated string of the objects class name, functions name, variables name and other codebase specific elements present in this code block:"
      );
    default:
      throw new Error("Invalid type");
  }
}

function addAbstractValue(code_block, value, responseTokenLength, type) {
  code_block["abstract_" + type] = {
    value: value,
    length: responseTokenLength,
  };
}
