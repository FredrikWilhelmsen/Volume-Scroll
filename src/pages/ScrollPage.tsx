import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import { Settings, Pages } from "../types";
import Tooltip from '@mui/material/Tooltip/Tooltip';
import Slider from '@mui/material/Slider/Slider';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';
import "../style/scrollPage.css"
import Typography from '@mui/material/Typography/Typography';

interface ScrollPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const ScrollPage: React.FC<ScrollPageInterface> = ({ settings, editSetting, setPage }) => {

    const [increment, setincrement] = useState(settings.volumeIncrement);

    //TODO: Add scrolling for slider

    const handleIncrementToggle = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("useMouseWheelVolume", value);
    }

    const handleIncrementChange = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("volumeIncrement", value);
        setincrement(value);
    }

    const handlePreciseScrollToggle = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("usePreciseScroll", value);
    }

    const handleFullscreenOnlyToggle = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("fullscreenOnly", value);
    }

    return (
        <div>
            <BackButton setPage={setPage} title={"Scroll Settings"}/>

            <hr></hr>

            <div className="settingsContainer">
                <div id="scrollIncrementContainer">
                    <div id="incrementToggleContainer">
                        <Tooltip title="Enable or disable Volume Scroll" placement="top" disableInteractive>
                            <FormControlLabel 
                                onChange={handleIncrementToggle}
                                control={
                                <Switch 
                                    checked={settings.useMouseWheelVolume}
                                />} 
                                label="Volume Scroll"
                            />
                        </Tooltip>
                        <Tooltip title="Current increment" placement="top" disableInteractive>
                            <div id="incrementDisplay">
                                <Typography variant="body2">
                                    {settings.volumeIncrement}
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    <Tooltip title="Set how much the volume will change per tick when scrolling" disableInteractive>
                        <Slider
                            min={1}
                            max={20}
                            step={1}
                            aria-label="Scroll increment"
                            value={increment}
                            valueLabelDisplay="off"
                            disabled={!settings.useMouseWheelVolume}
                            onChange={handleIncrementChange}
                        />
                    </Tooltip>
                </div>
                <div id="preciseScrollContainer">
                    <Tooltip title="Scroll increment changes to 1 when volume is at or below normal increment" placement="top" disableInteractive>
                        <FormControlLabel 
                            onChange={handlePreciseScrollToggle}
                            control={
                            <Switch 
                                checked={settings.usePreciseScroll}
                                disabled={!settings.useMouseWheelVolume}
                            />} 
                            label="Precise scroll"
                        />
                    </Tooltip>
                </div>
                <div id="fullscreenOnlyContainer">
                    <Tooltip title="Volume scroll will only be enabled when video is in fullscreen mode" placement="top" disableInteractive>
                        <FormControlLabel 
                            onChange={handleFullscreenOnlyToggle}
                            control={
                            <Switch 
                                checked={settings.fullscreenOnly}
                                disabled={!settings.useMouseWheelVolume}
                            />} 
                            label="Fullscreen only"
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default ScrollPage;