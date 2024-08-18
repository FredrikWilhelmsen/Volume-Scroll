import React from 'react';
import { Settings, Pages } from '../types';
import "../style/menuPage.css";
import Typography from '@mui/material/Typography/Typography';
import ButtonGroup from '@mui/material/ButtonGroup/ButtonGroup';
import Button from '@mui/material/Button/Button';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';

interface MenuPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const MenuPage: React.FC<MenuPageInterface> = ({ settings, editSetting, setPage }) => {

    const handleBlacklistToggle = (_e : Event | React.SyntheticEvent, value : any) => {
        
    }

    return (
        <div className="menuContainer">
            <div id="blacklistContainer">
                <Tooltip title="Set a key that must be held down for Volume Scroll to work" placement="top" disableInteractive>
                    <FormControlLabel 
                        onChange={handleBlacklistToggle}
                        control={
                        <Switch 
                            checked={settings.useModifierKey}
                            disabled={!settings.useMouseWheelVolume}
                        />} 
                        label="Modifier key"
                    />
                </Tooltip>
            </div>
            
            <ButtonGroup
                id="buttons"
                orientation="vertical"
                aria-label="Vertical button group"
                variant="text"
                >
                <Button onClick={() => setPage("scroll")} sx={{color: "white"}}>Scroll Settings</Button>
                <Button onClick={() => setPage("hotkeys")} sx={{color: "white"}}>Hotkey Settings</Button>
                <Button onClick={() => setPage("overlay")} sx={{color: "white"}}>Overlay Settings</Button>
                <Button onClick={() => setPage("volume")} sx={{color: "white"}}>Volume Settings</Button>
            </ButtonGroup>

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