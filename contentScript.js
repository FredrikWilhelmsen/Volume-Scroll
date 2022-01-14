let body = document.documentElement || document.body || document.getElementsByTagName("body")[0];
let settings = {};
let isModifierKeyPressed = false;
let scrolled = false;

function hasAudio(video) {
    return video.mozHasAudio ||
        Boolean(video.webkitAudioDecodedByteCount) ||
        Boolean(video.audioTracks && video.audioTracks.length);
}

let getVideo = function () {
    let elements = document.elementsFromPoint(event.clientX, event.clientY);
    for (const element of elements) {
        if (element.tagName === "VIDEO") {
            event.preventDefault();
            return { display: element, video: element, slider: null };
        }
        else if (element.tagName === "YTMUSIC-PLAYER" || element.tagName === "YTMUSIC-PLAYER-BAR") {
            event.preventDefault();
            let video = document.getElementsByTagName("VIDEO")[0];
            let display = document.getElementsByTagName("YTMUSIC-PLAYER")[0];
            let slider = document.getElementById("volume-slider");
            return { display: display, video: video, slider: slider };
        }
    }
}

let handleScroll = function (element, video, volumeBar, event) {
    scrolled = true;
    if (!hasAudio(video)) //video has audio. If not stops volume scrolling
        return;

    let volume = 1;

    if (video.volume > settings.volumeIncrement / 100 || (video.volume === settings.volumeIncrement / 100 && event.deltaY < 0) || !settings.usePreciseScroll) {
        volume = video.volume + (settings.volumeIncrement / 100) * (event.deltaY / 100 * -1); //deltaY is how much the wheel scrolled, 100 up, -100 down. Divided by 100 to only get direction, then inverted

        //Rounding the volume to the nearest increment, in case the original volume was not on the increment.
        volume = volume * 100;
        volume = volume / settings.volumeIncrement;
        volume = Math.round(volume);
        volume = volume * settings.volumeIncrement;
        volume = volume / 100;
    } else {
        volume = video.volume + (1 / 100) * (event.deltaY / 100 * -1);
    }

    volume = Math.round(volume * 100) / 100;

    //Limiting the volume to between 0-1
    if (volume < 0) {
        volume = 0;
    } else if (volume > 1) {
        volume = 1;
    }

    video.muted = volume <= 0;

    video.volume = volume;
    video.dataset.volume = volume;

    //Set volume cookie to avoid volume fighting
    document.cookie = "volume=" + volume * 100;
    console.log(document.cookie);

    if (volumeBar != null) {
        volumeBar.setAttribute("step", 1);
        volumeBar.setAttribute("value", volume * 100);
        volumeBar.ariaValueNow = volume * 100;
    }

    //Update overlay text
    let div = document.getElementById("volumeOverlay");
    div.innerHTML = Math.round(video.volume * 100);
    div.style.color = settings.fontColor;
    div.style.fontSize = settings.fontSize + "px";

    //position the overlay
    if (settings.useOverlayMouse) {
        div.style.top = window.scrollY + event.clientY - div.offsetHeight + "px";
        div.style.left = window.scrollX + event.clientX - div.offsetWidth + "px";
    } else {
        let vidPos = element.getBoundingClientRect();
        div.style.top = 10 + window.scrollY + vidPos.top + "px";
        div.style.left = 10 + window.scrollX + vidPos.left + "px";
    }

    //Animate fade
    let newDiv = div;
    div.parentNode.replaceChild(newDiv, div);
    div.classList.add("scrollOverlayFade");
}

let onScroll = function (event) {
    //Switch is to check for multiple cases where the volume scroll should not be performed
    switch (true) {
        case settings.blacklist.includes(window.location.hostname):
        case !settings.useMousewheelVolume:
        case settings.useModifierKey && !settings.invertModifierKey && !isModifierKeyPressed:
        case settings.useModifierKey && settings.invertModifierKey && isModifierKeyPressed:
            return;
        default:
            break;
    }

    let videoElements = getVideo();
    handleScroll(videoElements.display, videoElements.video, videoElements.slider, event);
}

let handleDefaultVolume = function (video) {
    video.volume = settings.volume / 100;
    video.dataset.volume = settings.volume / 100;

    let change = function () {
        if (!(video.volume == video.dataset.volume - settings.volumeIncrement || video.volume == video.dataset.volume + settings.volumeIncrement || video.volume == video.dataset.volume)) { //Checks to see if the registered change in volume is equal to the increment. If it is not then it is denied.
            video.volume = video.dataset.volume;
        }
    };

    video.addEventListener("volumechange", change);
};

let setAudio = function (mutations) {
    if (!settings.useDefaultVolume)
        return;

    if (settings.blacklist.includes(window.location.hostname))
        return;

    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.tagName !== "VIDEO")
                continue;

            let video = node;

            handleDefaultVolume(video);
        }
    }
}

chrome.storage.sync.get("userSettings", result => {
    settings = result.userSettings;

    chrome.storage.onChanged.addListener((changes) => {
        settings = changes.userSettings.newValue;
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

    body.addEventListener("keydown", function (event) {
        if (settings.modifierKey === event.key) {
            event.stopPropagation();
            isModifierKeyPressed = true;
        }
    });

    body.addEventListener("mousedown", function (event) {
        if (settings.modifierKey === getMouseKey(event.button)) {
            event.stopPropagation();
            isModifierKeyPressed = true;
        }
    });

    body.addEventListener("keyup", function (event) {
        if (settings.modifierKey === event.key) {
            isModifierKeyPressed = false;
        }
    });

    body.addEventListener("mouseup", function (event) {
        if (settings.modifierKey === getMouseKey(event.button)) {
            event.stopPropagation();
            isModifierKeyPressed = false;

            if (scrolled) {
                event.preventDefault();
                scrolled = false;

                if (event.button === 0 && !settings.invertModifierKey) {
                    let video = getVideo().video;
                    video.paused ? video.play() : video.pause();
                }

                let stopContextMenu = function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                }

                if (event.button === 2) {
                    body.addEventListener("contextmenu", stopContextMenu, true);
                    setTimeout(function () {
                        body.removeEventListener("contextmenu", stopContextMenu, true);
                    }, 1000);
                }
            }
        }
    });

    document.addEventListener("wheel", onScroll, { passive: false });

    //Add volume overlay to the page
    let div = document.createElement("div");
    div.id = "volumeOverlay";
    div.classList.add("scrollOverlay");
    div.style.color = settings.fontColor;
    div.style.fontSize = settings.fontSize + "px";

    body.appendChild(div);

    const config = {
        childList: true,
        subtree: true
    };

    let observer = new MutationObserver(setAudio);
    observer.observe(body, config);
});
