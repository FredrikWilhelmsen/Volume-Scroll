import React, { useState, useEffect } from "react";
import { Settings, OverlayType, CustomOverlay as CustomOverlayType } from "../types";
import { debug } from "../utils";
import { NumberOverlay } from "./overlays/NumberOverlay";
import { BarOverlay } from "./overlays/BarOverlay";
import { CircleOverlay } from "./overlays/CircleOverlay";
import { RetroBarOverlay } from "./overlays/RetroBarOverlay";
import { CustomOverlay } from "./overlays/CustomOverlay";

export interface VolumeOverlayProps {
    type: OverlayType;
    volume: number;
    mouseX: number;
    mouseY: number;
    isMuted?: boolean;
    isPaused?: boolean;
    settings: Settings;
    customOverlays?: Record<string, CustomOverlayType>;
    animationKey: number;
    playerRect?: DOMRect;
    parentRect?: DOMRect;
}

export const VolumeOverlay: React.FC<VolumeOverlayProps> = ({
    type,
    volume,
    mouseX,
    mouseY,
    isMuted,
    isPaused,
    settings,
    customOverlays,
    animationKey,
    playerRect,
    parentRect,
}) => {
    const [lastMuteStickyTime, setLastMuteStickyTime] = useState(0);
    const [lastMuteStickyType, setLastMuteStickyType] =
        useState<OverlayType | null>(null);
    const [lastPauseStickyTime, setLastPauseStickyTime] = useState(0);
    const [lastPauseStickyType, setLastPauseStickyType] =
        useState<OverlayType | null>(null);

    const [refreshCount, setRefreshCount] = useState(0);
    const volumeDisplay = Math.round(volume);
    const currentIsMuted = isMuted || volumeDisplay === 0;

    useEffect(() => {
        if (type === "unmute" || type === "mute") {
            setLastMuteStickyTime(Date.now());
            setLastMuteStickyType(type);
        }

        if (type === "pause" || type === "play") {
            setLastPauseStickyTime(Date.now());
            setLastPauseStickyType(type);
        }
    }, [type, animationKey, currentIsMuted]);

    const stickyDuration =
        settings.overlayDuration === 0 ? 2000 : settings.overlayDuration;
    const isMuteSticky =
        lastMuteStickyTime !== 0 &&
        Date.now() - lastMuteStickyTime < stickyDuration;
    const isPauseSticky =
        lastPauseStickyTime !== 0 &&
        Date.now() - lastPauseStickyTime < stickyDuration;

    useEffect(() => {
        const now = Date.now();
        const timers: any[] = [];

        if (isMuteSticky && settings.overlayDuration === 0) {
            const remaining = stickyDuration - (now - lastMuteStickyTime);
            timers.push(
                setTimeout(
                    () => setRefreshCount((prev) => prev + 1),
                    remaining + 50,
                ),
            );
        }

        if (isPauseSticky && settings.overlayDuration === 0) {
            const remaining = stickyDuration - (now - lastPauseStickyTime);
            timers.push(
                setTimeout(
                    () => setRefreshCount((prev) => prev + 1),
                    remaining + 50,
                ),
            );
        }

        return () => timers.forEach(clearTimeout);
    }, [
        isMuteSticky,
        isPauseSticky,
        lastMuteStickyTime,
        lastPauseStickyTime,
        stickyDuration,
        settings.overlayDuration,
    ]);

    const fadeStartPercentage =
        settings.overlayDuration > 250
            ? Math.round(
                  ((settings.overlayDuration - 250) /
                      settings.overlayDuration) *
                      100,
              )
            : 0;

    if (settings.overlayStyle === "bar") {
        return (
            <BarOverlay
                volume={volume}
                mouseX={mouseX}
                mouseY={mouseY}
                settings={settings}
                animationKey={animationKey}
                fadeStartPercentage={fadeStartPercentage}
                playerRect={playerRect}
                parentRect={parentRect}
                isMuteSticky={isMuteSticky}
                lastMuteStickyType={lastMuteStickyType}
                isPauseSticky={isPauseSticky}
                lastPauseStickyType={lastPauseStickyType}
            />
        );
    }

    if (settings.overlayStyle === "circle") {
        return (
            <CircleOverlay
                volume={volume}
                mouseX={mouseX}
                mouseY={mouseY}
                settings={settings}
                animationKey={animationKey}
                fadeStartPercentage={fadeStartPercentage}
                playerRect={playerRect}
                parentRect={parentRect}
                isMuteSticky={isMuteSticky}
                lastMuteStickyType={lastMuteStickyType}
                isPauseSticky={isPauseSticky}
                lastPauseStickyType={lastPauseStickyType}
            />
        );
    }

    if (settings.overlayStyle === "retro") {
        return (
            <RetroBarOverlay
                volume={volume}
                mouseX={mouseX}
                mouseY={mouseY}
                settings={settings}
                animationKey={animationKey}
                fadeStartPercentage={fadeStartPercentage}
                playerRect={playerRect}
                parentRect={parentRect}
                isMuteSticky={isMuteSticky}
                lastMuteStickyType={lastMuteStickyType}
                isPauseSticky={isPauseSticky}
                lastPauseStickyType={lastPauseStickyType}
            />
        );
    }

    const hasSelectedCustomOverlay =
        Boolean(settings.customOverlay) &&
        Boolean(customOverlays?.[settings.customOverlay]);

    if (settings.overlayStyle === "custom") {
        if (hasSelectedCustomOverlay) {
            return (
                <CustomOverlay
                    volume={volume}
                    mouseX={mouseX}
                    mouseY={mouseY}
                    settings={settings}
                    customOverlays={customOverlays}
                    animationKey={animationKey}
                    fadeStartPercentage={fadeStartPercentage}
                    playerRect={playerRect}
                    parentRect={parentRect}
                    isMuteSticky={isMuteSticky}
                    lastMuteStickyType={lastMuteStickyType}
                    isPauseSticky={isPauseSticky}
                    lastPauseStickyType={lastPauseStickyType}
                />
            );
        }

        debug(
            `Custom overlay "${settings.customOverlay}" not found or none selected. Defaulting to NumberOverlay.`,
            {
                customOverlay: settings.customOverlay,
                availableOverlays: customOverlays
                    ? Object.keys(customOverlays)
                    : [],
            },
        );
    }

    return (
        <NumberOverlay
            volume={volume}
            mouseX={mouseX}
            mouseY={mouseY}
            settings={settings}
            animationKey={animationKey}
            fadeStartPercentage={fadeStartPercentage}
            playerRect={playerRect}
            parentRect={parentRect}
            isMuteSticky={isMuteSticky}
            lastMuteStickyType={lastMuteStickyType}
            isPauseSticky={isPauseSticky}
            lastPauseStickyType={lastPauseStickyType}
        />
    );
};
