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
    map_list[map_list_index] += `${map_key}:${processor_steps.build_maps[type][
      map_key
    ].join(" ")},`;
    if (getTokenSize(map_list[map_list_index]) > 250) {
      map_list_index++;
      map_list.push("");
    }
  });
  return map_list;
}
