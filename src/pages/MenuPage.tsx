import React from 'react';
import { Settings } from '../Settings';

type Page = "menu" | "scroll" | "hotkeys" | "overlay" | "volume";

interface MenuPageInterface {
    settings: Settings,
    setPage: React.Dispatch<React.SetStateAction<Page>>
}

const MenuPage: React.FC<MenuPageInterface> = ({ settings, setPage }) => {
    return (
        <div>
            <div>

            </div>
            <button onClick={() => setPage("scroll")}>Scroll Settings</button>
            <button onClick={() => setPage("hotkeys")}>Hotkey Settings</button>
            <button onClick={() => setPage("overlay")}>Overlay Settings</button>
            <button onClick={() => setPage("volume")}>Volume Settings</button>
            <div>
                
            </div>
        </div>
    );
}

export default MenuPage;