import { DefaultHandler } from "./Default";

export class YTMusicHandler extends DefaultHandler {
    protected name: string = "YTMusicHandler";
    protected domains: string[] = ["music.youtube.com"];
}
