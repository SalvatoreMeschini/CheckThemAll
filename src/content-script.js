"use strict";
var debug = false; // See doWork and log

browser.runtime.onMessage.addListener(doWork);

function doWork(event) {
    debug = event.isDebugEnabled;
    CheckThemAll(event.message);
    return Promise.resolve({ ack: "Action: " + event.message });
}

function CheckThemAll(action) {
    var isCheck = action === "check";
    var selection = getCurrentSelection();

    if (selection.toString().length > 0) {
        var all, checkBoxes, item;
        var checkList = [];
        all = getCheckBoxes();

        for (var k = 0; k < all.length; k++) {
            checkBoxes = all[k];
            for (var i = 0; i < checkBoxes.snapshotLength; i++) {
                item = checkBoxes.snapshotItem(i);
                if (selection.containsNode(item, true)) {
                    if (action === "invert")
                        checkList = checkList.concat(item);
                    else if ((item.checked && !isCheck) || (!item.checked && isCheck)) {
                        checkList = checkList.concat(item);
                    }
                }
            }
        }

        for (var c = 0; c < checkList.length; c++) {
            checkList[c].click();
        }
    }
}

//TODO: understand how to deal with Permission denied to access property "document" on cross-origin object when there is no selection in "external" iframes
function getCheckBoxes() {
    var doc = window.document;
    var checkBoxes = doc.evaluate("//input[translate(@type, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='checkbox']", doc, null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    log("Checkboxes found at first attempt: " + checkBoxes.snapshotLength);
    var all = new Array(checkBoxes);

    if (window.frames.length > 0) {
        var exceptions = [];
        log("Frames: " + window.frames.length);
        for (var i = 0; i < window.frames.length; i++) {
            log("Adding checkboxes from frame #" + i);
            try {
                doc = window.frames[i].document;
                checkBoxes = doc.evaluate("//input[translate(@type, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='checkbox']", doc, null,
                    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

                if (checkBoxes.snapshotLength > 0) {
                    log("SnapshotLength: " + checkBoxes.snapshotLength);
                    all = all.concat(checkBoxes);
                }
            } catch (exception) {
                if (exceptions.indexOf(exception.message) < 0) {
                    exceptions.push(exception.message);
                }
            }
        }

        /*  if (exceptions.length > 0) {
              browser.runtime.sendMessage({ "text": exceptions.join() });
          }*/
    }
    return all;
}

function getCurrentSelection() {
    var selection = window.top.getSelection();
    log("Selected characters: " + selection.toString().length);
    if (selection.toString().length <= 0) {
        log("No selection found!");
        var exceptions = [];
        if (window.frames.length > 0) {
            log("Let's check if something else is selected...");

            for (var i = 0; i < window.frames.length; i++) {
                log("Checking selection on frame " + i);
                try {
                    selection = window.frames[i].getSelection();
                    log("Frame selection length: " + selection.toString().length);
                    if (selection.toString().length > 0) {
                        break;
                    }
                } catch (exception) {
                    if (exceptions.indexOf(exception.message) < 0) {
                        exceptions.push(exception.message);
                    }
                }
            }
            if (exceptions.length > 0) {
                browser.runtime.sendMessage({ "text": exceptions.join() });
            }
        }
    }
    return selection;
}

function log(message) {
    if (debug) {
        console.log("CheckThemAll: " + message);
    }
}