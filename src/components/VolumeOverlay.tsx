import React, { useState, useEffect } from 'react';
import { Settings, OverlayType } from '../types';

export interface VolumeOverlayProps {
    type: OverlayType;
    volume: number;
    x: number;
    y: number;
    isMuted?: boolean;
    isPaused?: boolean;
    settings: Settings;
    animationKey: number;
}

export const VolumeOverlay: React.FC<VolumeOverlayProps> = ({ type, volume, x, y, isMuted, isPaused, settings, animationKey }) => {
    const [lastMuteStickyTime, setLastMuteStickyTime] = useState(0);
    const [lastMuteStickyType, setLastMuteStickyType] = useState<OverlayType | null>(null);
    const [lastPauseStickyTime, setLastPauseStickyTime] = useState(0);
    const [lastPauseStickyType, setLastPauseStickyType] = useState<OverlayType | null>(null);

    const [, setRefreshCount] = useState(0);

    useEffect(() => {
        if (type === "unmute" || type === "mute") {
            setLastMuteStickyTime(Date.now());
            setLastMuteStickyType(type);
        }
        if (type === "pause" || type === "play") {
            setLastPauseStickyTime(Date.now());
            setLastPauseStickyType(type);
        }
    }, [type, animationKey]);

    const stickyDuration = settings.overlayDuration === 0 ? 2000 : settings.overlayDuration;
    const isMuteSticky = (lastMuteStickyTime !== 0 && (Date.now() - lastMuteStickyTime) < stickyDuration);
    const isPauseSticky = (lastPauseStickyTime !== 0 && (Date.now() - lastPauseStickyTime) < stickyDuration);

    useEffect(() => {
        const now = Date.now();
        const timers: any[] = [];

        if (isMuteSticky && settings.overlayDuration === 0) {
            const remaining = stickyDuration - (now - lastMuteStickyTime);
            timers.push(setTimeout(() => setRefreshCount(prev => prev + 1), remaining + 50));
        }

        if (isPauseSticky && settings.overlayDuration === 0) {
            const remaining = stickyDuration - (now - lastPauseStickyTime);
            timers.push(setTimeout(() => setRefreshCount(prev => prev + 1), remaining + 50));
        }

        return () => timers.forEach(clearTimeout);
    }, [isMuteSticky, isPauseSticky, lastMuteStickyTime, lastPauseStickyTime, stickyDuration, settings.overlayDuration]);

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

    const PauseIcon = () => (
        <svg viewBox="0 -960 960 960" width="1.2em" height="1.2em" fill="currentColor" style={iconStyle}>
            <path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z" />
        </svg>
    );

    const PlayIcon = () => (
        <svg viewBox="0 -960 960 960" width="1.2em" height="1.2em" fill="currentColor" style={iconStyle}>
            <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
        </svg>
    );

    const renderContent = () => {
        const volumeDisplay = Math.round(volume);
        const currentIsMuted = isMuted || volumeDisplay === 0;

        const icons: React.ReactNode[] = [];

        // Handle Mute/Unmute state
        if (currentIsMuted) {
            icons.push(<MutedIcon key="mute" />);
        } else if (isMuteSticky && lastMuteStickyType === "unmute") {
            icons.push(<UnmutedIcon key="unmute" />);
        }

        // Handle Pause/Play state
        if (isPauseSticky && lastPauseStickyType) {
            const icon = lastPauseStickyType === "play" ? <PlayIcon key="play" /> : <PauseIcon key="pause" />;
            icons.push(icon);
        }

        if (icons.length === 0) return volumeDisplay;

        return settings.overlayXPos <= 50
            ? <React.Fragment>{volumeDisplay} {icons}</React.Fragment>
            : <React.Fragment>{icons} {volumeDisplay}</React.Fragment>;
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
                    color: settings.fontColor,
                    backgroundColor: settings.useOverlayBackground ? `rgba(30, 30, 30, ${settings.overlayBackgroundOpacity / 100})` : 'transparent',
                    padding: settings.useOverlayBackground ? '0.1em 0.3em' : '0',
                    borderRadius: '4px'
                }}
            >
                {renderContent()}
            </div>
        </React.Fragment>
    );
};
