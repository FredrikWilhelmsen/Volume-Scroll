import { Settings, videoElements } from "../types";
import { DefaultHandler } from "./Default";

export class RedditHandler extends DefaultHandler {
    protected name: string = "RedditHandler";
    protected domains: string[] = [
        "www.reddit.com"
    ];

    protected getVideo(mouseX: number, mouseY: number, debug: (message: String, extra?: any) => void): videoElements | null {
        const elements = document.elementsFromPoint(mouseX, mouseY);

        for (const element of elements) {
            if (element.tagName.includes("SHREDDIT-PLAYER")) {
                const shadow = element.shadowRoot;
                if (!shadow) continue;

                const video: HTMLVideoElement = shadow.querySelector("VIDEO") as HTMLVideoElement;
                if (!video) continue;

                return {
                    display: element as HTMLBaseElement,
                    video: video
                };
            }
        }
        return null;
    }
}

// TODO: Fix twitch video grabber, add reddit explicit support. Manifest v3 for chrome. Two branches on github.