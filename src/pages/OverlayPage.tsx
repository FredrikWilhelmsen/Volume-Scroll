import React from 'react';
import { Settings, Pages } from '../types';

interface OverlayPageInterface {
    settings: Settings,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const OverlayPage: React.FC<OverlayPageInterface> = ({ settings, setPage }) => {
    return (
        <div>
            Overlay
        </div>
    );
}

export default OverlayPage;