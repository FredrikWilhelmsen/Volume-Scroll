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

    // Calculate right-side and bottom-side offset relative to parent container
    const barRight =
        playerRect && parentRect ? parentRect.right - playerRect.right : 0;
    const barBottom =
        playerRect && parentRect ? parentRect.bottom - playerRect.bottom : 0;

    const barHeight = playerRect ? playerRect.height : 200;
    const barWidth = playerRect ? playerRect.width : 200;

    const normalFill = Math.min(volume, 100) + "%";
    const boostPercent =
        volume > 100
            ? ((volume - 100) / (settings.volumeBoostAmount - 100)) * 100
            : 0;
    const boostFill = Math.min(boostPercent, 100) + "%";

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

    // Determine layout and rotation parameters based on side
    const isRightSide = settings.overlayBarSide === "right";
    const isBottomSide = settings.overlayBarSide === "bottom";
    const isHorizontal =
        settings.overlayBarSide === "top" ||
        settings.overlayBarSide === "bottom";

    const rotation = settings.useDutchAngle
        ? isHorizontal
            ? isBottomSide
                ? "rotate(2deg)"
                : "rotate(-2deg)"
            : isRightSide
              ? "rotate(6deg)"
              : "rotate(-6deg)"
        : "none";

    const transformOrigin = isHorizontal
        ? isBottomSide
            ? "center bottom"
            : "center top"
        : isRightSide
          ? "right top"
          : "left top";

    const flexDirection = isHorizontal
        ? isBottomSide
            ? "column-reverse"
            : "column"
        : isRightSide
          ? "row-reverse"
          : "row";
    const alignItems = "flex-start";

    const showIconsWrapper = icons.length > 0 || settings.showNumericValue;

    // Adjust the seamless adjacent borders dynamically
    let barBorderRadius = "12px";
    let iconsBorderRadius = "12px";

    if (isHorizontal) {
        if (showIconsWrapper) {
            if (isBottomSide) {
                // Icons above bar
                barBorderRadius = "0 0 12px 12px";
                iconsBorderRadius = "12px 12px 0 0";
            } else {
                // Bar above icons
                barBorderRadius = "12px 12px 0 0";
                iconsBorderRadius = "0 0 12px 12px";
            }
        }
    } else {
        barBorderRadius = isRightSide
            ? showIconsWrapper
                ? "0 12px 12px 12px"
                : "12px"
            : showIconsWrapper
              ? "12px 0 12px 12px"
              : "12px";
        iconsBorderRadius = isRightSide ? "12px 0 0 12px" : "0 12px 12px 0";
    }

    const iconsPaddingTop = isHorizontal
        ? isBottomSide
            ? "16px"
            : "0"
        : "16px";
    const iconsPaddingBottom = isHorizontal
        ? isBottomSide
            ? "0"
            : "16px"
        : "16px";
    const iconsPaddingLeft = isHorizontal ? "16px" : isRightSide ? "16px" : "0";
    const iconsPaddingRight = isHorizontal
        ? "16px"
        : isRightSide
          ? "0"
          : "16px";

    const rotationStr = rotation === "none" ? "" : rotation;
    const transform = isBottomSide
        ? `translateY(-100%) ${rotationStr}`.trim()
        : rotation;

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
                    align-items: ${alignItems};
                    
                    /* Dynamic Dutch angle setup */
                    transform: ${transform} !important;
                    transform-origin: ${transformOrigin} !important;
                }
                .volumeScrollBarBackgroundWrapper {
                    background-color: ${settings.useOverlayBackground ? `rgba(30, 30, 30, ${settings.overlayBackgroundOpacity / 100})` : "transparent"};
                    width: ${isHorizontal ? "100%" : "auto"};
                    height: ${isHorizontal ? "auto" : "100%"};
                    padding: 16px;
                    box-sizing: border-box;
                    border-radius: ${barBorderRadius};
                }
                .volumeScrollBarIconsWrapper {
                    background-color: ${settings.useOverlayBackground ? `rgba(30, 30, 30, ${settings.overlayBackgroundOpacity / 100})` : "transparent"};
                    padding-top: ${iconsPaddingTop};
                    padding-bottom: ${iconsPaddingBottom};
                    padding-left: ${iconsPaddingLeft};
                    padding-right: ${iconsPaddingRight};
                    box-sizing: border-box;
                    border-radius: ${iconsBorderRadius};
                }
                .volumeScrollBarIcons {
                    display: flex;
                    flex-direction: ${isHorizontal ? "row" : "column"};
                    align-items: center;
                    gap: 16px;
                    color: ${volume > 100 ? settings.boostedColor : settings.overlayColor};
                    font-size: ${settings.fontSize}px;
                }
                .volumeScrollBarContainer {
                    position: relative;
                    width: ${isHorizontal ? "100%" : "40px"};
                    height: ${isHorizontal ? "40px" : "100%"};
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
                    width: ${isHorizontal ? normalFill : "100%"};
                    height: ${isHorizontal ? "100%" : normalFill};
                    background-color: ${settings.overlayColor};
                    transition: ${isHorizontal ? "width" : "height"} 0.1s ease-out;
                }
                .volumeScrollBarBoost {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: ${isHorizontal ? boostFill : "100%"};
                    height: ${isHorizontal ? "100%" : boostFill};
                    background-color: ${settings.boostedColor};
                    transition: ${isHorizontal ? "width" : "height"} 0.1s ease-out;
                    z-index: 2;
                }
            `}</style>
            <div
                key={animationKey}
                className="volumeScrollBarOverlay"
                style={{
                    ...(isHorizontal
                        ? {
                              left: `${barLeft + barWidth * 0.1}px`,
                              width: `${barWidth * 0.8}px`,
                              top: isBottomSide
                                  ? `${barTop + barHeight - 20}px`
                                  : `${barTop + 20}px`,
                          }
                        : {
                              top: `${barTop + barHeight * 0.1}px`,
                              height: `${barHeight * 0.8}px`,
                              ...(isRightSide
                                  ? { right: `${barRight + 20}px` }
                                  : { left: `${barLeft + 20}px` }),
                          }),
                }}
            >
                <div className="volumeScrollBarBackgroundWrapper">
                    <div className="volumeScrollBarContainer">
                        <div className="volumeScrollBarFillContainer">
                            <div
                                className="volumeScrollBarNormal"
                                style={{
                                    ...(isHorizontal
                                        ? { width: normalFill, height: "100%" }
                                        : {
                                              height: normalFill,
                                              width: "100%",
                                          }),
                                }}
                            />
                            <div
                                className="volumeScrollBarBoost"
                                style={{
                                    ...(isHorizontal
                                        ? { width: boostFill, height: "100%" }
                                        : { height: boostFill, width: "100%" }),
                                }}
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
