export interface Settings {
    useDefaultVolume: boolean;
    defaultVolume: number;
    startMuted: boolean;

    useMouseWheelVolume: boolean;
    volumeIncrement: number;
    useRoundToNearestIncrement: boolean;
    useAlternateVolumeIncrement: boolean;
    alternateVolumeIncrement: number;
    alternateVolumeIncrementHotkey: string;

    usePreciseScroll: boolean;
    useCustomPreciseScrollThreshold: boolean;
    customPreciseScrollThreshold: number;

    doBoostVolume: boolean;
    volumeBoostAmount: number;
    boostedColor: string;

    modifierKey: string;
    useModifierKey: boolean;
    invertModifierKey: boolean;

    toggleMuteKey: string;
    useToggleMuteKey: boolean;

    togglePauseKey: string;
    useTogglePauseKey: boolean;

    fullscreenOnly: boolean;

    overlayColor: string;
    fontSize: number;
    useOverlay: boolean;
    useOverlayBackground: boolean;
    overlayBackgroundOpacity: number;
    overlayDuration: number;
    useDutchAngle: boolean;
    overlayStyle: OverlayStyle;

    overlayPosition: OverlayNumberPosition;
    overlayXPos: number;
    overlayYPos: number;

    overlayBarSide: OverlayBarSide;
    showNumericValue: boolean;

    enableDefault: boolean;

    doDebugLog: boolean;
}

export const defaultSettings: Settings = {
    useDefaultVolume: false,
    defaultVolume: 20,
    startMuted: false,

    useMouseWheelVolume: true,
    volumeIncrement: 5,
    useRoundToNearestIncrement: true,
    useAlternateVolumeIncrement: false,
    alternateVolumeIncrement: 10,
    alternateVolumeIncrementHotkey: "Control",

    usePreciseScroll: true,
    useCustomPreciseScrollThreshold: false,
    customPreciseScrollThreshold: 10,

    doBoostVolume: false,
    volumeBoostAmount: 200,
    boostedColor: "#EB144C",

    modifierKey: "Shift",
    useModifierKey: false,
    invertModifierKey: false,

    toggleMuteKey: "Middle Mouse",
    useToggleMuteKey: false,

    togglePauseKey: "Right Mouse",
    useTogglePauseKey: false,

    fullscreenOnly: false,

    overlayColor: "#FCB900",
    fontSize: 40,
    useOverlay: true,
    useOverlayBackground: true,
    overlayBackgroundOpacity: 65,
    overlayDuration: 2000,
    useDutchAngle: false,
    overlayStyle: "number",

    // Number style settings
    overlayPosition: "tl",
    overlayXPos: 5,
    overlayYPos: 5,

    // Bar style settings
    overlayBarSide: "left",
    showNumericValue: false,

    enableDefault: true,

    doDebugLog: false,
};

export const colors: string[] = [
    "#FF6900",
    "#FCB900",
    "#7BDCB5",
    "#00D084",
    "#8ED1FC",
    "#0693E3",
    "#ABB8C3",
    "#EB144C",
    "#F78DA7",
    "#9900EF",
    "#DABDAB",
];

export interface ExtensionData {
    globalSettings: Settings;
    domainOverrides: Record<string, Partial<Settings>>;
    lastVersionRead: string;
}

export type Pages =
    | "menu"
    | "scroll"
    | "hotkeys"
    | "overlay"
    | "misc"
    | "domains"
    | "updatePage";

export type OverlayType = "volume" | "mute" | "unmute" | "pause" | "play";

export type OverlayStyle = "number" | "bar" | "circle" | "retro";

export type OverlayNumberPosition =
    | "tl"
    | "tr"
    | "bl"
    | "br"
    | "custom"
    | "mouse";

export type OverlayBarSide = "left" | "right" | "top" | "bottom";

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
    isMuted: boolean; // Tracking if we have forced mute
    isPaused: boolean; // Tracking if we have forced pause
    videoId: string; // Unique ID for this video instance
}
