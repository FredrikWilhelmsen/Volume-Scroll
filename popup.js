document.getElementById("useMousewheelVolume").addEventListener("change", function(){
  //Mousewheel control toggle
  let input = document.getElementById("useMousewheelVolume");

  document.getElementById("incrementSlider").disabled = !input.checked;
  document.getElementById("overlayFontSizeSlider").disabled = !input.checked;
  document.getElementById("overlayColorInput").disabled = !input.checked;
  document.getElementById("useModifierKey").disabled = !input.checked;

  chrome.storage.sync.set({useMousewheelVolume: input.checked});
});

document.getElementById("incrementSlider").addEventListener("change", function(){
  //Increment range input
  let input = document.getElementById("incrementSlider");

  document.querySelector("#mousewheelVolumeWrapper .valueDisplay").innerHTML = input.value;

  chrome.storage.sync.set({increment: input.value});

  let defaultVolumeInput = document.getElementById("defaultVolumeSlider");
  defaultVolumeInput.step = input.value;

  let volume = defaultVolumeInput.value;
  volume = volume / input.value;
  volume = Math.round(volume);
  volume = volume * input.value;
  defaultVolumeInput.value = volume;

  chrome.storage.sync.set({volume: volume});
  document.querySelector("#defaultVolumeWrapper .valueDisplay").innerHTML = volume;
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
});

document.getElementById("useModifierKey").addEventListener("change", function(){
  let input = document.getElementById("useModifierKey");
  chrome.storage.sync.set({useModifierKey: input.checked});
});

document.getElementById("modifierKey").addEventListener("click", function(){
  if(document.getElementById("useModifierKey").checked){
    let element = document.getElementById("modifierKey");
    let body = document.documentElement || document.body;

    element.innerHTML = "----";

    let keyDown = function(event){
      event.preventDefault();

      let key = event.key;
      element.innerHTML = (key == " ") ? "Space" : key;

      chrome.storage.sync.set({modifierKey: key});

      body.removeEventListener("keydown", keyDown);
    }

    body.addEventListener("keydown", keyDown);
  }
});

document.getElementById("blacklist").addEventListener("change", function(){
  //Blacklist toggle input
  let input = document.getElementById("blacklist");

  document.getElementById("blacklistState").innerHTML = (input.checked) ? "Enabled on this page" : "Disabled on this page";

  chrome.storage.sync.get("blacklist", (data) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      let url = new URL(tabs[0].url).hostname;
      console.log(url);
      if(input.checked){ //Checkbox is checked, meaning the page should not be blacklisted
        let blacklist = data.blacklist;

        blacklist.splice(blacklist.indexOf(url), 1);

        chrome.storage.sync.set({blacklist: blacklist});
      }
      else { //Checkbox is not checked, meaning the page should be blacklisted
        let blacklist = data.blacklist;

        blacklist.push(url);

        chrome.storage.sync.set({blacklist: blacklist});
      }
    });
  });
});

let loadSettings = function(){
  chrome.storage.sync.get("useMousewheelVolume", (data) => {
    let useMousewheelVolume = data.useMousewheelVolume;
    document.getElementById("useMousewheelVolume").checked = useMousewheelVolume;

    document.getElementById("incrementSlider").disabled = !useMousewheelVolume;
    document.getElementById("overlayFontSizeSlider").disabled = !useMousewheelVolume;
    document.getElementById("overlayColorInput").disabled = !useMousewheelVolume;
    document.getElementById("useModifierKey").disabled = !useMousewheelVolume;
  });

  chrome.storage.sync.get("increment", (data) => {
    document.getElementById("incrementSlider").value = data.increment;

    document.querySelector("#mousewheelVolumeWrapper .valueDisplay").innerHTML = data.increment;

    document.getElementById("defaultVolumeSlider").step = data.increment;
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

  chrome.storage.sync.get("useModifierKey", (data) => {
    document.getElementById("useModifierKey").checked = data.useModifierKey;
  });

  chrome.storage.sync.get("modifierKey", (data) => {
    document.getElementById("modifierKey").innerHTML = data.modifierKey;
  });

  chrome.storage.sync.get("blacklist", (data) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      let url = new URL(tabs[0].url).hostname;
      document.getElementById("blacklist").checked = !data.blacklist.includes(url);
      document.getElementById("blacklistState").innerHTML = (!data.blacklist.includes(url)) ? "Enabled on this page" : "Disabled on this page";
    });
  });
}

loadSettings();
