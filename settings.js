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

export function setUserSettings(settings) {
    chrome.storage.sync.set({userSettings: settings}, result => {
        if (chrome.runtime.lastError) {
            console.error("Could not set user data: " + chrome.runtime.lastError.message)
        }
    });
}

export function getUserSettings() {
    // TODO: bit unsure if this actually works
    return new Promise((resolve) => {
      chrome.storage.sync.get({userSettings: defaultSettings}, result => {
          setUserSettings(result.userSettings);
          resolve(result ? result : defaultSettings);
      });
    });
}