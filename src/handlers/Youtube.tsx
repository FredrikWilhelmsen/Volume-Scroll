import { Settings, videoElements } from "../types";
import { DefaultHandler } from "./Default";

export class YoutubeHandler extends DefaultHandler {
    protected name: string = "YoutubeHandler";
    protected domains: string[] = [
        "www.youtube.com"
    ];

    protected tagNamesToIgnore = [
        "YT-MULTI-PAGE-MENU-SECTION-RENDERER",
        "YT-CONTEXTUAL-SHEET-LAYOUT",
        "YTD-LIVE-CHAT-FRAME",
        "YTD-GUIDE-RENDERER"
    ];

    protected classNamesToIgnore = [
        "ytSearchboxComponentSuggestionsContainerScrollable",
        "ytd-popup-container",
        "ytp-settings-menu",
        "yt-live-chat-renderer"
    ];

}