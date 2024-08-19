import React, { useEffect, useState } from 'react';
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

    const [hostname, setHostname] = useState<string>("");

    useEffect(() => {
        const getActiveTabHostname = async () => {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const activeTab = tabs[0];
            if (activeTab?.url) {
                const url = new URL(activeTab.url);
                setHostname(url.hostname);
            }
        };

        getActiveTabHostname();
    }, []);

    const isBlacklisted = settings.blacklist.includes(hostname);

    const handleBlacklistToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        let updatedBlacklist: string[];
        if (value) {
            updatedBlacklist = settings.blacklist.filter((domain) => domain !== hostname);
        } else {
            updatedBlacklist = [...settings.blacklist, hostname];
        }

        editSetting("blacklist", updatedBlacklist);
    }

    return (
        <div className="menuContainer">
            <div id="blacklistContainer">
                <Tooltip title="Enable or disable Volume Scroll for this site" placement="bottom" disableInteractive>
                    <FormControlLabel 
                        onChange={handleBlacklistToggle}
                        control={
                        <Switch 
                            checked={!isBlacklisted}
                        />} 
                        label={!isBlacklisted ? "Enabled on this site" : "Disabled on this site"}
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