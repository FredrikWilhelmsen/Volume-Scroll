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

    // Calculate right-side offset relative to parent container
    const barRight =
        playerRect && parentRect ? parentRect.right - playerRect.right : 0;

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

    // Determine layout and rotation parameters based on side ("left" or "right")
    const isRightSide = settings.overlayBarSide === "right";
    const rotation = settings.useDutchAngle
        ? isRightSide
            ? "rotate(6deg)"
            : "rotate(-6deg)"
        : "none";

    const transformOrigin = isRightSide ? "right top" : "left top";
    const flexDirection = isRightSide ? "row-reverse" : "row";

    const showIconsWrapper = icons.length > 0 || settings.showNumericValue;

    // Adjust the seamless adjacent borders dynamically
    const barBorderRadius = isRightSide
        ? showIconsWrapper
            ? "0 12px 12px 12px"
            : "12px" // Flatten top-left corner
        : showIconsWrapper
          ? "12px 0 12px 12px"
          : "12px"; // Flatten top-right corner

    const iconsBorderRadius = isRightSide ? "12px 0 0 12px" : "0 12px 12px 0";
    const iconsPaddingLeft = isRightSide ? "16px" : "0";
    const iconsPaddingRight = isRightSide ? "0" : "16px";

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
                    flex-direction: ${flexDirection};
                    align-items: flex-start;
                    
                    /* Dynamic Dutch angle setup */
                    transform: ${rotation} !important;
                    transform-origin: ${transformOrigin} !important;
                }
                .volumeScrollBarBackgroundWrapper {
                    background-color: ${settings.useOverlayBackground ? `rgba(30, 30, 30, ${settings.overlayBackgroundOpacity / 100})` : "transparent"};
                    height: 100%;
                    padding: 16px;
                    box-sizing: border-box;
                    border-radius: ${barBorderRadius};
                }
                .volumeScrollBarIconsWrapper {
                    background-color: ${settings.useOverlayBackground ? `rgba(30, 30, 30, ${settings.overlayBackgroundOpacity / 100})` : "transparent"};
                    padding: 16px;
                    padding-left: ${iconsPaddingLeft};
                    padding-right: ${iconsPaddingRight};
                    box-sizing: border-box;
                    border-radius: ${iconsBorderRadius};
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
                    top: `${barTop + barHeight * 0.1}px`,
                    height: `${barHeight * 0.8}px`,
                    // Symmetrical positioning from the video container boundaries
                    ...(isRightSide
                        ? { right: `${barRight + 20}px` }
                        : { left: `${barLeft + 20}px` }),
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
                {showIconsWrapper && (
                    <div className="volumeScrollBarIconsWrapper">
                        <div className="volumeScrollBarIcons">
                            {settings.showNumericValue && (
                                <div
                                    style={{
                                        fontWeight: "bold",
                                        fontFamily: "Roboto, Arial, sans-serif",
                                        textShadow:
                                            "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                                        color:
                                            volume > 100
                                                ? settings.boostedColor
                                                : settings.overlayColor,
                                        fontSize: `${settings.fontSize * 0.85}px`,
                                        lineHeight: 1,
                                    }}
                                >
                                    {Math.round(volume)}
                                </div>
                            )}
                            {icons}
                        </div>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};
