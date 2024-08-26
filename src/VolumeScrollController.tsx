import { Settings, defaultSettings } from "./types";

import * as defaultHandler from "./defaultHandler";

let settings : Settings = defaultSettings;
let isModifierKeyPressed : boolean;

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

const isFullscreen = function(){
    return document.fullscreenElement != null;
}

const doVolumeScroll = () => {
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

    if(!doVolumeScroll()) return;

    //Get the scroll handler
    //Get video
    //Validate video
    //Get scroll direction
    //Modify volume

    
    const direction = e.deltaY / 100 * -1;
    debug(direction > 0 ? "UP" : "DOWN", direction);
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