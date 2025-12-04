import { Settings, videoElements } from "../types";
import { DefaultHandler } from "./Default";

export class TwitchHandler extends DefaultHandler {
    protected name: string = "TwitchHandler";
    protected domains: string[] = [
        "www.twitch.tv"
    ];

    private previousVolume: number = 0;

    protected getVideo(mouseX: number, mouseY: number, debug: (message: String, extra?: any) => void): videoElements | null {
        const video = document.getElementsByTagName("VIDEO")[0];
        debug("Got video: ", video);

        if (video.parentElement?.matches(":hover")) {
            const videoGroup: videoElements = {
                display: video as HTMLBaseElement,
                video: video as HTMLVideoElement
            };

            return videoGroup;
        }

        return null;
    }

    public toggleMute(mouseX: number, mouseY: number, debug: (message: String, extra?: any) => void) {
        const videoGroup: videoElements | null = this.getVideo(mouseX, mouseY, debug);

        if (!videoGroup) return;

        const video: HTMLVideoElement = videoGroup?.video as HTMLVideoElement;

        if(video.muted){
            this.volumeTargets.set(video, this.previousVolume);
            video.volume = this.previousVolume;
            video.muted = false;
        }
        else {
            this.volumeTargets.set(video, 0);
            this.previousVolume = video.volume;
            video.volume = 0;
            video.muted = true;
        }
    }
}