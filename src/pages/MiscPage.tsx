import React, { useState } from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';
import Typography from '@mui/material/Typography/Typography';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';
import "../style/miscPage.css"
import { TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Paper from '@mui/material/Paper';
import { TwitterPicker } from "@hello-pangea/color-picker";
import SettingsSlider from '../components/SettingsSlider';
import HotkeyButton from '../components/HotkeyButton';
import SettingsSwitch from '../components/SettingsSwitch';
import SettingsValueDisplay from '../components/SettingsValueDisplay';


interface MiscPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const MiscPage: React.FC<MiscPageInterface> = ({ settings, editSetting, setPage }) => {

    const [defaultVolume, setDefaultVolume] = useState(settings.defaultVolume);
    const [volumeBoostAmount, setVolumeBoostAmount] = useState(settings.volumeBoostAmount);
    const [alternateVolumeIncrement, setAlternateVolumeIncrement] = useState(settings.alternateVolumeIncrement);
    const [domainListInput, setdomainListInput] = useState("");
    const [isBoostColorPickerVisible, setIsBoostColorPickerVisible] = useState(false);

    const colors: string[] = [
        "#FF6900",
        "#FCB900",
        "#7BDCB5",
        "#00D084",
        "#8ED1FC",
        "#0693E3",
        "#ABB8C3",
        "#EB144C",
        "#F78DA7",
        "#9900EF",
        "#DABDAB"
    ];

    const handleUseDefaultVolumeToggle = (value: boolean) => {
        editSetting("useDefaultVolume", value);
    }

    const handleDefaultVolumeChange = (value: number) => {
        setDefaultVolume(value);
        editSetting("defaultVolume", value);
    }

    const handleStartMutedToggle = (value: boolean) => {
        editSetting("startMuted", value);
    }

    const handleBoostVolumeToggle = (value: boolean) => {
        editSetting("doBoostVolume", value);
    }

    const handleBoostVolumeChange = (value: number) => {
        setVolumeBoostAmount(value);
        editSetting("volumeBoostAmount", value);
    }

    const handleBoostColorChange = (color: any) => {
        if (!settings.useMouseWheelVolume || !settings.doBoostVolume) return;
        editSetting("boostedColor", color.hex);
    }

    const handleBoostColorPickerClick = () => {
        if (!settings.useMouseWheelVolume || !settings.doBoostVolume) return;
        setIsBoostColorPickerVisible(!isBoostColorPickerVisible);
    }

    const handleAlternateIncrementToggle = (value: boolean) => {
        editSetting("useAlternateVolumeIncrement", value);
    }

    const handleAlternateIncrementChange = (value: number) => {
        editSetting("alternateVolumeIncrement", value);
        setAlternateVolumeIncrement(value);
    }

    const handleAlternateIncrementHotkeySet = (value: string) => {
        editSetting("alternateVolumeIncrementHotkey", value);
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
                        <SettingsSwitch
                            label="Default volume"
                            checked={settings.useDefaultVolume}
                            onChange={handleUseDefaultVolumeToggle}
                            tooltip="Enable or disable default volume"
                        />
                        <SettingsValueDisplay
                            id="defaultVolumeDisplay"
                            value={settings.defaultVolume}
                            tooltip="Current increment"
                        />
                    </div>
                    <SettingsSlider
                        min={0}
                        max={100}
                        step={5}
                        ariaLabel="Default volume"
                        value={defaultVolume}
                        disabled={!settings.useDefaultVolume}
                        onChange={handleDefaultVolumeChange}
                        tooltip="Set what volume videos should start at"
                    />
                    <div>
                        <SettingsSwitch
                            label="Start muted"
                            checked={settings.startMuted}
                            onChange={handleStartMutedToggle}
                            disabled={!settings.useDefaultVolume}
                            tooltip="Makes default volume start new videos muted"
                        />
                    </div>
                </div>
                <div id="boostVolumeContainer">
                    <div id="boostVolumeToggleContainer">
                        <SettingsSwitch
                            label="Boost volume"
                            checked={settings.doBoostVolume}
                            onChange={handleBoostVolumeToggle}
                            tooltip="Increase volume limit past 100% - Experimental, disable if you experience issues"
                        />
                        <SettingsValueDisplay
                            id="boostVolumeDisplay"
                            value={settings.volumeBoostAmount}
                            tooltip="Current volume limit"
                        />
                    </div>
                    <SettingsSlider
                        min={100}
                        max={500}
                        step={5}
                        ariaLabel="Volume boost"
                        value={volumeBoostAmount}
                        disabled={!settings.doBoostVolume}
                        onChange={handleBoostVolumeChange}
                        tooltip="Current volume limit"
                    />
                </div>
                <div id="boostColorPickerContainer">
                    <div id="colorDisplay" style={{ opacity: (!settings.useMouseWheelVolume || !settings.doBoostVolume) ? 0.5 : 1 }}>
                        <Paper elevation={2} sx={
                            {
                                bgcolor: settings.boostedColor,
                                width: 40,
                                height: 20,
                                mr: 1,
                                cursor: (!settings.useMouseWheelVolume || !settings.doBoostVolume) ? 'default' : 'pointer'
                            }
                        }
                            onClick={handleBoostColorPickerClick}
                        />
                        <Typography variant="body1">
                            Boosted color
                        </Typography>
                    </div>

                    {isBoostColorPickerVisible && !(!settings.useMouseWheelVolume || !settings.doBoostVolume) && <TwitterPicker colors={colors} color={settings.boostedColor} onChange={handleBoostColorChange} width="220px" />}
                </div>
                <div id="alternateIncrementContainer">
                    <div id="alternateIncrementToggleContainer">
                        <SettingsSwitch
                            label="Alt. Step"
                            checked={settings.useAlternateVolumeIncrement}
                            onChange={handleAlternateIncrementToggle}
                            tooltip="Enable or disable alternate increment hotkey"
                        />
                        <SettingsValueDisplay
                            id="alternateIncrementDisplay"
                            value={alternateVolumeIncrement}
                            tooltip="Current alternate increment"
                        />
                    </div>
                    <SettingsSlider
                        min={1}
                        max={20}
                        step={1}
                        ariaLabel="Alternate volume increment"
                        value={alternateVolumeIncrement}
                        disabled={!settings.useAlternateVolumeIncrement}
                        onChange={handleAlternateIncrementChange}
                        tooltip="How much the volume will change per step using the alternate increment hotkey"
                    />
                    <HotkeyButton
                        value={settings.alternateVolumeIncrementHotkey}
                        onSet={handleAlternateIncrementHotkeySet}
                        disabled={!settings.useMouseWheelVolume || !settings.useAlternateVolumeIncrement}
                        tooltip="Click to change alternate step hotkey. Limited to mouse buttons and modifier keys (Alt, Ctrl, Shift)."
                        allowedKeys={["Shift", "Alt", "Control"]}
                        allowMouse45={true}
                    />
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