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
                    for (const player of capturedPlayers) {
                        if (player.volume !== proxy.volume) {
                            originalVolSet.call(player, proxy.volume);
                        }
                        if (player.muted !== proxy.muted) {
                            originalMuteSet.call(player, proxy.muted);
                        }
                    }
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

                    player.addEventListener("volumechange", () => {
                        player.removeAttribute("data-vs-locked-volume");
                        player.removeAttribute("data-vs-locked-mute");
                        const p = createProxy();
                        const currentVol = originalVolGet.call(player);
                        const currentMute = originalMuteGet.call(player);
                        if (p.volume !== currentVol) {
                            p.volume = currentVol;
                        }
                        if (p.muted !== currentMute) {
                            p.muted = currentMute;
                        }
                    });

                    if (proxy) {
                        const currentVol = originalVolGet.call(proxy);
                        const currentMute = originalMuteGet.call(proxy);
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
