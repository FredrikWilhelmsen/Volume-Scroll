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

(function () {
    try {
        const originalCreateElement = document.createElement;
        const volDesc = Object.getOwnPropertyDescriptor(
            HTMLMediaElement.prototype,
            "volume",
        );
        const muteDesc = Object.getOwnPropertyDescriptor(
            HTMLMediaElement.prototype,
            "muted",
        );

        if (!volDesc || !muteDesc) return;

        console.log("Interceptor loaded for domain ", window.location.hostname);

        const originalVolSet = volDesc.set;
        const originalMuteSet = muteDesc.set;
        const originalVolGet = volDesc.get;
        const originalMuteGet = muteDesc.get;

        if (
            !originalVolSet ||
            !originalMuteSet ||
            !originalVolGet ||
            !originalMuteGet
        )
            return;

        const isSpotify = window.location.hostname.includes("spotify.com");

        if (isSpotify) {
            const capturedPlayers: HTMLMediaElement[] = [];
            let proxy: HTMLVideoElement | null = null;

            const createProxy = () => {
                if (proxy) return proxy;
                proxy = originalCreateElement.call(
                    document,
                    "video",
                ) as HTMLVideoElement;
                proxy.id = "volume-scroll-spotify-proxy";
                proxy.style.setProperty("display", "none", "important");

                proxy.addEventListener("volumechange", () => {
                    if (!proxy) return;
                    console.log(
                        "[Volume Scroll] proxy volumechange event fired, volume:",
                        proxy.volume,
                        "muted:",
                        proxy.muted,
                    );
                    for (const player of capturedPlayers) {
                        if (player.volume !== proxy.volume) {
                            console.log(
                                "[Volume Scroll] Syncing player volume to:",
                                proxy.volume,
                            );
                            originalVolSet.call(player, proxy.volume);
                        }
                        if (player.muted !== proxy.muted) {
                            console.log(
                                "[Volume Scroll] Syncing player muted to:",
                                proxy.muted,
                            );
                            originalMuteSet.call(player, proxy.muted);
                        }
                    }
                });

                const observer = new MutationObserver((mutations) => {
                    console.log(
                        "[Volume Scroll] proxy MutationObserver triggered",
                    );
                    for (const mutation of mutations) {
                        if (mutation.type === "attributes") {
                            const attr = mutation.attributeName;
                            if (attr === "data-vs-locked-volume") {
                                const lockedVol = proxy!.getAttribute(
                                    "data-vs-locked-volume",
                                );
                                console.log(
                                    "[Volume Scroll] data-vs-locked-volume changed to:",
                                    lockedVol,
                                );
                                if (lockedVol !== null) {
                                    const vol = parseFloat(lockedVol);
                                    if (!isNaN(vol)) {
                                        for (const player of capturedPlayers) {
                                            if (
                                                originalVolGet.call(player) !==
                                                vol
                                            ) {
                                                console.log(
                                                    "[Volume Scroll] Syncing player volume to (via observer):",
                                                    vol,
                                                );
                                                originalVolSet.call(
                                                    player,
                                                    vol,
                                                );
                                            }
                                        }
                                    }
                                }
                            }
                            if (attr === "data-vs-locked-mute") {
                                const lockedMute = proxy!.getAttribute(
                                    "data-vs-locked-mute",
                                );
                                console.log(
                                    "[Volume Scroll] data-vs-locked-mute changed to:",
                                    lockedMute,
                                );
                                if (lockedMute !== null) {
                                    const mute = lockedMute === "true";
                                    for (const player of capturedPlayers) {
                                        if (
                                            originalMuteGet.call(player) !==
                                            mute
                                        ) {
                                            console.log(
                                                "[Volume Scroll] Syncing player muted to (via observer):",
                                                mute,
                                            );
                                            originalMuteSet.call(player, mute);
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                observer.observe(proxy, {
                    attributes: true,
                    attributeFilter: [
                        "data-vs-locked-volume",
                        "data-vs-locked-mute",
                    ],
                });

                proxy.addEventListener("play", () => {
                    for (const player of capturedPlayers) {
                        player.play().catch(() => {});
                    }
                });
                proxy.addEventListener("pause", () => {
                    for (const player of capturedPlayers) {
                        player.pause();
                    }
                });

                const appendProxy = () => {
                    if (document.documentElement) {
                        document.documentElement.appendChild(proxy!);
                    } else {
                        setTimeout(appendProxy, 50);
                    }
                };
                appendProxy();
                return proxy;
            };

            const registerPlayer = (player: HTMLMediaElement) => {
                if (!capturedPlayers.includes(player)) {
                    capturedPlayers.push(player);
                    console.log(
                        "[Volume Scroll] Intercepted Spotify player:",
                        player,
                    );

                    player.removeAttribute("data-vs-locked-volume");
                    player.removeAttribute("data-vs-locked-mute");

                    const p = createProxy();

                    player.addEventListener("volumechange", () => {
                        player.removeAttribute("data-vs-locked-volume");
                        player.removeAttribute("data-vs-locked-mute");
                        const currentVol = originalVolGet.call(player);
                        const currentMute = originalMuteGet.call(player);
                        if (p.volume !== currentVol) {
                            p.volume = currentVol;
                        }
                        if (p.muted !== currentMute) {
                            p.muted = currentMute;
                        }
                    });

                    if (capturedPlayers.length === 1) {
                        const currentVol = originalVolGet.call(player);
                        const currentMute = originalMuteGet.call(player);
                        if (p.volume !== currentVol) {
                            p.volume = currentVol;
                        }
                        if (p.muted !== currentMute) {
                            p.muted = currentMute;
                        }
                    } else {
                        const currentVol = originalVolGet.call(p);
                        const currentMute = originalMuteGet.call(p);
                        if (player.volume !== currentVol) {
                            originalVolSet.call(player, currentVol);
                        }
                        if (player.muted !== currentMute) {
                            originalMuteSet.call(player, currentMute);
                        }
                    }
                }
            };

            document.createElement = function (
                tagName: string,
                options?: ElementCreationOptions,
            ) {
                const element = originalCreateElement.call(
                    document,
                    tagName,
                    options,
                );
                const tag = tagName.toLowerCase();
                if (tag === "audio" || tag === "video") {
                    registerPlayer(element as HTMLMediaElement);
                }
                return element;
            };

            const OriginalAudio = window.Audio;
            window.Audio = class extends OriginalAudio {
                constructor(...args: any[]) {
                    super(...args);
                    registerPlayer(this);
                }
            } as any;
        }

        Object.defineProperty(HTMLMediaElement.prototype, "volume", {
            get: function () {
                return originalVolGet.call(this);
            },
            set: function (val: number) {
                if (
                    document.documentElement.hasAttribute(
                        "data-volume-scroll-disabled",
                    )
                ) {
                    originalVolSet.call(this, val);
                    return;
                }
                const locked = this.getAttribute("data-vs-locked-volume");
                if (locked !== null) {
                    const target = parseFloat(locked);
                    if (!isNaN(target) && Math.abs(val - target) > 0.001) {
                        console.log(
                            "Volume Scroll: Intercepted site volume set:",
                            val,
                            "keeping:",
                            target,
                        );
                        return;
                    }
                }
                originalVolSet.call(this, val);
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(HTMLMediaElement.prototype, "muted", {
            get: function () {
                return originalMuteGet.call(this);
            },
            set: function (val: boolean) {
                if (
                    document.documentElement.hasAttribute(
                        "data-volume-scroll-disabled",
                    )
                ) {
                    originalMuteSet.call(this, val);
                    return;
                }
                const locked = this.getAttribute("data-vs-locked-mute");
                if (locked !== null) {
                    const target = locked === "true";
                    if (val !== target) {
                        console.log(
                            "Volume Scroll: Intercepted site mute set:",
                            val,
                            "keeping:",
                            target,
                        );
                        return;
                    }
                }
                originalMuteSet.call(this, val);
            },
            configurable: true,
            enumerable: true,
        });
    } catch (e) {
        // Silently fail if something goes wrong with prototype patching
        console.log(
            "Volume Scroll: Failed to inject page-level volume interceptor",
            e,
        );
    }
})();
