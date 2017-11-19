function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
        debugmode: document.querySelector("#debugmode").checked,
        shownotifications: document.querySelector("#shownotifications").checked
    });
    document.querySelector("#savebutton").disabled = true;
}

function restoreOptions() {
    function setConfiguration(config) {
        if (!config.alreadySet) // First run?
        {
            document.querySelector("#debugmode").checked = false;
            document.querySelector("#shownotifications").checked = true;
            browser.storage.local.set({
                alreadySet: true,
                debugmode: false,
                shownotifications: true
            });
        } else {
            document.querySelector("#debugmode").checked = config.debugmode || false; // is || redundant?
            document.querySelector("#shownotifications").checked = config.shownotifications || false;
        }
    }

    function onError(error) {
        console.log('(CheckThemAll) Error while restoring options: ' + error);
    }

    var getting = browser.storage.local.get();
    getting.then(setConfiguration, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);