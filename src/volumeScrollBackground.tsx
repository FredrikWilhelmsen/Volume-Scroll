import { Settings } from './settings';

const defaultSettings : Settings = {
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

    doDebugLog: false,
    blacklist: []
};

browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.get({settings: defaultSettings})
        .then((result) => {
            browser.storage.local.set({settings: result.settings});
        });
});