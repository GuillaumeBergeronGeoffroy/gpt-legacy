let promptNode = null;
let promptInput = null;

const promptCodeTemplate = /*html*/ `
    <div id="prompt-template" class='steps-template'>
        <h1>Prompt Codebase</h1>
        <div id="prompt-instruction">
        </div>
        <div id="prompt" contenteditable="true">...</div>
    </div>`;

function registerPrompt() {
  promptNode = addTemplate(
    "prompt-template",
    promptCodeTemplate,
    "body",
    "prepend"
  );
  promptInput = promptNode.querySelector("#prompt");
  registerPromptInputEventListeners();

  //   pauseProcessNode = processorNode.querySelector("#pause-process-img");
  //   initializeProcessorLogsFromProcessorSteps();
}

function registerPromptInputEventListeners() {
  promptInput.addEventListener("focus", handleFocus);
  promptInput.addEventListener("input", handleInput);
  promptInput.addEventListener("paste", handlePaste);
  promptInput.addEventListener("keydown", function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
    }
  });
  setTimeout(function () {
    promptInput.focus();
  }, 0);
}

function handleFocus(event) {
  addGeneratePrompt(promptInput);
}

function handleInput(event) {
  const divElement = event.target;
  const spanElement = divElement.querySelector(".submit-prompt");

  // Check if the div is empty other than the span
  if (
    divElement.childNodes.length === 1 &&
    divElement.childNodes[0] === spanElement
  ) {
    // Remove the span element from the div
    spanElement && divElement.removeChild(spanElement);
  } else {
    addGeneratePrompt(divElement);
  }
}

function handlePaste(event) {
  const divElement = event.target;
  const spanElement = divElement.querySelector(".submit-prompt");
  spanElement && divElement.removeChild(spanElement);
  setTimeout(() => {
    divElement.innerHTML = getVisibleText(divElement);
    addGeneratePrompt(divElement);
    // set cursor position at end of text befor the generate prompt
  }, 1);
}

function addGeneratePrompt(div) {
  // remove all divs with class submit-prompt
  document.querySelectorAll(".submit-prompt").forEach((submitPrompt) => {
    submitPrompt.remove();
  });
  let submitPrompt = document.createElement("span");
  submitPrompt.classList.add("submit-prompt");
  submitPrompt.innerText = "Prompt";
  submitPrompt.contentEditable = false;
  submitPrompt.addEventListener("click", function () {});
  div.append(submitPrompt);
}

function togglePrompt() {}
