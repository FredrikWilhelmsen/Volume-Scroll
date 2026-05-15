import { Settings, videoElements, defaultSettings, VideoState, OverlayType } from "../types";
import { isHotkeyPressed, debug } from "../utils";

import { createRoot, Root } from "react-dom/client";
import { VolumeOverlay } from "../components/VolumeOverlay";

export class DefaultHandler {
    protected name: string = "DefaultHandler";
    protected domains: string[] = [];
    protected observer: MutationObserver | null = null;
    protected settings: Settings = defaultSettings;

    protected volumeTargets = new WeakMap<HTMLVideoElement, VideoState>();
    protected watchdogs = new WeakSet<HTMLVideoElement>();
    protected isSettingInternally = false;

    // Web Audio API
    protected audioCtx: AudioContext | null = null;
    protected gainNodes = new WeakMap<HTMLVideoElement, GainNode>();
    protected sourceNodes = new WeakMap<HTMLVideoElement, MediaElementAudioSourceNode>();


    protected videoIdCounter: number = 0;
    protected reactRoot: Root | null = null;
    protected overlayContainer: HTMLElement | null = null;
    protected animationKey: number = 0;

    protected tagNamesToIgnore: string[] = [];
    protected classNamesToIgnore: string[] = [];

    protected scrollAccumulator: number = 0;
    protected lastScrollTime: number = 0;

    public updateSettings(newSettings: Settings): void {
        this.settings = newSettings;
    }

    public getName(): string {
        return this.name;
    }

    public handlesDomain(domain: string): boolean {
        return this.domains.includes(domain.toLowerCase());
    }

    protected initAudioContext(): void {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    protected getGainNode(video: HTMLVideoElement): GainNode | null {
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

    public isIgnored(elements: Element[]): boolean {

        const scrollLists = elements.find(el =>
            this.tagNamesToIgnore.includes(el.tagName) ||
            this.classNamesToIgnore.some(className => el.classList.contains(className))
        );

        return !!scrollLists;
    }

    protected getVideoFromElements(elements: Element[]): videoElements | null {

        const video = elements.find(el => el.tagName === "VIDEO") as HTMLVideoElement | undefined;

        return video ? {
            display: video as unknown as HTMLBaseElement,
            video: video
        } : null;
    }

    protected getVideo(mouseX: number, mouseY: number): videoElements | null {
        const elements = document.elementsFromPoint(mouseX, mouseY);

        if (this.isIgnored(elements)) {
            debug("Found blacklisted overlay, aborting scroll");
            return null;
        }

        return this.getVideoFromElements(elements);
    }

    protected getVideoState(video: HTMLVideoElement): VideoState {
        let state = this.volumeTargets.get(video);
        if (!state) {
            state = {
                targetVolume: video.volume,
                isMuted: video.muted,
                isPaused: video.paused,
                videoId: `video-${this.videoIdCounter++}`
            };
            this.volumeTargets.set(video, state);
        }
        return state;
    }

    protected getAllVideos(): HTMLCollectionOf<Element> | HTMLVideoElement[] {
        return document.getElementsByTagName("VIDEO");
    }

    protected getFullscreenElement(): Element | null {
        return document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement;
    }

    private updateOverlay(e: MouseEvent, display: HTMLElement, type: OverlayType, volume: number,
        body: HTMLElement, video: HTMLVideoElement): void {

        if (!this.settings.useOverlay) return;

        // Try to find existing container if we don't have a valid reference
        if (!this.overlayContainer || !this.overlayContainer.isConnected) {
            this.overlayContainer = document.getElementById("volumeScrollOverlayContainer");

            if (!this.overlayContainer) {
                const fs = this.getFullscreenElement();
                if (fs && fs.shadowRoot) {
                    this.overlayContainer = fs.shadowRoot.querySelector("#volumeScrollOverlayContainer") as HTMLElement;
                }
            }
        }

        if (!this.overlayContainer) {
            debug("Overlay container does not exist, creating a new container");
            this.overlayContainer = document.createElement("div");
            this.overlayContainer.id = "volumeScrollOverlayContainer";
            body.appendChild(this.overlayContainer);
            this.reactRoot = createRoot(this.overlayContainer);
        } else if (!this.reactRoot) {
            this.reactRoot = createRoot(this.overlayContainer);
        }

        let container = this.overlayContainer;

        // Move container next to video in DOM (do this before measuring/positioning)
        const fullscreenElement = this.getFullscreenElement();
        if (fullscreenElement) {
            // If the fullscreen element has a shadow root (like Reddit), we must append to it
            if (fullscreenElement.shadowRoot) {
                if (container.parentNode !== fullscreenElement.shadowRoot) {
                    fullscreenElement.shadowRoot.appendChild(container);
                }
            } else {
                if (container.parentNode !== fullscreenElement) {
                    fullscreenElement.appendChild(container);
                }
            }
        } else {
            if (container.parentNode !== body) {
                body.appendChild(container);
            }
        }

        // Position the overlay
        let x = 0;
        let y = 0;

        const parentRect = (container.offsetParent || body).getBoundingClientRect();

        if (this.settings.overlayPosition === "mouse") {
            x = e.clientX - parentRect.left;
            y = e.clientY - parentRect.top;
        } else {
            const displayRect = display.getBoundingClientRect();
            x = displayRect.left - parentRect.left + (displayRect.width / 100 * this.settings.overlayXPos);
            y = displayRect.top - parentRect.top + (displayRect.height / 100 * this.settings.overlayYPos);
        }

        this.animationKey++;

        const state = this.getVideoState(video);

        this.reactRoot.render(
            <VolumeOverlay
                key={state.videoId}
                volume={volume}
                x={x}
                y={y}
                isMuted={video.muted}
                isPaused={video.paused}
                settings={this.settings}
                type={type}
                animationKey={this.animationKey}
            />
        );
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

    private updateLockedAttributes(video: HTMLVideoElement) {
        const state = this.volumeTargets.get(video);
        if (!state) return;

        if (this.settings.useMouseWheelVolume) {
            const target = state.targetVolume > 1 ? 1 : state.targetVolume;
            video.setAttribute("data-vs-locked-volume", target.toString());
        } else {
            video.removeAttribute("data-vs-locked-volume");
        }

        if (this.settings.useToggleMuteKey) {
            const targetMute = state.isMuted || state.targetVolume <= 0;
            video.setAttribute("data-vs-locked-mute", targetMute.toString());
        } else {
            video.removeAttribute("data-vs-locked-mute");
        }
    }

    private attachVolumeWatchdog(video: HTMLVideoElement): void {

        this.watchdogs.add(video);
        debug("Attached volume watchdog");

        const enforceVolume = () => {
            const state: VideoState | undefined = this.volumeTargets.get(video);

            if (state === undefined || this.isSettingInternally) return;

            // Only enforce if the corresponding feature is enabled
            const enforceVolume = this.settings.useMouseWheelVolume;
            const enforceMute = this.settings.useToggleMuteKey;

            if (!enforceVolume && !enforceMute) return;

            const needsRevert = (enforceVolume && this.shouldRevertVolume(video, video.volume, state.targetVolume)) ||
                (enforceMute && (state.isMuted !== video.muted));

            if (needsRevert) {
                debug(`Site tried to change volume/mute to ${video.volume} (muted: ${video.muted}), forcing back to internal state: ${state.targetVolume} (muted: ${state.isMuted || state.targetVolume <= 0})`, video);

                // Force it back. We use setTimeout to ensure we run after any other site listeners
                setTimeout(() => {
                    if (state.targetVolume > 1) {
                        this.isSettingInternally = true;
                        video.volume = 1;
                        video.muted = state.isMuted;
                        this.isSettingInternally = false;
                        // Ensure gain is correct (re-apply boost)
                        const gainNode = this.getGainNode(video);

                        if (gainNode) {
                            gainNode.gain.value = state.targetVolume;
                        }
                    } else {
                        this.isSettingInternally = true;
                        video.volume = state.targetVolume;
                        video.muted = state.isMuted || state.targetVolume <= 0;
                        this.isSettingInternally = false;

                        // Reset gain if exists
                        const gainNode = this.gainNodes.get(video);
                        if (gainNode) {
                            gainNode.gain.value = 1;
                        }
                    }

                    // Alert site of the change we just made.
                    this.isSettingInternally = true;
                    video.dispatchEvent(new Event("volumechange"));
                    this.isSettingInternally = false;
                }, 0);
            }
        };

        video.addEventListener("volumechange", enforceVolume);

        // Some sites reset volume on play/playing without necessarily triggering volumechange correctly,
        // or they do it right after play starts.
        video.addEventListener("play", enforceVolume);
        video.addEventListener("playing", enforceVolume);
    }

    protected setVolume(volume: number, video: HTMLVideoElement, isMuted?: boolean): number {

        debug(`New volume set to: ${volume}`)

        // Set volume initially
        let state = this.getVideoState(video);
        state.targetVolume = volume / 100;
        state.isMuted = isMuted !== undefined ? isMuted : (volume <= 0);

        // Update locked attributes for page-level interceptor BEFORE setting volume/mute
        // This ensures the interceptor allows our changes.
        this.updateLockedAttributes(video);

        let effectiveVolume = volume;

        if (volume > 100) {
            // Uncapped volume logic
            const gainNode = this.getGainNode(video);

            if (gainNode) {
                // We can boost
                this.isSettingInternally = true;
                video.volume = 1; // Max out the actual video element
                video.muted = state.isMuted;
                this.isSettingInternally = false;

                // 100 = 1x gain. 500 = 5x gain.
                const gainValue = state.isMuted ? 0 : (volume / 100);

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
                this.isSettingInternally = true;
                video.volume = 1;
                video.muted = state.isMuted;
                this.isSettingInternally = false;

                // Correct the target since we failed to boost
                state.targetVolume = 1;
                effectiveVolume = 100;
            }
        } else {
            // Normal volume logic
            this.isSettingInternally = true;
            video.volume = volume / 100;
            video.muted = state.isMuted;
            this.isSettingInternally = false;

            // Reset gain if it exists
            const gainNode = this.gainNodes.get(video);
            if (gainNode) {
                const gainValue = state.isMuted ? 0 : 1;
                if (this.audioCtx) {
                    gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
                    gainNode.gain.setValueAtTime(gainValue, this.audioCtx.currentTime);
                } else {
                    gainNode.gain.value = gainValue;
                }
            }
        }

        if (!this.watchdogs.has(video)) {
            this.attachVolumeWatchdog(video);
        }

        // Alert site of change
        this.isSettingInternally = true;
        video.dispatchEvent(new Event("volumechange"));
        this.isSettingInternally = false;

        return effectiveVolume;
    }

    private updateVolume(e: WheelEvent, videoGroup: videoElements, direction: number,
        body: HTMLElement): void {

        // Retrieve stored previous volume
        const state: VideoState | undefined = this.volumeTargets.get(videoGroup.video);
        let previousVolume: number = 0;
        let type: OverlayType = "volume";

        if (state !== undefined && !isNaN(state.targetVolume)) {
            // If currently muted, we want to scroll relative to the unmuted target volume
            if (state.isMuted) {
                previousVolume = Math.round(state.targetVolume * 100);
                type = "unmute";
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
        const isAltVolumeKeyPressed = isHotkeyPressed(e, this.settings.alternateVolumeIncrementHotkey);

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
        if (this.settings.useRoundToNearestIncrement && newVolume > threshold) {
            newVolume = newVolume / increment;
            newVolume = Math.round(newVolume);
            newVolume = newVolume * increment;
        }

        // Limiting the volume to between 0 - max volume
        newVolume = Math.max(newVolume, 0);

        let maxVolume: number = 100;
        if (this.settings.doBoostVolume) {
            maxVolume = this.settings.volumeBoostAmount;
        }

        debug(`Max volume is: ${maxVolume}`);

        newVolume = Math.min(newVolume, maxVolume);

        let effectiveVolume = this.setVolume(newVolume, videoGroup.video);

        // Defensive check: if setVolume returns undefined/NaN (e.g. build issue), fallback to newVolume
        if (effectiveVolume === undefined || isNaN(effectiveVolume)) {
            effectiveVolume = newVolume;
        }

        this.updateOverlay(e, videoGroup.display, type, effectiveVolume, body, videoGroup.video);
    }

    public scroll(e: WheelEvent, body: HTMLElement): boolean {
        // Get video
        const videoGroup: videoElements | null = this.getVideo(e.clientX, e.clientY);

        if (videoGroup === null) {
            debug("Video group was null, returning");
            return false;
        }

        debug("Got video group: ", videoGroup);

        if (!this.hasAudio(videoGroup.video)) {
            debug("Video has no audio track, returning");
            return false;
        }

        // Video found, prevent default scroll behaviour and stop propagation to site listeners
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();

        // Get scroll direction
        // Accumulate scroll deltas until threshold is reached
        const now = Date.now();
        if (now - this.lastScrollTime > 500) {
            this.scrollAccumulator = 0;
        }

        this.lastScrollTime = now;

        let delta = e.deltaY;
        if (e.deltaMode === 1) { // Lines
            delta *= 33.3;
        } else if (e.deltaMode === 2) { // Pages
            delta *= 333;
        }

        this.scrollAccumulator += delta;

        // Haven't reached threshold for a step, wait for more events.
        if (Math.abs(this.scrollAccumulator) < 50) {
            return true;
        }

        // Threshold reached, calculate direction and reset accumulator.
        const direction: number = this.scrollAccumulator > 0 ? -1 : 1;
        this.scrollAccumulator = 0;

        debug("Scroll direction: " + `${direction > 0 ? "UP" : "DOWN"}`, direction);

        // Modify volume
        this.updateVolume(e, videoGroup, direction, body);
        return true;
    }

    protected startVideoObserver(body: HTMLElement) {

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
                                this.applyDefaultVolume(video);

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
                                    this.applyDefaultVolume(videoElement);

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

    private applyDefaultVolume(video: HTMLVideoElement) {
        debug("New video found: ", video);
        debug("Default volume set to: ", this.settings.defaultVolume);
        this.setVolume(this.settings.defaultVolume, video, this.settings.startMuted);
    }

    public setDefaultVolume(body: HTMLElement) {
        const videoCollection: HTMLVideoElement[] = this.getAllVideos() as HTMLVideoElement[];
        debug("Setting default volume for: ", videoCollection);

        for (let tag of videoCollection) {
            let video: HTMLVideoElement = tag as HTMLVideoElement;
            this.applyDefaultVolume(video);
        }

        this.startVideoObserver(body);
    }

    public toggleMute(e: MouseEvent, body: HTMLElement): boolean {
        const videoGroup: videoElements | null = this.getVideo(e.clientX, e.clientY);

        if (!videoGroup) return false;

        const video = videoGroup.video;
        debug(`Found video: ${video}`);
        let state = this.getVideoState(video);
        debug(`Video state: ${state}`);

        if (video.muted || state.isMuted) {
            // Unmute: Restore target volume (or 1 increment if at 0)
            let restoreVolume = state.targetVolume > 0
                ? state.targetVolume * 100
                : (this.settings.usePreciseScroll ? 1 : this.settings.volumeIncrement);

            debug(`Unmuting. Restoring volume to ${restoreVolume}`);
            this.setVolume(restoreVolume, video, false);
            this.updateOverlay(e, videoGroup.display, "unmute", restoreVolume, body, videoGroup.video);
        } else {
            // Mute: Keep current target volume
            debug(`Muting. Saving volume ${state.targetVolume} and muting`);
            this.setVolume(state.targetVolume * 100, video, true);
            this.updateOverlay(e, videoGroup.display, "mute", state.targetVolume * 100, body, videoGroup.video);
        }

        return true;
    }

    public togglePause(e: MouseEvent, body: HTMLElement): boolean {
        const videoGroup: videoElements | null = this.getVideo(e.clientX, e.clientY);

        if (!videoGroup) return false;

        const video = videoGroup.video;
        debug(`Found video: ${video}`);
        let state = this.getVideoState(video);
        debug(`Video state: ${state}`);

        if (video.paused) {
            debug(`Unpausing`);
            state.isPaused = false;
            this.updateOverlay(e, videoGroup.display, "play", state.targetVolume * 100, body, videoGroup.video);
        } else {
            debug(`Pausing`);
            state.isPaused = true;
            this.updateOverlay(e, videoGroup.display, "pause", state.targetVolume * 100, body, videoGroup.video);
        }

        this.volumeTargets.set(video, state);
        state.isPaused ? video.pause() : video.play();

        return true;
    }
}