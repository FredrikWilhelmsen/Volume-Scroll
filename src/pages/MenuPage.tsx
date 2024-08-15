import React from 'react';
import { Settings, Pages } from '../types';
import "../style/menuPage.css";

interface MenuPageInterface {
    settings: Settings,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const MenuPage: React.FC<MenuPageInterface> = ({ settings, setPage }) => {
    return (
        <div className="menuContainer">
            <div>
                Blacklist
            </div>

            <button onClick={() => setPage("scroll")}>Scroll Settings</button>
            <button onClick={() => setPage("hotkeys")}>Hotkey Settings</button>
            <button onClick={() => setPage("overlay")}>Overlay Settings</button>
            <button onClick={() => setPage("volume")}>Volume Settings</button>

            <div>
                Footer
            </div>
        </div>
    );
}

export default MenuPage;