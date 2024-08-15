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