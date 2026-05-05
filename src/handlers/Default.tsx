import { Settings, videoElements, defaultSettings, VideoState } from "../types";

export class DefaultHandler {
    protected name: string = "DefaultHandler";
    protected domains: string[] = [];
    protected observer: MutationObserver | null = null;
    protected settings: Settings = defaultSettings;

    protected volumeTargets = new WeakMap<HTMLVideoElement, VideoState>();
    protected watchdogs = new WeakSet<HTMLVideoElement>();

    // Web Audio API
    protected audioCtx: AudioContext | null = null;
    protected gainNodes = new WeakMap<HTMLVideoElement, GainNode>();
    protected sourceNodes = new WeakMap<HTMLVideoElement, MediaElementAudioSourceNode>();

    protected invalidDomains: string[] = [
        "clips.twitch.tv"
    ];

    protected tagNamesToIgnore: string[] = [];
    protected classNamesToIgnore: string[] = [];


    public updateSettings(newSettings: Settings): void {
        this.settings = newSettings;
    }

    public getName(): string {
        return this.name;
    }

    public handlesDomain(domain: string): boolean {
        return this.domains.includes(domain);
    }

    protected initAudioContext(): void {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    protected getGainNode(video: HTMLVideoElement, debug: (message: String, extra?: any) => void): GainNode | null {
        // Check invalid domains
        if (this.invalidDomains.some(d => window.location.hostname.includes(d))) {
            debug("Current domain is in invalidDomains list, skipping Web Audio API");
            return null;
        }

        this.initAudioContext();

        if (!this.audioCtx) {
            debug("AudioContext failed to initialize");
            return null;
        }

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        // Runtime CORS check:
        // If the video is cross-origin and does not have crossorigin="anonymous" (or similar),
        // createMediaElementSource will output silence. We must abort in that case.
        if (video.currentSrc && !video.currentSrc.startsWith("blob:")) {
            try {
                const videoUrl = new URL(video.currentSrc);
                const isSameOrigin = videoUrl.origin === window.location.origin;

                if (!isSameOrigin && !video.crossOrigin) {
                    debug("Video is cross-origin and lacks CORS attribute. Web Audio API would be silent. Aborting boost.");
                    return null;
                }
            } catch (e) {
                // Invalid URL or other issue, proceed with caution or abort.
                // Mostly safe to ignore error and try, or fail safe.
                // Let's debug and fail safe if we can't determine.
                debug("Could not parse video URL for CORS check", e);
            }
        }

        let gainNode = this.gainNodes.get(video);
        if (!gainNode) {
            try {
                // Check if we already have a source node for this video
                let source = this.sourceNodes.get(video);
                if (!source) {
                    source = this.audioCtx.createMediaElementSource(video);
                    this.sourceNodes.set(video, source);
                }

                gainNode = this.audioCtx.createGain();
                source.connect(gainNode);
                gainNode.connect(this.audioCtx.destination);
                this.gainNodes.set(video, gainNode);

                debug("Created new GainNode for video", video);
            } catch (e) {
                debug("Error creating GainNode (likely CORS)", e);
                return null;
            }
        }

        return gainNode;
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

        return false;
    }

    public isIgnored(elements: Element[], debug: (message: String, extra?: any) => void): boolean {
        const scrollLists = elements.find(el =>
            this.tagNamesToIgnore.includes(el.tagName) ||
            this.classNamesToIgnore.some(className => el.classList.contains(className))
        );

        return !!scrollLists;
    }

    protected getVideoFromElements(elements: Element[], debug: (message: String, extra?: any) => void): videoElements | null {
        const video = elements.find(el => el.tagName === "VIDEO") as HTMLVideoElement | undefined;

        return video ? {
            display: video as unknown as HTMLBaseElement,
            video: video
        } : null;
    }

    protected getVideo(mouseX: number, mouseY: number, debug: (message: String, extra?: any) => void): videoElements | null {
        const elements = document.elementsFromPoint(mouseX, mouseY);

        if (this.isIgnored(elements, debug)) {
            debug("Found blacklisted overlay, aborting scroll");
            return null;
        }

        return this.getVideoFromElements(elements, debug);
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

        if (!this.settings.useOverlay) return;

        let overlay: HTMLElement | null = document.getElementById("volumeScrollOverlay");

        if (!overlay) {
            debug("Overlay does not exist, creating a new overlay");
            overlay = this.createOverlay(body);
        }

        // Move overlay next to video in DOM (do this before measuring/positioning)
        display.insertAdjacentElement("beforebegin", overlay);

        // Update overlay text
        overlay.innerHTML = `${Math.round(volume)}`;
        overlay.style.color = this.settings.fontColor;
        overlay.style.fontSize = `${this.settings.fontSize}px`;

        // Position the overlay
        if (this.settings.overlayPosition === "mouse") {
            const parentRect = (overlay.offsetParent || body).getBoundingClientRect();
            overlay.style.left = e.clientX - parentRect.left - overlay.offsetWidth + "px";
            overlay.style.top = e.clientY - parentRect.top - overlay.offsetHeight + "px";
        } else {
            overlay.style.left = display.offsetLeft + (display.offsetWidth / 100 * this.settings.overlayXPos) - (overlay.offsetWidth / 2) + "px";
            overlay.style.top = display.offsetTop + (display.offsetHeight / 100 * this.settings.overlayYPos) - (overlay.offsetHeight / 2) + "px";
        }

        // Animate fade
        let newOverlay = overlay;
        overlay.parentNode?.replaceChild(newOverlay, overlay);
        overlay.classList.add("volumeScrollOverlayFade");
    }

    protected shouldRevertVolume(video: HTMLVideoElement, currentVolume: number, targetVolume: number): boolean {
        // Default behavior: strict enforcement. Revert if diff > 0.001
        let expectedVolume = targetVolume;
        if (targetVolume > 1) {
            expectedVolume = 1;
        }

        const difference = Math.abs(currentVolume - expectedVolume);
        return difference > 0.001;
    }

    private attachVolumeWatchdog(video: HTMLVideoElement, debug: (message: String, extra?: any) => void): void {
        this.watchdogs.add(video);
        debug("Attached volume watchdog");

        video.addEventListener("volumechange", () => {
            const state: VideoState | undefined = this.volumeTargets.get(video);

            if (state === undefined) return;

            const needsRevert = this.shouldRevertVolume(video, video.volume, state.targetVolume) ||
                (state.isMuted && !video.muted) ||
                (state.targetVolume > 1 && video.muted);

            if (needsRevert) {
                debug(`Site tried to change volume/mute to ${video.volume} (muted: ${video.muted}), forcing back to ${state.targetVolume} (muted: ${state.isMuted || state.targetVolume <= 0})`, video);

                // Force it back
                if (state.targetVolume > 1) {
                    video.volume = 1;
                    video.muted = false;
                    // Ensure gain is correct (re-apply boost)
                    const gainNode = this.getGainNode(video, debug);
                    if (gainNode) {
                        gainNode.gain.value = state.targetVolume;
                    }
                } else {
                    video.volume = state.targetVolume;
                    video.muted = state.isMuted || state.targetVolume <= 0;

                    // Reset gain if exists
                    const gainNode = this.gainNodes.get(video);
                    if (gainNode) {
                        gainNode.gain.value = 1;
                    }
                }
            }
        });
    }

    protected setVolume(volume: number, video: HTMLVideoElement, debug: (message: String, extra?: any) => void): number {
        debug(`New volume set to: ${volume}`)

        // Set volume initially
        let state = this.volumeTargets.get(video);
        if (!state) {
            state = { targetVolume: volume / 100, lastUnmutedVolume: volume / 100, isMuted: video.muted };
            this.volumeTargets.set(video, state);
        } else {
            state.targetVolume = volume / 100;
            if (volume > 0) {
                state.lastUnmutedVolume = volume / 100;
                state.isMuted = false;
            } else {
                state.isMuted = true;
            }
        }

        let effectiveVolume = volume;

        if (volume > 100) {
            // Uncapped volume logic
            const gainNode = this.getGainNode(video, debug);

            if (gainNode) {
                // We can boost
                video.volume = 1; // Max out the actual video element
                video.muted = false;

                // 100 = 1x gain. 500 = 5x gain.
                const gainValue = volume / 100;

                // Use setValueAtTime for immediate and precise application
                if (this.audioCtx) {
                    gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
                    gainNode.gain.setValueAtTime(gainValue, this.audioCtx.currentTime);
                } else {
                    gainNode.gain.value = gainValue;
                }

                debug(`Set GainNode value to ${gainValue} for ${video.currentSrc}`, gainNode);
            } else {
                // Fallback if boosting fails (CORS, etc)
                debug("Boosting failed or not allowed, capping at 100%");
                video.volume = 1;
                video.muted = false;

                // Correct the target since we failed to boost
                state.targetVolume = 1;
                state.lastUnmutedVolume = 1;
                effectiveVolume = 100;
            }
        } else {
            // Normal volume logic
            video.volume = volume / 100;
            video.muted = volume <= 0;

            // Reset gain if it exists
            const gainNode = this.gainNodes.get(video);
            if (gainNode) {
                if (this.audioCtx) {
                    gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
                    gainNode.gain.setValueAtTime(1, this.audioCtx.currentTime);
                } else {
                    gainNode.gain.value = 1;
                }
            }
        }

        if (!this.watchdogs.has(video)) {
            this.attachVolumeWatchdog(video, debug);
        }

        // Alert site of change
        video.dispatchEvent(new Event("volumechange"));

        return effectiveVolume;
    }

    private updateVolume(e: WheelEvent, videoGroup: videoElements, direction: number,
        body: HTMLElement, isAltVolumeKeyPressed: boolean, debug: (message: String, extra?: any) => void): void {

        // Retrieve stored previous volume
        const state: VideoState | undefined = this.volumeTargets.get(videoGroup.video);
        let previousVolume: number = 0;

        if (state !== undefined && !isNaN(state.targetVolume)) {
            // If currently muted, we want to scroll relative to the last unmuted volume
            if (state.isMuted || state.targetVolume === 0) {
                previousVolume = Math.round(state.lastUnmutedVolume * 100);
            } else {
                previousVolume = Math.round(state.targetVolume * 100);
            }
        } else {
            previousVolume = Math.round(videoGroup.video.volume * 100);
        }

        if (isNaN(previousVolume)) {
            previousVolume = 0;
        }

        debug(`Previous volume was: ${previousVolume}`);
        let increment: number = this.settings.volumeIncrement;
        let threshold: number = this.settings.volumeIncrement;

        if (this.settings.useAlternateVolumeIncrement && isAltVolumeKeyPressed) {
            increment = this.settings.alternateVolumeIncrement;
            threshold = this.settings.alternateVolumeIncrement;
        }

        if (this.settings.usePreciseScroll) {
            if (this.settings.useCustomPreciseScrollThreshold) {
                threshold = this.settings.customPreciseScrollThreshold;
            }

            debug(`Threshold set to: ${threshold}`);

            if (direction === -1 && previousVolume <= threshold) {
                increment = 1;
            }
            else if (direction === 1 && previousVolume < threshold) {
                increment = 1;
            }
        }

        debug(`Increment set to: ${increment}`);

        let newVolume: number = previousVolume + (increment * direction);

        // Rounding the volume to the nearest increment, in case the original volume was not on the increment
        if (newVolume > threshold) {
            newVolume = newVolume / this.settings.volumeIncrement;
            newVolume = Math.round(newVolume);
            newVolume = newVolume * this.settings.volumeIncrement;
        }

        // Limiting the volume to between 0 - max volume
        newVolume = Math.max(newVolume, 0);

        let maxVolume: number = 100;
        if (this.settings.doBoostVolume) {
            maxVolume = this.settings.volumeBoostAmount;
        }

        debug(`Max volume is: ${maxVolume}`);

        newVolume = Math.min(newVolume, maxVolume);

        let effectiveVolume = this.setVolume(newVolume, videoGroup.video, debug);

        // Defensive check: if setVolume returns undefined/NaN (e.g. build issue), fallback to newVolume
        if (effectiveVolume === undefined || isNaN(effectiveVolume)) {
            effectiveVolume = newVolume;
        }

        this.updateOverlay(e, videoGroup.display, effectiveVolume, body, debug);
    }

    public scroll(e: WheelEvent, body: HTMLElement, isAltVolumeKeyPressed: boolean, debug: (message: String, extra?: any) => void): void {
        // Get video
        const videoGroup: videoElements | null = this.getVideo(e.clientX, e.clientY, debug);

        if (videoGroup === null) {
            debug("Video group was null, returning");
            return;
        }

        debug("Got video group: ", videoGroup);

        if (!this.hasAudio(videoGroup.video)) {
            debug("Video has no audio track, returning");
            return;
        }

        // Video found, prevent default scroll behaviour and stop propagation to site listeners
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Get scroll direction
        const direction: number = Math.round(e.deltaY / 100 * -1);
        debug("Scroll direction: " + `${direction > 0 ? "UP" : "DOWN"}`, direction);

        // Modify volume
        this.updateVolume(e, videoGroup, direction, body, isAltVolumeKeyPressed, debug);
    }

    protected startVideoObserver(body: HTMLElement, debug: (message: String, extra?: any) => void) {
        if (this.observer) return; // Observer already running

        debug("Starting MutationObserver");

        this.observer = new MutationObserver((mutations) => {
            // debug("Change to DOM detected");
            for (const mutation of mutations) {
                // Check added nodes
                for (const node of mutation.addedNodes) {
                    if (node instanceof HTMLElement) {
                        // Check if the added node is itself a video
                        if (node.tagName === "VIDEO") {
                            const video = node as HTMLVideoElement;
                            if (this.volumeTargets.has(video)) {
                                debug("Already tracking this video, skipping default volume reset", video);
                            } else {
                                debug("New video found: ", video);
                                debug("Default volume set to: ", this.settings.defaultVolume);
                                this.setVolume(this.settings.defaultVolume, video, debug);
                            }
                        }
                        // Check if the added node contains videos (e.g. a div with a video inside)
                        else {
                            const nestedVideos = node.getElementsByTagName("VIDEO");
                            for (let video of nestedVideos) {
                                const videoElement = video as HTMLVideoElement;
                                if (this.volumeTargets.has(videoElement)) {
                                    debug("Already tracking this nested video, skipping default volume reset", videoElement);
                                } else {
                                    debug("New video found: ", videoElement);
                                    debug("Default volume set to: ", this.settings.defaultVolume);
                                    this.setVolume(this.settings.defaultVolume, videoElement, debug);
                                }
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

    public toggleMute(mouseX: number, mouseY: number, debug: (message: String, extra?: any) => void): boolean {
        const videoGroup: videoElements | null = this.getVideo(mouseX, mouseY, debug);

        if (!videoGroup) return false;

        const video = videoGroup.video;
        let state = this.volumeTargets.get(video);

        if (!state) {
            state = {
                targetVolume: video.volume,
                lastUnmutedVolume: video.volume > 0 ? video.volume : (this.settings.defaultVolume / 100),
                isMuted: video.muted
            };
            this.volumeTargets.set(video, state);
        }

        if (video.muted || state.isMuted) {
            // Unmute: Restore last unmuted volume
            debug(`Unmuting. Restoring volume to ${state.lastUnmutedVolume}`);
            this.setVolume(state.lastUnmutedVolume * 100, video, debug);
            video.muted = false;
            state.isMuted = false;
        } else {
            // Mute: Save current volume and set to 0
            debug(`Muting. Saving volume ${state.targetVolume} and setting to 0`);
            state.lastUnmutedVolume = state.targetVolume;
            this.setVolume(0, video, debug);
            video.muted = true;
            state.isMuted = true;
        }

        return true;
    }
}