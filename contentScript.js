let body = document.documentElement || document.body;
const config = {
  childList: true,
  subtree: true
};

let handleDefaultVolume = function(video){
  chrome.storage.sync.get("volume", (vol) => {
    video.volume = vol.volume / 100;
    video.dataset.volume = vol.volume / 100;
    console.log("Set volume of video to " + video.volume);
    console.log(video);

    let change = function(){
      video.volume = video.dataset.volume;
    };

    video.addEventListener("volumechange", change);

    setTimeout(function(){
      video.removeEventListener("volumechange", change);
    }, 1500);
  });
};

let setAudio = function(mutations){
  for(mutation of mutations){
    for(node of mutation.addedNodes){
      if(node.tagName == "VIDEO"){
        console.log("New video added to DOM");
        console.log(node);
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

console.log("starting observer");
let observer = new MutationObserver(setAudio);
observer.observe(body, config);
