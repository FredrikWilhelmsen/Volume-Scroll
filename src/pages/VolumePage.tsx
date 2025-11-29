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

    const handleUseDefaultVolumeToggle = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("useDefaultVolume", value);
    }

    const handleDefaultVolumeChange = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("defaultVolume", value);
    }

    const handleDefaultVolumeScroll = (e: React.WheelEvent) => {
        if(!settings.useDefaultVolume) return;

        e.preventDefault();

        let newValue: number = defaultVolume;

        if (e.deltaY < 0) {
            newValue = Math.min(defaultVolume + 5, 100);
        } else {
            newValue = Math.max(defaultVolume - 5, 1);
        }

        setDefaultVolume(newValue);
        editSetting("defaultVolume", newValue);
    };

    const handleUncappedVolumeToggle = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("useUncappedVolume", value);
    }

    return (
        <div>
            <BackButton setPage={setPage} title={"Volume Settings"}/>

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
                <div id="uncappedVolumeContainer">
                    <Tooltip title="Enable or disable uncapped volume - Experimental, disable if you experience issues" placement="top" disableInteractive>
                        <FormControlLabel 
                            onChange={handleUncappedVolumeToggle}
                            control={
                            <Switch 
                                checked={settings.useUncappedVolume}
                                disabled
                            />} 
                            label={settings.useUncappedVolume ? "Volume is uncapped" : "Volume is capped"}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default VolumePage;