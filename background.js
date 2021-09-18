importScripts('config.js')

const setDefaultSetting = (setting, defaultValue) => {
  chrome.storage.sync.get(setting, (data) => {
    if (data[setting] === undefined) {
      chrome.storage.sync.set({[setting]: defaultValue});
    }
  });
};

// Load initial settings from config
chrome.runtime.onInstalled.addListener(() => {
  setDefaultSetting('volume', config.defaultVolume);
  setDefaultSetting('increment',config.defaultIncrement);
  setDefaultSetting('useDefaultVolume', config.useDefaultVolume);
  setDefaultSetting('useMousewheelVolume', config.useMousewheelVolume);
  setDefaultSetting('fontColor', config.defaultColor);
  setDefaultSetting('fontSize', config.defaultFontSize);
  setDefaultSetting('useOverlayMouse', config.useOverlayMouse);
  setDefaultSetting('useModifierKey', config.useModifierKey);
  setDefaultSetting('modifierKey', config.defaultModifierKey);
  setDefaultSetting('blacklist', config.defaultBlacklist);
});
