import React from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';

interface HotkeyPageInterface {
    settings: Settings,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const HotkeyPage: React.FC<HotkeyPageInterface> = ({ settings, setPage }) => {
    return (
        <div>
            <BackButton setPage={setPage}/>
        </div>
    );
}

export default HotkeyPage;