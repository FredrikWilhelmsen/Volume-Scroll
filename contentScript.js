let blacklist = [
  "music.youtube.com",
  "open.spotify.com"
];

if(!blacklist.includes(window.location.hostname)){
  let body = document.documentElement || document.body;
  const config = {
    childList: true,
    subtree: true
  };

  let handleDefaultVolume = function(video){
    chrome.storage.sync.get("volume", (vol) => {
      video.volume = vol.volume / 100;
      video.dataset.volume = vol.volume / 100;

      let change = function(){
        chrome.storage.sync.get("increment", (incData) => {
          if(!(video.volume == video.dataset.volume - incData.increment || video.volume == video.dataset.volume + incData.increment)){ //Checks to see if the registered change in volume is equal to the increment. If it is not then it is denied.
            video.volume = video.dataset.volume;
          }
        });
      };

      video.addEventListener("volumechange", change);
    });
  };

  let onScroll = function(event){
    let elements = document.elementsFromPoint(event.clientX, event.clientY)
    for(element of elements){
      if(element.tagName == "VIDEO"){
        event.preventDefault();

        let video = element;

        chrome.storage.sync.get("increment", (incData) => {
          let vol = video.volume + (incData.increment / 100) * (event.deltaY / 100 * -1); //deltaY is how much the wheel scrolled, 100 up, -100 down. Divided by 100 to only get direction, then inverted

          //Limiting the volume to between 0-1
          if(vol < 0){
            vol = 0;
          }
          else if(vol > 1) {
            vol = 1;
          }

          if(vol > 0){
            video.muted = false;
          }
          else {
            video.muted = true;
          }

          //Rounding the volume to the nearest increment, in case the original volume was not on the increment.
          let volume = vol * 100;
          volume = volume / incData.increment;
          volume = Math.round(volume);
          volume = volume * incData.increment;
          volume = volume / 100;

          video.volume = volume;
          video.dataset.volume = volume;

          //Update overlay
          let div = document.getElementById("volumeOverlay");
          div.innerHTML = Math.round(video.volume * 100);
          div.style.top = event.clientY - div.offsetHeight + "px";
          div.style.left = event.clientX - div.offsetWidth + "px";


          //Animate fade
          let newDiv = div;
          div.parentNode.replaceChild(newDiv, div);
          div.classList.add("scrollOverlayFade");
        });
      }
    }
  };

  window.onload = function(){
    chrome.storage.sync.get("useMousewheelVolume", (data) => {
      if(data.useMousewheelVolume){
        document.addEventListener("wheel", onScroll, { passive: false });

        chrome.storage.sync.get("fontColor", (colorData) => {
          chrome.storage.sync.get("fontSize", (fontSizeData) => {

            //Add volume overlay to the page
            let div = document.createElement("div");
            div.id = "volumeOverlay";
            div.classList.add("scrollOverlay");
            div.style.color = colorData.fontColor;
            div.style.fontSize = fontSizeData.fontSize + "px";

            document.getElementsByTagName("body")[0].appendChild(div);
          });
        });
      }
    });
  }

  let setAudio = function(mutations){
    for(mutation of mutations){
      for(node of mutation.addedNodes){
        if(node.tagName == "VIDEO"){
          let video = node;

          chrome.storage.sync.get("useDefaultVolume", (data) => {
            if(data.useDefaultVolume){
              handleDefaultVolume(video);
            }
          });

        }
      }
    }
  }

  let observer = new MutationObserver(setAudio);
  observer.observe(body, config);

}
