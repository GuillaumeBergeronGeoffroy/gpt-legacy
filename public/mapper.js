function buildMaps() {
  const maps = processor_steps.build_maps;
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
                if (!maps[map_key][word]) {
                  maps[map_key][word] = [];
                }
                maps[map_key][word].push(parsed_files_block_id);
              });
        });
        code_block.status = "complete";
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

  processorStep = "complete";
  processCode();
}
