function buildMaps() {
  const maps = processor_steps.build_maps;
  updateProcessorProgress(
    0,
    Object.keys(processor_steps.parse.parsed_files_blocks).length
  );

  Object.keys(processor_steps.parse.parsed_files_blocks).forEach(
    (parsed_files_block_id) => {
      const code_block =
        processor_steps.parse.parsed_files_blocks[parsed_files_block_id];
      if (code_block.status == "abstract") {
        addProcessorLog(
          "info",
          `Adding code block ${code_block.log_string} abstract data to maps`
        );
        Object.keys(maps).forEach((map_key) => {
          code_block[`abstract_${map_key}`] &&
            code_block[`abstract_${map_key}`].value.trim().length &&
            code_block[`abstract_${map_key}`].value
              .split(",")
              .forEach((word) => {
                // remove all \n in string
                word = word.replace(/(\r\n|\n|\r)/gm, "").trim();
                if (
                  !maps[map_key][word] ||
                  !Array.isArray(maps[map_key][word])
                ) {
                  maps[map_key][word] = [];
                }
                maps[map_key][word].push(parsed_files_block_id);
              });
        });
        code_block.status = "complete";
        updateProcessorProgress(1);
      }
    }
  );

  // filter out all parsed_files_block_id from maps object that are from blocks no longer in parsed_files_blocks
  Object.keys(maps).forEach((map_key) => {
    Object.keys(maps[map_key]).forEach((word) => {
      maps[map_key][word] = maps[map_key][word].filter(
        (parsed_files_block_id) => {
          return processor_steps.parse.parsed_files_blocks[
            parsed_files_block_id
          ];
        }
      );
    });
  });

  // filter out all words from maps object that have no parsed_files_block_id
  Object.keys(maps).forEach((map_key) => {
    Object.keys(maps[map_key]).forEach((word) => {
      if (!maps[map_key][word].length) {
        delete maps[map_key][word];
      }
    });
  });

  processorStep = "complete";
  processCode();
}

function getMapLists(type) {
  let map_list = [""];
  let map_list_index = 0;
  Object.keys(processor_steps.build_maps[type]).forEach((map_key) => {
    // concat map_key: join array values
    // map_list[map_list_index] += `${map_key}:${processor_steps.build_maps[type][
    //   map_key
    // ].join(" ")},`;
    map_list[map_list_index] += `${map_key},`;
    if (getTokenSize(map_list[map_list_index]) > 1000) {
      map_list_index++;
      map_list.push("");
    }
  });
  return map_list;
}

function getDescriptionsPerFileId(file_id = null) {
  let description_string = Object.values(
    processor_steps.parse.parsed_files_blocks
  )
    .map((code_block) => {
      if (!file_id || code_block.file_id == file_id) {
        return (
          "\n #" +
          code_block.parsed_files_block_id +
          ": " +
          code_block.abstract_description.value +
          "\n"
        );
      }
    })
    .join("");

  return description_string;
}

function getDescriptionPerBlockId(parsed_files_block_id) {
  return processor_steps.parse.parsed_files_blocks[parsed_files_block_id]
    .abstract_description.value;
}

function getConceptsPerBlockId(parsed_files_block_id) {
  return processor_steps.parse.parsed_files_blocks[parsed_files_block_id]
    .abstract_concepts.value;
}

function getObjectsPerBlockId(parsed_files_block_id) {
  return processor_steps.parse.parsed_files_blocks[parsed_files_block_id]
    .abstract_objects.value;
}

function getMappingPrompt(requirement, type, values) {
  switch (type) {
    case "concepts":
      return (
        "Given the following abstract representation of part of a codebase in a comma separated list of concepts:" +
        values +
        "\n\n Given the following requested change:" +
        requirement +
        "\n\n Here is the complete list of comma separated concepts present in the above list that are relevant to the requested change:"
      );
    case "objects":
      "Given the following abstract representation of part of a codebase in a comma separated list of concepts:" +
        values +
        "\n\n Given the following requested change:" +
        requirement +
        "\n\n Here is the complete list of comma separated code objects present in the above list that are relevant to the requested change:";
  }
}

async function mapPromptLinkedBlocksIds(prompt_object, type) {
  const values = getMapLists(type);

  for (const value_key of values) {
    const map_part = values[value_key];
    await getPromptLinkedBlocksIdsPart(prompt_object, type, map_part);
  }
}

async function mapPromptLinkedBlocksIdsPart(prompt_object, type, map_part) {
  const prompt = getMappingPrompt(prompt_object.prompt, type, map_part);

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

  prompt_object["codebase_" + type] = data.choices[0].text
    .replace(/(\r\n|\n|\r)/gm, "")
    .trim();
}

function intersectPromptBlockIdsUsingMaps(prompt_object, type) {
  const prompt_map = processor_steps.build_maps[type];
  const prompt_map_linked_blocks_id = prompt_object["codebase_" + type]
    .split(",")
    .map((word) => {
      return prompt_map[word];
    });

  // array merge mapped_existing_blocks with prompt_map_linked_blocks_id and remove duplicates
  prompt_object["mapped_existing_blocks"] = [
    ...new Set([
      ...prompt_object["mapped_existing_blocks"],
      ...prompt_map_linked_blocks_id,
    ]),
  ];
}
