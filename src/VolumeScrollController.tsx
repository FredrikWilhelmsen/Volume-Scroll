import browser from "webextension-polyfill";
import { Settings, defaultSettings } from "./types";

import { DefaultHandler } from "./handlers/Default";
import { YTMusicHandler } from "./handlers/YTMusic";
import { TwitchHandler } from "./handlers/Twitch";

const handlers : DefaultHandler[] = [
    new YTMusicHandler(),
    new TwitchHandler()
];

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

const handler = getHandler();
const body = document.documentElement || document.body || document.getElementsByTagName("body")[0];
let settings : Settings = defaultSettings;
let isModifierKeyPressed : boolean = false;
let mouseX : number = 0;
let mouseY : number = 0;

const debug = function(message: String, extra?: any): void {
    if(!settings.doDebugLog) return;

    if(extra){
        console.log("Volume Scroll: " + message, extra);
    }
    else {
        console.log("Volume Scroll: " + message);
    }
}

export const init = () => {
    browser.storage.local.get("settings")
        .then((result) => {
            if (result.settings) {
                settings = { ...defaultSettings, ...result.settings };
            } else {
                settings = defaultSettings;
            }
            debug("Settings loaded: ", settings);

            // NOW that settings are ready, perform the Page Load check
            if (document.readyState === "complete") {
                onPageLoad();
            } else {
                window.addEventListener("load", onPageLoad);
            }
        });
};

browser.storage.onChanged.addListener((changes) => {
    settings = changes.settings.newValue as Settings;
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

export function onScroll(e: WheelEvent): void {
    debug("Scrolled!");

    // Check settings
    if(!doVolumeScroll()) return;

    debug("Got handler: " + handler.getName(), handler);
    debug("Hostname: " + window.location.hostname);

    handler.scroll(e, settings, body, debug);
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
        handler.toggleMute(e.clientX, e.clientY, debug);
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
        handler.toggleMute(mouseX, mouseY, debug);
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

export function onPageLoad(){
    if(!settings.useDefaultVolume) return;
    debug("Setting default volumes");
    handler.setDefaultVolume(settings, debug);
}