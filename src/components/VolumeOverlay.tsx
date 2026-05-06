import React from 'react';
import { Settings } from '../types';

export interface VolumeOverlayProps {
    volume: number;
    x: number;
    y: number;
    settings: Settings;
    animationKey: number;
}

export const VolumeOverlay: React.FC<VolumeOverlayProps> = ({ volume, x, y, settings, animationKey }) => {
    const fadeStartPercentage = settings.overlayDuration > 250
        ? Math.round(((settings.overlayDuration - 250) / settings.overlayDuration) * 100)
        : 0;

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
                {Math.round(volume)}
            </div>
        </React.Fragment>
    );
};
