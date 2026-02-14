import browser from "webextension-polyfill";
import { Settings, defaultSettings, logElement } from "./types";

import { DefaultHandler } from "./handlers/Default";
import { YTMusicHandler } from "./handlers/YTMusic";
import { TwitchHandler } from "./handlers/Twitch";
import { RedditHandler } from "./handlers/Reddit";

const handlers: DefaultHandler[] = [
    new YTMusicHandler(),
    new TwitchHandler(),
    new RedditHandler()
];

const getHandler = function (): DefaultHandler {
    let handler: DefaultHandler = new DefaultHandler();

    for (const handlerCandidate of handlers) {
        if (handlerCandidate.handlesDomain(window.location.hostname)) {
            handler = handlerCandidate;
            break;
        }
    }

    return handler;
}

const handler: DefaultHandler = getHandler();
const body: HTMLElement = document.documentElement || document.body || document.getElementsByTagName("body")[0];
let settings: Settings = defaultSettings;
let isModifierKeyPressed: boolean = false;
let mouseX: number = 0;
let mouseY: number = 0;
let preventContextMenu: boolean = false;
let logList: logElement[] = [];

const debug = function (message: String, extra?: any): void {
    logList.push({ text: message, extra: extra });
    if (!settings.doDebugLog) return;

    if (extra) {
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
            handler.updateSettings(settings);

            window.addEventListener("message", (event) => {
                if (!event.data) return;
                // Ensure we are the top window (the player), not another nested iframe
                if (window.top === window.self) {

                    // Security check: ensure the data object exists and is ours
                    if (event.data.type === "VOLUME_SCROLL_RELAY") {
                        debug("Received direct postMessage relay", event.data);

                        // Construct synthetic event
                        const syntheticEvent = {
                            deltaY: event.data.deltaY,
                            clientX: mouseX,
                            clientY: mouseY,
                            preventDefault: () => { },
                            stopPropagation: () => { }
                        } as any as WheelEvent;

                        onScroll(syntheticEvent);
                    }

                    if (event.data.type === "VOLUME_MUTE_RELAY") {
                        debug("Received Mute Relay");
                        handler.toggleMute(mouseX, mouseY, debug);
                    }
                }
            });

            // Now that settings are ready, perform the Page Load check
            if (document.readyState === "complete") {
                onPageLoad();
            } else {
                window.addEventListener("load", onPageLoad);
            }
        });
};

browser.storage.onChanged.addListener((changes) => {
    settings = changes.settings.newValue as Settings;
    handler.updateSettings(settings);
    debug("Settings reapplied: ", settings);
});

const isFullscreen = function (): boolean {
    return document.fullscreenElement != null;
}

const isDisabledOnSite = function (): boolean {
    // Returns default value if domain is not in the map, otherwise returns the domain-specific value
    // If in an iframe, we also want to respect the parent domain's setting if the iframe domain is not explicitly set
    let enabled = settings.domainList?.[window.location.hostname];

    if (enabled === undefined && window.self !== window.top) {
        try {
            // Try to get the top frame's hostname
            if (window.top?.location.hostname) {
                enabled = settings.domainList?.[window.top.location.hostname];
            }
        } catch (e) {
            // Cross-origin access denied. Fallback to referrer.
            if (document.referrer) {
                try {
                    const referrerHostname = new URL(document.referrer).hostname;
                    enabled = settings.domainList?.[referrerHostname];
                } catch (refErr) {
                    // Invalid referrer URL, ignore
                }
            }
        }
    }

    // Inverted to return whether Volume Scroll is disabled, not enabled
    return !(enabled ?? settings.enableDefault);
}

const doVolumeScroll = function (): boolean {
    switch (true) {
        case isDisabledOnSite():                                                                // Domain is disabled
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

    // Check if we utilized the Right Mouse button as a modifier for this scroll
    if (settings.useModifierKey && settings.modifierKey === "Right Mouse" && isModifierKeyPressed) {
        preventContextMenu = true;
    }

    // Check settings
    if (!doVolumeScroll()) return;

    // If we are inside an iframe
    if (window.self !== window.top) {
        const localVideo = document.getElementsByTagName("video")[0];

        // If no video here, assume we are an overlay and shout to the parent
        if (!localVideo) {
            debug("In iframe without video, posting message to parent");

            e.preventDefault();
            e.stopPropagation();

            // "*" allows communication even if the iframe is cross-origin (common with Twitch extensions)
            window.parent.postMessage({
                type: "VOLUME_SCROLL_RELAY",
                deltaY: e.deltaY
            }, "*");

            return;
        }
    }

    handler.scroll(e, body, debug);
}

const getMouseKey = function (key: number) {
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

    // Reset context menu prevention on new click.
    if (getMouseKey(e.button) === "Right Mouse") {
        preventContextMenu = false;
    }

    if (settings.modifierKey === getMouseKey(e.button) && settings.useModifierKey) {
        e.preventDefault();
        isModifierKeyPressed = true;
        debug("Modifier key pressed");
    }

    if (settings.toggleMuteKey === getMouseKey(e.button) && settings.useToggleMuteKey) {

        if (window.self !== window.top) {
            const localVideo = document.getElementsByTagName("video")[0];
            if (!localVideo) {
                debug("In iframe, relaying Mute Toggle to parent");
                e.preventDefault();
                e.stopPropagation();

                window.parent.postMessage({ type: "VOLUME_MUTE_RELAY" }, "*");
                return;
            }
        }

        e.preventDefault();
        const result: boolean = handler.toggleMute(e.clientX, e.clientY, debug);
        debug("Toggle mute key pressed");

        if (getMouseKey(e.button) === "Right Mouse") {
            preventContextMenu = result;
        }
    }
}

export function onMouseUp(e: MouseEvent): void {
    debug("Mouse up!");

    if (settings.modifierKey === getMouseKey(e.button) && settings.useModifierKey) {
        e.preventDefault();
        isModifierKeyPressed = false;
        debug("Modifier key released");
    }
}

export function onKeyDown(e: KeyboardEvent): void {
    debug("Key down!");

    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();

        debug("Debug hotkey pressed, logs copied to clipboard");

        // Debug hotkey pressed, copy logs to clipboard as json string
        const debugData = {
            settings: settings,
            logs: logList
        };
        navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));

        return;
    }

    if (settings.modifierKey === e.key && settings.useModifierKey) {
        e.preventDefault();
        isModifierKeyPressed = true;
        debug("Modifier key pressed");
    }

    if (settings.toggleMuteKey === e.key && settings.useToggleMuteKey) {

        if (window.self !== window.top) {
            const localVideo = document.getElementsByTagName("video")[0];
            if (!localVideo) {
                debug("In iframe, relaying Mute Toggle to parent");
                e.preventDefault();
                e.stopPropagation();

                window.parent.postMessage({ type: "VOLUME_MUTE_RELAY" }, "*");
                return;
            }
        }

        e.preventDefault();
        handler.toggleMute(mouseX, mouseY, debug);
        debug("Toggle mute key pressed");
    }
}

export function onKeyUp(e: KeyboardEvent): void {
    debug("Key up!");

    if (settings.modifierKey === e.key && settings.useModifierKey) {
        e.preventDefault();
        isModifierKeyPressed = false;
        debug("Modifier key released");
    }
}

export function onMouseMove(e: MouseEvent): void {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

export function onPageLoad(): void {
    if (!settings.useDefaultVolume) return;
    debug("Using handler: " + handler.getName());
    debug("Hostname: " + window.location.hostname);
    handler.setDefaultVolume(body, debug);
}

export function onContextMenu(e: MouseEvent): void {
    // If the flag was set during Scroll or Mute actions, block the menu
    if (preventContextMenu) {
        debug("Context menu blocked due to volume scroll/mute action");
        e.preventDefault();
        e.stopPropagation();

        // Reset flag immediately after blocking
        preventContextMenu = false;
        return;
    }
}