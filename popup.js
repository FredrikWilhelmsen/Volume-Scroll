chrome.storage.sync.get("userSettings", data => {
    const {
        volume,
        volumeIncrement,
        usePreciseScroll,
        fullscreenOnly,
        useDefaultVolume,
        useMousewheelVolume,
        fontColor,
        fontSize,
        modifierKey,
        useOverlayMouse,
        overlayXPos,
        overlayYPos,
        useModifierKey,
        invertModifierKey,
        toggleMuteKey,
        useToggleMuteKey,
        blacklist
    } = data.userSettings;
    console.log(data.userSettings);

    chrome.storage.onChanged.addListener((changes) => {
        console.log(changes.userSettings.newValue);
    });

    //Add event listeners
    document.getElementById("useMousewheelVolume").addEventListener("change", function () {
        let input = document.getElementById("useMousewheelVolume");

        document.getElementById("fullscreenScroll").disabled = !input.checked;
        document.getElementById("incrementSlider").disabled = !input.checked;
        document.getElementById("overlayFontSizeSlider").disabled = !input.checked;
        document.getElementById("overlayColorInput").disabled = !input.checked;
        document.getElementById("useModifierKey").disabled = !input.checked;
        document.getElementById("overlayPositionInput").disabled = !input.checked;
        document.getElementById("preciseScroll").disabled = !input.checked;
        document.getElementById("invertModifierKey").disabled = !input.checked || !document.getElementById("useModifierKey").checked;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, useMousewheelVolume: input.checked } });
        });
    });

    document.getElementById("incrementSlider").addEventListener("input", function () {
        let input = document.getElementById("incrementSlider");

        document.querySelector("#mousewheelVolumeWrapper .valueDisplay").innerHTML = input.value;

        let defaultVolumeInput = document.getElementById("defaultVolumeSlider");
        defaultVolumeInput.step = input.value;

        let volume = defaultVolumeInput.value;
        volume = volume / input.value;
        volume = Math.round(volume);
        volume = volume * input.value;
        defaultVolumeInput.value = volume;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, volumeIncrement: input.value, volume: volume } });
        });
        document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = volume;
    });

    document.getElementById("incrementSlider").addEventListener("wheel", function (event) {
        let input = document.getElementById("incrementSlider");

        if (input.disabled) {
            return;
        }

        event.preventDefault();

        input.value = parseInt(input.value) + event.deltaY / 100 * -1; //Gets the direction of the scroll, then divides by 100 to get just the value 1 or -1.

        document.querySelector("#mousewheelVolumeWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, volumeIncrement: input.value } });
        });

        let defaultVolumeInput = document.getElementById("defaultVolumeSlider");
        defaultVolumeInput.step = input.value;

        let volume = defaultVolumeInput.value;
        volume = volume / input.value;
        volume = Math.round(volume);
        volume = volume * input.value;
        defaultVolumeInput.value = volume;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, volumeIncrement: input.value, volume: volume } });
        });
        document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = volume;
    });

    document.getElementById("preciseScroll").addEventListener("input", function () {
        let input = document.getElementById("preciseScroll");

        document.getElementById("preciseScrollState").innerHTML = (input.checked) ? "Precise scroll is enabled" : "Precise scroll is disabled";

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, usePreciseScroll: input.checked } });
        });
    });

    document.getElementById("fullscreenScroll").addEventListener("input", function () {
        let input = document.getElementById("fullscreenScroll");

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, fullscreenOnly: input.checked } });
        });
    });

    document.getElementById("overlayFontSizeSlider").addEventListener("input", function () {
        let input = document.getElementById("overlayFontSizeSlider");

        document.querySelector("#overlayWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, fontSize: input.value } });
        });
    });

    document.getElementById("overlayFontSizeSlider").addEventListener("wheel", function (event) {
        let input = document.getElementById("overlayFontSizeSlider");

        if (input.disabled) {
            return;
        }

        event.preventDefault();

        input.value = parseInt(input.value) + (event.deltaY / 100 * -1) * input.step; //Gets the direction of the scroll, then divides by 100 to get just the value 1 or -1.

        document.querySelector("#overlayWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, fontSize: input.value } });
        });
    });

    document.getElementById("overlayColorInput").addEventListener("change", function () {
        let input = document.getElementById("overlayColorInput");

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, fontColor: input.value } });
        });
    });

    document.getElementById("overlayPositionInput").addEventListener("change", function () {
        let input = document.getElementById("overlayPositionInput");

        if(input.value === "mouse"){
            document.getElementById("overlayXPos").disabled = true;
            document.getElementById("overlayYPos").disabled = true;
            
            document.getElementById("overlayXPosWrapper").style.display = "none";
            document.getElementById("overlayYPosWrapper").style.display = "none";

            chrome.storage.sync.get("userSettings", result => {
                chrome.storage.sync.set({ userSettings: { ...result.userSettings, useOverlayMouse: true } });
            });
        }
        else if (input.value === "custom"){
            document.getElementById("overlayXPos").disabled = false;
            document.getElementById("overlayYPos").disabled = false ;

            document.getElementById("overlayXPosWrapper").style.display = "block";
            document.getElementById("overlayYPosWrapper").style.display = "block";

            chrome.storage.sync.get("userSettings", result => {
                chrome.storage.sync.set({ userSettings: { ...result.userSettings, useOverlayMouse: false } });
            });
        }
        else {
            document.getElementById("overlayXPos").disabled = true;
            document.getElementById("overlayYPos").disabled = true;

            document.getElementById("overlayXPosWrapper").style.display = "block";
            document.getElementById("overlayYPosWrapper").style.display = "block";

            let value = JSON.parse(input.value);
            let xPos = document.getElementById("overlayXPos");
            let yPos = document.getElementById("overlayYPos");

            xPos.value = value[0];
            document.querySelector("#overlayXPosWrapper .valueDisplay").innerHTML = value[0];
            xPos.disabled = true;
            yPos.value = value[1];
            document.querySelector("#overlayYPosWrapper .valueDisplay").innerHTML = value[1];
            yPos.disabled = true;

            chrome.storage.sync.get("userSettings", result => {
                chrome.storage.sync.set({ userSettings: { ...result.userSettings, useOverlayMouse: false, overlayXPos: value[0], overlayYPos: value[1] } });
            });
        }
    })

    document.getElementById("overlayXPos").addEventListener("change", function(){
        let xPos = document.getElementById("overlayXPos").value;

        document.querySelector("#overlayXPosWrapper .valueDisplay").innerHTML = xPos;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, overlayXPos: xPos } });
        });
    });

    document.getElementById("overlayXPos").addEventListener("wheel", function (event) {
        let input = document.getElementById("overlayXPos");

        if (input.disabled) {
            return;
        }

        event.preventDefault();

        input.value = parseInt(input.value) + (event.deltaY / 100 * -1) * input.step; //Gets the direction of the scroll, then divides by 100 to get just the value 1 or -1.

        document.querySelector("#overlayXPosWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, overlayXPos: parseInt(input.value) } });
        });
    });

    document.getElementById("overlayYPos").addEventListener("change", function(){
        let yPos = document.getElementById("overlayYPos").value;

        document.querySelector("#overlayYPosWrapper .valueDisplay").innerHTML = yPos;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, overlayYPos: yPos } });
        });
    });

    document.getElementById("overlayYPos").addEventListener("wheel", function (event) {
        let input = document.getElementById("overlayYPos");

        if (input.disabled) {
            return;
        }

        event.preventDefault();

        input.value = parseInt(input.value) + (event.deltaY / 100 * -1) * input.step; //Gets the direction of the scroll, then divides by 100 to get just the value 1 or -1.

        document.querySelector("#overlayYPosWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, overlayYPos: parseInt(input.value) } });
        });
    });

    document.getElementById("useDefaultVolume").addEventListener("change", function () {
        let input = document.getElementById("useDefaultVolume");
        document.getElementById("defaultVolumeSlider").disabled = !input.checked;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, useDefaultVolume: input.checked } });
        });
    });

    document.getElementById("defaultVolumeSlider").addEventListener("input", function () {
        let input = document.getElementById("defaultVolumeSlider");

        document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, volume: input.value } });
        });
    });

    document.getElementById("defaultVolumeSlider").addEventListener("wheel", function (event) {
        event.preventDefault();

        let input = document.getElementById("defaultVolumeSlider");

        input.value = parseInt(input.value) + (event.deltaY / 100 * -1) * input.step; //Gets the direction of the scroll, then divides by 100 to get just the value 1 or -1.

        document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, volume: input.value } });
        });
    });

    document.getElementById("useModifierKey").addEventListener("change", function () {
        let input = document.getElementById("useModifierKey");

        document.getElementById("invertModifierKey").disabled = !input.checked;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, useModifierKey: input.checked } });
        });
    });

    let getMouseKey = function (key) {
        switch (key) {
            case 0:
                return "Left Mouse";
            case 1:
                return "Middle Mouse";
            case 2:
                return "Right Mouse";
            case 3:
                return "Mouse 3";
            case 4:
                return "Mouse 4";
        }
    }

    let modifierKeyOnClick = function () {
        document.getElementById("modifierKey").removeEventListener("click", modifierKeyOnClick);

        if (document.getElementById("useModifierKey").checked) {
            let element = document.getElementById("modifierKey");
            let body = document.documentElement || document.body;

            element.innerHTML = "-----";

            let keyDown = function (event) {
                event.preventDefault();

                let key = event.key;
                element.innerHTML = (key == " ") ? "Space" : key;

                chrome.storage.sync.get("userSettings", result => {
                    chrome.storage.sync.set({ userSettings: { ...result.userSettings, modifierKey: key } });
                });

                document.getElementById("modifierKey").addEventListener("click", modifierKeyOnClick);
                body.removeEventListener("keydown", keyDown);
                body.removeEventListener("mousedown", click);
                body.removeEventListener("contextmenu", stopContextMenu);
            }

            let click = function (event) {
                event.preventDefault();
                let key = getMouseKey(event.button);
                element.innerHTML = key;

                chrome.storage.sync.get("userSettings", result => {
                    chrome.storage.sync.set({ userSettings: { ...result.userSettings, modifierKey: key } });
                });


                body.removeEventListener("keydown", keyDown);
                body.removeEventListener("mousedown", click);
                setTimeout(function () {
                    body.removeEventListener("contextmenu", stopContextMenu);
                }, 100);

                setTimeout(function () {
                    document.getElementById("modifierKey").addEventListener("click", modifierKeyOnClick);
                }, 100);
            }

            let stopContextMenu = function (event) {
                event.preventDefault();
                return false;
            }

            body.addEventListener("keydown", keyDown);
            body.addEventListener("mousedown", click);
            body.addEventListener("contextmenu", stopContextMenu);
        }
    }

    document.getElementById("modifierKey").addEventListener("click", modifierKeyOnClick);

    document.getElementById("invertModifierKey").addEventListener("input", function () {
        let input = document.getElementById("invertModifierKey");

        document.getElementById("invertModifierKeyState").innerHTML = (input.checked) ? "Inverted" : "Normal";

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, invertModifierKey: input.checked } });
        });
    });

    document.getElementById("useToggleMuteKey").addEventListener("change", function () {
        let input = document.getElementById("useToggleMuteKey");

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({ userSettings: { ...result.userSettings, useToggleMuteKey: input.checked } });
        });
    });

    let toggleMuteKeyOnClick = function () {
        document.getElementById("toggleMuteKey").removeEventListener("click", toggleMuteKeyOnClick);

        if (document.getElementById("useToggleMuteKey").checked) {
            let element = document.getElementById("toggleMuteKey");
            let body = document.documentElement || document.body;

            element.innerHTML = "-----";

            let keyDown = function (event) {
                event.preventDefault();

                let key = event.key;
                element.innerHTML = (key == " ") ? "Space" : key;

                chrome.storage.sync.get("userSettings", result => {
                    chrome.storage.sync.set({ userSettings: { ...result.userSettings, toggleMuteKey: key } });
                });

                document.getElementById("modifierKey").addEventListener("click", modifierKeyOnClick);
                body.removeEventListener("keydown", keyDown);
                body.removeEventListener("mousedown", click);
                body.removeEventListener("contextmenu", stopContextMenu);
            }

            let click = function (event) {
                event.preventDefault();
                let key = getMouseKey(event.button);
                element.innerHTML = key;

                chrome.storage.sync.get("userSettings", result => {
                    chrome.storage.sync.set({ userSettings: { ...result.userSettings, toggleMuteKey: key } });
                });

                body.removeEventListener("keydown", keyDown);
                body.removeEventListener("mousedown", click);
                setTimeout(function () {
                    body.removeEventListener("contextmenu", stopContextMenu);
                }, 100);

                setTimeout(function () {
                    document.getElementById("toggleMuteKey").addEventListener("click", toggleMuteKeyOnClick);
                }, 100);
            }

            let stopContextMenu = function (event) {
                event.preventDefault();
                return false;
            }

            body.addEventListener("keydown", keyDown);
            body.addEventListener("mousedown", click);
            body.addEventListener("contextmenu", stopContextMenu);
        }
    }

    document.getElementById("toggleMuteKey").addEventListener("click", toggleMuteKeyOnClick);

    document.getElementById("blacklist").addEventListener("change", function () {
        let input = document.getElementById("blacklist");

        document.getElementById("blacklistState").innerHTML = (input.checked) ? "Enabled on this page" : "Disabled on this page";

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let url = new URL(tabs[0].url).hostname;
            if (input.checked) { //Checkbox is checked, meaning the page should not be blacklisted
                blacklist.splice(blacklist.indexOf(url), 1);

                chrome.storage.sync.get("userSettings", result => {
                    chrome.storage.sync.set({ userSettings: { ...result.userSettings, blacklist: blacklist } });
                });
            } else { //Checkbox is not checked, meaning the page should be blacklisted
                blacklist.push(url);

                chrome.storage.sync.get("userSettings", result => {
                    chrome.storage.sync.set({ userSettings: { ...result.userSettings, blacklist: blacklist } });
                });
            }
        });
    });

    //Insert stored settings
    document.getElementById("useMousewheelVolume").checked = useMousewheelVolume;
    document.getElementById("incrementSlider").disabled = !useMousewheelVolume;
    document.getElementById("overlayFontSizeSlider").disabled = !useMousewheelVolume;
    document.getElementById("overlayColorInput").disabled = !useMousewheelVolume;
    document.getElementById("useModifierKey").disabled = !useMousewheelVolume;
    document.getElementById("overlayPositionInput").disabled = !useMousewheelVolume;
    document.getElementById("preciseScroll").disabled = !useMousewheelVolume;
    document.getElementById("invertModifierKey").disabled = !useMousewheelVolume || !document.getElementById("useModifierKey").checked;

    document.getElementById("incrementSlider").value = volumeIncrement;
    document.querySelector("#mousewheelVolumeWrapper .valueDisplay").innerHTML = volumeIncrement;
    document.getElementById("defaultVolumeSlider").step = volumeIncrement;

    document.getElementById("preciseScroll").checked = usePreciseScroll;
    document.getElementById("preciseScrollState").innerHTML = (usePreciseScroll) ? "Precise scroll is enabled" : "Precise scroll is disabled";

    document.getElementById("fullscreenScroll").checked = fullscreenOnly;

    document.getElementById("overlayFontSizeSlider").value = fontSize;
    document.querySelector("#overlayWrapper .valueDisplay").innerHTML = fontSize;

    document.getElementById("overlayColorInput").value = fontColor;

    document.getElementById("overlayXPos").disabled = true;
    document.getElementById("overlayYPos").disabled = true;

    if(useOverlayMouse){
        document.getElementById("overlayPositionInput").value = "mouse";
        document.getElementById("overlayXPosWrapper").style.display = "none";
        document.getElementById("overlayYPosWrapper").style.display = "none";
    }
    else if(overlayXPos === 5 && overlayYPos === 5){
        document.getElementById("overlayPositionInput").value = "[5,5]";
    }
    else if(overlayXPos === 95 && overlayYPos === 5){
        document.getElementById("overlayPositionInput").value = "[95,5]";
    }
    else if(overlayXPos === 5 && overlayYPos === 95){
        document.getElementById("overlayPositionInput").value = "[5,95]";
    }
    else if(overlayXPos === 95 && overlayYPos === 95){
        document.getElementById("overlayPositionInput").value = "[95,95]";
    }
    else {
        document.getElementById("overlayPositionInput").value = "custom";
        document.getElementById("overlayXPos").disabled = false;
        document.getElementById("overlayYPos").disabled = false;
    }

    document.getElementById("overlayXPos").value = overlayXPos;
    document.querySelector("#overlayXPosWrapper .valueDisplay").innerHTML = overlayXPos;
    document.getElementById("overlayYPos").value = overlayYPos;
    document.querySelector("#overlayYPosWrapper .valueDisplay").innerHTML = overlayYPos;

    document.getElementById("useDefaultVolume").checked = useDefaultVolume;
    document.getElementById("defaultVolumeSlider").disabled = !useDefaultVolume;

    document.getElementById("defaultVolumeSlider").value = volume;
    document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = volume;

    document.getElementById("useModifierKey").checked = useModifierKey;
    document.getElementById("invertModifierKey").disabled = !useModifierKey;

    document.getElementById("modifierKey").innerHTML = modifierKey;

    document.getElementById("useToggleMuteKey").checked = useToggleMuteKey;
    document.getElementById("toggleMuteKey").innerHTML = toggleMuteKey;

    document.getElementById("invertModifierKey").checked = invertModifierKey;
    document.getElementById("invertModifierKeyState").innerHTML = (invertModifierKey) ? "Inverted" : "Normal";

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let url = new URL(tabs[0].url).hostname;
        document.getElementById("blacklist").checked = !blacklist.includes(url);
        document.getElementById("blacklistState").innerHTML = (!blacklist.includes(url)) ? "Enabled on this page" : "Disabled on this page";
    });
});

let folders = document.getElementsByTagName("folder");
for (let folder of folders) {
    folder.getElementsByTagName("content")[0].style.display = "none";
    folder.getElementsByTagName("title")[0].addEventListener("mousedown", function () {
        let allFolders = document.getElementsByTagName("folder");
        for (let otherFolder of allFolders) {
            if (!otherFolder.isSameNode(folder)) {
                otherFolder.getElementsByTagName("content")[0].style.display = "none";
            }
        }

        let element = folder.getElementsByTagName("content")[0];
        if (element.style.display === "none") {
            element.style.display = "block";
        }
        else {
            element.style.display = "none";
        }

        document.documentElement.style.height = document.body.style.height;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        (function () {
            var ln = links[i];
            var location = ln.href;
            ln.onclick = function () {
                chrome.tabs.create({ active: true, url: location });
            };
        })();
    }
});