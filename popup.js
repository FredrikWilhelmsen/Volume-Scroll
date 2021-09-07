document.getElementById("useMousewheelVolume").addEventListener("change", function(){
  //Mousewheel control toggle
  let input = document.getElementById("useMousewheelVolume");
  document.getElementById("defaultIncrementSlider").disabled = !input.checked;
  document.getElementById("overlayFontSizeSlider").disabled = !input.checked;
  document.getElementById("overlayColorInput").disabled = !input.checked;

  chrome.storage.sync.set({useMousewheelVolume: input.checked});
});

document.getElementById("defaultIncrementSlider").addEventListener("change", function(){
  //Increment range input
  let input = document.getElementById("defaultIncrementSlider");

  document.querySelector("#mousewheelVolumeWrapper .valueDisplay").innerHTML = input.value;

  chrome.storage.sync.set({increment: input.value});
});

document.getElementById("overlayFontSizeSlider").addEventListener("change", function(){
  //Font size range input
  let input = document.getElementById("overlayFontSizeSlider");

  document.querySelector("#overlayFontSizeWrapper .valueDisplay").innerHTML = input.value;

  chrome.storage.sync.set({fontSize: input.value});
});

document.getElementById("overlayColorInput").addEventListener("change", function(){
  //Overlay color input
  let input = document.getElementById("overlayColorInput");
  chrome.storage.sync.set({fontColor: input.value});
});

document.getElementById("useDefaultVolume").addEventListener("change", function(){
  //Default Volume Toggle
  let input = document.getElementById("useDefaultVolume");
  document.getElementById("defaultVolumeSlider").disabled = !input.checked;

  chrome.storage.sync.set({useDefaultVolume: input.checked});
});

document.getElementById("defaultVolumeSlider").addEventListener("change", function(){
  //Defult volume range input
  let input = document.getElementById("defaultVolumeSlider");

  document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = input.value;

  chrome.storage.sync.set({volume: input.value});
})

let loadSettings = function(){
  chrome.storage.sync.get("useMousewheelVolume", (data) => {
    document.getElementById("useMousewheelVolume").checked = data.useMousewheelVolume;

    document.getElementById("defaultIncrementSlider").disabled = !data.useMousewheelVolume;
  });

  chrome.storage.sync.get("increment", (data) => {
    document.getElementById("defaultIncrementSlider").value = data.increment;

    document.querySelector("#mousewheelVolumeWrapper .valueDisplay").innerHTML = data.increment;
  });

  chrome.storage.sync.get("fontSize", (data) => {
    document.getElementById("overlayFontSizeSlider").value = data.fontSize;

    document.querySelector("#overlayFontSizeWrapper .valueDisplay").innerHTML = data.fontSize;
  });

  chrome.storage.sync.get("fontColor", (data) => {
    document.getElementById("overlayColorInput").value = data.fontColor;
  });

  chrome.storage.sync.get("useDefaultVolume", (data) => {
    document.getElementById("useDefaultVolume").checked = data.useDefaultVolume;

    document.getElementById("defaultVolumeSlider").disabled = !data.useDefaultVolume;
  });

  chrome.storage.sync.get("volume", (data) => {
    document.getElementById("defaultVolumeSlider").value = data.volume;
    document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = data.volume;
  });
}

loadSettings();
