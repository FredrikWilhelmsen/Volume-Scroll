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

export class RedditHandler extends DefaultHandler {
    protected name: string = "RedditHandler";
    protected domains: string[] = ["www.reddit.com"];

    private processPlayer(player: HTMLElement) {
        if (!player.shadowRoot) {
            // If shadow root is not yet available, wait a bit and try again.
            // This can happen with web components if they haven't hydrated yet.
            setTimeout(() => this.processPlayer(player), 100);
            return;
        }

        const video = player.shadowRoot.querySelector(
            "video",
        ) as HTMLVideoElement;
        if (video) {
            if (this.volumeTargets.has(video)) {
                debug(
                    "Already tracking this video, skipping default volume reset",
                    video,
                );
            } else {
                debug("Found video immediately in shadow root: ", video);
                this.applyDefaultVolume(video);
            }
            return;
        }

        // If not found, the Shadow DOM is likely still hydrating.
        // Observe the SHADOW ROOT specifically for the video tag to appear.
        debug(
            "Player found but video not ready. Observing Shadow DOM...",
            player,
        );

        const shadowObserver = new MutationObserver((shadowMutations, obs) => {
            const lateVideo = player.shadowRoot?.querySelector(
                "video",
            ) as HTMLVideoElement;
            if (lateVideo) {
                if (this.volumeTargets.has(lateVideo)) {
                    debug(
                        "Already tracking this late video, skipping",
                        lateVideo,
                    );
                } else {
                    debug("Found video in shadow root", lateVideo);
                    this.applyDefaultVolume(lateVideo);
                }

                // Once found, we don't need to watch this specific shadow root anymore
                obs.disconnect();
            }
        });

        shadowObserver.observe(player.shadowRoot, {
            childList: true,
            subtree: true,
        });
    }

    protected startVideoObserver(body: HTMLElement) {
        if (this.observer) return;

        debug("Starting Reddit MutationObserver");

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof HTMLElement) {
                        const tagName = node.tagName.toLowerCase();

                        // Check if the added node itself is a player
                        if (tagName === "shreddit-player") {
                            this.processPlayer(node);
                        }
                        // Check if the added node contains players
                        else {
                            const nestedPlayers =
                                node.querySelectorAll("shreddit-player");
                            nestedPlayers.forEach((player) => {
                                this.processPlayer(player as HTMLElement);
                            });
                        }
                    }
                }
            }
        });

        this.observer.observe(body, { childList: true, subtree: true });
    }

    public setDefaultVolume(body: HTMLElement) {
        // Handle existing Reddit players first
        const players = document.querySelectorAll("shreddit-player");
        debug(`Found ${players.length} existing Reddit players on page load`);
        players.forEach((player) => this.processPlayer(player as HTMLElement));

        // Let the base class handle any standard videos and start the body observer
        super.setDefaultVolume(body);
    }

    protected getAllVideos(): HTMLVideoElement[] {
        const videos: HTMLVideoElement[] = [];

        // Find all custom player elements
        const players = document.querySelectorAll("shreddit-player");

        // Iterate and check the shadow root
        players.forEach((player) => {
            if (player.shadowRoot) {
                const video = player.shadowRoot.querySelector("video");
                if (video) {
                    videos.push(video as HTMLVideoElement);
                }
            }
        });

        return videos;
    }

    protected getVideo(mouseX: number, mouseY: number): videoElements | null {
        // First try standard video detection
        const standardVideo = super.getVideo(mouseX, mouseY);
        if (standardVideo) return standardVideo;

        // Then check for Reddit-specific shadow DOM players
        const elements = document.elementsFromPoint(mouseX, mouseY);

        for (const element of elements) {
            if (element.tagName.toLowerCase() === "shreddit-player") {
                const shadow = element.shadowRoot;
                if (!shadow) continue;

                const video: HTMLVideoElement = shadow.querySelector(
                    "VIDEO",
                ) as HTMLVideoElement;
                if (!video) continue;

                return {
                    display: element as HTMLBaseElement,
                    video: video,
                };
            }
        }
        return null;
    }
}
