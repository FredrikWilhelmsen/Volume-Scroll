const defaultSettings = {
    useDefaultVolume: false,
    defaultVolume: 20,

    volumeIncrement: 5,
    usePreciseScroll: true,
    useMouseWheelVolume: true,
    useUncappedVolume: false,
    modifierKey: "Right Mouse",
    useModifierKey: false,
    invertModifierKey: false,
    toggleMuteKey: "Middle Mouse",
    useToggleMuteKey: false,

    fontColor: "#FFFF00", //Yellow
    fontSize: 40,
    useOverlayMouse: true,
    overlayXPos: 5,
    overlayYPos: 5,

    blacklist: []
};

browser.runtime.onInstalled.addListener(() => {
    browser.storage.sync.get({settings: defaultSettings})
        .then((result) => {
            browser.storage.sync.set({settings: result.settings});
        });
});