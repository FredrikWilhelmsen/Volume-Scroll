import React from "react";
import { Settings, OverlayType } from "../../types";
import { MutedIcon, UnmutedIcon, PlayIcon, PauseIcon } from "./Icons";

export interface CircleOverlayProps {
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

export const CircleOverlay: React.FC<CircleOverlayProps> = ({
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
    // Coordinate calculation (matching NumberOverlay)
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

    const rotation =
        settings.useDutchAngle && settings.overlayPosition !== "mouse"
            ? settings.overlayXPos <= 50
                ? " rotate(-6deg)"
                : " rotate(6deg)"
            : "";

    // Sizing calculations for the progress circle
    const size = Math.max(60, settings.fontSize * 2.8);
    const strokeWidth = size * 0.08;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Outer background sizing and padding
    const padding = settings.useOverlayBackground
        ? Math.max(8, settings.fontSize * 0.4)
        : 0;
    const containerSize = size + padding * 2;

    // Volume progression calculations
    const normalPercent = Math.min(volume, 100);
    const normalOffset = circumference - (normalPercent / 100) * circumference;

    const boostPercent =
        volume > 100
            ? ((volume - 100) / (settings.volumeBoostAmount - 100)) * 100
            : 0;
    const boostOffset =
        circumference - (Math.min(boostPercent, 100) / 100) * circumference;

    // Background color determination
    const backgroundColor = settings.useOverlayBackground
        ? `rgba(30, 30, 30, ${settings.overlayBackgroundOpacity / 100})`
        : "transparent";

    // Gather active icons
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

    return (
        <React.Fragment>
            <style>{`
                @keyframes volumeScrollFade {
                    0% { opacity: 1; }
                    ${fadeStartPercentage}% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .volumeScrollCircleOverlay {
                    position: absolute !important;
                    visibility: visible !important;
                    z-index: 9999999 !important;
                    pointer-events: none;
                    opacity: ${settings.overlayDuration === 0 ? 1 : 0};
                    animation: ${settings.overlayDuration === 0 ? "none" : `volumeScrollFade ${settings.overlayDuration}ms normal forwards`};
                    
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;

                    /* Centered translate for symmetrical alignment */
                    transform: translate(-50%, -50%)${rotation} !important;
                }
                .volumeScrollCircleContainer {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                }
                .volumeScrollCircleInner {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: ${volume > 100 ? settings.boostedColor : settings.overlayColor};
                }
                .volumeScrollCircleInnerIcons {
                    display: flex;
                    gap: 6px;
                    line-height: 1;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
            <div
                key={animationKey}
                className="volumeScrollCircleOverlay"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                }}
            >
                <div
                    className="volumeScrollCircleContainer"
                    style={{
                        width: `${containerSize}px`,
                        height: `${containerSize}px`,
                        backgroundColor: backgroundColor,
                        borderRadius: "50%",
                        padding: `${padding}px`,
                    }}
                >
                    <svg
                        width={size}
                        height={size}
                        style={{ transform: "rotate(-90deg)" }} // Starts progression from 12 o'clock
                    >
                        {/* Background track circle (faint path indicating total span) */}
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={settings.overlayColor}
                            strokeOpacity={0.15}
                            strokeWidth={strokeWidth}
                        />

                        {/* Normal Volume Ring */}
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={settings.overlayColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={normalOffset}
                            strokeLinecap="round"
                            style={{
                                transition: "stroke-dashoffset 0.1s ease-out",
                            }}
                        />

                        {/* Boost Volume Ring */}
                        {volume > 100 && (
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke={settings.boostedColor}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={boostOffset}
                                strokeLinecap="round"
                                style={{
                                    transition:
                                        "stroke-dashoffset 0.1s ease-out",
                                }}
                            />
                        )}
                    </svg>

                    {/* Centered content block containing only icons */}
                    <div
                        className="volumeScrollCircleInner"
                        style={{
                            width: `${size - strokeWidth * 2.5}px`,
                            height: `${size - strokeWidth * 2.5}px`,
                        }}
                    >
                        {icons.length > 0 && (
                            <div
                                className="volumeScrollCircleInnerIcons"
                                style={{
                                    fontSize: `${settings.fontSize}px`,
                                }}
                            >
                                {icons}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
