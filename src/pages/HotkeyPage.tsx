import React, { useEffect, useState, useRef } from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';
import Button from '@mui/material/Button/Button';
import "../style/hotkeyPage.css";
import { getMouseKey } from '../utils';

interface HotkeyPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const HotkeyPage: React.FC<HotkeyPageInterface> = ({ settings, editSetting, setPage }) => {

    const [isSettingModifierKey, setIsSettingModifierKey] = useState(false);
    const [isSettingMuteKey, setIsSettingMuteKey] = useState(false);
    const [isSettingPauseKey, setIsSettingPauseKey] = useState(false);
    const lastSetTime = useRef(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isSettingModifierKey && !isSettingMuteKey && !isSettingPauseKey) return;

            e.preventDefault();

            if (e.key === "Escape") {
                setIsSettingModifierKey(false);
                setIsSettingMuteKey(false);
                setIsSettingPauseKey(false);
                lastSetTime.current = Date.now();
                return;
            }

            const allowedKeys = ["Shift", "Alt", "Control"];

            if (isSettingModifierKey && allowedKeys.includes(e.key)) {
                editSetting("modifierKey", e.key);
                setIsSettingModifierKey(false);
                lastSetTime.current = Date.now();
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (!isSettingModifierKey && !isSettingMuteKey && !isSettingPauseKey) return;
            e.preventDefault();
            e.stopPropagation();

            const mouseKey = getMouseKey(e.button);
            if (!mouseKey) return;

            if (isSettingModifierKey) {
                editSetting("modifierKey", mouseKey);
                setIsSettingModifierKey(false);
                lastSetTime.current = Date.now();
            } else if (isSettingMuteKey) {
                editSetting("toggleMuteKey", mouseKey);
                setIsSettingMuteKey(false);
                lastSetTime.current = Date.now();
            } else if (isSettingPauseKey) {
                editSetting("togglePauseKey", mouseKey);
                setIsSettingPauseKey(false);
                lastSetTime.current = Date.now();
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isSettingModifierKey && !isSettingMuteKey && !isSettingPauseKey) return;

            let detectedKey: string | undefined;
            if (e.buttons & 8) detectedKey = "Mouse 4";
            else if (e.buttons & 16) detectedKey = "Mouse 5";

            if (detectedKey) {
                if (isSettingModifierKey) {
                    editSetting("modifierKey", detectedKey);
                    setIsSettingModifierKey(false);
                } else if (isSettingMuteKey) {
                    editSetting("toggleMuteKey", detectedKey);
                    setIsSettingMuteKey(false);
                } else if (isSettingPauseKey) {
                    editSetting("togglePauseKey", detectedKey);
                    setIsSettingPauseKey(false);
                }
                lastSetTime.current = Date.now();
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            if (!isSettingModifierKey && !isSettingMuteKey && !isSettingPauseKey) return;
            e.preventDefault();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Alt") e.preventDefault();
        };

        window.addEventListener("contextmenu", handleContextMenu, { capture: true });
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("auxclick", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("pointermove", handleMouseMove);

        return () => {
            window.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("auxclick", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("pointermove", handleMouseMove);
        };
    }, [isSettingModifierKey, isSettingMuteKey, isSettingPauseKey, editSetting]);

    const handleModifierKeyToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("useModifierKey", value);
    }

    const handleModifierKeyClick = (_e: Event | React.SyntheticEvent) => {
        if (isSettingModifierKey || isSettingMuteKey || isSettingPauseKey || Date.now() - lastSetTime.current < 100) return;

        setIsSettingModifierKey(true);
    }

    const handleInvertModifierKeyToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("invertModifierKey", value);
    }

    const handleMuteKeyToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("useToggleMuteKey", value);
    }

    const handleMuteKeyClick = (_e: Event | React.SyntheticEvent) => {
        if (isSettingModifierKey || isSettingMuteKey || isSettingPauseKey || Date.now() - lastSetTime.current < 100) return;

        setIsSettingMuteKey(true);
    }

    const handlePauseKeyToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("useTogglePauseKey", value);
    }

    const handlePauseKeyClick = (_e: Event | React.SyntheticEvent) => {
        if (isSettingModifierKey || isSettingMuteKey || isSettingPauseKey || Date.now() - lastSetTime.current < 100) return;

        setIsSettingPauseKey(true);
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
                    <Tooltip title="Click to change modifier hotkey. Limited to mouse buttons and modifier keys (Alt, Ctrl, Shift)." placement="top" disableInteractive>
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
                    <Tooltip title="Click to change mute hotkey. Limited to mouse buttons." placement="top" disableInteractive>
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
                <div id="togglePauseKeyContainer">
                    <Tooltip title="Set a key that will pause or play the video when pressed" placement="top" disableInteractive>
                        <FormControlLabel
                            onChange={handlePauseKeyToggle}
                            control={
                                <Switch
                                    checked={settings.useTogglePauseKey}
                                    disabled={!settings.useMouseWheelVolume}
                                />}
                            label="Toggle pause key"
                        />
                    </Tooltip>
                    <Tooltip title="Click to change pause hotkey. Limited to mouse buttons." placement="top" disableInteractive>
                        <Button
                            onClick={handlePauseKeyClick}
                            className="button"
                            variant="outlined"
                            sx={{ color: "white" }}
                            disabled={!settings.useMouseWheelVolume || !settings.useTogglePauseKey}
                        >
                            {isSettingPauseKey ? "-----" : (settings.togglePauseKey === " " ? "Space" : settings.togglePauseKey)}
                        </Button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default HotkeyPage;