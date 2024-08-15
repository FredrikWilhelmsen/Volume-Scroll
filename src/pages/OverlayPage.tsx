import React from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';

interface OverlayPageInterface {
    settings: Settings,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const OverlayPage: React.FC<OverlayPageInterface> = ({ settings, setPage }) => {
    return (
        <div>
            <BackButton setPage={setPage}/>
        </div>
    );
}

export default OverlayPage;