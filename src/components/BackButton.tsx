import React from 'react';

type Page = "menu" | "scroll" | "hotkeys" | "overlay" | "volume";

interface BackButtonInterface {
    setPage: React.Dispatch<React.SetStateAction<Page>>
}

const BackButton: React.FC<BackButtonInterface> = ({ setPage }) => {
    return (
        <div>
            Volume
        </div>
    );
}

export default BackButton;