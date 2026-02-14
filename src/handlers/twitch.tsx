import { Settings, videoElements } from "../types";
import { DefaultHandler } from "./Default";

export class TwitchHandler extends DefaultHandler {
    protected name: string = "TwitchHandler";
    protected domains: string[] = [
        "www.twitch.tv"
    ];

    // Track the "main" video (the stream)
    private mainVideo: HTMLVideoElement | null = null;

    private previousVolume: number = 0;

    protected setVolume(volume: number, video: HTMLVideoElement, debug: (message: String, extra?: any) => void): number {
        // VISIBILITY CHECK:
        // Twitch hides the backup player (or the stream during ads) often.
        // If the video is hidden (no dimensions), do not unmute it.
        if (video.offsetWidth === 0 && video.offsetHeight === 0) {
            debug("Video is hidden (0 dimensions), ignoring setVolume/unmute", video);
            return 0;
        }

        // DUPLICATE/AD CHECK
        // If we don't have a main video content yet, or the previous one was removed from DOM, claim this one.
        if (!this.mainVideo || !this.mainVideo.isConnected) {
            this.mainVideo = video;
            debug("Main video assigned:", video);
        }

        // If this video is NOT the main video, it's a secondary player (likely Ad).
        // Force mute it.
        if (video !== this.mainVideo) {
            debug("Secondary video detected (Ad?), muting.", video);
            video.muted = true;
            video.volume = 0;
            return 0;
        }

        return super.setVolume(volume, video, debug);
    }

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

    public toggleMute(mouseX: number, mouseY: number, debug: (message: String, extra?: any) => void): boolean {
        const videoGroup: videoElements | null = this.getVideo(mouseX, mouseY, debug);

        if (!videoGroup) return false;

        const video: HTMLVideoElement = videoGroup?.video as HTMLVideoElement;

        if (video.muted) {
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

        return true;
    }
}