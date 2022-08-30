const defaultSettings = {
    volume: 20,
    volumeIncrement: 5,
    usePreciseScroll: true,
    fullscreenOnly: false,
    useDefaultVolume: false,
    useMousewheelVolume: true,
    fontColor: "#ffffff", //white
    fontSize: 40,
    useOverlayMouse: true,
    modifierKey: "Right Mouse",
    useModifierKey: false,
    invertModifierKey: false,
    toggleMuteKey: "Middle Mouse",
    useToggleMuteKey: false,
    blacklist: [
        "open.spotify.com"
    ]
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get({ userSettings: defaultSettings }, result => {
        chrome.storage.sync.set({ userSettings: result.userSettings });
    });
});