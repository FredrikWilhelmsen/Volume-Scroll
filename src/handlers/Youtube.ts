import { DefaultHandler } from "./Default";

export class YoutubeHandler extends DefaultHandler {
    protected name: string = "YoutubeHandler";
    protected domains: string[] = ["www.youtube.com"];

    protected setVolume(
        volume: number,
        video: HTMLVideoElement,
        force?: boolean | undefined,
    ): number {
        const calculatedVolume: number = super.setVolume(volume, video, force);

        const volumePanel =
            video.parentElement?.querySelector(".ytp-volume-panel") ??
            video
                .closest(".html5-video-player")
                ?.querySelector(".ytp-volume-panel");

        if (volumePanel) {
            const cappedVolume = Math.min(
                100,
                Math.max(0, Math.round(calculatedVolume)),
            );
            volumePanel.setAttribute("aria-valuenow", cappedVolume.toString());
            volumePanel.setAttribute(
                "aria-valuetext",
                `${cappedVolume}% volume`,
            );

            const handle = volumePanel.querySelector<HTMLElement>(
                ".ytp-volume-slider-handle",
            );
            if (handle) {
                const pxOffset = (cappedVolume / 100) * 40;
                handle.style = `left: ${pxOffset}px`;
            }
        }

        return calculatedVolume;
    }
}
