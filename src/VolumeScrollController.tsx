import { Settings, defaultSettings, videoElements } from "./types";

import { DefaultHandler } from "./handlers/default";
import { YTMusicHandler } from "./handlers/ytMusic";
import { TwitchHandler } from "./handlers/twitch";

const handlers : DefaultHandler[] = [
    new YTMusicHandler(),
    new TwitchHandler()
];

let settings : Settings = defaultSettings;
let isModifierKeyPressed : boolean = false;

const debug = (message: String, extra?: any): void => {
    if(!settings.doDebugLog) return;

    if(extra){
        console.log("Volume Scroll: " + message, extra);
    }
    else {
        console.log("Volume Scroll: " + message);
    }
}

browser.storage.local.get("settings")
    .then((result) => {
        settings = result.settings;
        debug("Settings loaded: ", result.settings);
});

browser.storage.onChanged.addListener((changes) => {
    settings = changes.settings.newValue;
    debug("Settings reapplied: ", settings);
});

let hasAudio = function(video: any): boolean {
    if (video.audioTracks && video.audioTracks.length > 0) {
        return true;
    }

    if (typeof video.webkitAudioDecodedByteCount !== "undefined" && video.webkitAudioDecodedByteCount > 0) {
        return true;
    }

    if (typeof video.mozHasAudio !== "undefined" && video.mozHasAudio) {
        return true;
    }

    //TODO: Use Web Audio API for more advanced audio analysis

    return false;
}

const isFullscreen = function(): boolean {
    return document.fullscreenElement != null;
}

const doVolumeScroll = function(): boolean{
    switch (true) {
        case settings.blacklist.includes(window.location.hostname):                             //Domain is blacklisted
        case !settings.useMouseWheelVolume:                                                     //Volume Scroll is disabled
        case settings.useModifierKey && !settings.invertModifierKey && !isModifierKeyPressed:   //Modifier key is enabled and not inverted, key is not held down
        case settings.useModifierKey && settings.invertModifierKey && isModifierKeyPressed:     //Modifier key is enabled, but inverted, key is held down
        case settings.fullscreenOnly && !isFullscreen():                                        //Fullscreen only mode is enabled, and there are no fullscreen elements
            return false;
        default:
            return true;
    }
}

export function onScroll(e: WheelEvent): void {
    debug("Scrolled!");

    //Check settings
    if(!doVolumeScroll()) return;

    //Get handler
    let handler : DefaultHandler = new DefaultHandler();

    for( const handlerCandidate of handlers ){
        if(handlerCandidate.handlesDomain(window.location.hostname)){
            handler = handlerCandidate;
            break;
        }
    }

    debug("Got handler: ", handler);

    //Get video
    const videoGroup : videoElements | null = handler.getVideo(e);
    debug("Got video: ", videoGroup);

    if(videoGroup === null) return;

    if(!hasAudio(videoGroup.video)) return;

    //Get scroll direction
    const direction = e.deltaY / 100 * -1;
    debug(direction > 0 ? "UP" : "DOWN", direction);
    
    //Modify volume
    let newVolume: number = 0;

    if(settings.useUncappedVolume){
        
    }
    else {
        
    }

    handler.updateVolume(newVolume);
}

const getMouseKey = function (key : number) {
    switch (key) {
        case 0:
            return "Left Mouse";
        case 1:
            return "Middle Mouse";
        case 2:
            return "Right Mouse";
        case 3:
            return "Mouse 4";
        case 4:
            return "Mouse 5";
    }
}

export function onMouseDown(e: MouseEvent): void {
    debug("Mouse down!");

    if(settings.modifierKey === getMouseKey(e.button) && settings.useModifierKey){
        e.preventDefault();
        isModifierKeyPressed = true;
        debug("Modifier key pressed down");
    }
}

export function onMouseUp(e: MouseEvent): void {
    debug("Mouse up!");

    if(settings.modifierKey === getMouseKey(e.button) && settings.useModifierKey){
        e.preventDefault();
        isModifierKeyPressed = false;
        debug("Modifier key released");
    }
}

export function onKeyDown(e: KeyboardEvent): void {
    debug("Key down!");

    if(settings.modifierKey === e.key && settings.useModifierKey){
        e.preventDefault();
        isModifierKeyPressed = true;
        debug("Modifier key pressed down");
    }
}

export function onKeyUp(e: KeyboardEvent): void {
    debug("Key up!");

    if(settings.modifierKey === e.key && settings.useModifierKey){
        e.preventDefault();
        isModifierKeyPressed = false;
        debug("Modifier key released");
    }
}