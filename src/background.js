var debug = false;
var shownotifications = true;

browser.runtime.onMessage.addListener(notify);

browser.contextMenus.create({
        id: "checkthem-all",
        title: browser.i18n.getMessage("menuitemCheckAll"),
        contexts: ["all"],
        icons: {
            "16": "icons/16x16-check.png",
            "32": "icons/32x32-check.png"
        }
    },
    onCreated(debug)
);

browser.contextMenus.create({
        id: "uncheckthem-all",
        title: browser.i18n.getMessage("menuitemUnCheckAll"),
        contexts: ["all"],
        icons: {
            "16": "icons/16x16-uncheck.png",
            "32": "icons/32x32-uncheck.png"
        }
    },
    onCreated(debug)
);

browser.contextMenus.create({
        id: "invertthem-all",
        title: browser.i18n.getMessage("menuitemInvertAll"),
        contexts: ["all"],
        icons: {
            "16": "icons/16x16-invert.png",
            "32": "icons/32x32-invert.png"
        }
    },
    onCreated(debug)
);

browser.contextMenus.onClicked.addListener((info, tab) => {
    var action = "check";

    switch (info.menuItemId) {
        case "checkthem-all":
            action = "check";
            break;
        case "uncheckthem-all":
            action = "uncheck";
            break;
        case "invertthem-all":
            action = "invert";
            break;
    }

    var getting = browser.storage.local.get();
    getting.then(
        function(config) {
            debug = config.debugmode,
                shownotifications = config.shownotifications;
        }, handleError);

    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(tabs => sendMessageToTabs(tabs, action)).catch(handleError);
});

function sendMessageToTabs(tabs, action) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(tab.id, { message: action, isDebugEnabled: debug }).then(response => {
            console.log("ACK: " + response.ack);
        }).catch(handleError);
    }
}

function handleError(error) {
    console.log('CheckThemAll Error: ' + error);
}

function onCreated() {
    if (browser.runtime.lastError) {
        console.log("CheckThemAll: " + browser.runtime.lastError);
    }
}

function notify(notification) {
    if (shownotifications) {
        var title = "CheckThemAll";
        var content = notification.text; // browser.i18n.getMessage("notificationContent", notification.text);
        browser.notifications.create({
            "type": "basic",
            "iconUrl": browser.extension.getURL("icons/48x48.png"),
            "title": title,
            "message": content
        });
    }
}