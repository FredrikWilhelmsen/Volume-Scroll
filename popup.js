chrome.storage.sync.get("userSettings", data => {
    const {
        volume,
        volumeIncrement,
        usePreciseScroll,
        useDefaultVolume,
        useMousewheelVolume,
        fontColor,
        fontSize,
        modifierKey,
        useOverlayMouse,
        useModifierKey,
        invertModifierKey,
        blacklist
    } = data.userSettings;

    //Add event listeners
    document.getElementById("useMousewheelVolume").addEventListener("change", function () {
        let input = document.getElementById("useMousewheelVolume");

        document.getElementById("incrementSlider").disabled = !input.checked;
        document.getElementById("overlayFontSizeSlider").disabled = !input.checked;
        document.getElementById("overlayColorInput").disabled = !input.checked;
        document.getElementById("useModifierKey").disabled = !input.checked;
        document.getElementById("overlayPosition").disabled = !input.checked;
        document.getElementById("preciseScroll").disabled = !input.checked;
        document.getElementById("invertModifierKey").disabled = !input.checked || !document.getElementById("useModifierKey").checked;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, useMousewheelVolume: input.checked}});
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
            chrome.storage.sync.set({userSettings: {...result.userSettings, volumeIncrement: input.value, volume: volume}});
        });
        document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = volume;
    });

    document.getElementById("incrementSlider").addEventListener("wheel", function (event) {
        event.preventDefault();

        let input = document.getElementById("incrementSlider");

        input.value = parseInt(input.value) + event.deltaY / 100 * -1; //Gets the direction of the scroll, then divides by 100 to get just the value 1 or -1.

        document.querySelector("#mousewheelVolumeWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, volumeIncrement: input.value}});
        });

        let defaultVolumeInput = document.getElementById("defaultVolumeSlider");
        defaultVolumeInput.step = input.value;

        let volume = defaultVolumeInput.value;
        volume = volume / input.value;
        volume = Math.round(volume);
        volume = volume * input.value;
        defaultVolumeInput.value = volume;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, volumeIncrement: input.value, volume: volume}});
        });
        document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = volume;
    });

    document.getElementById("preciseScroll").addEventListener("input", function(){
        let input = document.getElementById("preciseScroll");

        document.getElementById("preciseScrollState").innerHTML = (input.checked) ? "Precise scroll is enabled" : "Precise scroll is disabled";

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, usePreciseScroll: input.checked}});
        });
    });

    document.getElementById("overlayFontSizeSlider").addEventListener("input", function () {
        let input = document.getElementById("overlayFontSizeSlider");

        document.querySelector("#overlayWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, fontSize: input.value}});
        });
    });

    document.getElementById("overlayFontSizeSlider").addEventListener("wheel", function (event) {
        event.preventDefault();

        let input = document.getElementById("overlayFontSizeSlider");

        input.value = parseInt(input.value) + (event.deltaY / 100 * -1) * input.step; //Gets the direction of the scroll, then divides by 100 to get just the value 1 or -1.

        document.querySelector("#overlayWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, fontSize: input.value}});
        });
    });

    document.getElementById("overlayColorInput").addEventListener("change", function () {
        let input = document.getElementById("overlayColorInput");

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, fontColor: input.value}});
        });
    });

    document.getElementById("useDefaultVolume").addEventListener("change", function () {
        let input = document.getElementById("useDefaultVolume");
        document.getElementById("defaultVolumeSlider").disabled = !input.checked;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, useDefaultVolume: input.checked}});
        });
    });

    document.getElementById("defaultVolumeSlider").addEventListener("input", function () {
        let input = document.getElementById("defaultVolumeSlider");

        document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, volume: input.value}});
        });
    });

    document.getElementById("defaultVolumeSlider").addEventListener("wheel", function (event) {
        event.preventDefault();

        let input = document.getElementById("defaultVolumeSlider");

        input.value = parseInt(input.value) + (event.deltaY / 100 * -1) * input.step; //Gets the direction of the scroll, then divides by 100 to get just the value 1 or -1.

        document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = input.value;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, volume: input.value}});
        });
    });

    document.getElementById("overlayPosition").addEventListener("change", function () {
        let input = document.getElementById("overlayPosition")

        document.getElementById("overlayPositionState").innerHTML = (input.checked) ? "Relative to mouse" : "Relative to video";

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, useOverlayMouse: input.checked}});
        });
    });

    document.getElementById("useModifierKey").addEventListener("change", function () {
        let input = document.getElementById("useModifierKey");

        document.getElementById("invertModifierKey").disabled = !input.checked;

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, useModifierKey: input.checked}});
        });
    });

    document.getElementById("modifierKey").addEventListener("click", function () {
        if (document.getElementById("useModifierKey").checked) {
            let element = document.getElementById("modifierKey");
            let body = document.documentElement || document.body;

            element.innerHTML = "----";

            let keyDown = function (event) {
                event.preventDefault();

                let key = event.key;
                element.innerHTML = (key == " ") ? "Space" : key;

                chrome.storage.sync.get("userSettings", result => {
                    chrome.storage.sync.set({userSettings: {...result.userSettings, modifierKey: key}});
                });

                body.removeEventListener("keydown", keyDown);
            }

            body.addEventListener("keydown", keyDown);
        }
    });

    document.getElementById("invertModifierKey").addEventListener("input", function(){
        let input = document.getElementById("invertModifierKey");

        document.getElementById("invertModifierKeyState").innerHTML = (input.checked) ? "Inverted" : "Normal";

        chrome.storage.sync.get("userSettings", result => {
            chrome.storage.sync.set({userSettings: {...result.userSettings, invertModifierKey: input.checked}});
        });
    });

    document.getElementById("blacklist").addEventListener("change", function () {
        let input = document.getElementById("blacklist");

        document.getElementById("blacklistState").innerHTML = (input.checked) ? "Enabled on this page" : "Disabled on this page";

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            let url = new URL(tabs[0].url).hostname;
            if (input.checked) { //Checkbox is checked, meaning the page should not be blacklisted
                blacklist.splice(blacklist.indexOf(url), 1);

                chrome.storage.sync.get("userSettings", result => {
                    chrome.storage.sync.set({userSettings: {...result.userSettings, blacklist: blacklist}});
                });
            } else { //Checkbox is not checked, meaning the page should be blacklisted
                blacklist.push(url);

                chrome.storage.sync.get("userSettings", result => {
                    chrome.storage.sync.set({userSettings: {...result.userSettings, blacklist: blacklist}});
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
    document.getElementById("overlayPosition").disabled = !useMousewheelVolume;
    document.getElementById("preciseScroll").disabled = !useMousewheelVolume;
    document.getElementById("invertModifierKey").disabled = !useMousewheelVolume || !document.getElementById("useModifierKey").checked;

    document.getElementById("incrementSlider").value = volumeIncrement;
    document.querySelector("#mousewheelVolumeWrapper .valueDisplay").innerHTML = volumeIncrement;
    document.getElementById("defaultVolumeSlider").step = volumeIncrement;

    document.getElementById("preciseScroll").checked = usePreciseScroll;
    document.getElementById("preciseScrollState").innerHTML = (usePreciseScroll) ? "Precise scroll is enabled" : "Precise scroll is disabled";

    document.getElementById("overlayFontSizeSlider").value = fontSize;
    document.querySelector("#overlayWrapper .valueDisplay").innerHTML = fontSize;

    document.getElementById("overlayColorInput").value = fontColor;

    document.getElementById("useDefaultVolume").checked = useDefaultVolume;
    document.getElementById("defaultVolumeSlider").disabled = !useDefaultVolume;

    document.getElementById("defaultVolumeSlider").value = volume;
    document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = volume;

    document.getElementById("overlayPosition").checked = useOverlayMouse;
    document.getElementById("overlayPositionState").innerHTML = (useOverlayMouse) ? "Relative to mouse" : "Relative to video";

    document.getElementById("useModifierKey").checked = useModifierKey;
    document.getElementById("invertModifierKey").disabled = !useModifierKey;

    document.getElementById("modifierKey").innerHTML = modifierKey;

    document.getElementById("invertModifierKey").checked = invertModifierKey;
    document.getElementById("invertModifierKeyState").innerHTML = (invertModifierKey) ? "Inverted" : "Normal";

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        let url = new URL(tabs[0].url).hostname;
        document.getElementById("blacklist").checked = !blacklist.includes(url);
        document.getElementById("blacklistState").innerHTML = (!blacklist.includes(url)) ? "Enabled on this page" : "Disabled on this page";
    });
});
