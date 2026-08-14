import React from "react";
import { Settings, OverlayType } from "../../types";
import { MutedIcon, UnmutedIcon, PlayIcon, PauseIcon } from "./Icons";

export interface NumberOverlayProps {
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

export const NumberOverlay: React.FC<NumberOverlayProps> = ({
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
    const volumeDisplay = Math.round(volume);

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

    const renderContent = () => {
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

        if (icons.length === 0) return volumeDisplay;

        return settings.overlayXPos <= 50 ? (
            <React.Fragment>
                {volumeDisplay} {icons}
            </React.Fragment>
        ) : (
            <React.Fragment>
                {icons} {volumeDisplay}
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
                .volumeScrollOverlay {
                    font-family: Roboto, Arial, sans-serif !important;
                    font-weight: bold !important;
                    position: absolute !important;
                    visibility: visible !important;
                    z-index: 9999999 !important;
                    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000 !important;
                    pointer-events: none;
                    opacity: ${settings.overlayDuration === 0 ? 1 : 0};
                    animation: ${settings.overlayDuration === 0 ? "none" : `volumeScrollFade ${settings.overlayDuration}ms normal forwards`};
                    
                    display: flex !important;
                    align-items: center !important;
                    gap: 0.25em !important;

                    transform: ${
                        settings.overlayPosition === "mouse"
                            ? `translate(-50%, -100%)${rotation}`
                            : `translate(${settings.overlayXPos <= 50 ? "0" : "-100%"}, ${settings.overlayYPos <= 50 ? "0" : "-100%"})${rotation}`
                    } !important;
                }
            `}</style>
            <div
                key={animationKey}
                className="volumeScrollOverlay"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    fontSize: `${settings.fontSize}px`,
                    color:
                        volume > 100
                            ? settings.boostedColor
                            : settings.overlayColor,
                    backgroundColor: settings.useOverlayBackground
                        ? `rgba(30, 30, 30, ${settings.overlayBackgroundOpacity / 100})`
                        : "transparent",
                    padding: settings.useOverlayBackground
                        ? "0.1em 0.3em"
                        : "0",
                    borderRadius: "4px",
                }}
            >
                {renderContent()}
            </div>
        </React.Fragment>
    );
};
