import { Settings, videoElements } from "../types";
import { DefaultHandler } from "./Default";

export class TwitchHandler extends DefaultHandler {
    protected name: string = "TwitchHandler";
    protected domains: string[] = [
        "www.twitch.tv"
    ];

    protected getVideo(mouseX: number, mouseY: number, debug: (message: String, extra?: any) => void): videoElements | null {
        const video = document.getElementsByTagName("VIDEO")[0];
        debug("Got video: ", video);
    
        if(video.parentElement?.matches(":hover")){
            const videoGroup : videoElements = { 
                display: video as HTMLBaseElement, 
                video: video as HTMLVideoElement
            }; 
    
            return videoGroup;
        }
    
        return null;
    }
}

// TODO: Fix twitch video grabber, add reddit explicit support, add default volume setter. Manifest v3 for chrome. Two branches on github.