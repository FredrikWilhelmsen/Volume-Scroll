import browser from "webextension-polyfill";
import {
    isHotkeyPressed,
    getMouseKey,
    debug,
    setUtilSettings,
    getLogList,
    addLog,
    findScrollableParent,
    setManualMouse4Pressed,
    setManualMouse5Pressed,
} from "./utils";

import { Settings, defaultSettings, ExtensionData } from "./types";

import { DefaultHandler } from "./handlers/Default";
import { YoutubeHandler } from "./handlers/Youtube";
import { YTMusicHandler } from "./handlers/YTMusic";
import { TwitchHandler } from "./handlers/Twitch";
import { RedditHandler } from "./handlers/Reddit";

const handlers: DefaultHandler[] = [
    new YoutubeHandler(),
    new YTMusicHandler(),
    new TwitchHandler(),
    new RedditHandler(),
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
};

const handler: DefaultHandler = getHandler();
const body: HTMLElement =
    document.documentElement ||
    document.body ||
    document.getElementsByTagName("body")[0];
let settings: Settings = defaultSettings;

let mouseX: number = 0;
let mouseY: number = 0;
let preventContextMenu: boolean = false;
let preventMiddleClick: boolean = false;
let preventLeftClick: boolean = false;
let preventMouse4Click: boolean = false;
let preventMouse5Click: boolean = false;
let isInitialized: boolean = false;
let listenersBound: boolean = false;
let lastActionTime: number = 0;
const processedMessageIds = new Set<string>();

let parentDisabledState: boolean = false;
let parentHasVideoState: boolean = false;

export function bindListeners(): void {
    if (listenersBound) return;
    debug("Binding event listeners...");
    window.addEventListener("wheel", onScroll, {
        passive: false,
        capture: true,
    });
    window.addEventListener("mousedown", onMouseDown, {
        passive: false,
        capture: true,
    });
    window.addEventListener("pointerdown", onMouseDown, {
        passive: false,
        capture: true,
    });
    window.addEventListener("mouseup", onMouseUp, {
        passive: false,
        capture: true,
    });
    window.addEventListener("pointerup", onMouseUp, {
        passive: false,
        capture: true,
    });
    window.addEventListener("mousemove", onMouseMove, { capture: true });
    window.addEventListener("contextmenu", onContextMenu, { capture: true });
    window.addEventListener("auxclick", onAuxClick, { capture: true });
    window.addEventListener("click", onClick, { capture: true });
    listenersBound = true;
}

export function unbindListeners(): void {
    if (!listenersBound) return;
    debug("Unbinding event listeners...");
    window.removeEventListener("wheel", onScroll, { capture: true });
    window.removeEventListener("mousedown", onMouseDown, { capture: true });
    window.removeEventListener("pointerdown", onMouseDown, { capture: true });
    window.removeEventListener("mouseup", onMouseUp, { capture: true });
    window.removeEventListener("pointerup", onMouseUp, { capture: true });
    window.removeEventListener("mousemove", onMouseMove, { capture: true });
    window.removeEventListener("contextmenu", onContextMenu, { capture: true });
    window.removeEventListener("auxclick", onAuxClick, { capture: true });
    window.removeEventListener("click", onClick, { capture: true });
    listenersBound = false;
}

export function updateListenerState(): void {
    const disabled = isDisabledOnSite();
    debug(
        `Updating listener state. isDisabledOnSite: ${disabled}, listenersBound: ${listenersBound}`,
    );
    if (disabled) {
        document.documentElement.setAttribute("data-volume-scroll-disabled", "true");
        unbindListeners();
    } else {
        document.documentElement.removeAttribute("data-volume-scroll-disabled");
        bindListeners();
    }
}

const isInteractiveElement = (el: HTMLElement | null): boolean => {
    while (el) {
        const tagName = el.tagName;
        if (
            tagName === "A" ||
            tagName === "BUTTON" ||
            tagName === "INPUT" ||
            tagName === "TEXTAREA" ||
            tagName === "SELECT"
        ) {
            return true;
        }
        const role = el.getAttribute("role");
        if (
            role === "button" ||
            role === "link" ||
            role === "checkbox" ||
            role === "radio"
        ) {
            return true;
        }
        try {
            if (window.getComputedStyle(el).cursor === "pointer") {
                return true;
            }
        } catch (e) {
            // Ignore potential security/style access issues
        }
        el = el.parentElement;
    }
    return false;
};

const getActiveHostname = (): string => {
    if (window.self !== window.top) {
        try {
            if (window.top?.location.hostname) {
                return window.top.location.hostname.toLowerCase();
            }
        } catch (e) {
            if (document.referrer) {
                try {
                    return new URL(document.referrer).hostname.toLowerCase();
                } catch (refErr) {
                    // Invalid referrer URL
                }
            }
        }
    }
    return window.location.hostname.toLowerCase();
};

export const init = () => {
    if (isInitialized) return;
    isInitialized = true;
    browser.storage.sync.get("extensionData").then((result) => {
        const data: ExtensionData = (result.extensionData as ExtensionData) || {
            globalSettings: defaultSettings,
            domainOverrides: {},
            lastVersionRead: "0.0.0",
        };
        const overrides = data.domainOverrides[getActiveHostname()];
        settings = { ...data.globalSettings, ...(overrides || {}) };

        setUtilSettings(settings);
        debug("Settings loaded: ", settings);
        handler.updateSettings(settings);

        window.addEventListener("message", (event) => {
            if (!event.data) return;

            if (
                event.data.type === "VOLUME_SCROLL_IFRAME_PING" &&
                event.source
            ) {
                (event.source as Window).postMessage(
                    {
                        type: "VOLUME_SCROLL_IFRAME_PONG",
                        parentDisabled: isDisabledOnSite(),
                        parentHasVideo:
                            document.getElementsByTagName("video").length > 0,
                    },
                    "*",
                );
                return;
            }

            if (
                event.data.type === "VOLUME_SCROLL_IFRAME_PONG" ||
                event.data.type === "VOLUME_SCROLL_PARENT_STATUS"
            ) {
                parentDisabledState = event.data.parentDisabled;
                parentHasVideoState = event.data.parentHasVideo;
                updateListenerState();
                return;
            }

            const isRelayMessage =
                event.data.type === "VOLUME_SCROLL_RELAY" ||
                event.data.type === "VOLUME_MUTE_RELAY" ||
                event.data.type === "VOLUME_PAUSE_RELAY";

            if (isRelayMessage) {
                if (event.data.messageId) {
                    if (processedMessageIds.has(event.data.messageId)) return;
                    processedMessageIds.add(event.data.messageId);
                    setTimeout(
                        () => processedMessageIds.delete(event.data.messageId),
                        1000,
                    );
                }

                let x =
                    event.data.clientX !== undefined
                        ? event.data.clientX
                        : mouseX;
                let y =
                    event.data.clientY !== undefined
                        ? event.data.clientY
                        : mouseY;

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
                        preventDefault: () => {},
                        stopPropagation: () => {},
                        stopImmediatePropagation: () => {},
                    } as any as WheelEvent;

                    handled = handler.scroll(syntheticEvent, body);
                }

                if (event.data.type === "VOLUME_MUTE_RELAY") {
                    // Construct synthetic event
                    const syntheticEvent = {
                        clientX: x,
                        clientY: y,
                        button: event.data.button,
                        buttons: event.data.buttons,
                        ctrlKey: event.data.ctrlKey,
                        shiftKey: event.data.shiftKey,
                        altKey: event.data.altKey,
                        metaKey: event.data.metaKey,
                        preventDefault: () => {},
                        stopPropagation: () => {},
                        stopImmediatePropagation: () => {},
                    } as any as MouseEvent;

                    handled = handler.toggleMute(syntheticEvent, body);
                }

                if (event.data.type === "VOLUME_PAUSE_RELAY") {
                    // Construct synthetic event
                    const syntheticEvent = {
                        clientX: x,
                        clientY: y,
                        button: event.data.button,
                        buttons: event.data.buttons,
                        ctrlKey: event.data.ctrlKey,
                        shiftKey: event.data.shiftKey,
                        altKey: event.data.altKey,
                        metaKey: event.data.metaKey,
                        preventDefault: () => {},
                        stopPropagation: () => {},
                        stopImmediatePropagation: () => {},
                    } as any as MouseEvent;

                    handled = handler.togglePause(syntheticEvent, body);
                }

                if (handled) {
                    lastActionTime = Date.now();
                    const button =
                        event.data.button !== undefined
                            ? event.data.button
                            : event.data.buttons & 2
                              ? 2
                              : event.data.buttons & 4
                                ? 1
                                : event.data.buttons & 1
                                  ? 0
                                  : -1;
                    if (button !== -1) {
                        const mouseKey = getMouseKey(button);
                        if (mouseKey === "Right Mouse")
                            preventContextMenu = true;
                        else if (mouseKey === "Middle Mouse")
                            preventMiddleClick = true;
                        else if (mouseKey === "Left Mouse")
                            preventLeftClick = true;
                        else if (mouseKey === "Mouse 4")
                            preventMouse4Click = true;
                        else if (mouseKey === "Mouse 5")
                            preventMouse5Click = true;
                    } else if (event.data.type === "VOLUME_SCROLL_RELAY") {
                        // For scroll, we might only have buttons bitmask
                        if (event.data.buttons & 2) preventContextMenu = true;
                        if (event.data.buttons & 4) preventMiddleClick = true;
                        if (event.data.buttons & 1) preventLeftClick = true;
                        if (event.data.buttons & 8) preventMouse4Click = true;
                        if (event.data.buttons & 16) preventMouse5Click = true;
                    }
                }

                if (!handled && !isTop) {
                    // Relay it to the next parent
                    debug(`Relaying ${event.data.type} up to parent`);
                    const relayData = {
                        ...event.data,
                        clientX: x,
                        clientY: y,
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

        if (window.self !== window.top) {
            window.parent.postMessage(
                { type: "VOLUME_SCROLL_IFRAME_PING" },
                "*",
            );
        } else {
            broadcastStatusToIframes();

            const videoObserver = new MutationObserver(() => {
                broadcastStatusToIframes();
            });
            videoObserver.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true,
            });
        }

        // Sync the listener registration state based on whether site is enabled/disabled
        updateListenerState();
    });
};

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;
    if (!changes.extensionData) return;

    const data: ExtensionData = changes.extensionData.newValue as ExtensionData;
    const overrides = data.domainOverrides[getActiveHostname()];
    settings = { ...data.globalSettings, ...(overrides || {}) };

    setUtilSettings(settings);
    handler.updateSettings(settings);
    debug("Settings reapplied: ", settings);

    updateListenerState();

    if (window.self === window.top) {
        broadcastStatusToIframes();
    }
});

browser.runtime.onMessage.addListener((message: any) => {
    if (message.type === "GET_DEBUG_LOGS") {
        // Only the top-level frame should respond to avoid multiple conflicting responses
        if (window.top !== window.self) return;

        debug("Received GET_DEBUG_LOGS message");
        const debugData = {
            settings: settings,
            logs: getLogList(),
        };

        return Promise.resolve(debugData);
    }
});

const isFullscreen = function (): boolean {
    return document.fullscreenElement != null;
};

const isDisabledOnSite = function (): boolean {
    if (window.self !== window.top && parentDisabledState) {
        return true;
    }

    // Inverted to return whether Volume Scroll is disabled, not enabled
    return !settings.enableDefault;
};

export function broadcastStatusToIframes(): void {
    const iframes = document.getElementsByTagName("iframe");
    const hasVideo = document.getElementsByTagName("video").length > 0;
    const disabled = isDisabledOnSite();
    for (let i = 0; i < iframes.length; i++) {
        try {
            iframes[i].contentWindow?.postMessage(
                {
                    type: "VOLUME_SCROLL_PARENT_STATUS",
                    parentDisabled: disabled,
                    parentHasVideo: hasVideo,
                },
                "*",
            );
        } catch (e) {
            // Ignore cross-origin errors
        }
    }
}

const doVolumeScroll = function (e: WheelEvent): boolean {
    const isModifierKeyPressed = isHotkeyPressed(e, settings.modifierKey);

    switch (true) {
        case isDisabledOnSite(): // Domain is disabled
        case !settings.useMouseWheelVolume: // Volume Scroll is disabled
        case settings.useModifierKey &&
            !settings.invertModifierKey &&
            !isModifierKeyPressed: // Modifier key is enabled and not inverted, key is not held down
        case settings.useModifierKey &&
            settings.invertModifierKey &&
            isModifierKeyPressed: // Modifier key is enabled, but inverted, key is held down
        case settings.fullscreenOnly && !isFullscreen(): // Fullscreen only mode is enabled, and there are no fullscreen elements
            return false;
        default:
            return true;
    }
};

export function onScroll(e: WheelEvent): void {
    // If the event target is an iframe, let the iframe's extension handle it (or relay it)
    if (e.target instanceof HTMLIFrameElement) {
        debug("Scroll target is an iframe, ignoring in this frame");
        return;
    }

    debug("Scrolled!");

    const isModifierKeyPressed = isHotkeyPressed(e, settings.modifierKey);
    debug(
        `Modifier key state: ${isModifierKeyPressed}, currently set to: ${settings.modifierKey}`,
    );
    const isAltVolumeKeyPressed = isHotkeyPressed(
        e,
        settings.alternateVolumeIncrementHotkey,
    );
    debug(
        `Alt volume key state: ${isAltVolumeKeyPressed}, currently set to: ${settings.alternateVolumeIncrementHotkey}`,
    );

    // Check if we utilized the Right Mouse button as a modifier for this scroll
    if (
        settings.useModifierKey &&
        settings.modifierKey === "Right Mouse" &&
        isModifierKeyPressed
    ) {
        preventContextMenu = true;
    }
    if (
        settings.useModifierKey &&
        settings.modifierKey === "Left Mouse" &&
        isModifierKeyPressed
    ) {
        preventLeftClick = true;
    }
    if (
        settings.useModifierKey &&
        settings.modifierKey === "Mouse 4" &&
        isModifierKeyPressed
    ) {
        preventMouse4Click = true;
    }
    if (
        settings.useModifierKey &&
        settings.modifierKey === "Mouse 5" &&
        isModifierKeyPressed
    ) {
        preventMouse5Click = true;
    }

    // If we are inside an iframe
    if (window.self !== window.top) {
        const elementsAtPoint = document.elementsFromPoint(
            e.clientX,
            e.clientY,
        );

        // If the handler says this area should be ignored, then we respect that and allow default scrolling
        if (handler.isIgnored(elementsAtPoint)) {
            debug("Area is blacklisted by handler, allowing default scroll");
            return;
        }

        const localVideo = document.getElementsByTagName("video")[0];

        // If no video here, assume we are an overlay and shout to the parent
        if (!localVideo) {
            if (parentDisabledState || !parentHasVideoState) {
                return;
            }

            if (doVolumeScroll(e)) {
                debug("In iframe without video, posting message to parent");
                const scrollableParent = findScrollableParent(
                    e.target as HTMLElement,
                );
                if (!scrollableParent) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                // "*" allows communication even if the iframe is cross-origin
                window.parent.postMessage(
                    {
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
                        metaKey: e.metaKey,
                    },
                    "*",
                );
            } else {
                // If a modifier key that is set to Inverted is being used,
                // the user likely wants to scroll the page normally (vertically),
                // but Shift/Ctrl would normally trigger horizontal scroll or zoom.
                const isShiftInverted =
                    settings.useModifierKey &&
                    settings.invertModifierKey &&
                    settings.modifierKey === "Shift" &&
                    e.shiftKey;
                const isCtrlInverted =
                    settings.useModifierKey &&
                    settings.invertModifierKey &&
                    settings.modifierKey === "Control" &&
                    e.ctrlKey;

                if (isShiftInverted || isCtrlInverted) {
                    e.preventDefault();
                    e.stopPropagation();

                    let delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
                    if (e.deltaMode === 1) delta *= 33.3;
                    else if (e.deltaMode === 2) delta *= 333;

                    const scrollTarget =
                        findScrollableParent(e.target as HTMLElement) ||
                        document.scrollingElement ||
                        document.documentElement;
                    scrollTarget.scrollBy({ top: delta, behavior: "auto" });
                }
            }

            return;
        }
    }

    // Check settings
    if (!doVolumeScroll(e)) {
        // If a modifier key that is set to Inverted is being used,
        // the user likely wants to scroll the page normally (vertically),
        // but Shift/Ctrl would normally trigger horizontal scroll or zoom.
        const isShiftInverted =
            settings.useModifierKey &&
            settings.invertModifierKey &&
            settings.modifierKey === "Shift" &&
            e.shiftKey;
        const isCtrlInverted =
            settings.useModifierKey &&
            settings.invertModifierKey &&
            settings.modifierKey === "Control" &&
            e.ctrlKey;

        if (isShiftInverted || isCtrlInverted) {
            e.preventDefault();
            e.stopPropagation();

            let delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
            if (e.deltaMode === 1) delta *= 33.3;
            else if (e.deltaMode === 2) delta *= 333;

            const scrollTarget =
                findScrollableParent(e.target as HTMLElement) ||
                document.scrollingElement ||
                document.documentElement;
            scrollTarget.scrollBy({ top: delta, behavior: "auto" });
        }
        return;
    }

    // Prevent default browser behavior for Shift (horizontal scroll) or Control (zoom)
    // if they are being used as trigger keys.
    const isShiftTrigger =
        (settings.useModifierKey &&
            settings.modifierKey === "Shift" &&
            e.shiftKey) ||
        (settings.useAlternateVolumeIncrement &&
            settings.alternateVolumeIncrementHotkey === "Shift" &&
            isAltVolumeKeyPressed);
    const isCtrlTrigger =
        (settings.useModifierKey &&
            settings.modifierKey === "Control" &&
            e.ctrlKey) ||
        (settings.useAlternateVolumeIncrement &&
            settings.alternateVolumeIncrementHotkey === "Control" &&
            isAltVolumeKeyPressed);

    if (isShiftTrigger || isCtrlTrigger) {
        debug(
            `Blocking browser default for ${isShiftTrigger ? "Shift" : "Control"} trigger`,
        );
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }

    // Check if we utilized the Right Mouse button as an alternate increment hotkey for this scroll
    if (
        settings.useAlternateVolumeIncrement &&
        settings.alternateVolumeIncrementHotkey === "Right Mouse" &&
        isAltVolumeKeyPressed
    ) {
        preventContextMenu = true;
    }
    if (
        settings.useAlternateVolumeIncrement &&
        settings.alternateVolumeIncrementHotkey === "Left Mouse" &&
        isAltVolumeKeyPressed
    ) {
        preventLeftClick = true;
    }
    if (
        settings.useAlternateVolumeIncrement &&
        settings.alternateVolumeIncrementHotkey === "Mouse 4" &&
        isAltVolumeKeyPressed
    ) {
        preventMouse4Click = true;
    }
    if (
        settings.useAlternateVolumeIncrement &&
        settings.alternateVolumeIncrementHotkey === "Mouse 5" &&
        isAltVolumeKeyPressed
    ) {
        preventMouse5Click = true;
    }

    // Check if we utilized the Middle Mouse button for this scroll
    if (
        settings.useModifierKey &&
        settings.modifierKey === "Middle Mouse" &&
        isModifierKeyPressed
    ) {
        preventMiddleClick = true;
    }
    if (
        settings.useAlternateVolumeIncrement &&
        settings.alternateVolumeIncrementHotkey === "Middle Mouse" &&
        isAltVolumeKeyPressed
    ) {
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

    if (Date.now() - lastActionTime < 50) {
        if (getMouseKey(e.button) === "Left Mouse" && preventLeftClick) {
            e.preventDefault();
            e.stopPropagation();
        } else if (
            getMouseKey(e.button) === "Middle Mouse" &&
            preventMiddleClick
        ) {
            e.preventDefault();
            e.stopPropagation();
        } else if (
            getMouseKey(e.button) === "Right Mouse" &&
            preventContextMenu
        ) {
            e.preventDefault();
            e.stopPropagation();
        } else if (getMouseKey(e.button) === "Mouse 4" && preventMouse4Click) {
            e.preventDefault();
            e.stopPropagation();
        } else if (getMouseKey(e.button) === "Mouse 5" && preventMouse5Click) {
            e.preventDefault();
            e.stopPropagation();
        }
        return;
    }

    debug("Mouse down!");

    const currentMouseKey = getMouseKey(e.button);
    if (currentMouseKey === "Mouse 4") setManualMouse4Pressed(true);
    if (currentMouseKey === "Mouse 5") setManualMouse5Pressed(true);

    // Reset flags on new click.
    if (getMouseKey(e.button) === "Right Mouse") {
        preventContextMenu = false;
    } else if (getMouseKey(e.button) === "Middle Mouse") {
        preventMiddleClick = false;
    } else if (getMouseKey(e.button) === "Left Mouse") {
        preventLeftClick = false;
    } else if (getMouseKey(e.button) === "Mouse 4") {
        preventMouse4Click = false;
    } else if (getMouseKey(e.button) === "Mouse 5") {
        preventMouse5Click = false;
    }

    if (isDisabledOnSite() || (settings.fullscreenOnly && !isFullscreen())) {
        return;
    }

    if (currentMouseKey === "Mouse 4" || currentMouseKey === "Mouse 5") {
        const isModifier =
            settings.useModifierKey && settings.modifierKey === currentMouseKey;
        const isAlt =
            settings.useAlternateVolumeIncrement &&
            settings.alternateVolumeIncrementHotkey === currentMouseKey;
        const isMute =
            settings.useToggleMuteKey &&
            settings.toggleMuteKey === currentMouseKey;
        const isPause =
            settings.useTogglePauseKey &&
            settings.togglePauseKey === currentMouseKey;

        // Unconditionally block mousedown for these to prevent browser navigation gestures starting
        // and set the flag to block mouseup so the gesture doesn't complete.
        if (isModifier || isAlt || isMute || isPause) {
            e.preventDefault();
            if (currentMouseKey === "Mouse 4") preventMouse4Click = true;
            if (currentMouseKey === "Mouse 5") preventMouse5Click = true;
        }
    }

    let handled = false;

    if (
        settings.toggleMuteKey === getMouseKey(e.button) &&
        settings.useToggleMuteKey
    ) {
        if (window.self !== window.top) {
            const elementsAtPoint = document.elementsFromPoint(
                e.clientX,
                e.clientY,
            );

            // If the handler says this area should be ignored, then we respect that and allow default behavior
            if (handler.isIgnored(elementsAtPoint)) {
                debug(
                    "Area is blacklisted by handler, allowing default mute toggle behavior",
                );
                return;
            }

            const localVideo = document.getElementsByTagName("video")[0];
            if (!localVideo) {
                if (
                    parentDisabledState ||
                    !parentHasVideoState ||
                    isInteractiveElement(e.target as HTMLElement | null)
                ) {
                    return;
                }

                debug("In iframe, relaying Mute Toggle to parent");
                e.preventDefault();
                e.stopPropagation();

                window.parent.postMessage(
                    {
                        type: "VOLUME_MUTE_RELAY",
                        messageId: Math.random().toString(36).slice(2, 11),
                        clientX: e.clientX,
                        clientY: e.clientY,
                        button: e.button,
                        buttons: e.buttons,
                        ctrlKey: e.ctrlKey,
                        shiftKey: e.shiftKey,
                        altKey: e.altKey,
                        metaKey: e.metaKey,
                    },
                    "*",
                );

                if (getMouseKey(e.button) === "Right Mouse") {
                    preventContextMenu = true;
                } else if (getMouseKey(e.button) === "Middle Mouse") {
                    preventMiddleClick = true;
                } else if (getMouseKey(e.button) === "Left Mouse") {
                    preventLeftClick = true;
                } else if (getMouseKey(e.button) === "Mouse 4") {
                    preventMouse4Click = true;
                } else if (getMouseKey(e.button) === "Mouse 5") {
                    preventMouse5Click = true;
                }
                return;
            }
        }

        e.preventDefault();
        const result: boolean = handler.toggleMute(e, body);

        debug("Toggle mute key pressed");

        if (result) {
            handled = true;
            e.stopPropagation();
            lastActionTime = Date.now();

            if (getMouseKey(e.button) === "Right Mouse") {
                preventContextMenu = true;
            } else if (getMouseKey(e.button) === "Middle Mouse") {
                preventMiddleClick = true;
            } else if (getMouseKey(e.button) === "Left Mouse") {
                preventLeftClick = true;
            } else if (getMouseKey(e.button) === "Mouse 4") {
                preventMouse4Click = true;
            } else if (getMouseKey(e.button) === "Mouse 5") {
                preventMouse5Click = true;
            }
        }
    }

    if (
        !handled &&
        settings.togglePauseKey === getMouseKey(e.button) &&
        settings.useTogglePauseKey
    ) {
        if (window.self !== window.top) {
            const elementsAtPoint = document.elementsFromPoint(
                e.clientX,
                e.clientY,
            );

            // If the handler says this area should be ignored, then we respect that and allow default behavior
            if (handler.isIgnored(elementsAtPoint)) {
                debug(
                    "Area is blacklisted by handler, allowing default pause toggle behavior",
                );
                return;
            }

            const localVideo = document.getElementsByTagName("video")[0];
            if (!localVideo) {
                if (
                    parentDisabledState ||
                    !parentHasVideoState ||
                    isInteractiveElement(e.target as HTMLElement | null)
                ) {
                    return;
                }

                debug("In iframe, relaying Pause Toggle to parent");
                e.preventDefault();
                e.stopPropagation();

                window.parent.postMessage(
                    {
                        type: "VOLUME_PAUSE_RELAY",
                        messageId: Math.random().toString(36).slice(2, 11),
                        clientX: e.clientX,
                        clientY: e.clientY,
                        button: e.button,
                        buttons: e.buttons,
                        ctrlKey: e.ctrlKey,
                        shiftKey: e.shiftKey,
                        altKey: e.altKey,
                        metaKey: e.metaKey,
                    },
                    "*",
                );

                if (getMouseKey(e.button) === "Right Mouse") {
                    preventContextMenu = true;
                } else if (getMouseKey(e.button) === "Middle Mouse") {
                    preventMiddleClick = true;
                } else if (getMouseKey(e.button) === "Left Mouse") {
                    preventLeftClick = true;
                } else if (getMouseKey(e.button) === "Mouse 4") {
                    preventMouse4Click = true;
                } else if (getMouseKey(e.button) === "Mouse 5") {
                    preventMouse5Click = true;
                }
                return;
            }
        }

        e.preventDefault();
        const result: boolean = handler.togglePause(e, body);

        debug("Toggle pause key pressed");

        if (result) {
            handled = true;
            e.stopPropagation();
            lastActionTime = Date.now();

            if (getMouseKey(e.button) === "Right Mouse") {
                preventContextMenu = true;
            } else if (getMouseKey(e.button) === "Middle Mouse") {
                preventMiddleClick = true;
            } else if (getMouseKey(e.button) === "Left Mouse") {
                preventLeftClick = true;
            } else if (getMouseKey(e.button) === "Mouse 4") {
                preventMouse4Click = true;
            } else if (getMouseKey(e.button) === "Mouse 5") {
                preventMouse5Click = true;
            }
        }
    }
}

export function onMouseUp(e: MouseEvent): void {
    debug("Mouse up!");

    const currentMouseKey = getMouseKey(e.button);
    if (currentMouseKey === "Mouse 4") setManualMouse4Pressed(false);
    if (currentMouseKey === "Mouse 5") setManualMouse5Pressed(false);

    if (preventMiddleClick && getMouseKey(e.button) === "Middle Mouse") {
        debug("Mouseup blocked due to volume action");
        e.preventDefault();
        e.stopPropagation();
    } else if (preventLeftClick && getMouseKey(e.button) === "Left Mouse") {
        debug("Mouseup blocked due to volume action");
        e.preventDefault();
        e.stopPropagation();
    } else if (preventContextMenu && getMouseKey(e.button) === "Right Mouse") {
        debug("Mouseup blocked due to volume action");
        e.preventDefault();
        e.stopPropagation();
    } else if (preventMouse4Click && getMouseKey(e.button) === "Mouse 4") {
        debug("Mouseup blocked due to volume action");
        e.preventDefault();
        e.stopPropagation();
    } else if (preventMouse5Click && getMouseKey(e.button) === "Mouse 5") {
        debug("Mouseup blocked due to volume action");
        e.preventDefault();
        e.stopPropagation();
    }
}

export function onClick(e: MouseEvent): void {
    if (preventLeftClick && getMouseKey(e.button) === "Left Mouse") {
        debug("Click blocked due to volume action");
        e.preventDefault();
        e.stopPropagation();

        // Reset flag immediately after blocking
        preventLeftClick = false;
        return;
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
        e.stopImmediatePropagation();

        // Reset flag immediately after blocking
        preventContextMenu = false;
        return;
    }
}

export function onAuxClick(e: MouseEvent): void {
    // If the flag was set during Mute actions, block the auxclick (middle click, mouse 4, mouse 5)
    if (preventMiddleClick && getMouseKey(e.button) === "Middle Mouse") {
        debug("Auxclick blocked due to volume mute action");
        e.preventDefault();
        e.stopPropagation();

        // Reset flag immediately after blocking
        preventMiddleClick = false;
        return;
    }
    if (preventMouse4Click && getMouseKey(e.button) === "Mouse 4") {
        debug("Auxclick blocked due to volume mute action");
        e.preventDefault();
        e.stopPropagation();

        preventMouse4Click = false;
        return;
    }
    if (preventMouse5Click && getMouseKey(e.button) === "Mouse 5") {
        debug("Auxclick blocked due to volume mute action");
        e.preventDefault();
        e.stopPropagation();

        preventMouse5Click = false;
        return;
    }
}
