import { Settings, videoElements, defaultSettings } from "../types";

export class DefaultHandler {
    protected name: string = "DefaultHandler";
    protected domains: string[] = [];
    private observer: MutationObserver | null = null;
    private settings: Settings = defaultSettings;

    public updateSettings(newSettings: Settings): void {
        this.settings = newSettings;
    }

    public getName(): string {
        return this.name;
    }

    public handlesDomain(domain: string): boolean {
        return this.domains.includes(domain);
    }

    private hasAudio(video: any): boolean {
        if (video.audioTracks && video.audioTracks.length > 0) {
            return true;
        }

        if (typeof video.webkitAudioDecodedByteCount !== "undefined" && video.webkitAudioDecodedByteCount > 0) {
            return true;
        }

        if (typeof video.mozHasAudio !== "undefined" && video.mozHasAudio) {
            return true;
        }

        //TODO: Look into Web Audio API

        return false;
    }

    protected getVideo(mouseX: number, mouseY: number, debug: (message: String, extra?: any) => void): videoElements | null {
        const elements = document.elementsFromPoint(mouseX, mouseY);

        for (const element of elements) {
            if (element.tagName === "VIDEO") {
                const videoGroup: videoElements = {
                    display: element as HTMLBaseElement,
                    video: element as HTMLVideoElement
                };

                return videoGroup;
            }
        }

        return null;
    }

    private getAllVideos(): HTMLCollectionOf<Element> {
        return document.getElementsByTagName("VIDEO");
    }

    private createOverlay(body: HTMLElement): HTMLElement {
        let div = document.createElement("div");

        div.id = "volumeScrollOverlay";
        div.classList.add("volumeScrollOverlay");
        div.style.color = this.settings.fontColor;
        div.style.fontSize = this.settings.fontSize + "px";
        body.appendChild(div);

        return div;
    }

    private updateOverlay(e: WheelEvent, videoGroup: videoElements, volume: number,
        body: HTMLElement, debug: (message: String, extra?: any) => void): void {
        let overlay: HTMLElement | null = document.getElementById("volumeScrollOverlay");

        if (!overlay) {
            debug("Overlay does not exist, creating a new overlay");
            overlay = this.createOverlay(body);
        }

        // Update overlay text
        overlay.innerHTML = `${Math.round(volume)}`;
        overlay.style.color = this.settings.fontColor;
        overlay.style.fontSize = `${this.settings.fontSize}px`;

        // Position the overlay
        if (this.settings.overlayPosition === "mouse") {
            overlay.style.left = window.scrollX + e.clientX - overlay.offsetWidth + "px";
            overlay.style.top = window.scrollY + e.clientY - overlay.offsetHeight + "px";
        } else {
            let vidPos = videoGroup.display.getBoundingClientRect();
            let overlayPos = overlay.getBoundingClientRect();
            overlay.style.left = (vidPos.width / 100 * this.settings.overlayXPos) - (overlayPos.width / 2) + "px";
            overlay.style.top = (vidPos.height / 100 * this.settings.overlayYPos) - (overlayPos.height / 2) + "px";
        }

        // Move overlay next to video in DOM
        videoGroup.display.insertAdjacentElement("beforebegin", overlay);

        // Animate fade
        let newOverlay = overlay;
        overlay.parentNode?.replaceChild(newOverlay, overlay);
        overlay.classList.add("volumeScrollOverlayFade");
    }

    private attachVolumeWatchdog(video: HTMLVideoElement, debug: (message: String, extra?: any) => void): void {
        video.dataset.hasVolumeWatchdog = "true";
        debug("Attached volume watchdog");

        video.addEventListener("volumechange", () => {
            // If we don't have a custom volume set, do nothing
            if (!video.dataset.customVolume) return;

            const targetVolume = parseFloat(video.dataset.customVolume);

            // Allow for a tiny floating point margin of error
            const difference = Math.abs(video.volume - targetVolume);

            if (difference > 0.001) {
                debug(`Site tried to reset volume to ${video.volume}, forcing back to ${targetVolume}`);

                // Force it back
                video.volume = targetVolume;
            }
        });
    }

    private setVolume(volume: number, video: HTMLVideoElement, debug: (message: String, extra?: any) => void){
        debug(`New volume set to: ${volume}`)

        // Set volume
        video.dataset.customVolume = `${volume / 100}`;

        if (video.dataset.hasVolumeWatchdog !== "true") {
            this.attachVolumeWatchdog(video, debug);
        }

        video.volume = volume / 100;
        video.muted = volume <= 0;

        // Alert site of change
        video.dispatchEvent(new Event("volumechange"));
    }

    protected siteSpecificUpdate(volume: number): void { }

    private updateVolume(e: WheelEvent, videoGroup: videoElements, direction: number,
        body: HTMLElement, debug: (message: String, extra?: any) => void): void {
        const previousVolume: number = Math.round(videoGroup.video.volume * 100); // video.volume is a percentage, multiplied by 100 to get integer values
        debug(`Previous volume was: ${previousVolume}`);
        let increment: number = this.settings.volumeIncrement;

        if (this.settings.usePreciseScroll) {
            if (direction === -1 && previousVolume <= this.settings.volumeIncrement) {
                increment = 1;
            }
            else if (direction === 1 && previousVolume < this.settings.volumeIncrement) {
                increment = 1;
            }
        }

        debug(`Increment set to: ${increment}`);

        let newVolume: number = previousVolume + (increment * direction);

        // Rounding the volume to the nearest increment, in case the original volume was not on the increment
        if (newVolume > this.settings.volumeIncrement) {
            newVolume = newVolume / this.settings.volumeIncrement;
            newVolume = Math.round(newVolume);
            newVolume = newVolume * this.settings.volumeIncrement;
        }

        // Limiting the volume to between 0-100
        newVolume = Math.max(newVolume, 0);
        newVolume = Math.min(newVolume, 100);

        this.setVolume(newVolume, videoGroup.video, debug);

        this.siteSpecificUpdate(newVolume);

        this.updateOverlay(e, videoGroup, newVolume, body, debug);
    }

    private updateVolumeUncapped() { }

    public scroll(e: WheelEvent, body: HTMLElement, debug: (message: String, extra?: any) => void): void {
        // Get video
        const videoGroup: videoElements | null = this.getVideo(e.clientX, e.clientY, debug);
        debug("Got video group: ", videoGroup);

        if (videoGroup === null) {
            debug("Video group was null, returning");
            return;
        }

        if (!this.hasAudio(videoGroup.video)) {
            debug("Video has no audio track, returning");
            return;
        }

        // Video found, prevent default scroll behaviour
        e.preventDefault();

        // Get scroll direction
        const direction: number = Math.round(e.deltaY / 100 * -1);
        debug("Scroll direction: " + `${direction > 0 ? "UP" : "DOWN"}`, direction);

        // Modify volume
        this.updateVolume(e, videoGroup, direction, body, debug);
    }

    private startVideoObserver(body: HTMLElement, debug: (message: String, extra?: any) => void) {
        if (this.observer) return; // Observer already running

        debug("Starting MutationObserver");

        this.observer = new MutationObserver((mutations) => {
            debug("Change to DOM detected");
            for (const mutation of mutations) {
                // Check added nodes
                for (const node of mutation.addedNodes) {
                    if (node instanceof HTMLElement) {
                        // 1. Check if the added node is itself a video
                        if (node.tagName === "VIDEO") {
                            debug("New video found: ", node);
                            debug("Default volume set to: ", this.settings.defaultVolume);
                            this.setVolume(this.settings.defaultVolume, node as HTMLVideoElement, debug);
                        } 
                        // 2. Check if the added node contains videos (e.g. a div with a video inside)
                        else {
                            const nestedVideos = node.getElementsByTagName("VIDEO");
                            for (let video of nestedVideos) {
                                debug("New video found: ", video);
                                debug("Default volume set to: ", this.settings.defaultVolume);
                                this.setVolume(this.settings.defaultVolume, video as HTMLVideoElement, debug);
                            }
                        }
                    }
                }
            }
        });

        // Start observing the body for added children, recursively
        this.observer.observe(body, { childList: true, subtree: true });
    }

    public setDefaultVolume(body: HTMLElement, debug: (message: String, extra?: any) => void) {
        const videoCollection: HTMLCollectionOf<Element> = this.getAllVideos();
        debug("Setting default volume for: ", videoCollection);

        for (let tag of videoCollection){
            let video = tag as HTMLVideoElement;
            this.setVolume(this.settings.defaultVolume, video, debug);
        }

        this.startVideoObserver(body, debug);
    }

    public toggleMute(mouseX: number, mouseY: number, debug: (message: String, extra?: any) => void) {
        const videoGroup: videoElements | null = this.getVideo(mouseX, mouseY, debug);

        if (!videoGroup) return;

        videoGroup.video.muted = !videoGroup.video.muted;
    }
}