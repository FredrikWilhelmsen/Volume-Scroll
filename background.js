let defaultVolume = 20;
let defaultIncrement = 5;
let useDefaultVolume = false;
let useMousewheelVolume = true;

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
});
