import { Settings } from './settings';

import { getVideo } from "./defaultHandler";

let settings : Settings | null = null;

const log = (message: String, extra?: any): void => {
    if(settings === null) return;
    if(!settings.doLogging) return;

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
        log("Settings loaded: ", result.settings);
});

browser.storage.onChanged.addListener((changes) => {
    settings = changes.settings.newValue;
    log("Settings reapplied");
});

export function onScroll(e: WheelEvent): void {
    log("Scrolled!");
    //Check settings
    //Get video
    //Validate video
    //Get scroll direction
    //Modify volume

    
    const direction = e.deltaY / 100 * -1;
    log(direction > 0 ? "UP" : "DOWN");
}

export function onClick(e: Event): void {
    console.log("Volume Scroll: Clicked!");
}