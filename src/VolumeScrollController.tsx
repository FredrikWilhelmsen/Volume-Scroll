import browser from "webextension-polyfill";
import { isHotkeyPressed, getMouseKey, debug, setUtilSettings, getLogList, addLog } from "./utils";

import { Settings, defaultSettings } from "./types";

import { DefaultHandler } from "./handlers/Default";
import { YoutubeHandler } from "./handlers/Youtube";
import { YTMusicHandler } from "./handlers/YTMusic";
import { TwitchHandler } from "./handlers/Twitch";
import { RedditHandler } from "./handlers/Reddit";

const handlers: DefaultHandler[] = [
    new YoutubeHandler(),
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

let mouseX: number = 0;
let mouseY: number = 0;
let preventContextMenu: boolean = false;
let preventMiddleClick: boolean = false;
let isInitialized: boolean = false;
const processedMessageIds = new Set<string>();

export const init = () => {
    if (isInitialized) return;
    isInitialized = true;
    browser.storage.sync.get("settings")
        .then((result) => {
            settings = result.settings ? { ...defaultSettings, ...result.settings } : defaultSettings;
            const { domainList, ...settingsToLog } = settings;
            setUtilSettings(settings);
            debug("Settings loaded: ", settingsToLog);
            handler.updateSettings(settings);

            window.addEventListener("message", (event) => {
                if (!event.data) return;

                const isRelayMessage = event.data.type === "VOLUME_SCROLL_RELAY" || event.data.type === "VOLUME_MUTE_RELAY" || event.data.type === "VOLUME_PAUSE_RELAY";

                if (isRelayMessage) {
                    if (event.data.messageId) {
                        if (processedMessageIds.has(event.data.messageId)) return;
                        processedMessageIds.add(event.data.messageId);
                        setTimeout(() => processedMessageIds.delete(event.data.messageId), 1000);
                    }

                    let x = event.data.clientX !== undefined ? event.data.clientX : mouseX;
                    let y = event.data.clientY !== undefined ? event.data.clientY : mouseY;

                    // Adjust coordinates if this came from a sub-frame
                    if (event.source && event.source !== window) {
                        const iframes = document.getElementsByTagName("iframe");
                        for (let i = 0; i < iframes.length; i++) {
                            try {
                                if (iframes[i].contentWindow === event.source) {
                                    const rect = iframes[i].getBoundingClientRect();
                                    x += rect.left;
                                    y += rect.top;
                                    break;
                                }
                            } catch (e) {
                                // Ignore cross-origin errors
                            }
                        }
                    }

                    const isTop = window.top === window.self;

                    debug(`Handling ${event.data.type} in this frame`, event.data);

                    let handled = false;
                    if (event.data.type === "VOLUME_SCROLL_RELAY") {
                        // Construct synthetic event
                        const syntheticEvent = {
                            deltaY: event.data.deltaY,
                            deltaMode: event.data.deltaMode,
                            clientX: x,
                            clientY: y,
                            buttons: event.data.buttons,
                            ctrlKey: event.data.ctrlKey,
                            shiftKey: event.data.shiftKey,
                            altKey: event.data.altKey,
                            metaKey: event.data.metaKey,
                            preventDefault: () => { },
                            stopPropagation: () => { },
                            stopImmediatePropagation: () => { }
                        } as any as WheelEvent;

                        handled = handler.scroll(syntheticEvent, body);
                    }

                    if (event.data.type === "VOLUME_MUTE_RELAY") {
                        // Construct synthetic event
                        const syntheticEvent = {
                            clientX: x,
                            clientY: y,
                            buttons: event.data.buttons,
                            ctrlKey: event.data.ctrlKey,
                            shiftKey: event.data.shiftKey,
                            altKey: event.data.altKey,
                            metaKey: event.data.metaKey,
                            preventDefault: () => { },
                            stopPropagation: () => { },
                            stopImmediatePropagation: () => { }
                        } as any as MouseEvent;

                        handled = handler.toggleMute(syntheticEvent, body);
                    }

                    if (event.data.type === "VOLUME_PAUSE_RELAY") {
                        // Construct synthetic event
                        const syntheticEvent = {
                            clientX: x,
                            clientY: y,
                            buttons: event.data.buttons,
                            ctrlKey: event.data.ctrlKey,
                            shiftKey: event.data.shiftKey,
                            altKey: event.data.altKey,
                            metaKey: event.data.metaKey,
                            preventDefault: () => { },
                            stopPropagation: () => { },
                            stopImmediatePropagation: () => { }
                        } as any as MouseEvent;

                        handled = handler.togglePause(syntheticEvent, body);
                    }

                    if (!handled && !isTop) {
                        // Relay it to the next parent
                        debug(`Relaying ${event.data.type} up to parent`);
                        const relayData = {
                            ...event.data,
                            clientX: x,
                            clientY: y
                        };
                        window.parent.postMessage(relayData, "*");
                    }
                    return;
                }

                // VOLUME_LOG_RELAY must be handled by EVERY frame to ensure it bubbles up to the top
                if (event.data.type === "VOLUME_LOG_RELAY") {
                    if (window.top === window.self) {
                        // We are at the top, aggregate it
                        addLog(event.data.log);
                    } else {
                        // Relay it to the next parent
                        window.parent.postMessage(event.data, "*");
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

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;
    if (!changes.settings) return;

    settings = changes.settings.newValue as Settings;
    setUtilSettings(settings);
    handler.updateSettings(settings);
    const { domainList, ...settingsToLog } = settings;
    debug("Settings reapplied: ", settingsToLog);
});

browser.runtime.onMessage.addListener((message: any) => {
    if (message.type === "GET_DEBUG_LOGS") {
        // Only the top-level frame should respond to avoid multiple conflicting responses
        if (window.top !== window.self) return;

        debug("Received GET_DEBUG_LOGS message");
        const { domainList, ...settingsToLog } = settings;
        const debugData = {
            settings: settingsToLog,
            logs: getLogList()
        };

        return Promise.resolve(debugData);
    }
});


const isFullscreen = function (): boolean {
    return document.fullscreenElement != null;
}

const isDisabledOnSite = function (): boolean {
    // Returns default value if domain is not in the map, otherwise returns the domain-specific value
    // If in an iframe, we also want to respect the parent domain's setting if the iframe domain is not explicitly set
    let enabled = settings.domainList?.[window.location.hostname.toLowerCase()];

    if (enabled === undefined && window.self !== window.top) {
        try {
            // Try to get the top frame's hostname
            if (window.top?.location.hostname) {
                enabled = settings.domainList?.[window.top.location.hostname.toLowerCase()];
            }
        } catch (e) {
            // Cross-origin access denied. Fallback to referrer.
            if (document.referrer) {
                try {
                    const referrerHostname = new URL(document.referrer).hostname;
                    enabled = settings.domainList?.[referrerHostname.toLowerCase()];
                } catch (refErr) {
                    // Invalid referrer URL, ignore
                }
            }
        }
    }

    // Inverted to return whether Volume Scroll is disabled, not enabled
    return !(enabled ?? settings.enableDefault);
}

const doVolumeScroll = function (e: WheelEvent): boolean {
    const isModifierKeyPressed = isHotkeyPressed(e, settings.modifierKey);

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
    // If the event target is an iframe, let the iframe's extension handle it (or relay it)
    if (e.target instanceof HTMLIFrameElement) {
        debug("Scroll target is an iframe, ignoring in this frame");
        return;
    }

    debug("Scrolled!");

    const isModifierKeyPressed = isHotkeyPressed(e, settings.modifierKey);
    debug(`Modifier key state: ${isModifierKeyPressed}, currently set to: ${settings.modifierKey}`);
    const isAltVolumeKeyPressed = isHotkeyPressed(e, settings.alternateVolumeIncrementHotkey);
    debug(`Alt volume key state: ${isAltVolumeKeyPressed}, currently set to: ${settings.alternateVolumeIncrementHotkey}`);

    // Check if we utilized the Right Mouse button as a modifier for this scroll
    if (settings.useModifierKey && settings.modifierKey === "Right Mouse" && isModifierKeyPressed) {
        preventContextMenu = true;
    }

    // If we are inside an iframe
    if (window.self !== window.top) {
        const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);

        // If the handler says this area should be ignored, then we respect that and allow default scrolling
        if (handler.isIgnored(elementsAtPoint)) {
            debug("Area is blacklisted by handler, allowing default scroll");
            return;
        }

        const localVideo = document.getElementsByTagName("video")[0];

        // If no video here, assume we are an overlay and shout to the parent
        if (!localVideo) {
            debug("In iframe without video, posting message to parent");
            if (!isDisabledOnSite()) {
                e.preventDefault();
                e.stopPropagation();
            }

            // "*" allows communication even if the iframe is cross-origin
            window.parent.postMessage({
                type: "VOLUME_SCROLL_RELAY",
                messageId: Math.random().toString(36).slice(2, 11),
                deltaY: e.deltaY,
                deltaMode: e.deltaMode,
                clientX: e.clientX,
                clientY: e.clientY,
                buttons: e.buttons,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey
            }, "*");

            return;
        }
    }

    // Check settings
    if (!doVolumeScroll(e)) return;

    // Check if we utilized the Right Mouse button as an alternate increment hotkey for this scroll
    if (settings.useAlternateVolumeIncrement && settings.alternateVolumeIncrementHotkey === "Right Mouse" && isAltVolumeKeyPressed) {
        preventContextMenu = true;
    }

    // Check if we utilized the Middle Mouse button for this scroll
    if (settings.useModifierKey && settings.modifierKey === "Middle Mouse" && isModifierKeyPressed) {
        preventMiddleClick = true;
    }
    if (settings.useAlternateVolumeIncrement && settings.alternateVolumeIncrementHotkey === "Middle Mouse" && isAltVolumeKeyPressed) {
        preventMiddleClick = true;
    }

    handler.scroll(e, body);
}

export function onMouseDown(e: MouseEvent): void {
    // If the event target is an iframe, let the iframe's extension handle it (or relay it)
    if (e.target instanceof HTMLIFrameElement) {
        debug("MouseDown target is an iframe, ignoring in this frame");
        return;
    }

    debug("Mouse down!");

    // Reset context menu prevention on new click.
    if (getMouseKey(e.button) === "Right Mouse") {
        preventContextMenu = false;
    }

    if (settings.toggleMuteKey === getMouseKey(e.button) && settings.useToggleMuteKey) {

        if (window.self !== window.top) {
            const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);

            // If the handler says this area should be ignored, then we respect that and allow default behavior
            if (handler.isIgnored(elementsAtPoint)) {
                debug("Area is blacklisted by handler, allowing default mute toggle behavior");
                return;
            }

            const localVideo = document.getElementsByTagName("video")[0];
            if (!localVideo) {
                debug("In iframe, relaying Mute Toggle to parent");
                e.preventDefault();
                e.stopPropagation();

                window.parent.postMessage({
                    type: "VOLUME_MUTE_RELAY",
                    messageId: Math.random().toString(36).slice(2, 11),
                    clientX: e.clientX,
                    clientY: e.clientY,
                    buttons: e.buttons,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    altKey: e.altKey,
                    metaKey: e.metaKey
                }, "*");
                return;
            }
        }

        e.preventDefault();
        const result: boolean = handler.toggleMute(e, body);

        debug("Toggle mute key pressed");

        if (getMouseKey(e.button) === "Right Mouse") {
            preventContextMenu = result;
        } else if (getMouseKey(e.button) === "Middle Mouse") {
            preventMiddleClick = result;
        }
    }

    if (settings.togglePauseKey === getMouseKey(e.button) && settings.useTogglePauseKey) {

        if (window.self !== window.top) {
            const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);

            // If the handler says this area should be ignored, then we respect that and allow default behavior
            if (handler.isIgnored(elementsAtPoint)) {
                debug("Area is blacklisted by handler, allowing default pause toggle behavior");
                return;
            }

            const localVideo = document.getElementsByTagName("video")[0];
            if (!localVideo) {
                debug("In iframe, relaying Pause Toggle to parent");
                e.preventDefault();
                e.stopPropagation();

                window.parent.postMessage({
                    type: "VOLUME_PAUSE_RELAY",
                    messageId: Math.random().toString(36).slice(2, 11),
                    clientX: e.clientX,
                    clientY: e.clientY,
                    buttons: e.buttons,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    altKey: e.altKey,
                    metaKey: e.metaKey
                }, "*");
                return;
            }
        }

        e.preventDefault();
        const result: boolean = handler.togglePause(e, body);

        debug("Toggle pause key pressed");

        if (getMouseKey(e.button) === "Right Mouse") {
            preventContextMenu = result;
        } else if (getMouseKey(e.button) === "Middle Mouse") {
            preventMiddleClick = result;
        }
    }
}

export function onMouseUp(e: MouseEvent): void {
    debug("Mouse up!");

    if (preventMiddleClick && getMouseKey(e.button) === "Middle Mouse") {
        debug("Mouseup blocked due to volume mute action");
        e.preventDefault();
        e.stopPropagation();
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
    handler.setDefaultVolume(body);
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

export function onAuxClick(e: MouseEvent): void {
    // If the flag was set during Mute actions, block the auxclick (middle click)
    if (preventMiddleClick && getMouseKey(e.button) === "Middle Mouse") {
        debug("Auxclick blocked due to volume mute action");
        e.preventDefault();
        e.stopPropagation();

        // Reset flag immediately after blocking
        preventMiddleClick = false;
        return;
    }
}