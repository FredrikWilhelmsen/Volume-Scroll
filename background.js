const defaultSettings {
  defaultVolume = 20,
  defaultIncrement = 5,
  useDefaultVolume = false,
  useMousewheelVolume = true,
  defaultColor = "#ffffff", //white
  defaultFontSize = 40,
  useOverlayMouse = true,
  defaultModifierKey = "Shift",
  useModifierKey = false,
  defaultBlacklist = [
    "music.youtube.com",
    "open.spotify.com"
  ]
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({userSettings: defaultVolume}, result => {
    chrome.storage.sync.set({userSettings: data.userSettings});
  });
});
