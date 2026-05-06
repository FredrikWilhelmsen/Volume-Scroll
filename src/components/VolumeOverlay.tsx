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
    return (
        <React.Fragment>
            <style>{`
                @keyframes volumeScrollFade {
                    0% { opacity: 1; }
                    90% { opacity: 1; }
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
                    opacity: 0;
                    animation: volumeScrollFade 2s normal forwards;
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
