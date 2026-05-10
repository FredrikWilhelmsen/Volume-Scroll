import { Settings, defaultSettings, logElement } from "./types";

let utilSettings: Settings = defaultSettings;
let logList: logElement[] = [];

// Updates the settings used by the utility functions (e.g. for debug logging)
export const setUtilSettings = (settings: Settings) => {
    utilSettings = settings;
};

// Returns the current accumulated log list
export const getLogList = () => logList;

// Adds a log entry manually (e.g. from postMessage relays)
export const addLog = (log: logElement) => {
    logList.push(log);
};

export const deepSanitize = (obj: any): any => {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }

    if (obj instanceof HTMLElement) {
        return `<${obj.tagName.toLowerCase()}${obj.id ? ` id="${obj.id}"` : ""}${obj.className ? ` class="${obj.className}"` : ""}>`;
    }

    if (obj instanceof Event) {
        return `Event: ${obj.type}`;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepSanitize);
    }

    const sanitizedObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            sanitizedObj[key] = deepSanitize(obj[key]);
        }
    }
    return sanitizedObj;
};

export const debug = function (message: String, extra?: any): void {
    const sanitizedExtra = deepSanitize(extra);

    logList.push({ text: message, extra: sanitizedExtra });

    // If we are in an iframe, relay the log to the parent
    if (window.self !== window.top) {
        window.parent.postMessage({
            type: "VOLUME_LOG_RELAY",
            log: { text: `[Frame: ${window.location.hostname}] ${message}`, extra: sanitizedExtra }
        }, "*");
    }

    if (!utilSettings.doDebugLog) return;

    if (extra) {
        console.log("Volume Scroll: " + message, extra);
    }
    else {
        console.log("Volume Scroll: " + message);
    }
}

export const getMouseKey = (key: number): string | undefined => {
    switch (key) {
        case 0: return "Left Mouse";
        case 1: return "Middle Mouse";
        case 2: return "Right Mouse";
        case 3: return "Mouse 4";
        case 4: return "Mouse 5";
        default: return undefined;
    }
}

export const isHotkeyPressed = (e: MouseEvent | WheelEvent, hotkey: string): boolean => {
    switch (hotkey) {
        case "Left Mouse": return (e.buttons & 1) !== 0;
        case "Right Mouse": return (e.buttons & 2) !== 0;
        case "Middle Mouse": return (e.buttons & 4) !== 0;
        case "Mouse 4": return (e.buttons & 8) !== 0;
        case "Mouse 5": return (e.buttons & 16) !== 0;
        case "Shift": return e.shiftKey;
        case "Alt": return e.altKey;
        case "Control": return e.ctrlKey;
        default: return false;
    }
}
