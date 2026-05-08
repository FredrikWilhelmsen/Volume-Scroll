(function () {
    try {
        const volDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "volume");
        const muteDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "muted");

        if (!volDesc || !muteDesc) return;

        console.log("Interceptor loaded for domain ", window.location.hostname);

        const originalVolSet = volDesc.set;
        const originalMuteSet = muteDesc.set;
        const originalVolGet = volDesc.get;
        const originalMuteGet = muteDesc.get;

        if (!originalVolSet || !originalMuteSet || !originalVolGet || !originalMuteGet) return;

        Object.defineProperty(HTMLMediaElement.prototype, "volume", {
            get: function () {
                return originalVolGet.call(this);
            },
            set: function (val: number) {
                const locked = this.getAttribute("data-vs-locked-volume");
                if (locked !== null) {
                    const target = parseFloat(locked);
                    if (!isNaN(target) && Math.abs(val - target) > 0.001) {
                        console.log("Volume Scroll: Intercepted site volume set:", val, "keeping:", target);
                        return;
                    }
                }
                originalVolSet.call(this, val);
            },
            configurable: true,
            enumerable: true
        });

        Object.defineProperty(HTMLMediaElement.prototype, "muted", {
            get: function () {
                return originalMuteGet.call(this);
            },
            set: function (val: boolean) {
                const locked = this.getAttribute("data-vs-locked-mute");
                if (locked !== null) {
                    const target = locked === "true";
                    if (val !== target) {
                        console.log("Volume Scroll: Intercepted site mute set:", val, "keeping:", target);
                        return;
                    }
                }
                originalMuteSet.call(this, val);
            },
            configurable: true,
            enumerable: true
        });
    } catch (e) {
        // Silently fail if something goes wrong with prototype patching
        console.log("Volume Scroll: Failed to inject page-level volume interceptor", e);
    }
})();
