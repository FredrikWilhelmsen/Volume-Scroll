import { defaultSettings } from './types';

browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.get({settings: defaultSettings})
        .then((result) => {
            browser.storage.local.set({settings: result.settings});
        });
});