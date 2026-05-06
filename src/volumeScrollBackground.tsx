import browser from "webextension-polyfill";
import { defaultSettings, Settings } from './types';

browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") { // First time install
        await browser.storage.sync.set({ settings: defaultSettings });
    } else if (details.reason === "update") { // Extension updated
        const syncData = await browser.storage.sync.get("settings");
        const localData = await browser.storage.local.get("settings");

        // Use sync settings if they exist, otherwise migrate from local
        const oldSettings: Settings | Object = syncData.settings || localData.settings || {};

        const newSettings: Settings = {
            ...defaultSettings,      // Start with all new defaults
            ...oldSettings,          // Overwrite with any existing user settings
        };

        await browser.storage.sync.set({ settings: newSettings });
    }
});