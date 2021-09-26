let body = document.documentElement || document.body || document.getElementsByTagName("body")[0];
let settings = {};
let isModifierKeyPressed = true;

let onScroll = function (event) {
    if (isModifierKeyPressed) {
        let elements = document.elementsFromPoint(event.clientX, event.clientY)
        for (element of elements) {
            if (element.tagName == "VIDEO") {
                event.preventDefault();

                let video = element;
                let volume = 1;

                if (video.volume > settings.volumeIncrement / 100 || (video.volume == settings.volumeIncrement / 100 && event.deltaY < 0) || !settings.usePreciseScroll) {
                    volume = video.volume + (settings.volumeIncrement / 100) * (event.deltaY / 100 * -1); //deltaY is how much the wheel scrolled, 100 up, -100 down. Divided by 100 to only get direction, then inverted

                    //Rounding the volume to the nearest increment, in case the original volume was not on the increment.
                    volume = volume * 100;
                    volume = volume / settings.volumeIncrement;
                    volume = Math.round(volume);
                    volume = volume * settings.volumeIncrement;
                    volume = volume / 100;
                }
                else {
                    volume = video.volume + (1 / 100) * (event.deltaY / 100 * -1);
                }

                //Limiting the volume to between 0-1
                if (volume < 0) {
                    volume = 0;
                } else if (volume > 1) {
                    volume = 1;
                }

                if (volume > 0) {
                    video.muted = false;
                } else {
                    video.muted = true;
                }

                video.volume = volume;
                video.dataset.volume = volume;

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
                    let vidPos = video.getBoundingClientRect();
                    div.style.top = 10 + window.scrollY + vidPos.top + "px";
                    div.style.left = 10 + window.scrollX + vidPos.left + "px";
                }

                //Animate fade
                let newDiv = div;
                div.parentNode.replaceChild(newDiv, div);
                div.classList.add("scrollOverlayFade");
            }
        }
    }
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
    for (mutation of mutations) {
        for (node of mutation.addedNodes) {
            if (node.tagName != "VIDEO")
                continue;

            let video = node;

            if (settings.useDefaultVolume) {
                handleDefaultVolume(video);
            }
        }
    }
}

chrome.storage.sync.get("userSettings", result => {
    settings = result.userSettings;

    chrome.storage.onChanged.addListener((changes) => {
        settings = changes.userSettings.newValue;
    })

    if (settings.blacklist.includes(window.location.hostname)) {
        return;
    }

    if (settings.useModifierKey) {
        isModifierKeyPressed = false;

        body.addEventListener("keydown", function (event) {
            if (settings.modifierKey == event.key) {
                isModifierKeyPressed = true;
            }
        });

        body.addEventListener("keyup", function (event) {
            if (settings.modifierKey == event.key) {
                isModifierKeyPressed = false;
            }
        });
    }

    if (settings.useMousewheelVolume) {
        document.addEventListener("wheel", onScroll, {passive: false});

        //Add volume overlay to the page
        let div = document.createElement("div");
        div.id = "volumeOverlay";
        div.classList.add("scrollOverlay");
        div.style.color = settings.fontColor;
        div.style.fontSize = settings.fontSize + "px";

        body.appendChild(div);
    }

    const config = {
        childList: true,
        subtree: true
    };

    let observer = new MutationObserver(setAudio);
    observer.observe(body, config);
});