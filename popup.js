import {getUserSettings} from "./settings.js";
import {setUserSettings} from "./settings.js";

getUserSettings().then(settings => {
    const {
        volume,
        volumeIncrement,
        useDefaultVolume,
        useMousewheelVolume,
        fontColor,
        fontSize,
        modifierKey,
        useOverlayMouse,
        useModifierKey,
        blacklist
    } = settings.userSettings;

    //set event listeners
    document.getElementById("useMousewheelVolume").addEventListener("change", function () {
        let input = document.getElementById("useMousewheelVolume");

        document.getElementById("incrementSlider").disabled = !input.checked;
        document.getElementById("overlayFontSizeSlider").disabled = !input.checked;
        document.getElementById("overlayColorInput").disabled = !input.checked;
        document.getElementById("useModifierKey").disabled = !input.checked;
        document.getElementById("overlayPosition").disabled = !input.checked;

        setUserSettings({...settings, useMousewheelVolume: input.checked});
    });

    function changeSliderIncrement(inputValue) {
        document.querySelector("#mousewheelVolumeWrapper .valueDisplay").innerHTML = inputValue;

        setUserSettings({...settings, increment: inputValue});

        let defaultVolumeInput = document.getElementById("defaultVolumeSlider");
        defaultVolumeInput.step = inputValue;

        let volume = defaultVolumeInput.value;
        volume = volume / inputValue;
        volume = Math.round(volume);
        volume = volume * inputValue;
        defaultVolumeInput.value = volume;

        setUserSettings({...settings, volume: volume});
        document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = volume;
    }

    document.getElementById("incrementSlider").addEventListener("input", function () {
        let input = document.getElementById("incrementSlider");
        changeSliderIncrement(input.value);
    });

    document.getElementById("incrementSlider").addEventListener("wheel", function (event) {
        event.preventDefault();

        let input = document.getElementById("incrementSlider");

        // Gets the direction of the scroll, then divides by 100 to get just the value 1 or -1.
        input.value = parseInt(input.value) + event.deltaY / 100 * -1;

        changeSliderIncrement(input.value);
    });

    document.getElementById("overlayFontSizeSlider").addEventListener("input", function () {
        let input = document.getElementById("overlayFontSizeSlider");

        document.querySelector("#overlayFontSizeWrapper .valueDisplay").innerHTML = input.value;

        setUserSettings({...settings, fontSize: input.value});
    });

    document.getElementById("overlayFontSizeSlider").addEventListener("wheel", function (event) {
        event.preventDefault();

        let input = document.getElementById("overlayFontSizeSlider");

        input.value = parseInt(input.value) + (event.deltaY / 100 * -1) * input.step; //Gets the direction of the scroll, then divides by 100 to get just the value 1 or -1.

        document.querySelector("#overlayFontSizeWrapper .valueDisplay").innerHTML = input.value;

        setUserSettings({...settings, fontSize: input.value});
    });

    document.getElementById("overlayColorInput").addEventListener("change", function () {
        let input = document.getElementById("overlayColorInput");
        setUserSettings({...settings, fontColor: input.value});
    });

    document.getElementById("useDefaultVolume").addEventListener("change", function () {
        let input = document.getElementById("useDefaultVolume");
        document.getElementById("defaultVolumeSlider").disabled = !input.checked;

        setUserSettings({...settings, useDefaultVolume: input.checked});
    });

    document.getElementById("defaultVolumeSlider").addEventListener("input", function () {
        let input = document.getElementById("defaultVolumeSlider");

        document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = input.value;

        setUserSettings({...settings, volume: input.value});
    });

    document.getElementById("defaultVolumeSlider").addEventListener("wheel", function (event) {
        event.preventDefault();

        let input = document.getElementById("defaultVolumeSlider");

        input.value = parseInt(input.value) + (event.deltaY / 100 * -1) * input.step; //Gets the direction of the scroll, then divides by 100 to get just the value 1 or -1.

        document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = input.value;

        setUserSettings({...settings, volume: input.value});
    });

    document.getElementById("overlayPosition").addEventListener("change", function () {
        let input = document.getElementById("overlayPosition")

        document.getElementById("overlayPositiontState").innerHTML = (input.checked) ? "Relative to mouse" : "Relative to video";

        setUserSettings({...settings, useOverlayMouse: input.checked});
    });

    document.getElementById("useModifierKey").addEventListener("change", function () {
        let input = document.getElementById("useModifierKey");

        setUserSettings({...settings, useModifierKey: input.checked});
    });

    document.getElementById("modifierKey").addEventListener("click", function () {
        if (document.getElementById("useModifierKey").checked) {
            let element = document.getElementById("modifierKey");
            let body = document.documentElement || document.body;

            element.innerHTML = "----";

            let keyDown = function (event) {
                event.preventDefault();

                let key = event.key;
                element.innerHTML = (key === " ") ? "Space" : key;

                setUserSettings({...settings, modifierKey: key});

                body.removeEventListener("keydown", keyDown);
            }

            body.addEventListener("keydown", keyDown);
        }
    });

    document.getElementById("blacklist").addEventListener("change", function () {
        let input = document.getElementById("blacklist");

        document.getElementById("blacklistState").innerHTML = (input.checked) ? "Enabled on this page" : "Disabled on this page";


        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            let url = new URL(tabs[0].url).hostname;
            console.log(url);
            if (input.checked) { //Checkbox is checked, meaning the page should not be blacklisted
                let blacklist = blacklist;

                blacklist.splice(blacklist.indexOf(url), 1);

                setUserSettings({...settings, blacklist: blacklist});
            } else { //Checkbox is not checked, meaning the page should be blacklisted
                let blacklist = data.blacklist;

                blacklist.push(url);

                setUserSettings({...settings, blacklist: blacklist});
            }
        });
    });

    //Insert settings
    document.getElementById("useMousewheelVolume").checked = useMousewheelVolume;
    document.getElementById("incrementSlider").disabled = !useMousewheelVolume;
    document.getElementById("overlayFontSizeSlider").disabled = !useMousewheelVolume;
    document.getElementById("overlayColorInput").disabled = !useMousewheelVolume;
    document.getElementById("useModifierKey").disabled = !useMousewheelVolume;
    document.getElementById("overlayPosition").disabled = !useMousewheelVolume;

    document.getElementById("incrementSlider").value = volumeIncrement;
    document.querySelector("#mousewheelVolumeWrapper .valueDisplay").innerHTML = volumeIncrement;
    document.getElementById("defaultVolumeSlider").step = volumeIncrement;

    document.getElementById("overlayFontSizeSlider").value = fontSize;
    document.querySelector("#overlayFontSizeWrapper .valueDisplay").innerHTML = fontSize;

    document.getElementById("overlayColorInput").value = fontColor;

    document.getElementById("useDefaultVolume").checked = useDefaultVolume;
    document.getElementById("defaultVolumeSlider").disabled = !useDefaultVolume;

    document.getElementById("defaultVolumeSlider").value = volume;
    document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = volume;

    document.getElementById("overlayPosition").checked = useOverlayMouse;
    document.getElementById("overlayPositionState").innerHTML = useOverlayMouse ? "Relative to mouse" : "Relative to video";

    document.getElementById("useModifierKey").checked = useModifierKey;

    document.getElementById("modifierKey").innerHTML = modifierKey;

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        let url = new URL(tabs[0].url).hostname;
        document.getElementById("blacklist").checked = !blacklist.includes(url);
        document.getElementById("blacklistState").innerHTML = (!blacklist.includes(url)) ? "Enabled on this page" : "Disabled on this page";
    });
});
