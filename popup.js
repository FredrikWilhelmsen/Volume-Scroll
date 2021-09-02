document.getElementById("useMousewheelVolume").addEventListener("change", function(){
  //Mousewheel control toggle
  let input = document.getElementById("useMousewheelVolume");
  document.getElementById("defaultIncrement").disabled = !input.checked;

  chrome.storage.sync.set({useMousewheelVolume: input.checked});
});

document.getElementById("defaultIncrement").addEventListener("change", function(){
  //Increment Number Input
  let input = document.getElementById("defaultIncrement");

  if(input.value < 0){
    input.value = 0;
  }
  else if(input.value > 20){
    input.value = 20;
  }

  chrome.storage.sync.set({increment: input.value});
});

document.getElementById("useRoundedVolume").addEventListener("change", function(){
  //Rounded Volume Toggle
  let input = document.getElementById("useRoundedVolume");
  document.getElementById("useDefaultVolume").disabled = input.checked;
  if(input.checked){
    document.getElementById("defaultVolume").disabled = true;
    document.getElementById("useDefaultVolume").checked = false;

    chrome.storage.sync.set({useDefaultVolume: false});
  }

  chrome.storage.sync.set({useRoundedVolume: input.checked});
});

document.getElementById("useDefaultVolume").addEventListener("change", function(){
  //Default Volume Toggle
  let input = document.getElementById("useDefaultVolume");
  document.getElementById("defaultVolume").disabled = !input.checked;

  chrome.storage.sync.set({useDefaultVolume: input.checked});
});

document.getElementById("defaultVolume").addEventListener("change", function(){
  //Defult Volume Number Input
  let input = document.getElementById("defaultVolume");

  if(input.value < 0){
    input.value = 0;
  }
  else if(input.value > 100){
    input.value = 100;
  }

  chrome.storage.sync.set({volume: input.value});
})

let loadSettings = function(){
  chrome.storage.sync.get("useMousewheelVolume", (data) => {
    document.getElementById("useMousewheelVolume").checked = data.useMousewheelVolume;

    document.getElementById("defaultIncrement").disabled = !data.useMousewheelVolume;
  });

  chrome.storage.sync.get("increment", (data) => {
    document.getElementById("defaultIncrement").value = data.increment;
  });

  chrome.storage.sync.get("useRoundedVolume", (data) => {
    document.getElementById("useRoundedVolume").checked = data.useRoundedVolume;

    document.getElementById("useDefaultVolume").disabled = data.useRoundedVolume;
    if(data.useRoundedVolume){
      document.getElementById("defaultVolume").disabled = true;
      document.getElementById("useDefaultVolume").checked = false;
    }
  });

  chrome.storage.sync.get("useDefaultVolume", (data) => {
    document.getElementById("useDefaultVolume").checked = data.useDefaultVolume;

    document.getElementById("defaultVolume").disabled = !data.useDefaultVolume;
  });

  chrome.storage.sync.get("volume", (data) => {
    document.getElementById("defaultVolume").value = data.volume;
  });
}

loadSettings();
