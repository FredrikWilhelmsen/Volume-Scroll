import { Settings, videoElements } from "../types";

export class DefaultHandler {
    protected domains: string[] = [];

    public handlesDomain(domain : string): boolean {
        return this.domains.includes(domain);
    }
    
    private hasAudio(video: any): boolean {
        if (video.audioTracks && video.audioTracks.length > 0) {
            return true;
        }
    
        if (typeof video.webkitAudioDecodedByteCount !== "undefined" && video.webkitAudioDecodedByteCount > 0) {
            return true;
        }
    
        if (typeof video.mozHasAudio !== "undefined" && video.mozHasAudio) {
            return true;
        }
    
        //TODO: Look into Web Audio API
    
        return false;
    }

    protected getVideo(e: MouseEvent): videoElements | null {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        
        for (const element of elements) {
            if (element.tagName === "VIDEO") {
                const videoGroup : videoElements = { 
                    display: element as HTMLBaseElement, 
                    video: element as HTMLVideoElement
                }; 
    
                return videoGroup;
            }
        }
    
        return null;
    }

    private updateOverlay(e: WheelEvent, settings: Settings, videoGroup: videoElements, volume: number, 
                            createOverlay: () => HTMLElement, debug: (message: String, extra?: any) => void): void {
        let overlay : HTMLElement | null = document.getElementById("volumeScrollOverlay");
        
        if(!overlay){
            debug("Overlay does not exist, creating a new overlay");
            overlay = createOverlay();
        }

        //Update overlay text
        overlay.innerHTML = `${Math.round(volume)}`;
        overlay.style.color = settings.fontColor;
        overlay.style.fontSize = `${settings.fontSize}px`;

        //Position the overlay
        if (settings.overlayPosition === "mouse") {
            overlay.style.left = window.scrollX + e.clientX - overlay.offsetWidth + "px";
            overlay.style.top = window.scrollY + e.clientY - overlay.offsetHeight + "px";
        } else {
            let vidPos = videoGroup.display.getBoundingClientRect();
            let overlayPos = overlay.getBoundingClientRect();
            overlay.style.left = (vidPos.width / 100 * settings.overlayXPos) - (overlayPos.width / 2) + "px";
            overlay.style.top = (vidPos.height / 100 * settings.overlayYPos) - (overlayPos.height / 2) + "px";
        }

        //move overlay next to video in DOM
        videoGroup.display.insertAdjacentElement("beforebegin", overlay);

        //Animate fade
        let newOverlay = overlay;
        overlay.parentNode?.replaceChild(newOverlay, overlay);
        overlay.classList.add("volumeScrollOverlayFade");
    }

    protected siteSpecificUpdate(volume: number): void{}

    private updateVolume(e: WheelEvent, settings: Settings, videoGroup: videoElements, direction: number, 
                            createOverlay: () => HTMLElement, debug: (message: String, extra?: any) => void): void {
        const previousVolume : number = Math.round(videoGroup.video.volume * 100); //video.volume is a percentage, multiplied by 100 to get integer values
        debug(`Previous volume was: ${previousVolume}`);
        let increment : number = settings.volumeIncrement;

        if(settings.usePreciseScroll){
            if(direction === -1 && previousVolume <= settings.volumeIncrement){
                increment = 1;
            }
            else if(direction === 1 && previousVolume < settings.volumeIncrement){
                increment = 1;
            }
        }

        debug(`Increment set to: ${increment}`);

        let newVolume : number = previousVolume + ( increment * direction );

        //Rounding the volume to the nearest increment, in case the original volume was not on the increment
        if(newVolume > settings.volumeIncrement){
            newVolume = newVolume / settings.volumeIncrement;
            newVolume = Math.round(newVolume);
            newVolume = newVolume * settings.volumeIncrement;
        }

        //Limiting the volume to between 0-100
        newVolume = Math.max(newVolume, 0)
        newVolume = Math.min(newVolume, 100)

        debug(`New volume set to: ${newVolume}`)

        //Set volume
        videoGroup.video.volume = newVolume / 100;
        videoGroup.video.dataset.volume = `${newVolume / 100}`;

        this.siteSpecificUpdate(newVolume);

        this.updateOverlay(e, settings, videoGroup, newVolume, createOverlay, debug);
    }

    private updateVolumeUncapped(){}

    public scroll(e: WheelEvent, settings: Settings, createOverlay: () => HTMLElement, debug: (message: String, extra?: any) => void): void {
        //Get video
        const videoGroup : videoElements | null = this.getVideo(e);
        debug("Got video: ", videoGroup);

        if(videoGroup === null){
            debug("Video group was null, returning");
            return;
        }

        if(!this.hasAudio(videoGroup.video)){
            debug("Video has no audio track, returning")
            return;
        }

        //Video found, prevent default scroll behavior
        e.preventDefault();

        //Get scroll direction
        const direction = Math.round( e.deltaY / 100 * -1 );
        debug("Scroll direction: " + `${direction > 0 ? "UP" : "DOWN"}`, direction);
        
        //Modify volume
        this.updateVolume(e, settings, videoGroup, direction, createOverlay, debug);
    }
}