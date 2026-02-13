import { Settings, videoElements } from "../types";
import { DefaultHandler } from "./Default";

export class RedditHandler extends DefaultHandler {
    protected name: string = "RedditHandler";
    protected domains: string[] = [
        "www.reddit.com"
    ];

    private lastUserSetVolume: number | null = null;

    protected setVolume(volume: number, video: HTMLVideoElement, debug: (message: String, extra?: any) => void) {
        super.setVolume(volume, video, debug);
        this.lastUserSetVolume = volume / 100;
        debug("Last user set volume: " + volume);
    }

    // Override the watchdog logic
    protected shouldRevertVolume(video: HTMLVideoElement, currentVolume: number, targetVolume: number): boolean {
        const difference: number = Math.abs(currentVolume - targetVolume);

        // If volumes match, no action needed
        if (difference <= 0.001) return false;

        // CHECK: Is the 'wrong' volume actually what the user just set on a neighbouring video?
        if (this.lastUserSetVolume !== null) {
            const syncDiff = Math.abs(currentVolume - this.lastUserSetVolume);

            // If the site changed this video to match the last one we scrolled...
            if (syncDiff <= 0.001) {
                // ... then accept the sync Update our internal target to match.
                this.volumeTargets.set(video, this.lastUserSetVolume);
                return false;
            }
        }

        // Otherwise, it's a random site reset (ads, auto-mute, etc)
        return true;
    }

    protected startVideoObserver(body: HTMLElement, debug: (message: String, extra?: any) => void) {
        if (this.observer) return;

        debug("Starting MutationObserver");

        // Helper to handle the logic of "Video might exist now, or in 100ms"
        const processPlayer = (player: HTMLElement) => {
            if (!player.shadowRoot) return;

            const video = player.shadowRoot.querySelector("video");
            if (video) {
                debug("Found video immediately in shadow root: ", video);
                debug("Setting default volume: " + this.settings.defaultVolume);
                this.setVolume(this.settings.defaultVolume, video as HTMLVideoElement, debug);
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
                    this.setVolume(this.settings.defaultVolume, lateVideo as HTMLVideoElement, debug);

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

    protected getVideo(mouseX: number, mouseY: number, debug: (message: String, extra?: any) => void): videoElements | null {
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