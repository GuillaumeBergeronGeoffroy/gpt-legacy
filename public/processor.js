// each step contains status / progress / data / logs
let processorNode = null;
let pauseProcessNode = null;
let logsListNode = null;
let processor_beforeunload_event_listener = null;
let processorStep = "parse";
let processor_total_steps = (processor_current_step = 0);
let processor_progress_node = null;
let processor_steps = {
  // parse the files
  parse: {
    parsed_files_blocks: {
      // parsed_files_block_id: {
      //    file_id: file.id,
      //    parsed_files_block_id: parsed_files_block_id,
      //    code: code_block,
      //    status: "pending" / "abstract" / "complete",
      //    language: file.language,
      //    log_string: `#${parsed_files_block_id} from file #${file.id} (${file.name})`,
      //    abstract_description: {},
      //    abstract_concepts : {}
      //    abstract_objects : {}
      // }
    },
  },
  // Get natural language description of blocks -> concepts in blocks -> objects/classes/functions/variables in blocks
  abstract: {},
  // use parsed_files_blocks abstract_data to build map of objects / relationships / class / functions and variables with pointer to parsed content
  build_maps: {
    // on input for changes query gpt to extract concept present in input text / then use concept map partial match on keys to extract all pertinent codeblocks description / batch the codeblocks description // I have these code blocks in my codebase that seem to interact with the concepts in the request with id // Do you think we need a separate codeblock for this concept and which of these codeblocks should be reviewed for possible changes given the new concept
    // Send ids of codeblocks to be reviewed and any distinct functional code blocks that should be created
    // if its a novel concept -> pass the concept array to check with the prompt concept array? / create new code block
    concepts: {
      // concepts: [parsed_files_block_id]
    },
    objects: {
      // name: [parsed_files_block_id]
    },
  },
  logs: [
    // {type: "info", message: "message"},
  ],
  // on prompt for changes / questions to / of codebase use prepend with available functions that can be used to search maps and prompt to determine a step by step process for resolving the question
};

function initProcessorSteps() {
  processor_steps = {
    parse: {
      parsed_files_blocks: {},
    },
    abstract: {},
    build_maps: {
      concepts: {},
      objects: {},
    },
    logs: [],
  };
}

// running / paused state
let processor_state = 1;
let processPaused = false;

const processCodeTemplate = /*html*/ `
    <div id="process-code-template" class='steps-template'>
        <h1>Process Codebase <img id="pause-process-img" src="img/pause.svg" onclick='toggleProcess()' /></h1>
        <div id="process-instruction">
            <p>Follow the progress of the codebase processor.</p>
            <p class="small text-muted">
                * You can pause the process using the pause button above.
            </p>
            <!-- <p class="small text-muted"> -->
              <!-- * In the works is a toggleable view that will display the codebase files in their parsed & abstract form. -->
            <!-- </p> -->
        </div>
        <ul id="logsList"></ul>
        <div id='process-progress-bar'></div>
    </div>`;

function registerProcessor(init = false) {
  //  create element with addCodeTemplate and append it to body
  processorNode = addTemplate(
    "process-code-template",
    processCodeTemplate,
    "body",
    "prepend"
  );
  pauseProcessNode = processorNode.querySelector("#pause-process-img");
  processor_progress_node = processorNode.querySelector(
    "#process-progress-bar"
  );
  !processor_beforeunload_event_listener && addUnloadEvent();
  initializeProcessorLogsFromProcessorSteps(init);
}

function addUnloadEvent() {
  processor_beforeunload_event_listener = true;
  window.addEventListener("beforeunload", (e) => {
    if (processor_state === 1) {
      e.preventDefault(); //per the standard
      e.returnValue = "";
    }
  });
}

function getProcessorStepsFromLocalStorage() {
  try {
    const steps = localStorage.getItem("processor_steps");
    if (steps) {
      processor_steps = JSON.parse(steps);
    }
  } catch (e) {
    console.log(e);
  }
}

function setProcessorStepsToLocalStorage() {
  try {
    localStorage.setItem("processor_steps", JSON.stringify(processor_steps));
  } catch (e) {
    console.log(e);
  }
}

function toggleProcess() {
  if (processor_state === 0) {
    unpauseProcess();
  } else {
    pauseProcess();
  }
}

function endProcess(init = false) {
  updateProcessorProgress(1, 1);
  processorStep = "complete";
  processor_state = 0;
  pauseProcessNode.classList.add("ended");
  pauseProcessNode.classList.add("paused");
  pauseLoaderProcessAnimation(true);
  !init && addProcessorLog("info", "Process complete", { completed: true });
}

function pauseProcess(error = null, init = false) {
  processor_state = 0;
  pauseProcessNode.classList.add("paused");
  error && pauseProcessNode.classList.add("error");
  pauseLoaderProcessAnimation();
  !init &&
    (error
      ? addProcessorLog("error", error)
      : addProcessorLog("info", "Pausing"));
}

function unpauseProcess() {
  processor_state = 1;
  pauseProcessNode.classList.remove("paused");
  pauseProcessNode.classList.remove("error");
  unpauseLoaderProcessAnimation();
  addProcessorLog(
    "info",
    !processor_steps.logs.length ? "Starting" : "Resuming"
  );
  processCode();
}

function evalProcessPause() {
  if (processor_state === 0) {
    throw new Error("Pausing");
  }
}

function addProcessorLog(type, message, extra_data = {}) {
  const log = {
    type: type,
    message: `<span class='log-m'>${message}</span><span class='log-t'>${formatDate(
      new Date()
    )}</span>`,
    ...extra_data,
  };
  processor_steps.logs.push(log);
  setProcessorStepsToLocalStorage();
  addLogToDom(log);
}

function addLogToDom(log) {
  const logNode = document.createElement("li");
  logNode.classList.add(log.type);
  logNode.innerHTML = log.message;
  logsListNode.appendChild(logNode);
  scrollToBottomOfLogs();
}

function scrollToBottomOfLogs() {
  logsListNode.scrollTop = logsListNode.scrollHeight;
}

function initializeProcessorLogsFromProcessorSteps(init = false) {
  logsListNode = processorNode.querySelector("#logsList");
  if (!init) {
    clearProcessorLogs();
  } else {
    processor_steps.logs.forEach((log) => {
      addLogToDom(log);
    });
  }
}

async function processCode() {
  try {
    evalProcessPause();
    // if files_data_changed is true, then we need to evaluate which files are new
    if (files_data_changed) {
      processorStep = "parse";
      files_data_changed = false;
    }
    switch (processorStep) {
      // Parse files into functional groups / code blocks
      case "parse":
        await parseFilesIntoBlocks();
        break;
      // Get natural language description of blocks -> concepts in blocks -> objects/relationships/classes/functions/variables in blocks
      case "abstract":
        abstractCodeBlocks();
        break;
      // Build maps of objects/relationships/classes/functions/variables to code blocks
      case "build_maps":
        buildMaps();
        break;
      case "complete":
        endProcess();
      default:
        break;
    }
  } catch (e) {
    if (processor_state !== 0) {
      console.log(e);
      pauseProcess(e);
    }
  }
}

function updateProcessorProgress(
  step_increment,
  initialized_total_steps = null
) {
  if (initialized_total_steps) {
    processor_total_steps = initialized_total_steps;
    processor_current_step = 0;
  }
  processor_current_step += step_increment;

  width =
    "calc(" +
    Math.ceil((processor_current_step / processor_total_steps) * 100) +
    "%)";

  processor_progress_node.style.width = width;
}

function clearProcessorLogs() {
  processor_steps.logs = [];
  setProcessorStepsToLocalStorage();
  logsListNode.innerHTML = "";
}
