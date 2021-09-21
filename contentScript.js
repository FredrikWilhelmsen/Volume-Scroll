// TODO: figure out how to handle imports from settings.js
//      look into how other extensions do it

let body = document.documentElement || document.body;

function addModifierKeyEventListener(modifierKeyState, useModifierKey, modifierKey) {
    if (useModifierKey) {
        modifierKeyState.pressed = false;

        body.addEventListener("keydown", function (event) {
            if (modifierKey === event.key) {
                modifierKeyState.pressed = true;
            }
        });

        body.addEventListener("keyup", function (event) {
            if (modifierKey === event.key) {
                modifierKeyState.pressed = false;
            }
        });
    }
}

function handleDefaultVolume(video, volume, volumeIncrement) {
    video.volume = volume / 100;
    video.dataset.volume = volume / 100;

    video.addEventListener("volumechange", () => {
        // Checks to see if the registered change in volume is equal to the increment. If it is not then it is denied.
        if (!(video.volume === video.dataset.volume - volumeIncrement || video.volume === video.dataset.volume + volumeIncrement)) {
            video.volume = video.dataset.volume;
        }
    });
}

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
    } = settings;

    if (blacklist.blacklist.includes(window.location.hostname)) {
        return;
    }

    const modifierKeyState = {
        pressed: true
    };

    addModifierKeyEventListener(modifierKeyState, useModifierKey, modifierKey);

    // TODO: Separate logic into functions
    let onScroll = function (event) {
        if (!modifierKeyState.pressed)
            return;

        let elements = document.elementsFromPoint(event.clientX, event.clientY)
        for (const element of elements) {
            if (element.tagName !== "VIDEO")
                continue;

            event.preventDefault();

            let video = element;

            let vol = video.volume + (volumeIncrement / 100) * (event.deltaY / 100 * -1); //deltaY is how much the wheel scrolled, 100 up, -100 down. Divided by 100 to only get direction, then inverted

            //Limiting the volume to between 0-1
            if (vol < 0) {
                vol = 0;
            } else if (vol > 1) {
                vol = 1;
            }

            video.muted = vol <= 0;

            //Rounding the volume to the nearest increment, in case the original volume was not on the increment.
            let volume = vol * 100;
            volume = volume / volumeIncrement;
            volume = Math.round(volume);
            volume = volume * volumeIncrement;
            volume = volume / 100;

            video.volume = volume;
            video.dataset.volume = volume;

            //Update overlay text
            let div = document.getElementById("volumeOverlay");
            div.innerHTML = Math.round(video.volume * 100);

            //position the overlay
            if (useOverlayMouse) {
                div.style.top = window.scrollY + event.clientY - div.offsetHeight + "px";
                div.style.left = window.scrollX + event.clientX - div.offsetWidth + "px";
            } else {
                let vidPos = video.getBoundingClientRect();
                div.style.top = 10 + window.scrollY + vidPos.top + "px";
                div.style.left = 10 + window.scrollX + vidPos.left + "px";
            }

            //Animate fade
            div.parentNode.replaceChild(div, div);
            div.classList.add("scrollOverlayFade");
        }
    }

    window.onload = function () {
        if (useMousewheelVolume) {
            document.addEventListener("wheel", onScroll, {passive: false});

            //Add volume overlay to the page
            let div = document.createElement("div");
            div.id = "volumeOverlay";
            div.classList.add("scrollOverlay");
            div.style.color = fontColor;
            div.style.fontSize = fontSize + "px";

            document.getElementsByTagName("body")[0].appendChild(div);
        }
    }

    let setAudio = function (mutations) {
        if (!useDefaultVolume)
            return;

        // TODO: not tested
        mutations.map(mutation => mutation.addedNodes)
            .filter(node => node.tagName === "VIDEO")
            .forEach(node => handleDefaultVolume(node, volume, volumeIncrement));
    }

    let observer = new MutationObserver(setAudio);
    observer.observe(body, {
        childList: true,
        subtree: true
    });
});
