import React from "react";
import { Settings, OverlayType } from "../../types";
import { MutedIcon, UnmutedIcon, PlayIcon, PauseIcon } from "./Icons";

export interface RetroBarOverlayProps {
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

export const RetroBarOverlay: React.FC<RetroBarOverlayProps> = ({
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

    // Adjust the seamless adjacent borders dynamically
    const barBorderRadius = isRightSide
        ? icons.length > 0
            ? "0 12px 12px 12px"
            : "12px"
        : icons.length > 0
          ? "12px 0 12px 12px"
          : "12px";

    const iconsBorderRadius = isRightSide ? "12px 0 0 12px" : "0 12px 12px 0";
    const iconsPaddingLeft = isRightSide ? "16px" : "0";
    const iconsPaddingRight = isRightSide ? "0" : "16px";

    // Safe increment check
    const increment =
        settings.volumeIncrement && settings.volumeIncrement > 0
            ? settings.volumeIncrement
            : 5;

    // Highest step of the increment grid that is <= 100%
    const transitionThreshold = 100 - (100 % increment);
    const normalCeiling = transitionThreshold > 0 ? transitionThreshold : 100;

    const isBoostActive =
        settings.doBoostVolume &&
        volume > 100 &&
        settings.volumeBoostAmount > 100;

    let totalBlocksCount = 0;
    let blocks: Array<{
        id: number;
        fillRatio: number;
        fillColor: string;
        backgroundColor: string;
        isBgDimmed: boolean;
    }> = [];

    if (!isBoostActive) {
        // Normal Mode: standard 0% up to the normalCeiling (e.g. 98% for an increment of 7)
        totalBlocksCount = Math.ceil(normalCeiling / increment);

        blocks = Array.from({ length: totalBlocksCount }).map((_, index) => {
            const blockMin = index * increment;
            const blockMax = (index + 1) * increment;

            // Clamp to normalCeiling (prevents impossible-to-fill remainder block)
            const currentBlockMax = Math.min(blockMax, normalCeiling);
            const blockRange = currentBlockMax - blockMin;

            let fillRatio = 0;
            if (blockRange > 0) {
                fillRatio = Math.max(
                    0,
                    Math.min(1, (volume - blockMin) / blockRange),
                );
            }

            return {
                id: index,
                fillRatio,
                fillColor: settings.overlayColor,
                backgroundColor: settings.overlayColor,
                isBgDimmed: true,
            };
        });
    } else {
        // Boost Mode: transitionThreshold% - volumeBoostAmount%
        const boostCeiling = settings.volumeBoostAmount - transitionThreshold;
        totalBlocksCount = Math.ceil(boostCeiling / increment);
        const boostVolume = volume - transitionThreshold;

        blocks = Array.from({ length: totalBlocksCount }).map((_, index) => {
            const blockMin = index * increment;
            const blockMax = (index + 1) * increment;

            // Clamp the max range of the final block to the exact boost limit
            const currentBlockMax = Math.min(blockMax, boostCeiling);
            const blockRange = currentBlockMax - blockMin;

            let fillRatio = 0;
            if (blockRange > 0) {
                fillRatio = Math.max(
                    0,
                    Math.min(1, (boostVolume - blockMin) / blockRange),
                );
            }

            return {
                id: index,
                fillRatio,
                fillColor: settings.boostedColor,
                backgroundColor: settings.overlayColor,
                isBgDimmed: false,
            };
        });
    }

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
                    padding: 6px;
                    box-sizing: border-box;
                }
                .volumeScrollBarBlockContainer {
                    display: flex;
                    flex-direction: column-reverse; /* Bottom blocks render first */
                    gap: 3px;
                    height: 100%;
                    width: 100%;
                }
                .volumeScrollBarBlock {
                    position: relative;
                    flex: 1;
                    width: 100%;
                    overflow: hidden;
                    border-radius: 1px;
                }
                .volumeScrollBarBlockBg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .volumeScrollBarBlockFill {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    transition: height 0.08s ease-out;
                    z-index: 2;
                }
            `}</style>
            <div
                key={animationKey}
                className="volumeScrollBarOverlay"
                style={{
                    top: `${barTop + barHeight * 0.1}px`,
                    height: `${barHeight * 0.8}px`,
                    ...(isRightSide
                        ? { right: `${barRight + 20}px` }
                        : { left: `${barLeft + 20}px` }),
                }}
            >
                <div className="volumeScrollBarBackgroundWrapper">
                    <div className="volumeScrollBarContainer">
                        <div className="volumeScrollBarBlockContainer">
                            {blocks.map((block) => (
                                <div
                                    key={block.id}
                                    className="volumeScrollBarBlock"
                                >
                                    <div
                                        className="volumeScrollBarBlockBg"
                                        style={{
                                            backgroundColor:
                                                block.backgroundColor,
                                            opacity: block.isBgDimmed
                                                ? 0.15
                                                : 1.0,
                                        }}
                                    />
                                    <div
                                        className="volumeScrollBarBlockFill"
                                        style={{
                                            height: `${block.fillRatio * 100}%`,
                                            backgroundColor: block.fillColor,
                                        }}
                                    />
                                </div>
                            ))}
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
