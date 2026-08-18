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
import { defaultSettings, Settings, ExtensionData } from "./types";

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
            globalSettings: defaultSettings,
            domainOverrides: {},
            customRules: {},
            ignoredElements: {},
            lastVersionRead: browser.runtime.getManifest().version,
        };
        await browser.storage.sync.set({ extensionData: defaultData });
    } else if (details.reason === "update") {
        // Extension updated
        const syncData = await browser.storage.sync.get([
            "settings",
            "extensionData",
        ]);

        // If we already have extensionData, we don't need to migrate old settings
        if (syncData.extensionData) {
            const currentData = syncData.extensionData as ExtensionData;
            const newExtensionData: ExtensionData = {
                globalSettings: {
                    ...defaultSettings,
                    ...currentData.globalSettings,
                },
                domainOverrides: currentData.domainOverrides || {},
                customRules: currentData.customRules || {},
                ignoredElements: currentData.ignoredElements || {},
                lastVersionRead: currentData.lastVersionRead,
            };
            await browser.storage.sync.set({ extensionData: newExtensionData });
        } else {
            // Migrate from old format
            const oldSettings: any = syncData.settings || {};

            const domainOverrides: Record<string, Partial<Settings>> = {};

            if (oldSettings.domainList) {
                const keys = Object.keys(oldSettings.domainList);
                for (const key of keys) {
                    const override: Partial<Settings> = {};

                    // Handle the Record<string, DomainSettings> format
                    const domainSetting = oldSettings.domainList[key];
                    if (domainSetting.enabled !== undefined) {
                        override.enableDefault = domainSetting.enabled;
                    }
                    if (domainSetting.muted !== undefined) {
                        override.startMuted = domainSetting.muted;
                    }

                    domainOverrides[key] = override;
                }
            }

            // Clean up deprecated fields from the global settings object
            delete oldSettings.domainList;
            delete oldSettings.lastVersionRead; // Just in case it was in there

            const newExtensionData: ExtensionData = {
                globalSettings: {
                    ...defaultSettings,
                    ...oldSettings,
                },
                domainOverrides,
                customRules: {},
                ignoredElements: {},
                lastVersionRead: browser.runtime.getManifest().version,
            };

            await browser.storage.sync.set({ extensionData: newExtensionData });

            // Optionally clean up old storage keys to free space:
            await browser.storage.sync.remove("settings");
        }
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
