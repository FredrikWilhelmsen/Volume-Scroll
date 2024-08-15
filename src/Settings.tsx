export interface Settings {
    useDefaultVolume: boolean,
    defaultVolume: number,

    volumeIncrement: number,
    usePreciseScroll: boolean,
    useMouseWheelVolume: boolean,
    useUncappedVolume: boolean,
    modifierKey: string,
    useModifierKey: boolean,
    invertModifierKey: boolean,
    toggleMuteKey: string,
    useToggleMuteKey: boolean,

    fontColor: string,
    fontSize: number,
    useOverlayMouse: boolean,
    overlayXPos: number,
    overlayYPos: number,

    doDebugLog: boolean,
    blacklist: string[]
};

export const defaultSettings : Settings = {
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