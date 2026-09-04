import React from "react";
import {
    Settings,
    OverlayType,
    CustomOverlay as CustomOverlayType,
} from "../../types";
import { MutedIcon, UnmutedIcon, PlayIcon, PauseIcon } from "./Icons";

export interface CustomOverlayProps {
    volume: number;
    mouseX: number;
    mouseY: number;
    settings: Settings;
    customOverlays?: Record<string, CustomOverlayType>;
    animationKey: number;
    fadeStartPercentage: number;
    playerRect?: DOMRect;
    parentRect?: DOMRect;
    isMuteSticky: boolean;
    lastMuteStickyType: OverlayType | null;
    isPauseSticky: boolean;
    lastPauseStickyType: OverlayType | null;
}

export const CustomOverlay: React.FC<CustomOverlayProps> = ({
    volume,
    mouseX,
    mouseY,
    settings,
    customOverlays,
    animationKey,
    fadeStartPercentage,
    playerRect,
    parentRect,
    isMuteSticky,
    lastMuteStickyType,
    isPauseSticky,
    lastPauseStickyType,
}) => {
    const selectedOverlay = customOverlays?.[settings.customOverlay];

    if (
        !selectedOverlay ||
        !selectedOverlay.frames ||
        selectedOverlay.frames.length === 0
    ) {
        return null;
    }

    const { frames, images } = selectedOverlay;
    const numFrames = frames.length;

    let frameIndex = 0;

    // Base frame: volume at 0 (or single-frame overlay) displays the first frame
    if (volume <= 0 || numFrames === 1) {
        frameIndex = 0;
    } else {
        const inc = settings.volumeIncrement || 1;
        const isBoosted = settings.doBoostVolume && volume > 100;
        const boostMax = Math.max(settings.volumeBoostAmount || 200, 100);

        if (isBoosted && settings.customOverlayBoostBehavior === "stretch") {
            // Stretch: map entire frame sequence across full boosted range (0 -> boostMax)
            const step = boostMax / numFrames;
            const lastUncappedStep = Math.floor(boostMax / inc) * inc;
            if (volume >= lastUncappedStep) {
                frameIndex = numFrames - 1;
            } else {
                frameIndex = Math.min(Math.floor(volume / step), numFrames - 1);
            }
        } else if (
            isBoosted &&
            settings.customOverlayBoostBehavior === "loop"
        ) {
            // Loop: restart the animation from frame 0 once volume exceeds 100 up to boostMax
            const boostRange = boostMax - 100;
            const boostedVolume = Math.min(volume - 100, boostRange);
            const step = boostRange / numFrames;
            const lastUncappedStep = Math.floor(boostRange / inc) * inc;
            if (boostedVolume >= lastUncappedStep) {
                frameIndex = numFrames - 1;
            } else {
                frameIndex = Math.min(
                    Math.floor(boostedVolume / step),
                    numFrames - 1,
                );
            }
        } else {
            // Standard: map frames across standard volume range (0 -> 100)
            const step = 100 / numFrames;
            const lastUncappedStep = Math.floor(100 / inc) * inc;
            if (volume >= lastUncappedStep) {
                frameIndex = numFrames - 1;
            } else {
                frameIndex = Math.min(Math.floor(volume / step), numFrames - 1);
            }
        }
    }

    const imageIndex = frames[frameIndex];
    const image = images[imageIndex];

    if (!image || !image.url) {
        return null;
    }

    let x = 0;
    let y = 0;

    if (settings.overlayPosition === "mouse") {
        x = mouseX - (parentRect?.left || 0);
        y = mouseY - (parentRect?.top || 0);
    } else if (playerRect && parentRect) {
        x =
            playerRect.left -
            parentRect.left +
            (playerRect.width / 100) * settings.overlayXPos;
        y =
            playerRect.top -
            parentRect.top +
            (playerRect.height / 100) * settings.overlayYPos;
    }

    const angle = settings.dutchAngleValue;
    const rotation = settings.useDutchAngle
        ? settings.overlayXPos <= 50
            ? ` rotate(${-angle}deg)`
            : ` rotate(${angle}deg)`
        : "";

    // Base width relative to player width and customOverlayScale
    const playerWidth = playerRect?.width || window.innerWidth;
    const scaleFactor = (settings.customOverlayScale ?? 10) / 100;
    const calculatedWidth = playerWidth * scaleFactor;

    const icons: React.ReactNode[] = [];

    // Handle Mute/Unmute state
    if (isMuteSticky && lastMuteStickyType) {
        const icon =
            lastMuteStickyType === "mute" ? (
                <MutedIcon key="mute" />
            ) : (
                <UnmutedIcon key="unmute" />
            );
        icons.push(icon);
    }

    // Handle Pause/Play state
    if (isPauseSticky && lastPauseStickyType) {
        const icon =
            lastPauseStickyType === "play" ? (
                <PlayIcon key="play" />
            ) : (
                <PauseIcon key="pause" />
            );
        icons.push(icon);
    }

    const showIconsWrapper = icons.length > 0 || settings.showNumericValue;

    const renderIcons = () => {
        if (!showIconsWrapper) return null;

        return (
            <div
                style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25em",
                    backgroundColor: settings.useOverlayBackground
                        ? `rgba(30, 30, 30, ${settings.overlayBackgroundOpacity / 100})`
                        : "transparent",
                    padding: settings.useOverlayBackground
                        ? "0.1em 0.3em"
                        : "0",
                    borderRadius: "4px",
                }}
            >
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
                {icons.length > 0 && (
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25em",
                        }}
                    >
                        {icons}
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        const imageElement = (
            <img
                key="customOverlayImg"
                src={image.url}
                alt={image.name || "Custom Overlay"}
                style={{
                    width: `${calculatedWidth}px`,
                    height: "auto",
                    maxWidth: "100%",
                    display: "block",
                    objectFit: "contain",
                }}
            />
        );

        const renderedIcons = renderIcons();
        if (!renderedIcons) return imageElement;

        return settings.overlayXPos <= 50 ? (
            <React.Fragment>
                {imageElement} {renderedIcons}
            </React.Fragment>
        ) : (
            <React.Fragment>
                {renderedIcons} {imageElement}
            </React.Fragment>
        );
    };

    return (
        <React.Fragment>
            <style>{`
                @keyframes volumeScrollFade {
                    0% { opacity: 1; }
                    ${fadeStartPercentage}% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .volumeScrollCustomOverlay {
                    font-size: ${settings.fontSize}px;
                    color: ${volume > 100 ? settings.boostedColor : settings.overlayColor};
                    position: absolute !important;
                    visibility: visible !important;
                    z-index: 9999999 !important;
                    pointer-events: none;
                    opacity: ${settings.overlayDuration === 0 ? 1 : 0};
                    animation: ${
                        settings.overlayDuration === 0
                            ? "none"
                            : `volumeScrollFade ${settings.overlayDuration}ms normal forwards`
                    };
                    display: flex !important;
                    align-items: center !important;
                    gap: 0.25em !important;
                    transform: ${
                        settings.overlayPosition === "mouse"
                            ? `translate(-50%, -100%)${rotation}`
                            : `translate(${settings.overlayXPos <= 50 ? "0" : "-100%"}, ${
                                  settings.overlayYPos <= 50 ? "0" : "-100%"
                              })${rotation}`
                    } !important;
                }
            `}</style>
            <div
                key={animationKey}
                className="volumeScrollCustomOverlay"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                }}
            >
                {renderContent()}
            </div>
        </React.Fragment>
    );
};
