import React, { useEffect, useState, useRef } from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';
import Typography from '@mui/material/Typography/Typography';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import Slider from '@mui/material/Slider/Slider';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';
import "../style/miscPage.css"
import { Button, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface MiscPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const MiscPage: React.FC<MiscPageInterface> = ({ settings, editSetting, setPage }) => {

    const [defaultVolume, setDefaultVolume] = useState(settings.defaultVolume);
    const [volumeBoostAmount, setVolumeBoostAmount] = useState(settings.volumeBoostAmount);
    const [alternateVolumeIncrement, setAlternateVolumeIncrement] = useState(settings.alternateVolumeIncrement);
    const [isSettingAlternateIncrementKey, setIsSettingAlternateIncrementKey] = useState(false);
    const [domainListInput, setdomainListInput] = useState("");
    const lastSetTime = useRef(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isSettingAlternateIncrementKey) return;

            e.preventDefault();

            if (e.key === "Escape") {
                setIsSettingAlternateIncrementKey(false);
                lastSetTime.current = Date.now();
                return;
            }

            const allowedKeys = ["Shift", "Alt", "Control"];

            if (isSettingAlternateIncrementKey && allowedKeys.includes(e.key)) {
                editSetting("alternateVolumeIncrementHotkey", e.key);
                setIsSettingAlternateIncrementKey(false);
                lastSetTime.current = Date.now();
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (!isSettingAlternateIncrementKey) return;
            e.preventDefault();
            e.stopPropagation();

            const getMouseKey = (key: number): string | undefined => {
                switch (key) {
                    case 0: return "Left Mouse";
                    case 1: return "Middle Mouse";
                    case 2: return "Right Mouse";
                    case 3: return "Mouse 4";
                    case 4: return "Mouse 5";
                    default: return undefined;
                }
            }

            if (isSettingAlternateIncrementKey) {
                editSetting("alternateVolumeIncrementHotkey", getMouseKey(e.button));
                setIsSettingAlternateIncrementKey(false);
                lastSetTime.current = Date.now();
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            if (!isSettingAlternateIncrementKey) return;
            e.preventDefault();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Alt") e.preventDefault();
        };

        window.addEventListener("contextmenu", handleContextMenu, { capture: true });
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("mousedown", handleMouseDown);

        return () => {
            window.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("mousedown", handleMouseDown);
        };
    }, [isSettingAlternateIncrementKey, editSetting]);

    const handleUseDefaultVolumeToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("useDefaultVolume", value);
    }

    const handleDefaultVolumeChange = (_e: Event | React.SyntheticEvent, value: any) => {
        setDefaultVolume(value);
        editSetting("defaultVolume", value);
    }

    const handleDefaultVolumeScroll = (e: React.WheelEvent) => {
        if (!settings.useDefaultVolume) return;

        e.preventDefault();

        let newValue: number = defaultVolume;

        if (e.deltaY < 0) {
            newValue = Math.min(defaultVolume + 5, 100);
        } else {
            newValue = Math.max(defaultVolume - 5, 1);
        }

        setDefaultVolume(newValue);
        editSetting("defaultVolume", newValue);
    }

    const handleStartMutedToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("startMuted", value);
    }

    const handleBoostVolumeToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("doBoostVolume", value);
    }

    const handleBoostVolumeChange = (_e: Event | React.SyntheticEvent, value: any) => {
        setVolumeBoostAmount(value);
        editSetting("volumeBoostAmount", value);
    }

    const handleBoostVolumeScroll = (e: React.WheelEvent) => {
        if (!settings.doBoostVolume) return;

        e.preventDefault();

        let newValue: number = volumeBoostAmount;

        if (e.deltaY < 0) {
            newValue = Math.min(volumeBoostAmount + 5, 500);
        } else {
            newValue = Math.max(volumeBoostAmount - 5, 100);
        }

        setVolumeBoostAmount(newValue);
        editSetting("volumeBoostAmount", newValue);
    }

    const handleAlternateIncrementToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("useAlternateVolumeIncrement", value);
    }

    const handleAlternateIncrementScroll = (e: React.WheelEvent) => {
        if (!settings.useAlternateVolumeIncrement) return;

        e.preventDefault();

        let newValue: number = alternateVolumeIncrement;

        if (e.deltaY < 0) {
            newValue = Math.min(alternateVolumeIncrement + 1, 20);
        } else {
            newValue = Math.max(alternateVolumeIncrement - 1, 0);
        }

        setAlternateVolumeIncrement(newValue);
        editSetting("alternateVolumeIncrement", newValue);
    };

    const handleAlternateIncrementChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("alternateVolumeIncrement", value);
        setAlternateVolumeIncrement(value);
    }

    const handleAlternateIncrementKeyClick = (_e: Event | React.SyntheticEvent) => {
        if (isSettingAlternateIncrementKey || Date.now() - lastSetTime.current < 100) return;

        setIsSettingAlternateIncrementKey(true);
    }

    const handleDomainListChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setdomainListInput(e.target.value);
    }

    const handleDomainListToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        if (!domainListInput) return;

        const updatedDomainList = { ...settings.domainList };
        updatedDomainList[domainListInput.toLowerCase()] = value;
        editSetting("domainList", updatedDomainList);
    }

    const handleDomainListDelete = () => {
        if (!domainListInput) return;

        const updatedDomainList = { ...settings.domainList };
        delete updatedDomainList[domainListInput.toLowerCase()];
        editSetting("domainList", updatedDomainList);
    }

    return (
        <div>
            <BackButton setPage={setPage} title={"Misc Settings"} />

            <hr></hr>

            <div className="settingsContainer">
                <div id="defaultVolumeContainer">
                    <div id="defaultVolumeToggleContainer">
                        <Tooltip title="Enable or disable default volume" placement="top" disableInteractive>
                            <FormControlLabel
                                onChange={handleUseDefaultVolumeToggle}
                                control={
                                    <Switch
                                        checked={settings.useDefaultVolume}
                                    />}
                                label="Default volume"
                            />
                        </Tooltip>
                        <Tooltip title="Current increment" placement="top" disableInteractive>
                            <div id="defaultVolumeDisplay">
                                <Typography variant="body2">
                                    {settings.defaultVolume}
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    <div onWheel={handleDefaultVolumeScroll}>
                        <Tooltip title="Set what volume videos should start at" disableInteractive>
                            <Slider
                                min={0}
                                max={100}
                                step={5}
                                aria-label="Default volume"
                                value={defaultVolume}
                                valueLabelDisplay="off"
                                disabled={!settings.useDefaultVolume}
                                onChange={handleDefaultVolumeChange}
                            />
                        </Tooltip>
                    </div>
                    <div>
                        <Tooltip title="Makes default volume start new videos muted" placement="top" disableInteractive>
                            <FormControlLabel
                                onChange={handleStartMutedToggle}
                                control={
                                    <Switch
                                        disabled={!settings.useDefaultVolume}
                                        checked={settings.startMuted}
                                    />}
                                label="Start muted"
                            />
                        </Tooltip>
                    </div>
                </div>
                <div id="boostVolumeContainer">
                    <div id="boostVolumeToggleContainer">
                        <Tooltip title="Increase volume limit past 100% - Experimental, disable if you experience issues" placement="top" disableInteractive>
                            <FormControlLabel
                                onChange={handleBoostVolumeToggle}
                                control={
                                    <Switch
                                        checked={settings.doBoostVolume}
                                    />}
                                label="Boost volume"
                            />
                        </Tooltip>
                        <Tooltip title="Current volume limit" placement="top" disableInteractive>
                            <div id="boostVolumeDisplay">
                                <Typography variant="body2">
                                    {settings.volumeBoostAmount}
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    <div onWheel={handleBoostVolumeScroll}>
                        <Tooltip title="Current volume limit" disableInteractive>
                            <Slider
                                min={100}
                                max={500}
                                step={5}
                                aria-label="Volume boost"
                                value={volumeBoostAmount}
                                valueLabelDisplay="off"
                                disabled={!settings.doBoostVolume}
                                onChange={handleBoostVolumeChange}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div id="alternateIncrementContainer">
                    <div id="alternateIncrementToggleContainer">
                        <Tooltip title="Enable or disable alternate increment hotkey" placement="top" disableInteractive>
                            <FormControlLabel
                                onChange={handleAlternateIncrementToggle}
                                control={
                                    <Switch
                                        checked={settings.useAlternateVolumeIncrement}
                                    />}
                                label="Alt. Step"
                            />
                        </Tooltip>
                        <Tooltip title="Current alternate increment" placement="top" disableInteractive>
                            <div id="alternateIncrementDisplay">
                                <Typography variant="body2">
                                    {alternateVolumeIncrement}
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    <div onWheel={handleAlternateIncrementScroll}>
                        <Tooltip title="How much the volume will change per step using the alternate increment hotkey" disableInteractive>
                            <Slider
                                min={1}
                                max={20}
                                step={1}
                                aria-label="Alternate volume increment"
                                value={alternateVolumeIncrement}
                                valueLabelDisplay="off"
                                disabled={!settings.useAlternateVolumeIncrement}
                                onChange={handleAlternateIncrementChange}
                            />
                        </Tooltip>
                    </div>
                    <div>
                        <Tooltip title="Click to change alternate step hotkey. Limited to mouse buttons and modifier keys (Alt, Ctrl, Shift)." placement="top" disableInteractive>
                            <Button
                                onClick={handleAlternateIncrementKeyClick}
                                className="button"
                                variant="outlined"
                                sx={{ color: "white" }}
                                disabled={!settings.useMouseWheelVolume || !settings.useAlternateVolumeIncrement}
                            >
                                {isSettingAlternateIncrementKey ? "-----" : (settings.alternateVolumeIncrementHotkey === " " ? "Space" : settings.alternateVolumeIncrementHotkey)}
                            </Button>
                        </Tooltip>
                    </div>
                </div>
                <div id="domainListInputContainer">
                    <Tooltip title="Input a domain to toggle if it should be enabled or disabled" placement="top" disableInteractive>
                        <TextField
                            className="manualDomainInput"
                            label="Site override"
                            placeholder="e.g. www.youtube.com"
                            variant="outlined"
                            size="small"
                            autoComplete="off"
                            value={domainListInput}
                            onChange={handleDomainListChange}
                        />
                    </Tooltip>
                    <div className="domainListActions">
                        <Tooltip title="Disable or enable volume scroll for this site" placement="top" disableInteractive>
                            <FormControlLabel
                                onChange={handleDomainListToggle}
                                control={
                                    <Switch
                                        checked={settings.domainList?.[domainListInput.toLowerCase()] ?? settings.enableDefault}
                                        disabled={!domainListInput}
                                    />}
                                label={settings.domainList?.[domainListInput.toLowerCase()] === undefined ? "Default" : (settings.domainList[domainListInput.toLowerCase()] ? "Enabled" : "Disabled")}
                            />
                        </Tooltip>
                        <Tooltip title="Delete override" placement="top" disableInteractive>
                            <IconButton
                                onClick={(!domainListInput || settings.domainList?.[domainListInput.toLowerCase()] === undefined) ? undefined : handleDomainListDelete}
                                size="small"
                                sx={{
                                    color: (!domainListInput || settings.domainList?.[domainListInput.toLowerCase()] === undefined) ? "gray" : "white",
                                    cursor: (!domainListInput || settings.domainList?.[domainListInput.toLowerCase()] === undefined) ? "default" : "pointer"
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MiscPage;