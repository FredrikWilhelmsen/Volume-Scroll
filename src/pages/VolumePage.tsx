import React from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';

interface VolumePageInterface {
    settings: Settings,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const VolumePage: React.FC<VolumePageInterface> = ({ settings, setPage }) => {
    return (
        <div>
            <BackButton setPage={setPage}/>
        </div>
    );
}

export default VolumePage;