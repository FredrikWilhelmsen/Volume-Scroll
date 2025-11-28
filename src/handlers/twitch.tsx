import { Settings, videoElements } from "../types";
import { DefaultHandler } from "./default";

export class TwitchHandler extends DefaultHandler {
    protected domains: string[] = [
        "twitch.com",
    ];

    protected getVideo(e: MouseEvent): videoElements | null {
        return null;
    }
}