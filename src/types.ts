export interface Settings {
    useDefaultVolume: boolean;
    defaultVolume: number;
    startMuted: boolean;

    useMouseWheelVolume: boolean;
    invertScrollDirection: boolean;
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
    playingOnly: boolean;

    overlayColor: string;
    fontSize: number;
    useOverlay: boolean;
    useOverlayBackground: boolean;
    overlayBackgroundOpacity: number;
    overlayDuration: number;
    useDutchAngle: boolean;
    dutchAngleValue: number;
    showMutePlayIcons: boolean;
    overlayStyle: OverlayStyle;
    customOverlay: string;
    customOverlayBoostBehavior: CustomOverlayBoostBehavior;
    customOverlayScale: number;

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
    invertScrollDirection: false,
    volumeIncrement: 5,
    useRoundToNearestIncrement: true,
    useAlternateVolumeIncrement: false,
    alternateVolumeIncrement: 10,
    alternateVolumeIncrementHotkey: "Control",

    usePreciseScroll: true,
    useCustomPreciseScrollThreshold: false,
    customPreciseScrollThreshold: 10,

    doBoostVolume: false,
    volumeBoostAmount: 300,
    boostedColor: "#EB144C",

    modifierKey: "Shift",
    useModifierKey: false,
    invertModifierKey: false,

    toggleMuteKey: "Middle Mouse",
    useToggleMuteKey: false,

    togglePauseKey: "Right Mouse",
    useTogglePauseKey: false,

    fullscreenOnly: false,
    playingOnly: false,

    overlayColor: "#FCB900",
    fontSize: 40,
    useOverlay: true,
    useOverlayBackground: true,
    overlayBackgroundOpacity: 65,
    overlayDuration: 2000,
    useDutchAngle: false,
    showMutePlayIcons: true,
    dutchAngleValue: 6,
    overlayStyle: "number",
    customOverlay: "",
    customOverlayBoostBehavior: "loop",
    customOverlayScale: 10,

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

export interface CustomOverlayImage {
    name: string;
    url: string;
}

export interface CustomOverlay {
    images: CustomOverlayImage[]; // List of named images
    frames: number[]; // List of indexes to images for each volume step
}

export interface CustomRule {
    name: string;
    videoQuerySelector: string;
    displayQuerySelector: string;
    scrollInteractibleQuerySelector: string[];
}

export interface ExtensionData {
    globalSettings: Settings; // Global settings
    domainOverrides: Record<string, Partial<Settings>>; // Settings saved for specific domains
    customRules: Record<string, CustomRule[]>; // Custom rules for specific domains
    ignoredElements: Record<string, string[]>; // Elements to ignore for specific domains
    customOverlays: Record<string, CustomOverlay>; // Custom overlays, key is name
    lastVersionRead: string;
    schemaVersion: number;
}

export const defaultExtensionData: ExtensionData = {
    globalSettings: defaultSettings,
    domainOverrides: {},
    customRules: {
        "music.youtube.com": [
            {
                name: "YouTube Music Player",
                videoQuerySelector: "video",
                displayQuerySelector: "ytmusic-player",
                scrollInteractibleQuerySelector: [
                    "ytmusic-player-bar",
                    "ytmusic-player",
                ],
            },
        ],
    },
    ignoredElements: {
        "www.youtube.com": [
            "yt-thumbnail-view-model",
            "YT-MULTI-PAGE-MENU-SECTION-RENDERER",
            "YT-CONTEXTUAL-SHEET-LAYOUT",
            "YTD-LIVE-CHAT-FRAME",
            "YTD-GUIDE-RENDERER",
            ".ytSearchboxComponentSuggestionsContainerScrollable",
            ".ytd-popup-container",
            ".ytp-settings-menu",
            ".yt-live-chat-renderer",
            ".ytp-ce-covering-overlay",
        ],
    },
    customOverlays: {
        "Hearts": {
            "images": [
            {
                "name": "0",
                "url": "https://i.imgur.com/iXt9YZ5.png"
            },
            {
                "name": "1",
                "url": "https://i.imgur.com/41qfm6M.png"
            },
            {
                "name": "2",
                "url": "https://i.imgur.com/d2AWhtv.png"
            },
            {
                "name": "3",
                "url": "https://i.imgur.com/lCCu8yp.png"
            },
            {
                "name": "4",
                "url": "https://i.imgur.com/1mbLmQv.png"
            },
            {
                "name": "5",
                "url": "https://i.imgur.com/seAmD7m.png"
            },
            {
                "name": "6",
                "url": "https://i.imgur.com/p1bfreS.png"
            },
            {
                "name": "7",
                "url": "https://i.imgur.com/jcCygIj.png"
            },
            {
                "name": "8",
                "url": "https://i.imgur.com/OguJySS.png"
            },
            {
                "name": "9",
                "url": "https://i.imgur.com/gWnVHKF.png"
            },
            {
                "name": "10",
                "url": "https://i.imgur.com/ioiFnep.png"
            }
            ],
            "frames": [
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
            ]
        },
        "Cat": {
            "images": [
            {
                "name": "Closed",
                "url": "https://i.imgur.com/DDnQcL8.png"
            },
            {
                "name": "Open",
                "url": "https://i.imgur.com/YFiCHwg.png"
            }
            ],
            "frames": [
                0,
                1,
                0,
                1,
                0,
                1,
                0,
                1,
                0,
                1,
                0,
                1,
                0,
                1,
                0,
                1,
                0,
                1,
                0,
                1
            ]
        },
        "Signal": {
            "images": [
            {
                "name": "Image #1",
                "url": "https://i.imgur.com/im3JNTb.png"
            },
            {
                "name": "Image #2",
                "url": "https://i.imgur.com/CGwsdxa.png"
            },
            {
                "name": "Image #3",
                "url": "https://i.imgur.com/gi7H7Dy.png"
            },
            {
                "name": "Image #4",
                "url": "https://i.imgur.com/OoQxtLL.png"
            },
            {
                "name": "Image #5",
                "url": "https://i.imgur.com/wKvZn5o.png"
            }
            ],
            "frames": [
                0,
                1,
                2,
                3,
                4
            ]
        }
      },
    lastVersionRead: "0.0.0",
    schemaVersion: 6,
};

export interface ExportData extends Partial<
    Omit<ExtensionData, "lastVersionRead" | "schemaVersion">
> {
    version: string;
}

export type Pages =
    | "menu"
    | "scroll"
    | "hotkeys"
    | "overlay"
    | "misc"
    | "domains"
    | "updatePage"
    | "customRules"
    | "share"
    | "customOverlayPage";

export type OverlayType = "volume" | "mute" | "unmute" | "pause" | "play";

export type OverlayStyle = "number" | "bar" | "circle" | "retro" | "custom";

export type CustomOverlayBoostBehavior = "stretch" | "loop";

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
