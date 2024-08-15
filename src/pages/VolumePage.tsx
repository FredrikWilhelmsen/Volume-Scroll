import React from 'react';
import { Settings, Pages } from '../types';

interface VolumePageInterface {
    settings: Settings,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const VolumePage: React.FC<VolumePageInterface> = ({ settings, setPage }) => {
    return (
        <div>
            Volume
        </div>
    );
}

export default VolumePage;