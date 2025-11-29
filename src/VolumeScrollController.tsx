import { Settings, defaultSettings } from "./types";

import { DefaultHandler } from "./handlers/default";
import { YTMusicHandler } from "./handlers/ytMusic";
import { TwitchHandler } from "./handlers/twitch";

const handlers : DefaultHandler[] = [
    new YTMusicHandler(),
    new TwitchHandler()
];

const body = document.documentElement || document.body || document.getElementsByTagName("body")[0];
let settings : Settings = defaultSettings;
let isModifierKeyPressed : boolean = false;
let mouseX : number = 0;
let mouseY : number = 0;

const createOverlay = function(): HTMLElement {
    let div = document.createElement("div");

    div.id = "volumeScrollOverlay";
    div.classList.add("volumeScrollOverlay");
    div.style.color = settings.fontColor;
    div.style.fontSize = settings.fontSize + "px";
    body.appendChild(div);

    return div;
}

const debug = function(message: String, extra?: any): void {
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
        if (result.settings) {
            // Using Object spread to ensure missing keys in storage (from updates) take default values
            settings = { ...defaultSettings, ...result.settings };
        } else {
            settings = defaultSettings;
        }

        debug("Settings loaded: ", settings);
});

browser.storage.onChanged.addListener((changes) => {
    settings = changes.settings.newValue;
    debug("Settings reapplied: ", settings);
});

const isFullscreen = function(): boolean {
    return document.fullscreenElement != null;
}

const doVolumeScroll = function(): boolean{
    switch (true) {
        case settings.blacklist.includes(window.location.hostname):                             // Domain is blacklisted
        case !settings.useMouseWheelVolume:                                                     // Volume Scroll is disabled
        case settings.useModifierKey && !settings.invertModifierKey && !isModifierKeyPressed:   // Modifier key is enabled and not inverted, key is not held down
        case settings.useModifierKey && settings.invertModifierKey && isModifierKeyPressed:     // Modifier key is enabled, but inverted, key is held down
        case settings.fullscreenOnly && !isFullscreen():                                        // Fullscreen only mode is enabled, and there are no fullscreen elements
            return false;
        default:
            return true;
    }
}

const getHandler = function(): DefaultHandler {
    let handler : DefaultHandler = new DefaultHandler();

    for( const handlerCandidate of handlers ){
        if(handlerCandidate.handlesDomain(window.location.hostname)){
            handler = handlerCandidate;
            break;
        }
    }

    return handler;
}

export function onScroll(e: WheelEvent): void {
    debug("Scrolled!");

    // Check settings
    if(!doVolumeScroll()) return;

    // Get handler
    const handler = getHandler();

    debug("Got handler: " + typeof handler, handler);

    handler.scroll(e, settings, createOverlay, debug);
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
        debug("Modifier key pressed");
    }

    if(settings.toggleMuteKey === getMouseKey(e.button) && settings.useToggleMuteKey){
        e.preventDefault();
        const handler = getHandler();
        handler.toggleMute(e.clientX, e.clientY);
        debug("Toggle mute key pressed");
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
        debug("Modifier key pressed");
    }

    if(settings.toggleMuteKey === e.key && settings.useToggleMuteKey){
        e.preventDefault();
        const handler = getHandler();
        handler.toggleMute(mouseX, mouseY);
        debug("Toggle mute key pressed");
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

export function onMouseMove(e: MouseEvent){
    mouseX = e.clientX;
    mouseY = e.clientY;
}