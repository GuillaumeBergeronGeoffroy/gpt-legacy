let files_data = {};
let file_id = 0;
let loaderNode = null;

const addCodeTemplate = /*html*/ `
    <div id="add-code-template" class='steps-template'>
        <h1>Add Codebase</h1>
        <p class="small text-muted">
        * Add -> Process -> Prompt -> Apply or Discard changes -> Iterate.
        </p>
        <div id="codebase-instruction">
            <h2>Codebase</h2>
            <p>Add your codebase files.</p>
            <p class="small text-muted">* You can select multiple files at once.</p>
            <p class="small text-muted">
                * You can do multiple selections (to target different folders and
                sub-folders).
            </p>
        </div>
        <button class="btn btn-primary mt-3" onclick="document.getElementById('fileInput').click()">Add Files</button>
        <input class=' hidden' type="file" id="fileInput" multiple />
        <ul id="fileList"></ul>
    </div>`;

function registerLoader() {
  //  create element with addCodeTemplate and append it to body
  loaderNode = addTemplate(
    "add-code-template",
    addCodeTemplate,
    "body",
    "prepend"
  );

  document.getElementById("fileInput").addEventListener("change", (event) => {
    const files = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = file.name.split(".").pop();

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        file_id++;

        files_data[file_id] = {
          id: file_id,
          name: file.name,
          fileExtension: fileExtension,
          fileContent: fileContent,
        };

        addFileItemToDOM(files_data[file_id]);
        setFileListToLocalStorage();
      };

      reader.readAsText(file);
    }
  });
}

function initializeFileItemsFromFilesData() {
  if (files_data.length === 0) return;
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";
  for (const file in files_data) {
    addFileItemToDOM(files_data[file]);
  }
}

function addFileItemToDOM(file) {
  const listItem = document.createElement("li");
  listItem.innerHTML = `Title: ${file.name} - Extension: ${file.fileExtension}`;
  listItem.onclick = () => {
    // remove dom element and remove from files_data
    delete files_data[file.id];
    listItem.remove();
    setFileListToLocalStorage();
  };
  fileList.appendChild(listItem);
}

function setFileListToLocalStorage() {
  try {
    localStorage.setItem("files", JSON.stringify(files_data));
  } catch (e) {
    console.log(e);
  }
}

function getFileListFromLocalStorage() {
  try {
    const files = localStorage.getItem("files");
    if (files) {
      files_data = JSON.parse(files);
      if (Object.keys(files_data).length) {
        file_id = Math.max(...Object.keys(files_data).map((key) => key * 1));
      }
    }
  } catch (e) {
    console.log(e);
  }
}
