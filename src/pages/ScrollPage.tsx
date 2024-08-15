import React from 'react';
import BackButton from '../components/BackButton';
import { Settings, Pages } from "../types";

interface ScrollPageInterface {
    settings: Settings,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const ScrollPage: React.FC<ScrollPageInterface> = ({ settings, setPage }) => {
    return (
        <div>
            <BackButton setPage={setPage}/>
        </div>
    );
}

export default ScrollPage;