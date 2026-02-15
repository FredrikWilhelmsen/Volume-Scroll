import browser from "webextension-polyfill";
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

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
const reviewLink = isFirefox
    ? "https://addons.mozilla.org/en-GB/firefox/addon/volume-scroll/reviews/2585522/"
    : "https://chromewebstore.google.com/detail/volume-scroll/gkmagiadkkhdilnaicdnngcjhmhaeaoh/reviews";

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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'l') {
                event.preventDefault();
                editSetting('doDebugLog', !settings.doDebugLog);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [settings.doDebugLog, editSetting]);

    const isEnabled = settings.domainList?.[hostname] ?? settings.enableDefault;

    const handleEnableToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("domainList", { ...settings.domainList, [hostname]: value });
    }

    const handleCopyLogs = async () => {
        console.log("Log button clicked");
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        console.log("Active tab:", activeTab);
        if (activeTab?.id) {
            try {
                console.log("Sending message");
                const response = await browser.tabs.sendMessage(activeTab.id, { type: "GET_DEBUG_LOGS" });
                console.log("Response:", response);
                if (response) {
                    await navigator.clipboard.writeText(JSON.stringify(response, null, 2));
                }
            } catch (e) {
                console.error("Failed to copy logs:", e);
            }
        }
    };

    return (
        <div className="menuContainer">
            <div id="blacklistContainer">
                <Tooltip title="Enable or disable Volume Scroll for this site" placement="bottom" disableInteractive>
                    <FormControlLabel
                        onChange={handleEnableToggle}
                        control={
                            <Switch
                                checked={isEnabled}
                            />}
                        label={isEnabled ? "Enabled on this site" : "Disabled on this site"}
                    />
                </Tooltip>
            </div>

            <ButtonGroup
                id="buttons"
                orientation="vertical"
                aria-label="Vertical button group"
                variant="text"
            >
                <Button onClick={() => setPage("scroll")} sx={{ color: "white" }}>Scroll Settings</Button>
                <Button onClick={() => setPage("hotkeys")} sx={{ color: "white" }}>Hotkey Settings</Button>
                <Button onClick={() => setPage("overlay")} sx={{ color: "white" }}>Overlay Settings</Button>
                <Button onClick={() => setPage("volume")} sx={{ color: "white" }}>Volume Settings</Button>
            </ButtonGroup>

            <footer>
                <Typography variant="body2" sx={{ fontSize: '11px' }}>
                    Want to show support? <br />
                    Consider leaving a <a href={reviewLink} target="_blank" rel="noreferrer">review</a><br />or buy me a <a href="https://ko-fi.com/fredrikwilhelmsen" target="_blank" rel="noreferrer">coffee</a>
                </Typography>
            </footer>
            <Tooltip title="Debug logging enabled" placement="top-start" disableInteractive>
                <div>
                    {settings.doDebugLog && <div id="debugIcon" onClick={handleCopyLogs}></div>}
                </div>
            </Tooltip>
        </div>
    );
}

export default MenuPage;