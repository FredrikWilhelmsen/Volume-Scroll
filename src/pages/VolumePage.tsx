import React, { useState } from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';
import Typography from '@mui/material/Typography/Typography';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import Slider from '@mui/material/Slider/Slider';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';
import "../style/volumePage.css"

interface VolumePageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const VolumePage: React.FC<VolumePageInterface> = ({ settings, editSetting, setPage }) => {

    const [defaultVolume, setDefaultVolume] = useState(settings.defaultVolume);
    const [volumeBoostAmount, setVolumeBoostAmount] = useState(settings.volumeBoostAmount);

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

    return (
        <div>
            <BackButton setPage={setPage} title={"Volume Settings"} />

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
            </div>
        </div>
    );
}

export default VolumePage;