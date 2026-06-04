import React from "react";
import { Settings, OverlayType } from "../../types";
import { MutedIcon, UnmutedIcon, PlayIcon, PauseIcon } from "./Icons";

export interface BarOverlayProps {
    volume: number;
    mouseX: number;
    mouseY: number;
    settings: Settings;
    animationKey: number;
    fadeStartPercentage: number;
    playerRect?: DOMRect;
    parentRect?: DOMRect;
    isMuteSticky: boolean;
    lastMuteStickyType: OverlayType | null;
    isPauseSticky: boolean;
    lastPauseStickyType: OverlayType | null;
}

export const BarOverlay: React.FC<BarOverlayProps> = ({
    volume,
    mouseX,
    mouseY,
    settings,
    animationKey,
    fadeStartPercentage,
    playerRect,
    parentRect,
    isMuteSticky,
    lastMuteStickyType,
    isPauseSticky,
    lastPauseStickyType,
}) => {
    const barTop =
        playerRect && parentRect ? playerRect.top - parentRect.top : 0;
    const barLeft =
        playerRect && parentRect ? playerRect.left - parentRect.left : 0;
    const barHeight = playerRect ? playerRect.height : 200;

    const normalHeight = Math.min(volume, 100) + "%";
    const boostPercent =
        volume > 100
            ? ((volume - 100) / (settings.volumeBoostAmount - 100)) * 100
            : 0;
    const boostHeight = Math.min(boostPercent, 100) + "%";

    const borderColor =
        volume > 100 ? settings.boostedColor : settings.overlayColor;

    const icons: React.ReactNode[] = [];
    if (isMuteSticky && lastMuteStickyType) {
        icons.push(
            lastMuteStickyType === "mute" ? (
                <MutedIcon key="mute" />
            ) : (
                <UnmutedIcon key="unmute" />
            ),
        );
    }
    if (isPauseSticky && lastPauseStickyType) {
        icons.push(
            lastPauseStickyType === "play" ? (
                <PlayIcon key="play" />
            ) : (
                <PauseIcon key="pause" />
            ),
        );
    }

    // Determine rotation transform based on the Dutch angle setting (note, anchored top left, would need changing if positioned differently)
    const rotation = settings.useDutchAngle ? "rotate(-6deg)" : "none";

    return (
        <React.Fragment>
            <style>{`
                @keyframes volumeScrollFade {
                    0% { opacity: 1; }
                    ${fadeStartPercentage}% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .volumeScrollBarOverlay {
                    position: absolute !important;
                    visibility: visible !important;
                    z-index: 9999999 !important;
                    pointer-events: none;
                    opacity: ${settings.overlayDuration === 0 ? 1 : 0};
                    animation: ${settings.overlayDuration === 0 ? "none" : `volumeScrollFade ${settings.overlayDuration}ms normal forwards`};
                    
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                    
                    /* Applies rotation with an anchor pinned to the top-left */
                    transform: ${rotation} !important;
                    transform-origin: left top !important;
                }
                .volumeScrollBarBackgroundWrapper {
                    background-color: ${settings.useOverlayBackground ? `rgba(30, 30, 30, ${settings.overlayBackgroundOpacity / 100})` : "transparent"};
                    height: 100%;
                    padding: 16px;
                    box-sizing: border-box;
                    border-radius: ${icons.length > 0 ? "12px 0 12px 12px" : "12px"};
                }
                .volumeScrollBarIconsWrapper {
                    background-color: ${settings.useOverlayBackground ? `rgba(30, 30, 30, ${settings.overlayBackgroundOpacity / 100})` : "transparent"};
                    padding: 16px;
                    padding-left: 0;
                    box-sizing: border-box;
                    border-radius: 0 12px 12px 0;
                }
                .volumeScrollBarIcons {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    color: ${volume > 100 ? settings.boostedColor : settings.overlayColor};
                    font-size: ${settings.fontSize}px;
                }
                .volumeScrollBarContainer {
                    position: relative;
                    width: 40px;
                    height: 100%;
                    border: 4px solid ${borderColor};
                    padding: 8px;
                    box-sizing: border-box;
                }
                .volumeScrollBarFillContainer {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                .volumeScrollBarNormal {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background-color: ${settings.overlayColor};
                    transition: height 0.1s ease-out;
                }
                .volumeScrollBarBoost {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background-color: ${settings.boostedColor};
                    transition: height 0.1s ease-out;
                    z-index: 2;
                }
            `}</style>
            <div
                key={animationKey}
                className="volumeScrollBarOverlay"
                style={{
                    left: `${barLeft + 20}px`,
                    top: `${barTop + barHeight * 0.1}px`,
                    height: `${barHeight * 0.8}px`,
                }}
            >
                <div className="volumeScrollBarBackgroundWrapper">
                    <div className="volumeScrollBarContainer">
                        <div className="volumeScrollBarFillContainer">
                            <div
                                className="volumeScrollBarNormal"
                                style={{ height: normalHeight }}
                            />
                            <div
                                className="volumeScrollBarBoost"
                                style={{ height: boostHeight }}
                            />
                        </div>
                    </div>
                </div>
                {icons.length > 0 && (
                    <div className="volumeScrollBarIconsWrapper">
                        <div className="volumeScrollBarIcons">{icons}</div>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};
