let body = document.documentElement || document.body;
const config = {
  childList: true,
  subtree: true
};

let addMousewheelHandler = function(video){
  chrome.storage.sync.get("increment", (data) => {
    video.dataset.increment = data.increment;

    let onScroll = function(event){
      event.preventDefault();

      let vol = video.volume + (video.dataset.increment / 100) * (event.deltaY / 100 * -1); //deltaY is how much the wheel scrolled, 100 up, -100 down. Divided by 100 to only get direction, then inverted

      //Limiting the volume to between 0-1
      if(vol < 0){
        vol = 0;
      }
      else if(vol > 1) {
        vol = 1;
      }

      //Rounding the volume to the nearest increment, in case the original volume was not on the increment.
      let volume = vol * 100;
      volume = volume / video.dataset.increment;
      volume = Math.round(volume);
      volume = volume * video.dataset.increment;
      volume = volume / 100;

      video.volume = volume;
      video.dataset.volume = volume;

      //Remove all old overlays
      let parent = video.parentElement;

      while (parent.firstChild !== video) {
        parent.removeChild(parent.firstChild);
      }

      //Add new overlay
      let div = document.createElement("div");
      div.innerHTML = Math.round(video.volume * 100);
      div.classList.add("scrollOverlay");
      parent.classList.add("scrollContainer");

      //Animate fade
      div.classList.remove("scrollOverlayFade");
      div.classList.add("scrollOverlayFade");

      parent.insertBefore(div, video);
    }

    video.addEventListener("wheel", onScroll);

  });
}

let handleDefaultVolume = function(video){
  chrome.storage.sync.get("volume", (vol) => {
    video.volume = vol.volume / 100;
    video.dataset.volume = vol.volume / 100;

    let change = function(){
      if(!(video.volume == video.dataset.volume - video.dataset.increment || video.volume == video.dataset.volume + video.dataset.increment)){ //Checks to see if the registered change in volume is equal to the increment. If it is not then it is denied.
        video.volume = video.dataset.volume;
      }

    };

    video.addEventListener("volumechange", change);
  });
};

let setAudio = function(mutations){
  for(mutation of mutations){
    for(node of mutation.addedNodes){
      if(node.tagName == "VIDEO"){
        console.log("New video added to DOM");
        console.log(node);
        let video = node;

        chrome.storage.sync.get("useMousewheelVolume", (data) => {
          if(data.useMousewheelVolume){
            addMousewheelHandler(video);
          }
        });

        chrome.storage.sync.get("useDefaultVolume", (data) => {
          if(data.useDefaultVolume){
            handleDefaultVolume(video);
          }
        });

      }
    }
  }
}

console.log("starting observer");
let observer = new MutationObserver(setAudio);
observer.observe(body, config);
