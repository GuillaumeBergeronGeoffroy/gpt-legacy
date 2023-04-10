let files_data = {};

const processContentTemplate = /*html*/ `
    <div id="add-code-template">
        <h1>Add Codebase</h1>
        <p class="small text-muted">
        * For now once process starts can't add new files / update codebase.
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

function registerFileUploadListener() {
    //  create element with processContentTemplate and append it to body
    addTemplate('add-code-template', processContentTemplate);
    
    document.getElementById('fileInput').addEventListener('change', (event) => {
        const files = event.target.files;
        const fileList = document.getElementById('fileList');
        files_data = {};
    
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileExtension = file.name.split('.').pop();
    
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                files_data[file.name] = {
                    title: file.name,
                    extension: fileExtension,
                    content: fileContent,
                };
    
                const listItem = document.createElement('li');
                listItem.innerHTML = `Title: ${file.name} | Extension: ${fileExtension}`;
                listItem.onclick = () => {
                    // remove dom element and remove from files_data
                    delete files_data[file.name];
                    listItem.remove();
                };
                fileList.appendChild(listItem);
    
                console.log(`File: ${file.name}\nContent:\n${fileContent}\n\n`);
            };
    
            reader.readAsText(file);
        }
    });
}