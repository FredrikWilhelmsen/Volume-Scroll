import { Settings, videoElements } from "../types";
import { DefaultHandler } from "./default";

export class YTMusicHandler extends DefaultHandler {
    protected domains = [
        "music.youtube.com",
    ];

    public getVideo(e: MouseEvent): videoElements | null {
        const video = document.getElementsByTagName("VIDEO")[0];
        const bar = document.getElementsByTagName("YTMUSIC-PLAYER-BAR")[0];
        const image = document.getElementById("song-image");
        const player = document.getElementsByTagName("YTMUSIC-PLAYER")[0];
    
        if(bar.matches(":hover") || player.matches(":hover")){
            const videoGroup : videoElements = { 
                display: image as HTMLBaseElement, 
                video: video as HTMLVideoElement
            }; 
    
            return videoGroup;
        }
    
        return null;
    }
}