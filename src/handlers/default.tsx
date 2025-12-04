import { Settings, videoElements, defaultSettings } from "../types";

export class DefaultHandler {
    protected name: string = "DefaultHandler";
    protected domains: string[] = [];
    protected observer: MutationObserver | null = null;
    protected settings: Settings = defaultSettings;

    protected volumeTargets = new WeakMap<HTMLVideoElement, number>();
    protected watchdogs = new WeakSet<HTMLVideoElement>();

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

    protected getAllVideos(): HTMLCollectionOf<Element> | HTMLVideoElement[] {
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

    private updateOverlay(e: WheelEvent, display: HTMLElement, volume: number,
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
            let vidPos = display.getBoundingClientRect();
            let overlayPos = overlay.getBoundingClientRect();
            overlay.style.left = (vidPos.width / 100 * this.settings.overlayXPos) - (overlayPos.width / 2) + "px";
            overlay.style.top = (vidPos.height / 100 * this.settings.overlayYPos) - (overlayPos.height / 2) + "px";
        }

        // Move overlay next to video in DOM
        display.insertAdjacentElement("beforebegin", overlay);

        // Animate fade
        let newOverlay = overlay;
        overlay.parentNode?.replaceChild(newOverlay, overlay);
        overlay.classList.add("volumeScrollOverlayFade");
    }

    protected shouldRevertVolume(video: HTMLVideoElement, currentVolume: number, targetVolume: number): boolean {
        // Default behavior: strict enforcement. Revert if diff > 0.001
        const difference = Math.abs(currentVolume - targetVolume);
        return difference > 0.001;
    }

    private attachVolumeWatchdog(video: HTMLVideoElement, debug: (message: String, extra?: any) => void): void {
        this.watchdogs.add(video);
        debug("Attached volume watchdog");

        video.addEventListener("volumechange", () => {
            if (!navigator.userActivation.hasBeenActive){
                debug("User has not interacted with the page yet, ignoring volume change");
                return;
            }

            const targetVolume: number | undefined = this.volumeTargets.get(video);
            
            if (targetVolume === undefined) return;

            if (this.shouldRevertVolume(video, video.volume, targetVolume)) {
                debug(`Site tried to reset volume to ${video.volume}, forcing back to ${targetVolume}`, video);

                // Force it back
                video.volume = targetVolume;
                video.muted = targetVolume <= 0;
            }
        });
    }

    protected setVolume(volume: number, video: HTMLVideoElement, debug: (message: String, extra?: any) => void) {
        debug(`New volume set to: ${volume}`)

        // Set volume
        this.volumeTargets.set(video, volume / 100);

        if (!navigator.userActivation.hasBeenActive){
            debug("User has not interacted with the page yet, ignoring setVolume call");
            return;
        }

        video.volume = volume / 100;
        video.muted = volume <= 0;

        if (!this.watchdogs.has(video)) {
            this.attachVolumeWatchdog(video, debug);
        }

        // Alert site of change
        video.dispatchEvent(new Event("volumechange"));
    }

    protected siteSpecificUpdate(volume: number, debug: (message: String, extra?: any) => void): void { }

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

        this.siteSpecificUpdate(newVolume, debug);

        this.updateOverlay(e, videoGroup.display, newVolume, body, debug);
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

    protected startVideoObserver(body: HTMLElement, debug: (message: String, extra?: any) => void) {
        if (this.observer) return; // Observer already running

        debug("Starting MutationObserver");

        this.observer = new MutationObserver((mutations) => {
            debug("Change to DOM detected");
            for (const mutation of mutations) {
                // Check added nodes
                for (const node of mutation.addedNodes) {
                    if (node instanceof HTMLElement) {
                        // Check if the added node is itself a video
                        if (node.tagName === "VIDEO") {
                            debug("New video found: ", node);
                            debug("Default volume set to: ", this.settings.defaultVolume);
                            this.setVolume(this.settings.defaultVolume, node as HTMLVideoElement, debug);
                        }
                        // Check if the added node contains videos (e.g. a div with a video inside)
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
        const videoCollection: HTMLVideoElement[] = this.getAllVideos() as HTMLVideoElement[];
        debug("Setting default volume for: ", videoCollection);

        for (let tag of videoCollection) {
            let video: HTMLVideoElement = tag as HTMLVideoElement;
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