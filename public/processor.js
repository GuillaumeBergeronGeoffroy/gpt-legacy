// each step contains status / progress / data / logs
let processorNode = null;
let processor_steps = {};
// running / paused state
let processor_state = 1;
let pauseProcessNode = null;

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

function processCode() {}
