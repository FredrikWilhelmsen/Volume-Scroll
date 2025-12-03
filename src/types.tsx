export interface Settings {
    useDefaultVolume: boolean,
    defaultVolume: number,

    volumeIncrement: number,
    usePreciseScroll: boolean,
    fullscreenOnly: boolean,
    useMouseWheelVolume: boolean,
    useUncappedVolume: boolean,
    modifierKey: string,
    useModifierKey: boolean,
    invertModifierKey: boolean,
    toggleMuteKey: string,
    useToggleMuteKey: boolean,

    fontColor: string,
    fontSize: number,
    overlayPosition: string,
    overlayXPos: number,
    overlayYPos: number,

    doDebugLog: boolean,
    blacklist: string[]
};

export const defaultSettings: Settings = {
    useDefaultVolume: false,
    defaultVolume: 20,

    volumeIncrement: 5,
    usePreciseScroll: true,
    fullscreenOnly: false,
    useMouseWheelVolume: true,
    useUncappedVolume: false,
    modifierKey: "Right Mouse",
    useModifierKey: false,
    invertModifierKey: false,
    toggleMuteKey: "Middle Mouse",
    useToggleMuteKey: false,

    fontColor: "#FCB900",
    fontSize: 40,
    overlayPosition: "tl",
    overlayXPos: 5,
    overlayYPos: 5,

    doDebugLog: false,
    blacklist: []
};

export type Pages = "menu" | "scroll" | "hotkeys" | "overlay" | "volume";

export interface videoElements {
    display: HTMLBaseElement;
    video: HTMLVideoElement;
}