/*
 * Volume Scroll - Scrollable volume for any video on the internet
 * Copyright (C) 2026  Fredrik Wilhelmsen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { videoElements } from "../types";
import { debug } from "../utils";
import { DefaultHandler } from "./Default";

export class TwitchHandler extends DefaultHandler {
    protected name: string = "TwitchHandler";
    protected domains: string[] = ["www.twitch.tv"];

    // Track the "main" video (the stream)
    private mainVideo: HTMLVideoElement | null = null;

    protected setVolume(
        volume: number,
        video: HTMLVideoElement,
        isMuted?: boolean,
    ): number {
        // If the video is hidden (no dimensions), do not unmute it.
        if (video.offsetWidth === 0 && video.offsetHeight === 0) {
            debug(
                "Video is hidden (0 dimensions), ignoring setVolume/unmute",
                video,
            );
            return 0;
        }

        // If we don't have a main video content yet, or the previous one was removed from DOM, claim this one.
        if (!this.mainVideo || !this.mainVideo.isConnected) {
            this.mainVideo = video;
            debug("Main video assigned:", video);
        }

        // If this video is NOT the main video, it's a secondary player (Ad has started).
        // Force mute it.
        if (video !== this.mainVideo) {
            debug("Secondary video detected (Ad?), muting.", video);
            video.muted = true;
            video.volume = 0;
            return 0;
        }

        return super.setVolume(volume, video, isMuted);
    }

    protected getVideo(mouseX: number, mouseY: number): videoElements | null {
        const video = document.getElementsByTagName("VIDEO")[0];
        debug("Got video: ", video);

        if (video.parentElement?.matches(":hover")) {
            const videoGroup: videoElements = {
                display: video as HTMLBaseElement,
                video: video as HTMLVideoElement,
            };

            return videoGroup;
        }

        return null;
    }
}
