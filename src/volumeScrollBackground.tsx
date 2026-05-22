import browser from "webextension-polyfill";
import { defaultSettings, Settings, DomainSettings } from './types';

browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") { // First time install
        await browser.storage.sync.set({ settings: defaultSettings });
    } else if (details.reason === "update") { // Extension updated
        const syncData = await browser.storage.sync.get("settings");
        const localData = await browser.storage.local.get("settings");

        // Use sync settings if they exist, otherwise migrate from local
        const oldSettings: any = syncData.settings || localData.settings || {};

        if (oldSettings.domainList) {
            // Check if we need to migrate from Record<string, boolean> to Record<string, DomainSettings>
            const keys = Object.keys(oldSettings.domainList);
            if (keys.length > 0 && typeof oldSettings.domainList[keys[0]] === "boolean") {
                const newDomainList: Record<string, DomainSettings> = {};
                for (const key of keys) {
                    newDomainList[key] = {
                        enabled: oldSettings.domainList[key],
                        muted: oldSettings.startMutedDomainList?.[key]
                    };
                }
                oldSettings.domainList = newDomainList;
            }
            
            // Also merge any leftover startMutedDomainList keys that weren't in domainList
            if (oldSettings.startMutedDomainList) {
                for (const key of Object.keys(oldSettings.startMutedDomainList)) {
                    if (!oldSettings.domainList[key]) {
                        oldSettings.domainList[key] = {
                            muted: oldSettings.startMutedDomainList[key]
                        };
                    }
                }
            }
        }
        
        delete oldSettings.startMutedDomainList;

        const newSettings: Settings = {
            ...defaultSettings,      // Start with all new defaults
            ...oldSettings,          // Overwrite with any existing user settings
        };

        await browser.storage.sync.set({ settings: newSettings });
    }
});