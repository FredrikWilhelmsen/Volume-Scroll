import { videoElements } from "../types";
import { debug } from "../utils";
import { DefaultHandler } from "./Default";

export class RedditHandler extends DefaultHandler {
    protected name: string = "RedditHandler";
    protected domains: string[] = [
        "www.reddit.com"
    ];

    protected startVideoObserver(body: HTMLElement) {

        if (this.observer) return;

        debug("Starting MutationObserver");

        // Helper to handle the logic of "Video might exist now, or in 100ms"
        const processPlayer = (player: HTMLElement) => {
            if (!player.shadowRoot) return;

            const video = player.shadowRoot.querySelector("video");
            if (video) {
                debug("Found video immediately in shadow root: ", video);
                debug("Setting default volume: " + this.settings.defaultVolume);
                this.setVolume(this.settings.defaultVolume, video as HTMLVideoElement);
                return;
            }

            // If not found, the Shadow DOM is likely still hydrating. 
            // Observe the SHADOW ROOT specifically for the video tag to appear.
            debug("Player found but video not ready. Observing Shadow DOM...", player);

            const shadowObserver = new MutationObserver((shadowMutations, obs) => {
                const lateVideo = player.shadowRoot?.querySelector("video");
                if (lateVideo) {
                    debug("Found video in shadow root", lateVideo);
                    debug("Setting default volume: " + this.settings.defaultVolume);
                    this.setVolume(this.settings.defaultVolume, lateVideo as HTMLVideoElement);

                    // Once found, we don't need to watch this specific shadow root anymore
                    obs.disconnect();
                }
            });

            shadowObserver.observe(player.shadowRoot, { childList: true, subtree: true });
        };

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof HTMLElement) {
                        const tagName = node.tagName.toLowerCase();

                        // Check if the added node itself is a player
                        if (tagName === "shreddit-player") {
                            processPlayer(node);
                        }
                        // Check if the added node contains players
                        else {
                            const nestedPlayers = node.querySelectorAll("shreddit-player");
                            nestedPlayers.forEach((player) => {
                                processPlayer(player as HTMLElement);
                            });
                        }
                    }
                }
            }
        });

        this.observer.observe(body, { childList: true, subtree: true });
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