let body = document.documentElement || document.body;
const config = {
  childList: true,
  subtree: true
};

let addMousewheelHandler = function(video){
  chrome.storage.sync.get("increment", (data) => {
    video.dataset.increment = data.increment;
    console.log("adding scroll handler");

    let onScroll = function(event){
      event.preventDefault();

      video.volume += (video.dataset.increment / 100) * (event.deltaY / 100 * -1); //deltaY is how much the wheel scrolled, 100 up, -100 down. Divided by 100 to only get direction, then inverted

      //Rounding the volume to the nearest increment, in case the original volume was not on the increment.
      let volume = video.volume * 100;
      volume = volume / video.dataset.increment;
      volume = Math.round(volume);
      volume = volume * video.dataset.increment;
      volume = volume / 100;

      video.volume = volume;
      video.dataset.volume = volume;

      console.log("Set volume of video to " + video.volume);
    }

    video.addEventListener("wheel", onScroll);

  });
}

let handleDefaultVolume = function(video){
  chrome.storage.sync.get("volume", (vol) => {
    video.volume = vol.volume / 100;
    video.dataset.volume = vol.volume / 100;
    console.log("Set default volume of video to " + video.volume);

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
