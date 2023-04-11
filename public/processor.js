// each step contains status / progress / data / logs
let processorNode = null;
let pauseProcessNode = null;
let processor_beforeunload_event_listener = null;
let processor_steps = {
  // get regex patterns to parse files
  get_parsers: {
    status: "pending",
    files_parsers: {
      // file_id, status, regex_patterns
    },
  },
  // parse files
  parse_files: {
    status: "pending",
    files_parsed: {
      // files_parsed_id: {file_id, files_parsed_id, status, content}}
    },
  },
  // use files_parsed to prompt for objects / relationships / class / functions and variables
  // use files_parsed to prompt for
  abstract_files: {
    status: "pending",
    files_parsed_data: {
      // files_parsed_data_id: {files_parsed_id: {status, objects, relationships, class, functions, variables}
    },
  },
  // use files_parsed_data to build map of objects / relationships / class / functions and variables with pointer to parsed content
  build_abstract_maps: {
    status: "pending",
    // object_map: {
    //  name: array of files_parsed_id that have this object
    // }
  },
  // on prompt for changes to codebase use maps to determine which parsed content block needs to be updated
};

// running / paused state
let processor_state = 1;

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

function pauseProcess(error = false) {
  processor_state = 0;
  pauseProcessNode.classList.add("paused");
  error && pauseProcessNode.classList.add("error");
  pauseLoaderProcessAnimation(error);
}

function unpauseProcess() {
  processor_state = 1;
  pauseProcessNode.classList.remove("paused");
  pauseProcessNode.classList.remove("error");
  unpauseLoaderProcessAnimation();
}

function processCode(step = "get_parsers") {
  if (processor_state === 0) {
    return;
  }
  // if files_data_changed is true, then we need to evaluate which files are new
  if (files_data_changed) {
    step = "get_parsers";
    files_data_changed = false;
    // processor_steps.get_parsers.status
    // foreach processor_steps set status to pending
    Object.values(processor_steps).forEach((step) => {
      step.status = "pending";
    });
  }

  switch (step) {
    case "get_parsers":
      getParsers();
      break;
    case "parse_files":
      parseFiles();
      break;
    case "abstract_files":
      abstractFiles();
      break;
    case "build_abstract_maps":
      buildAbstractMaps();
    default:
      break;
  }
}

function getParsers() {}

function parseFiles() {}

function abstractFiles() {}

function buildAbstractMaps() {}
