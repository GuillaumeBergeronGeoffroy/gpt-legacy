let settingsObject = null;
let apiKey = null;

const settingsTemplate =
  /*html*/
  `<div id='settings-template'>
      <div><input id='api-key' value='Enter openAI API Key here' /><img class="settings-img" src="img/gear.png" /></div>
    </div>`;

function registerSettings() {
  settingsObject = addTemplate("settings-template", settingsTemplate);
  settingsTargetElem = settingsObject.node.querySelector("#settings-template");
  let settingsImg = settingsObject.node.querySelector(".settings-img");
  // rewrite this to use domManager
  settingsImg.addEventListener("click", () => {
    if (settingsImg.src.includes("img/gear.png")) {
      settingsImg.src = "img/close.png";
      settingsTargetElem.classList.add("active");
      // scrollToBottom of page
      // show all class setting-prompt
    } else {
      settingsImg.src = "img/gear.png";
      settingsTargetElem.classList.remove("active");
      // hide all class setting-prompt
    }
  });
  let apiKeyInput = settingsObject.node.querySelector("#api-key");
  apiKeyInput.addEventListener("change", (e) => {
    apiKey = e.target.value;
    setApiKeyToLocalStorage();
  });
}

function setApiKeyToLocalStorage() {
  try {
    localStorage.setItem("apiKey", apiKey);
  } catch (e) {
    console.log(e);
  }
}

function getApiKeyFromLocalStorage() {
  try {
    apiKey = localStorage.getItem("apiKey");
    if (apiKey) {
      let apiKeyInput = settingsObject.node.querySelector("#api-key");
      apiKeyInput.value = apiKey;
    }
  } catch (e) {
    console.log(e);
  }
}
