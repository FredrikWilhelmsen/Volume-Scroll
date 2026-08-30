/*
 * Volume Scroll - Scrollable volume for any video on the internet
 * Copyright (C) 2026  Fredrik Wilhelmsen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import browser from "webextension-polyfill";
import {
    defaultSettings,
    Settings,
    ExtensionData,
    defaultExtensionData,
} from "./types";

// Helper function to update action badge indicator for unread updates
async function updateExtensionBadge() {
    const syncData = await browser.storage.sync.get("extensionData");
    const data = syncData.extensionData as ExtensionData | undefined;
    const currentVersion = browser.runtime.getManifest().version;
    const action = browser.action || (browser as any).browserAction;

    if (!action) return;

    if (data && data.lastVersionRead !== currentVersion) {
        if (action.setBadgeText) {
            await action.setBadgeText({ text: "1" });
        }
        if (action.setBadgeBackgroundColor) {
            await action.setBadgeBackgroundColor({ color: "#3b82f6" });
        }
        if (action.setBadgeTextColor) {
            await action.setBadgeTextColor({ color: "#ffffff" });
        }
    } else {
        if (action.setBadgeText) {
            await action.setBadgeText({ text: "" });
        }
    }
}

browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
        // First time install
        const defaultData: ExtensionData = {
            ...defaultExtensionData,
            lastVersionRead: browser.runtime.getManifest().version,
        };
        await browser.storage.sync.set({ extensionData: defaultData });
    } else if (details.reason === "update") {
        // Extension updated
        const syncData = await browser.storage.sync.get("extensionData");

        const currentData = (syncData.extensionData ||
            {}) as Partial<ExtensionData>;
        let schemaVersion = currentData.schemaVersion || 0;

        let newExtensionData: ExtensionData = {
            ...defaultExtensionData,
            ...currentData,
            globalSettings: {
                ...defaultSettings,
                ...(currentData.globalSettings || {}),
            },
        };

        if (schemaVersion < 1) {
            schemaVersion = 1;
        }
        if (schemaVersion === 1) {
            const currentIgnored = newExtensionData.ignoredElements || {};
            const ytIgnored = currentIgnored["www.youtube.com"] || [];
            if (!ytIgnored.includes("yt-thumbnail-view-model")) {
                currentIgnored["www.youtube.com"] = [
                    ...ytIgnored,
                    "yt-thumbnail-view-model",
                ];
            }
            newExtensionData.ignoredElements = currentIgnored;
            schemaVersion = 2;
        }
        if (schemaVersion === 2) {
            const currentIgnored = {
                ...(newExtensionData.ignoredElements || {}),
            };
            const ytIgnored = [...(currentIgnored["www.youtube.com"] || [])];
            const youtubeDefaults = [
                "YT-MULTI-PAGE-MENU-SECTION-RENDERER",
                "YT-CONTEXTUAL-SHEET-LAYOUT",
                "YTD-LIVE-CHAT-FRAME",
                "YTD-GUIDE-RENDERER",
                ".ytSearchboxComponentSuggestionsContainerScrollable",
                ".ytd-popup-container",
                ".ytp-settings-menu",
                ".yt-live-chat-renderer",
            ];
            for (const item of youtubeDefaults) {
                if (!ytIgnored.includes(item)) {
                    ytIgnored.push(item);
                }
            }
            currentIgnored["www.youtube.com"] = ytIgnored;
            newExtensionData.ignoredElements = currentIgnored;
            schemaVersion = 3;
        }
        if (schemaVersion === 3) {
            const currentRules = { ...(newExtensionData.customRules || {}) };
            const ytMusicRules = currentRules["music.youtube.com"] || [];
            const hasRule = ytMusicRules.some(
                (rule) => rule.name === "YouTube Music Player",
            );
            if (!hasRule) {
                currentRules["music.youtube.com"] = [
                    ...ytMusicRules,
                    {
                        name: "YouTube Music Player",
                        videoQuerySelector: "video",
                        displayQuerySelector: "ytmusic-player",
                        scrollInteractibleQuerySelector: [
                            "ytmusic-player-bar",
                            "ytmusic-player",
                        ],
                    },
                ];
            }
            newExtensionData.customRules = currentRules;
            schemaVersion = 4;
        }
        if (schemaVersion === 4) {
            newExtensionData.customOverlays =
                newExtensionData.customOverlays || {};
            schemaVersion = 5;
        }

        newExtensionData.schemaVersion = schemaVersion;
        await browser.storage.sync.set({ extensionData: newExtensionData });
    }
    await updateExtensionBadge();
});

// Also update badge on startup and whenever storage changes
browser.runtime.onStartup?.addListener(() => {
    updateExtensionBadge();
});

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync" && changes.extensionData) {
        updateExtensionBadge();
    }
});

// Run check when background script initializes
updateExtensionBadge();
