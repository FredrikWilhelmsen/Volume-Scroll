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
import { DefaultHandler } from "./Default";

export class SpotifyHandler extends DefaultHandler {
    protected name: string = "SpotifyHandler";
    protected domains: string[] = ["open.spotify.com"];

    protected getVideo(mouseX: number, mouseY: number): videoElements | null {
        const proxy = document.getElementById(
            "volume-scroll-spotify-proxy",
        ) as HTMLVideoElement;

        const tempVideo = document.getElementsByTagName(
            "VIDEO",
        )[0] as HTMLVideoElement;

        const video = proxy || tempVideo;
        const bar = document.querySelector('[aria-label="Now playing bar"]');

        const coverArtsNodeList = document.querySelectorAll(
            '[data-testid="cover-art-image"]',
        );
        const coverArtsArray = Array.from(coverArtsNodeList);
        const smallCoverArt = document.querySelector(
            '[data-testid="track-visual-enhancement"]',
        );
        const isVideoVisible =
            tempVideo &&
            tempVideo.offsetWidth > 0 &&
            tempVideo.offsetHeight > 0;
        const display = isVideoVisible
            ? tempVideo
            : smallCoverArt || coverArtsArray.at(-1) || tempVideo;

        const canvaPlayer = document.querySelector(
            ".canvasVideoContainerNPV",
        ) as HTMLVideoElement;

        const elementsAtPoint = document.elementsFromPoint(mouseX, mouseY);
        const isHovering = elementsAtPoint.some((el) => {
            return (
                (bar && bar.contains(el)) ||
                (display && display.contains(el)) ||
                (tempVideo && tempVideo.contains(el)) ||
                (canvaPlayer && canvaPlayer.contains(el))
            );
        });

        if (isHovering) {
            const videoGroup: videoElements = {
                display: display as HTMLBaseElement,
                video: video as HTMLVideoElement,
            };

            return videoGroup;
        }

        return null;
    }

    protected getAllVideos(): HTMLVideoElement[] {
        const proxy = document.getElementById(
            "volume-scroll-spotify-proxy",
        ) as HTMLVideoElement;
        return proxy ? [proxy] : [];
    }

    protected applyDefaultVolume(video: HTMLVideoElement) {
        if (video && video.id === "volume-scroll-spotify-proxy") {
            super.applyDefaultVolume(video);
        }
    }

    protected hasAudio(video: any): boolean {
        if (video && video.id === "volume-scroll-spotify-proxy") {
            return true;
        }
        return super.hasAudio(video);
    }
}
