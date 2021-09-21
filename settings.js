const defaultSettings = {
    volume: 20,
    volumeIncrement: 5,
    useDefaultVolume: false,
    useMousewheelVolume: true,
    fontColor: "#ffffff", //white
    fontSize: 40,
    modifierKey: "Shift",
    useOverlayMouse: true,
    useModifierKey: false,
    blacklist: [
        "music.youtube.com",
        "open.spotify.com"
    ]
}

function setUserSettings(settings) {
    chrome.storage.sync.set({userSettings: settings})
        .then(result => {
            if (chrome.runtime.lastError) {
                console.error('Could not set user data: ' + chrome.runtime.lastError.message)
            }
        });
}

function getUserSettings() {
    // TODO: bit unsure if this actually works
    return chrome.storage.sync.get('userSettings').then(result => {
        return result ? result : defaultSettings;
    });
}