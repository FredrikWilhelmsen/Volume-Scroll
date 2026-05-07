export interface Settings {
    useDefaultVolume: boolean,
    defaultVolume: number,
    startMuted: boolean,

    useMouseWheelVolume: boolean,
    volumeIncrement: number,
    useAlternateVolumeIncrement: boolean,
    alternateVolumeIncrement: number,
    alternateVolumeIncrementHotkey: string,

    usePreciseScroll: boolean,
    useCustomPreciseScrollThreshold: boolean,
    customPreciseScrollThreshold: number,

    doBoostVolume: boolean,
    volumeBoostAmount: number,

    modifierKey: string,
    useModifierKey: boolean,
    invertModifierKey: boolean,

    toggleMuteKey: string,
    useToggleMuteKey: boolean,

    fullscreenOnly: boolean,

    fontColor: string,
    fontSize: number,
    useOverlay: boolean,
    overlayPosition: string,
    overlayXPos: number,
    overlayYPos: number,
    overlayDuration: number,

    domainList: Record<string, boolean>,
    enableDefault: boolean,

    doDebugLog: boolean
};

export const defaultSettings: Settings = {
    useDefaultVolume: false,
    defaultVolume: 20,
    startMuted: false,

    useMouseWheelVolume: true,
    volumeIncrement: 5,
    useAlternateVolumeIncrement: false,
    alternateVolumeIncrement: 10,
    alternateVolumeIncrementHotkey: "Shift",

    usePreciseScroll: true,
    useCustomPreciseScrollThreshold: false,
    customPreciseScrollThreshold: 10,

    doBoostVolume: false,
    volumeBoostAmount: 200,

    modifierKey: "Right Mouse",
    useModifierKey: false,
    invertModifierKey: false,

    toggleMuteKey: "Middle Mouse",
    useToggleMuteKey: false,

    fullscreenOnly: false,

    fontColor: "#FCB900",
    fontSize: 40,
    useOverlay: true,
    overlayPosition: "tl",
    overlayXPos: 5,
    overlayYPos: 5,
    overlayDuration: 2000,

    domainList: {},
    enableDefault: true,

    doDebugLog: false
};

export type Pages = "menu" | "scroll" | "hotkeys" | "overlay" | "misc";
export type OverlayType = "volume" | "mute" | "unmute";

export interface videoElements {
    display: HTMLBaseElement;
    video: HTMLVideoElement;
}

export interface logElement {
    text: String;
    extra?: any;
}

export interface VideoState {
    targetVolume: number; // Ratio 0-1 (or > 1 for boost)
    lastUnmutedVolume: number; // Ratio 0-1 (or > 1 for boost)
    isMuted: boolean; // Tracking if we have forced mute
}
