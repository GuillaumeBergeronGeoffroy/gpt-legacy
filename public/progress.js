const progressBarTemplate = /*html*/ 
    `<div>
        <div id='progress-bar-template'>
            <div class="step">
                Add
                <span class='next'>
                    <span class='go'>
                        Go
                    </span>
                    →
                </span>
            </div>
            <div class="step">
                Process
                <span class='next'>
                    <span class='go'>
                        Go
                    </span>
                    →
                </span>
            </div>
            <div class="step">Prompt</div>
        </div>
    </div>`

    function registerProgressBarListener() {
        addTemplate('progress-bar-template', progressBarTemplate);
    }

    function setProgressBarActiveStep(step) {
        const progressBar = document.getElementById('progress-bar-template');
        const steps = progressBar.childNodes;
        steps.forEach((step) => {
            step.classList && step.classList.remove('active');
        });
        steps[step].classList.add('active');
    }
