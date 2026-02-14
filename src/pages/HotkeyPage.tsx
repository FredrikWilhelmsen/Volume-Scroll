import React, { useEffect, useState } from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';
import Button from '@mui/material/Button/Button';
import "../style/hotkeyPage.css";

interface HotkeyPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const HotkeyPage: React.FC<HotkeyPageInterface> = ({ settings, editSetting, setPage }) => {

    const [isSettingModifierKey, setIsSettingModifierKey] = useState(false);
    const [isSettingMuteKey, setIsSettingMuteKey] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isSettingModifierKey && !isSettingMuteKey) return;

            e.preventDefault();

            if (isSettingModifierKey) {
                editSetting("modifierKey", e.key);
                setIsSettingModifierKey(false);
            } else if (isSettingMuteKey) {
                editSetting("toggleMuteKey", e.key);
                setIsSettingMuteKey(false);
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (!isSettingModifierKey && !isSettingMuteKey) return;

            const getMouseKey = (key: number) => {
                switch (key) {
                    case 0: return "Left Mouse";
                    case 1: return "Middle Mouse";
                    case 2: return "Right Mouse";
                    case 3: return "Mouse 4";
                    case 4: return "Mouse 5";
                }
            };

            if (isSettingModifierKey) {
                editSetting("modifierKey", getMouseKey(e.button));
                setIsSettingModifierKey(false);
            } else if (isSettingMuteKey) {
                editSetting("toggleMuteKey", getMouseKey(e.button));
                setIsSettingMuteKey(false);
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            if (!isSettingModifierKey && !isSettingMuteKey) return;
            e.preventDefault();
        };

        window.addEventListener("contextmenu", handleContextMenu, { capture: true });
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("mousedown", handleMouseDown);

        return () => {
            window.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("mousedown", handleMouseDown);
        };
    }, [isSettingModifierKey, isSettingMuteKey, editSetting]);

    const handleModifierKeyToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("useModifierKey", value);
    }

    const handleModifierKeyClick = (_e: Event | React.SyntheticEvent) => {
        if (isSettingModifierKey || isSettingMuteKey) return;

        setIsSettingModifierKey(true);
    }

    const handleInvertModifierKeyToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("invertModifierKey", value);
    }

    const handleMuteKeyToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("useToggleMuteKey", value);
    }

    const handleMuteKeyClick = (_e: Event | React.SyntheticEvent) => {
        if (isSettingModifierKey || isSettingMuteKey) return;

        setIsSettingMuteKey(true);
    }

    return (
        <div>
            <BackButton setPage={setPage} title={"Hotkey Settings"} />

            <hr></hr>

            <div className="settingsContainer">
                <div id="modifierKeyContainer">
                    <Tooltip title="Set a key that must be held down for Volume Scroll to work" placement="top" disableInteractive>
                        <FormControlLabel
                            onChange={handleModifierKeyToggle}
                            control={
                                <Switch
                                    checked={settings.useModifierKey}
                                    disabled={!settings.useMouseWheelVolume}
                                />}
                            label="Modifier key"
                        />
                    </Tooltip>
                    <Tooltip title="Click to change hotkey" placement="top" disableInteractive>
                        <Button
                            onClick={handleModifierKeyClick}
                            className="button"
                            variant="outlined"
                            sx={{ color: "white" }}
                            disabled={!settings.useMouseWheelVolume || !settings.useModifierKey}
                        >
                            {isSettingModifierKey ? "-----" : (settings.modifierKey === " " ? "Space" : settings.modifierKey)}
                        </Button>
                    </Tooltip>
                </div>
                <div id="invertedModifierKeyContainer">
                    <Tooltip title="If enabled, holding the modifier key will stop Volume Scroll from working" placement="top" disableInteractive>
                        <FormControlLabel
                            onChange={handleInvertModifierKeyToggle}
                            control={
                                <Switch
                                    checked={settings.invertModifierKey}
                                    disabled={!settings.useMouseWheelVolume || !settings.useModifierKey}
                                />}
                            label="Inverted"
                        />
                    </Tooltip>
                </div>
                <div id="toggleMuteKeyContainer">
                    <Tooltip title="Set a key that will mute or unmute the video when pressed" placement="top" disableInteractive>
                        <FormControlLabel
                            onChange={handleMuteKeyToggle}
                            control={
                                <Switch
                                    checked={settings.useToggleMuteKey}
                                    disabled={!settings.useMouseWheelVolume}
                                />}
                            label="Toggle mute key"
                        />
                    </Tooltip>
                    <Tooltip title="Click to change hotkey" placement="top" disableInteractive>
                        <Button
                            onClick={handleMuteKeyClick}
                            className="button"
                            variant="outlined"
                            sx={{ color: "white" }}
                            disabled={!settings.useMouseWheelVolume || !settings.useToggleMuteKey}
                        >
                            {isSettingMuteKey ? "-----" : (settings.toggleMuteKey === " " ? "Space" : settings.toggleMuteKey)}
                        </Button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default HotkeyPage;