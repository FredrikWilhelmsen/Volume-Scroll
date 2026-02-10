import browser from "webextension-polyfill";
import { defaultSettings, Settings } from './types';

browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") { // First time install
        await browser.storage.local.set({ settings: defaultSettings });
    } else if (details.reason === "update") { // Extension updated
        const data = await browser.storage.local.get("settings");
        const oldSettings: Settings | Object = data.settings || {};

        const newSettings: Settings = {
            ...defaultSettings,      // Start with all new defaults
            ...oldSettings,          // Overwrite with any existing user settings
        };

        await browser.storage.local.set({ settings: newSettings });
    }
});