import React from 'react';
import { Settings, Pages } from '../types';
import "../style/menuPage.css";
import Typography from '@mui/material/Typography/Typography';

interface MenuPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const MenuPage: React.FC<MenuPageInterface> = ({ settings, editSetting, setPage }) => {
    return (
        <div className="menuContainer">
            <div>
                Blacklist
            </div>

            <button onClick={() => setPage("scroll")}>Scroll Settings</button>
            <button onClick={() => setPage("hotkeys")}>Hotkey Settings</button>
            <button onClick={() => setPage("overlay")}>Overlay Settings</button>
            <button onClick={() => setPage("volume")}>Volume Settings</button>

            <footer>
                <Typography variant="body2" sx={{ fontSize: '11px' }}>
                    Want to show support? <br />
                    Consider leaving a <a href="https://addons.mozilla.org/en-US/firefox/addon/volume-scroll/">review</a> or buy me a <a href="https://ko-fi.com/fredrikwilhelmsen">coffee</a>
                </Typography>
            </footer>
        </div>
    );
}

export default MenuPage;