const defaultSettings = {
    volume: 20,
    volumeIncrement: 5,
    useDefaultVolume: false,
    useMousewheelVolume: true,
    fontColor: "#ffffff", //white
    fontSize: 40,
    useOverlayMouse: true,
    modifierKey: "Shift",
    useModifierKey: false,
    blacklist: [
    "music.youtube.com",
    "open.spotify.com"
    ]
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get({userSettings: defaultSettings}, result => {
        chrome.storage.sync.set({userSettings: result.userSettings});
    });
});
