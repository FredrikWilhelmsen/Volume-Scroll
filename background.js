let defaultVolume = 20;
let defaultIncrement = 5;
let useDefaultVolume = false;
let useMousewheelVolume = true;
let defaultColor = "#ffffff"; //white
let defaultFontSize = 40;
let useOverlayMouse = true;
let defaultModifierKey = "Shift";
let useModifierKey = false;
let defaultBlacklist = [
  "music.youtube.com",
  "open.spotify.com"
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({volume: defaultVolume}, (data) => {
    chrome.storage.sync.set({volume: data.volume});
  });

  chrome.storage.sync.get({increment: defaultIncrement}, (data) => {
    chrome.storage.sync.set({increment: data.increment});
  });

  chrome.storage.sync.get({useDefaultVolume: useDefaultVolume}, (data) => {
    chrome.storage.sync.set({useDefaultVolume: data.useDefaultVolume});
  });

  chrome.storage.sync.get({useMousewheelVolume: useMousewheelVolume}, (data) => {
    chrome.storage.sync.set({useMousewheelVolume: data.useMousewheelVolume});
  });

  chrome.storage.sync.get({fontColor: defaultColor}, (data) => {
    chrome.storage.sync.set({fontColor: data.fontColor});
  });

  chrome.storage.sync.get({fontSize: defaultFontSize}, (data) => {
    chrome.storage.sync.set({fontSize: data.fontSize});
  });

  chrome.storage.sync.get({useOverlayMouse: useOverlayMouse}, (data) => {
    chrome.storage.sync.set({useOverlayMouse: data.useOverlayMouse});
  });

  chrome.storage.sync.get({useModifierKey: useModifierKey}, (data) => {
    chrome.storage.sync.set({useModifierKey: data.useModifierKey});
  });

  chrome.storage.sync.get({modifierKey: defaultModifierKey}, (data) => {
    chrome.storage.sync.set({modifierKey: data.modifierKey});
  });

  chrome.storage.sync.get({blacklist: defaultBlacklist}, (data) => {
    chrome.storage.sync.set({blacklist: data.blacklist});
  });
});
