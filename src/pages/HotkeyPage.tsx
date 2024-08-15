import React from 'react';
import { Settings, Pages } from '../types';

interface HotkeyPageInterface {
    settings: Settings,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const HotkeyPage: React.FC<HotkeyPageInterface> = ({ settings, setPage }) => {
    return (
        <div>
            Hotkeys
        </div>
    );
}

export default HotkeyPage;