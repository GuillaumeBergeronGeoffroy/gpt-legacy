// each step contains status / progress / data / logs
let processorNode = null;
let pauseProcessNode = null;
let logsListNode = null;
let processor_beforeunload_event_listener = null;
let processorStep = "parse";
let processor_steps = {
  // parse the files
  parse: {
    status: "pending",
    parsed_files_blocks: {
      // file_id, parsed_file_id, status
    },
  },
  // use files_parsed to prompt for objects / relationships / class / functions and variables
  // use files_parsed to prompt for
  abstract: {
    status: "pending",
    code_blocks_data: {
      // code_blocks_data_id: {parsed_files_block_id, status, objects, relationships, class, functions, variables}
    },
  },
  // use code_blocks_data to build map of objects / relationships / class / functions and variables with pointer to parsed content
  build_maps: {
    status: "pending",
    // object_map: {
    //  name: array of files_parsed_id that have this object
    // }
  },
  logs: [
    // {type: "info", message: "message"},
  ],
  // on prompt for changes / questions to / of codebase use prepend with available functions that can be used to search maps and prompt to determine a step by step process for resolving the question
};

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
        </div>
        <ul id="logsList"></ul>
    </div>`;

function registerProcessor() {
  //  create element with addCodeTemplate and append it to body
  processorNode = addTemplate(
    "process-code-template",
    processCodeTemplate,
    "body",
    "prepend"
  );
  pauseProcessNode = processorNode.querySelector("#pause-process-img");
  !processor_beforeunload_event_listener && addUnloadEvent();
  initializeProcessorLogsFromProcessorSteps();
}

function addUnloadEvent() {
  processor_beforeunload_event_listener = window.addEventListener(
    "beforeunload",
    (e) => {
      if (processor_state === 1) {
        e.preventDefault(); //per the standard
        e.returnValue = "";
      }
    }
  );
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

function pauseProcess(error = null, init = false) {
  processor_state = 0;
  pauseProcessNode.classList.add("paused");
  error && pauseProcessNode.classList.add("error");
  pauseLoaderProcessAnimation(error);
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

function addProcessorLog(type, message) {
  const log = {
    type: type,
    message: `<span class='log-m'>${message}</span><span class='log-t'>${formatDate(
      new Date()
    )}</span>`,
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

function initializeProcessorLogsFromProcessorSteps() {
  logsListNode = processorNode.querySelector("#logsList");
  if (processor_steps.logs.length === 0) return;
  processor_steps.logs.forEach((log) => {
    addLogToDom(log);
  });
}

async function processCode() {
  try {
    evalProcessPause();
    // if files_data_changed is true, then we need to evaluate which files are new
    if (files_data_changed) {
      processorStep = "parse";
      files_data_changed = false;
      // processor_steps.get_parsers.status
      // foreach processor_steps set status to pending
      Object.values(processor_steps).forEach((step) => {
        step.status = "pending";
      });
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

function buildMaps() {}
