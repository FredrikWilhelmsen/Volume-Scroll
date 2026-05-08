import React, { useState, useEffect } from 'react';
import { Settings, OverlayType } from '../types';

export interface VolumeOverlayProps {
    type: OverlayType;
    volume: number;
    x: number;
    y: number;
    settings: Settings;
    animationKey: number;
}

export const VolumeOverlay: React.FC<VolumeOverlayProps> = ({ type, volume, x, y, settings, animationKey }) => {
    const [lastUnmuteTime, setLastUnmuteTime] = useState(0);

    useEffect(() => {
        if (type === "unmute") {
            setLastUnmuteTime(Date.now());
        }
    }, [type]);

    const fadeStartPercentage = settings.overlayDuration > 250
        ? Math.round(((settings.overlayDuration - 250) / settings.overlayDuration) * 100)
        : 0;

    const iconStyle: React.CSSProperties = {
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: 'drop-shadow(-1px -1px 0 #000) drop-shadow(1px -1px 0 #000) drop-shadow(-1px 1px 0 #000) drop-shadow(1px 1px 0 #000)'
    };

    const UnmutedIcon = () => (
        <svg viewBox="0 -960 960 960" width="1.2em" height="1.2em" fill="currentColor" style={iconStyle}>
            <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z" />
        </svg>
    );

    const MutedIcon = () => (
        <svg viewBox="0 -960 960 960" width="1.2em" height="1.2em" fill="currentColor" style={iconStyle}>
            <path d="m616-320-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104-104 104Zm-496-40v-240h160l200-200v640L280-360H120Zm280-246-86 86H200v80h114l86 86v-252ZM300-480Z" />
        </svg>
    );

    const renderContent = () => {
        const isUnmutedSticky = (Date.now() - lastUnmuteTime) < settings.overlayDuration;
        const volumeDisplay = Math.round(volume);

        if (volumeDisplay === 0) {
            return <MutedIcon />;
        }

        const unmuteContent = settings.overlayXPos <= 50
            ? <React.Fragment>{volumeDisplay} <UnmutedIcon /></React.Fragment>
            : <React.Fragment><UnmutedIcon /> {volumeDisplay}</React.Fragment>;

        switch (type) {
            case "unmute":
                return unmuteContent;
            case "volume":
                return isUnmutedSticky ? unmuteContent : volumeDisplay;
            case "mute":
                return <MutedIcon />;
        }
    }

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
                    animation: ${settings.overlayDuration === 0 ? 'none' : `volumeScrollFade ${settings.overlayDuration}ms normal forwards`};
                    
                    display: flex !important;
                    align-items: center !important;
                    gap: 0.25em !important;

                    transform: ${settings.overlayPosition === 'mouse'
                    ? 'translate(-50%, -100%)'
                    : `translate(${settings.overlayXPos <= 50 ? '0' : '-100%'}, ${settings.overlayYPos <= 50 ? '0' : '-100%'})`
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
                    color: settings.fontColor
                }}
            >
                {renderContent()}
            </div>
        </React.Fragment>
    );
};
