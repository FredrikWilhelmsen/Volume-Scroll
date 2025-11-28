import { Settings, videoElements } from "../types";
import { DefaultHandler } from "./default";

export class TwitchHandler extends DefaultHandler {
    protected domains: string[] = [
        "twitch.com",
    ];

    public getVideo(e: MouseEvent): videoElements | null {
        return null;
    }

    public updateVolume(settings: Settings, video: HTMLVideoElement, direction: number): void {

    }
}