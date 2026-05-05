import { Settings, videoElements } from "../types";
import { DefaultHandler } from "./Default";

export class YoutubeHandler extends DefaultHandler {
    protected name: string = "YoutubeHandler";
    protected domains: string[] = [
        "www.youtube.com"
    ];

    protected getVideo(mouseX: number, mouseY: number, debug: (message: String, extra?: any) => void): videoElements | null {
        const elements = document.elementsFromPoint(mouseX, mouseY);

        const video = elements.find(el => el.tagName === "VIDEO") as HTMLVideoElement | undefined;

        return video ? {
            display: video as unknown as HTMLBaseElement,
            video: video
        } : null;
    }
}