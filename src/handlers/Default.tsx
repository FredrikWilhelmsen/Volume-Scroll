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

import {
    Settings,
    videoElements,
    defaultSettings,
    VideoState,
    OverlayType,
    CustomRule,
    CustomOverlay,
} from "../types";
import { isHotkeyPressed, debug, getFullscreenElement } from "../utils";

import { createRoot, Root } from "react-dom/client";
import { VolumeOverlay } from "../components/VolumeOverlay";

export class DefaultHandler {
    protected name: string = "DefaultHandler";
    protected domains: string[] = [];
    protected observer: MutationObserver | null = null;
    protected settings: Settings = defaultSettings;
    protected customRules: CustomRule[] = [];
    protected ignoredElements: string[] = [];
    protected customOverlays: Record<string, CustomOverlay> = {};

    // Preloaded custom overlay images, kept alive in memory so the browser's
    // image cache stays warm and the overlay can render them instantly, even
    // after the overlay has not been shown for a while.
    protected preloadedOverlayImages = new Map<string, HTMLImageElement>();

    protected volumeTargets = new WeakMap<HTMLVideoElement, VideoState>();
    protected watchdogs = new Set<HTMLVideoElement>();
    protected watchdogListeners = new WeakMap<HTMLVideoElement, () => void>();
    protected isSettingInternally = false;
    protected isDisabled: boolean = false;

    // Web Audio API
    protected audioCtx: AudioContext | null = null;
    protected gainNodes = new WeakMap<HTMLVideoElement, GainNode>();
    protected sourceNodes = new WeakMap<
        HTMLVideoElement,
        MediaElementAudioSourceNode
    >();

    protected videoIdCounter: number = 0;
    protected reactRoot: Root | null = null;
    protected overlayContainer: HTMLElement | null = null;
    protected animationKey: number = 0;

    protected scrollAccumulator: number = 0;
    protected lastScrollTime: number = 0;

    // Tracks videos for which a CORS soft-reload has been scheduled but not yet
    // completed (prevents stacking duplicate reloads on rapid scrolls).
    protected corsReloadPending = new WeakSet<HTMLVideoElement>();
    // Tracks videos for which we already attempted a CORS soft-reload so we
    // only try once per element (avoids infinite reload loops on stubborn sites).
    protected corsReloadAttempted = new WeakSet<HTMLVideoElement>();

    public updateSettings(newSettings: Settings): void {
        this.settings = newSettings;
    }

    public updateCustomOverlays(
        customOverlays: Record<string, CustomOverlay>,
    ): void {
        this.customOverlays = customOverlays || {};
        this.preloadCustomOverlayImages(this.customOverlays);
    }

    /**
     * Preloads all custom overlay images ahead of time so the overlay can be
     * rendered instantly the first time it appears. The Image objects are kept
     * alive for the lifetime of the page
     */
    protected preloadCustomOverlayImages(
        customOverlays: Record<string, CustomOverlay>,
    ): void {
        const urls = new Set<string>();
        for (const overlay of Object.values(customOverlays)) {
            for (const image of overlay.images || []) {
                if (image && image.url) {
                    urls.add(image.url);
                }
            }
        }

        // Drop preloads for URLs that are no longer used by any overlay
        for (const url of this.preloadedOverlayImages.keys()) {
            if (!urls.has(url)) {
                this.preloadedOverlayImages.delete(url);
            }
        }

        // Preload any URLs we haven't seen yet
        for (const url of urls) {
            if (this.preloadedOverlayImages.has(url)) continue;

            const img = new Image();
            img.src = url;
            // Force an early decode so the decoded bitmap is ready too
            img.decode().catch(() => {});
            // Allow a retry later (e.g. after an overlay update) if the image
            // failed to load for some reason
            img.onerror = () => {
                this.preloadedOverlayImages.delete(url);
            };
            this.preloadedOverlayImages.set(url, img);
        }
    }

    public updateCustomRules(customRules: CustomRule[]): void {
        this.customRules = customRules || [];
    }

    public updateIgnoredElements(ignoredElements: string[]): void {
        this.ignoredElements = ignoredElements || [];
    }

    public getName(): string {
        return this.name;
    }

    public handlesDomain(domain: string): boolean {
        return this.domains.includes(domain.toLowerCase());
    }

    protected initAudioContext(): void {
        if (!this.audioCtx) {
            this.audioCtx = new (
                window.AudioContext || (window as any).webkitAudioContext
            )();
        }
    }

    /**
     * Performs an in-place "soft reload" of a video element to force the browser
     * to re-fetch the media with a CORS-credentialed request.
     *
     * Preserves the existing <video> tag and all event listeners:
     *  1. Record current playback state.
     *  2. Set crossOrigin = "anonymous" (must happen before load()).
     *  3. Call video.load() — browser re-fetches the src with CORS headers.
     *     The declarativeNetRequest rule in the background ensures the server
     *     responds with Access-Control-Allow-Origin: *.
     *  4. On the first `canplay` event, restore currentTime + resume playback,
     *     then invoke the onReady callback so the caller can retry
     *     createMediaElementSource.
     */
    protected softReloadForCors(
        video: HTMLVideoElement,
        onReady: () => void,
    ): void {
        const savedTime = video.currentTime;
        const wasPaused = video.paused;
        const savedVolume = video.volume;
        const savedMuted = video.muted;

        debug("[CORS] Soft-reloading video for CORS", video.currentSrc);

        // Must be set before load() so the browser sends a CORS request.
        video.crossOrigin = "anonymous";

        const onCanPlay = () => {
            video.removeEventListener("canplay", onCanPlay);
            this.corsReloadPending.delete(video);

            // Restore playback position
            try {
                video.currentTime = savedTime;
            } catch (e) {
                // Some streams don't support seeking; ignore
            }

            // Restore volume/mute using our internal setter to keep state consistent
            this.isSettingInternally = true;
            video.volume = savedVolume;
            video.muted = savedMuted;
            this.isSettingInternally = false;

            if (!wasPaused) {
                video.play().catch(() => {
                    // Autoplay may be blocked; the user can resume manually
                });
            }

            debug("[CORS] Soft-reload complete, retrying GainNode creation");
            onReady();
        };

        const onError = () => {
            video.removeEventListener("canplay", onCanPlay);
            video.removeEventListener("error", onError);
            this.corsReloadPending.delete(video);
            // Clear the attempted flag so getGainNode can still trigger a
            // reactive retry when the user first boosts.
            this.corsReloadAttempted.delete(video);
            debug("[CORS] Soft-reload failed (network/server error)");
        };

        video.addEventListener("canplay", onCanPlay, { once: true });
        video.addEventListener("error", onError, { once: true });
        video.load();
    }

    /**
     * Proactively pre-warms CORS for a newly detected media element so that
     * audio boost works on the very first scroll above 100%.
     */
    protected prewarmCorsIfNeeded(video: HTMLVideoElement): void {
        if (this.corsReloadAttempted.has(video)) return;

        // No src resolved yet — nothing to pre-warm.
        if (!video.currentSrc) return;
        // Blob URLs are same-origin by definition — GainNode can be created now.
        if (video.currentSrc.startsWith("blob:")) {
            this.prewarmGainNode(video);
            return;
        }
        // Already has CORS attribute set (e.g. by the interceptor) — GainNode can be created now.
        if (video.crossOrigin) {
            this.prewarmGainNode(video);
            return;
        }

        // Only pre-warm when the browser hasn't started fetching yet.
        // Once readyState > HAVE_NOTHING the media is loading or loaded;
        // reloading at that point hits the browser's media cache without
        // CORS headers and causes the exact error we are trying to avoid.
        if (video.readyState !== HTMLMediaElement.HAVE_NOTHING) return;

        try {
            const url = new URL(video.currentSrc);
            if (url.origin === window.location.origin) {
                // Same-origin — GainNode can be created without CORS.
                this.prewarmGainNode(video);
                return;
            }
        } catch (e) {
            return;
        }

        // Cross-origin, src set, not yet fetching — safe to pre-warm with CORS.
        if (this.corsReloadPending.has(video)) return;
        this.corsReloadPending.add(video);
        this.corsReloadAttempted.add(video);
        this.softReloadForCors(video, () => {
            const gainNode = this.getGainNode(video);
            if (gainNode) {
                debug("[CORS] GainNode pre-warmed proactively");
            } else {
                debug(
                    "[CORS] GainNode creation still failed after proactive pre-warm",
                );
            }
        });
    }

    protected prewarmGainNode(video: HTMLVideoElement): void {
        if (this.gainNodes.has(video)) return; // Already pre-warmed
        const gainNode = this.getGainNode(video);
        if (gainNode) {
            // Ensure the node is transparent (gain = 1) while not boosting.
            gainNode.gain.value = 1;
            debug("[GainNode] GainNode pre-warmed for video", video.currentSrc);
        } else {
            debug(
                "[GainNode] GainNode creation failed during pre-warm",
                video.currentSrc,
            );
        }
    }

    protected getGainNode(video: HTMLVideoElement): GainNode | null {
        this.initAudioContext();

        if (!this.audioCtx) {
            debug("AudioContext failed to initialize");
            return null;
        }

        if (this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
        }

        // Runtime CORS check:
        // If the video is cross-origin and does not have crossorigin="anonymous"
        // (or similar), createMediaElementSource will output silence.
        // Strategy:
        //   - If we haven't tried a soft-reload yet, schedule one and return null
        //     for this call (falls back to 100% cap this once).
        //   - The soft-reload re-fetches the media with crossOrigin="anonymous";
        //     on canplay we retry getGainNode() internally to pre-warm the node.
        //   - If we already attempted a reload (corsReloadAttempted is set), skip
        //     the check and try createMediaElementSource directly — crossOrigin
        //     should now be set.
        if (
            video.currentSrc &&
            !video.currentSrc.startsWith("blob:") &&
            !this.corsReloadAttempted.has(video)
        ) {
            try {
                const videoUrl = new URL(video.currentSrc);
                const isSameOrigin = videoUrl.origin === window.location.origin;

                if (!isSameOrigin && !video.crossOrigin) {
                    if (!this.corsReloadPending.has(video)) {
                        // Schedule a one-time soft reload.
                        // This call returns null (falls back to 100% cap);
                        // once canplay fires the GainNode is pre-warmed.
                        this.corsReloadPending.add(video);
                        this.corsReloadAttempted.add(video);
                        this.softReloadForCors(video, () => {
                            // Pre-warm: create and cache the GainNode so the
                            // next boost scroll works without another reload.
                            const gainNode = this.getGainNode(video);
                            if (gainNode) {
                                debug(
                                    "[CORS] GainNode pre-warmed after soft-reload",
                                );
                            } else {
                                debug(
                                    "[CORS] GainNode creation still failed after soft-reload",
                                );
                            }
                        });
                    } else {
                        debug(
                            "[CORS] Soft-reload already pending for this video",
                        );
                    }
                    return null;
                }
            } catch (e) {
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

    protected hasAudio(video: any): boolean {
        if (video.tagName === "AUDIO") {
            return true;
        }

        if (video.audioTracks && video.audioTracks.length > 0) {
            return true;
        }

        if (
            typeof video.webkitAudioDecodedByteCount !== "undefined" &&
            video.webkitAudioDecodedByteCount > 0
        ) {
            return true;
        }

        if (typeof video.mozHasAudio !== "undefined" && video.mozHasAudio) {
            return true;
        }

        return false;
    }

    public isIgnored(elements: Element[]): boolean {
        const scrollLists = elements.find((el) =>
            this.ignoredElements.some((selector) => {
                try {
                    return el.matches(selector);
                } catch (e) {
                    return false;
                }
            }),
        );

        return !!scrollLists;
    }

    protected getVideoFromElements(
        elements: Element[],
        mouseX: number,
        mouseY: number,
    ): videoElements | null {
        // Check custom rules first
        for (const rule of this.customRules) {
            const hasInteractibleMatch = elements.some((el) => {
                try {
                    return rule.scrollInteractibleQuerySelector?.some(
                        (selector) => el.matches(selector),
                    );
                } catch (e) {
                    return false;
                }
            });

            if (hasInteractibleMatch) {
                try {
                    const video = document.querySelector(
                        rule.videoQuerySelector,
                    ) as HTMLVideoElement | HTMLAudioElement | null;
                    const display = document.querySelector(
                        rule.displayQuerySelector,
                    ) as HTMLBaseElement | null;

                    if (video && display) {
                        return {
                            display: display,
                            video: video as HTMLVideoElement,
                        };
                    }
                } catch (e) {
                    // Ignore selector query syntax errors
                }
            }
        }

        // 1. Direct hit-test match
        let video = elements.find(
            (el) => el.tagName === "VIDEO" || el.tagName === "AUDIO",
        ) as HTMLVideoElement | HTMLAudioElement | undefined;
        let display: HTMLBaseElement | undefined =
            video as unknown as HTMLBaseElement;

        // 2. Fallback: video with pointer-events: none or nested inside a hovered container
        if (!video) {
            for (const el of elements) {
                // Don't search top-level document roots to avoid scanning unrelated videos on the page
                if (
                    el.tagName === "HTML" ||
                    el.tagName === "BODY" ||
                    el.id === "__next"
                ) {
                    continue;
                }

                const nestedVideo = el.querySelector<
                    HTMLVideoElement | HTMLAudioElement
                >("video, audio");
                if (nestedVideo) {
                    const rect = nestedVideo.getBoundingClientRect();
                    if (
                        mouseX >= rect.left &&
                        mouseX <= rect.right &&
                        mouseY >= rect.top &&
                        mouseY <= rect.bottom
                    ) {
                        video = nestedVideo;
                        display = el as unknown as HTMLBaseElement;
                        break;
                    }
                }
            }
        }

        return video
            ? {
                  display: display || (video as unknown as HTMLBaseElement),
                  video: video as HTMLVideoElement,
              }
            : null;
    }

    protected getVideo(mouseX: number, mouseY: number): videoElements | null {
        const elements = document.elementsFromPoint(mouseX, mouseY);

        if (this.isIgnored(elements)) {
            debug("Found blacklisted overlay, aborting scroll");
            return null;
        }

        console.log("SCROLL ELEMENTS");
        console.log(elements);

        return this.getVideoFromElements(elements, mouseX, mouseY);
    }

    protected getVideoState(video: HTMLVideoElement): VideoState {
        let state = this.volumeTargets.get(video);
        if (!state) {
            state = {
                targetVolume: video.volume,
                isMuted: video.muted,
                isPaused: video.paused,
                videoId: `video-${this.videoIdCounter++}`,
            };
            this.volumeTargets.set(video, state);
        }
        return state;
    }

    protected getAllVideos(): HTMLVideoElement[] {
        const videos = Array.from(
            document.getElementsByTagName("VIDEO"),
        ) as HTMLVideoElement[];
        const audios = Array.from(
            document.getElementsByTagName("AUDIO"),
        ) as HTMLVideoElement[];
        return [...videos, ...audios];
    }

    private updateOverlay(
        e: MouseEvent,
        display: HTMLElement,
        type: OverlayType,
        volume: number,
        body: HTMLElement,
        video: HTMLVideoElement,
    ): void {
        if (!this.settings.useOverlay) return;

        // Try to find existing container if we don't have a valid reference
        if (!this.overlayContainer || !this.overlayContainer.isConnected) {
            this.overlayContainer = document.getElementById(
                "volumeScrollOverlayContainer",
            );

            if (!this.overlayContainer) {
                const fs = getFullscreenElement();
                if (fs && fs.shadowRoot) {
                    this.overlayContainer = fs.shadowRoot.querySelector(
                        "#volumeScrollOverlayContainer",
                    ) as HTMLElement;
                }
            }
        }

        if (!this.overlayContainer) {
            debug("Overlay container does not exist, creating a new container");
            this.overlayContainer = document.createElement("div");
            this.overlayContainer.id = "volumeScrollOverlayContainer";
            const shadow =
                this.overlayContainer.shadowRoot ||
                this.overlayContainer.attachShadow({ mode: "open" });
            body.appendChild(this.overlayContainer);
            this.reactRoot = createRoot(shadow);
        } else if (!this.reactRoot) {
            const shadow =
                this.overlayContainer.shadowRoot ||
                this.overlayContainer.attachShadow({ mode: "open" });
            this.reactRoot = createRoot(shadow);
        }

        let container = this.overlayContainer;

        // Move container next to video in DOM (do this before measuring/positioning)
        const fullscreenElement = getFullscreenElement();
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

        const parentRect = (
            container.offsetParent || body
        ).getBoundingClientRect();

        const displayRect = display.getBoundingClientRect();

        this.animationKey++;

        const state = this.getVideoState(video);

        this.reactRoot.render(
            <VolumeOverlay
                key={state.videoId}
                volume={volume}
                mouseX={e.clientX}
                mouseY={e.clientY}
                isMuted={video.muted}
                isPaused={video.paused}
                settings={this.settings}
                customOverlays={this.customOverlays}
                type={type}
                animationKey={this.animationKey}
                playerRect={displayRect}
                parentRect={parentRect}
            />,
        );
    }

    protected shouldRevertVolume(
        video: HTMLVideoElement,
        currentVolume: number,
        targetVolume: number,
    ): boolean {
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
        if (this.isDisabled) return;
        if (this.watchdogs.has(video)) return;
        this.watchdogs.add(video);
        debug("Attached volume watchdog");

        const enforceVolume = () => {
            if (this.isDisabled) return;
            const state: VideoState | undefined = this.volumeTargets.get(video);

            if (state === undefined || this.isSettingInternally) return;

            if (!this.hasAudio(video)) {
                return;
            }

            // Only enforce if the corresponding feature is enabled
            const enforceVolume = this.settings.useMouseWheelVolume;
            const enforceMute = this.settings.useToggleMuteKey;

            if (!enforceVolume && !enforceMute) return;

            const needsRevert =
                (enforceVolume &&
                    this.shouldRevertVolume(
                        video,
                        video.volume,
                        state.targetVolume,
                    )) ||
                (enforceMute && state.isMuted !== video.muted);

            if (needsRevert) {
                debug(
                    `Site tried to change volume/mute to ${video.volume} (muted: ${video.muted}), forcing back to internal state: ${state.targetVolume} (muted: ${state.isMuted || state.targetVolume <= 0})`,
                    video,
                );

                // Force it back. We use setTimeout to ensure we run after any other site listeners
                setTimeout(() => {
                    if (this.isDisabled) return;
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

        this.watchdogListeners.set(video, enforceVolume);
    }

    private removeVolumeWatchdog(video: HTMLVideoElement): void {
        const enforceVolume = this.watchdogListeners.get(video);
        if (enforceVolume) {
            video.removeEventListener("volumechange", enforceVolume);
            video.removeEventListener("play", enforceVolume);
            video.removeEventListener("playing", enforceVolume);
            this.watchdogs.delete(video);
            this.watchdogListeners.delete(video);
            video.removeAttribute("data-vs-locked-volume");
            video.removeAttribute("data-vs-locked-mute");
            debug("Removed volume watchdog");
        }
    }

    protected setVolume(
        volume: number,
        video: HTMLVideoElement,
        isMuted?: boolean,
    ): number {
        if (this.isDisabled) return volume;
        debug(`New volume set to: ${volume}`);

        // Set volume initially
        let state = this.getVideoState(video);
        state.targetVolume = volume / 100;
        state.isMuted = isMuted !== undefined ? isMuted : volume <= 0;

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
                const gainValue = state.isMuted ? 0 : volume / 100;

                // Use setValueAtTime for immediate and precise application
                if (this.audioCtx) {
                    gainNode.gain.cancelScheduledValues(
                        this.audioCtx.currentTime,
                    );
                    gainNode.gain.setValueAtTime(
                        gainValue,
                        this.audioCtx.currentTime,
                    );
                } else {
                    gainNode.gain.value = gainValue;
                }

                debug(
                    `Set GainNode value to ${gainValue} for ${video.currentSrc}`,
                    gainNode,
                );
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
                    gainNode.gain.cancelScheduledValues(
                        this.audioCtx.currentTime,
                    );
                    gainNode.gain.setValueAtTime(
                        gainValue,
                        this.audioCtx.currentTime,
                    );
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

    private updateVolume(
        e: WheelEvent,
        videoGroup: videoElements,
        direction: number,
        body: HTMLElement,
    ): void {
        //Invert direction if enabled
        if (this.settings.invertScrollDirection) {
            direction *= -1;
        }

        // Retrieve stored previous volume
        const state: VideoState | undefined = this.volumeTargets.get(
            videoGroup.video,
        );
        let previousVolume: number = 0;
        let type: OverlayType = "volume";

        let isCurrentlyMuted = false;
        if (state !== undefined && !isNaN(state.targetVolume)) {
            previousVolume = Math.round(state.targetVolume * 100);
            isCurrentlyMuted = state.isMuted;
        } else {
            previousVolume = Math.round(videoGroup.video.volume * 100);
            isCurrentlyMuted = videoGroup.video.muted;
        }

        if (isNaN(previousVolume)) {
            previousVolume = 0;
        }

        if (isCurrentlyMuted) {
            if (previousVolume > 0 || direction === 1) {
                type = "unmute";
            }
        }

        debug(`Previous volume was: ${previousVolume}`);
        let increment: number = this.settings.volumeIncrement;
        let threshold: number = this.settings.volumeIncrement;
        const isAltVolumeKeyPressed = isHotkeyPressed(
            e,
            this.settings.alternateVolumeIncrementHotkey,
        );

        if (
            this.settings.useAlternateVolumeIncrement &&
            isAltVolumeKeyPressed
        ) {
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
            } else if (direction === 1 && previousVolume < threshold) {
                increment = 1;
            }
        }

        debug(`Increment set to: ${increment}`);

        let newVolume: number = previousVolume + increment * direction;

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

        if (previousVolume > 0 && effectiveVolume === 0) {
            type = "mute";
        }

        this.updateOverlay(
            e,
            videoGroup.display,
            type,
            effectiveVolume,
            body,
            videoGroup.video,
        );
    }

    public scroll(e: WheelEvent, body: HTMLElement): boolean {
        // Get video
        const videoGroup: videoElements | null = this.getVideo(
            e.clientX,
            e.clientY,
        );

        if (videoGroup === null) {
            debug("Video group was null, returning");
            return false;
        }

        debug("Got video group: ", videoGroup);

        if (!this.hasAudio(videoGroup.video)) {
            debug("Video has no audio track, returning");
            return false;
        }

        if (this.settings.playingOnly && videoGroup.video.paused) {
            debug(
                "Video is paused and playingOnly setting is enabled, returning",
            );
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
        if (e.deltaMode === 1) {
            // Lines
            delta *= 33.3;
        } else if (e.deltaMode === 2) {
            // Pages
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

        debug(
            "Scroll direction: " + `${direction > 0 ? "UP" : "DOWN"}`,
            direction,
        );

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
                        // Check if the added node is itself a video or audio element
                        if (
                            node.tagName === "VIDEO" ||
                            node.tagName === "AUDIO"
                        ) {
                            const video = node as HTMLVideoElement;
                            // Always pre-warm CORS regardless of useDefaultVolume
                            this.prewarmCorsIfNeeded(video);
                            if (this.volumeTargets.has(video)) {
                                debug(
                                    "Already tracking this video, skipping default volume reset",
                                    video,
                                );
                            } else {
                                this.applyDefaultVolume(video);
                            }
                        }
                        // Check if the added node contains video/audio elements
                        // (e.g. a div with a video or audio inside)
                        else {
                            const nestedMedia =
                                node.querySelectorAll<HTMLVideoElement>(
                                    "video, audio",
                                );
                            for (let videoElement of nestedMedia) {
                                // Always pre-warm CORS regardless of useDefaultVolume
                                this.prewarmCorsIfNeeded(videoElement);
                                if (this.volumeTargets.has(videoElement)) {
                                    debug(
                                        "Already tracking this nested video, skipping default volume reset",
                                        videoElement,
                                    );
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

    protected applyDefaultVolume(video: HTMLVideoElement) {
        debug("New video found: ", video);
        debug("Default volume set to: ", this.settings.defaultVolume);
        this.setVolume(
            this.settings.defaultVolume,
            video,
            this.settings.startMuted,
        );
    }

    public stopVideoObserver() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
            debug("Stopped MutationObserver");
        }
    }

    public removeAllWatchdogs(): void {
        const videos = Array.from(this.watchdogs);
        for (const video of videos) {
            this.removeVolumeWatchdog(video);
        }
        this.watchdogs.clear();
    }

    public setDisabled(disabled: boolean): void {
        if (this.isDisabled === disabled) return;
        this.isDisabled = disabled;
        debug(`Handler disabled state changed to: ${disabled}`);

        if (disabled) {
            this.stopVideoObserver();
            this.removeAllWatchdogs();
        }
    }

    public setDefaultVolume(body: HTMLElement) {
        if (this.isDisabled) return;
        const videoCollection: HTMLVideoElement[] =
            this.getAllVideos() as HTMLVideoElement[];
        debug("Setting default volume for: ", videoCollection);

        for (let tag of videoCollection) {
            let video: HTMLVideoElement = tag as HTMLVideoElement;
            // Always pre-warm CORS regardless of whether this video is already tracked
            this.prewarmCorsIfNeeded(video);
            if (this.volumeTargets.has(video)) {
                debug(
                    "Already tracking this video, skipping default volume reset",
                    video,
                );
                if (!this.watchdogs.has(video)) {
                    this.attachVolumeWatchdog(video);
                }
                continue;
            }
            this.applyDefaultVolume(video);
        }

        this.startVideoObserver(body);
    }

    /**
     * Starts the MutationObserver and scans existing videos solely for CORS
     * pre-warming. Called unconditionally (even when useDefaultVolume is off)
     * so that audio boost always works on the first scroll above 100%.
     */
    public startCorsPrewarm(body: HTMLElement): void {
        if (this.isDisabled) return;
        // Scan videos already on the page
        const videoCollection = this.getAllVideos() as HTMLVideoElement[];
        for (const video of videoCollection) {
            this.prewarmCorsIfNeeded(video);
        }
        // Start the observer so future videos are also pre-warmed
        this.startVideoObserver(body);
    }

    public toggleMute(e: MouseEvent, body: HTMLElement): boolean {
        const videoGroup: videoElements | null = this.getVideo(
            e.clientX,
            e.clientY,
        );

        if (!videoGroup) return false;

        const video = videoGroup.video;

        if (!this.hasAudio(video)) {
            debug("Video has no audio track, returning");
            return false;
        }

        debug(`Found video: ${video}`);
        let state = this.getVideoState(video);
        debug(`Video state: ${state}`);

        if (video.muted || state.isMuted) {
            // Unmute: Restore target volume (or 1 increment if at 0)
            let restoreVolume =
                state.targetVolume > 0
                    ? state.targetVolume * 100
                    : this.settings.usePreciseScroll
                      ? 1
                      : this.settings.volumeIncrement;

            debug(`Unmuting. Restoring volume to ${restoreVolume}`);
            this.setVolume(restoreVolume, video, false);
            this.updateOverlay(
                e,
                videoGroup.display,
                "unmute",
                restoreVolume,
                body,
                videoGroup.video,
            );
        } else {
            // Mute: Keep current target volume
            debug(`Muting. Saving volume ${state.targetVolume} and muting`);
            this.setVolume(state.targetVolume * 100, video, true);
            this.updateOverlay(
                e,
                videoGroup.display,
                "mute",
                state.targetVolume * 100,
                body,
                videoGroup.video,
            );
        }

        return true;
    }

    public togglePause(e: MouseEvent, body: HTMLElement): boolean {
        const videoGroup: videoElements | null = this.getVideo(
            e.clientX,
            e.clientY,
        );

        if (!videoGroup) return false;

        const video = videoGroup.video;
        debug(`Found video: ${video}`);
        let state = this.getVideoState(video);
        debug(`Video state: ${state}`);

        if (video.paused) {
            debug(`Unpausing`);
            state.isPaused = false;
            this.updateOverlay(
                e,
                videoGroup.display,
                "play",
                state.targetVolume * 100,
                body,
                videoGroup.video,
            );
        } else {
            debug(`Pausing`);
            state.isPaused = true;
            this.updateOverlay(
                e,
                videoGroup.display,
                "pause",
                state.targetVolume * 100,
                body,
                videoGroup.video,
            );
        }

        this.volumeTargets.set(video, state);
        state.isPaused ? video.pause() : video.play();

        return true;
    }
}
