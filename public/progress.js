let progressBarNode = null;

const progressBarTemplate =
  /*html*/
  `<div id='progress-bar-template'>
        <div class="step">
            Add
            <span class='next' onclick='setActiveStep(1)'>
                <span class='go'>
                    Go
                </span>
                →
            </span>
        </div>
        <div class="step process">
            Process
            <span class='next'>
              <span class='back' onclick='setActiveStep(0)'>←</span>
              <div class="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </span>
        </div>
        <div class="step">Prompt</div>
    </div>`;

function registerProgressBar() {
  progressBarNode = addTemplate("progress-bar-template", progressBarTemplate);
}

function getStepFromLocalStorage() {
  try {
    const step = localStorage.getItem("current_step");
    if (step) {
      return JSON.parse(step);
    }
  } catch (e) {
    console.log(e);
  }
  return 0;
}

function setStepToLocalStorage(step) {
  try {
    localStorage.setItem("current_step", JSON.stringify(step));
  } catch (e) {
    console.log(e);
  }
}

function setActiveStep(step_index, init = false) {
  current_step = step_index;
  if (init) {
    getFileListFromLocalStorage();
    getProcessorStepsFromLocalStorage();
    getApiKeyFromLocalStorage();
  } else {
    // set opacity 0 to all element with class='steps-template'
    document.querySelectorAll(".steps-template").forEach((node) => {
      // move node margin-top by node height
      node.remove();
    });
  }
  if (current_step == 0) {
    registerLoader();
  } else if (current_step == 1) {
    registerProcessor();
  } else if (current_step == 2) {
  }
  if (init) {
    console.log(files_data);
    registerProgressBar();
    registerSettings();
    if (current_step == 1) {
      pauseProcess(null, true);
    }
  } else {
    if (current_step == 1) {
      unpauseProcess();
      processCode();
    }
  }
  progressBarNode.querySelectorAll(".step").forEach((step, i) => {
    step.classList.remove("active");
    if (step_index == i) step.classList.add("active");
  });
  setStepToLocalStorage(current_step);
}

function pauseLoaderProcessAnimation(error = false) {
  progressBarNode.classList.add("paused");
}

function unpauseLoaderProcessAnimation() {
  progressBarNode.classList.remove("error");
  progressBarNode.classList.remove("paused");
}
