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
  addTemplate("progress-bar-template", progressBarTemplate);
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

function setActiveStep(step_index) {
  const progressBar = document.getElementById("progress-bar-template");
  progressBar.querySelectorAll(".step").forEach((step, i) => {
    step.classList.remove("active");
    if (step_index == i) step.classList.add("active");
  });
  current_step = step_index;
  setStepToLocalStorage(current_step);
}

function pauseLoaderProcessAnimation(error = false) {
  const ldsEllipsis = document.querySelector(".lds-ellipsis");
  // error && ldsEllipsis.classList.add("error");
  ldsEllipsis.classList.add("paused");
}

function unpauseLoaderProcessAnimation() {
  const ldsEllipsis = document.querySelector(".lds-ellipsis");
  ldsEllipsis.classList.remove("error");
  ldsEllipsis.classList.remove("paused");
}
