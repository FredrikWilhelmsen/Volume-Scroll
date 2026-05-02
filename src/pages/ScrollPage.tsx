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
    const [customPreciseScrollThreshold, setCustomPreciseScrollThreshold] = useState(settings.customPreciseScrollThreshold);

    const handleIncrementToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("useMouseWheelVolume", value);
    }

    const handleIncrementScroll = (e: React.WheelEvent) => {
        if (!settings.useMouseWheelVolume) return;

        e.preventDefault();

        let newValue: number = increment;

        if (e.deltaY < 0) {
            newValue = Math.min(increment + 1, 20);
        } else {
            newValue = Math.max(increment - 1, 0);
        }

        setincrement(newValue);
        editSetting("volumeIncrement", newValue);
    };

    const handleIncrementChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("volumeIncrement", value);
        setincrement(value);
    }

    const handlePreciseScrollToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("usePreciseScroll", value);
    }

    const handleCustomPreciseScrollThresholdToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("useCustomPreciseScrollThreshold", value);
    }

    const handleCustomPreciseScrollThresholdChange = (_e: Event | React.SyntheticEvent, value: any) => {
        setCustomPreciseScrollThreshold(value);
        editSetting("customPreciseScrollThreshold", value);
    }

    const handleCustomPreciseScrollThresholdScroll = (e: React.WheelEvent) => {
        if (!settings.useCustomPreciseScrollThreshold || !settings.usePreciseScroll) return;

        e.preventDefault();

        let newValue: number = customPreciseScrollThreshold;

        if (e.deltaY < 0) {
            newValue = Math.min(customPreciseScrollThreshold + 1, 100);
        } else {
            newValue = Math.max(customPreciseScrollThreshold - 1, 0);
        }

        setCustomPreciseScrollThreshold(newValue);
        editSetting("customPreciseScrollThreshold", newValue);
    }

    const handleFullscreenOnlyToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("fullscreenOnly", value);
    }

    const handleEnableToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("enableDefault", value);
    }

    return (
        <div>
            <BackButton setPage={setPage} title={"Scroll Settings"} />

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
                    <div onWheel={handleIncrementScroll}>
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
                <div id="customPreciseScrollContainer">
                    <div id="customPreciseScrollThresholdToggleContainer">
                        <Tooltip title="Precise scroll will start at this volume threshold" placement="top" disableInteractive>
                            <FormControlLabel
                                onChange={handleCustomPreciseScrollThresholdToggle}
                                control={
                                    <Switch
                                        checked={settings.useCustomPreciseScrollThreshold}
                                        disabled={!settings.usePreciseScroll}
                                    />}
                                label="Precision start"
                            />
                        </Tooltip>
                        <Tooltip title="Current threshold" placement="top" disableInteractive>
                            <div id="customPreciseScrollThresholdDisplay">
                                <Typography variant="body2">
                                    {settings.customPreciseScrollThreshold}
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    <div onWheel={handleCustomPreciseScrollThresholdScroll}>
                        <Tooltip title="Set the threshold for precise scroll" disableInteractive>
                            <Slider
                                min={0}
                                max={100}
                                step={5}
                                aria-label="Custom precise scroll threshold"
                                value={customPreciseScrollThreshold}
                                valueLabelDisplay="off"
                                disabled={!settings.usePreciseScroll || !settings.useCustomPreciseScrollThreshold}
                                onChange={handleCustomPreciseScrollThresholdChange}
                            />
                        </Tooltip>
                    </div>
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
                <div id="blacklistContainer">
                    <Tooltip title={
                        settings.enableDefault
                            ? "VolumeScroll will be enabled by default for every page"
                            : "VolumeScroll will be disabled by default for every page"
                    } placement="top" disableInteractive>
                        <FormControlLabel
                            onChange={handleEnableToggle}
                            control={
                                <Switch
                                    checked={settings.enableDefault}
                                />}
                            label={settings.enableDefault ? "Enabled by default" : "Disabled by default"}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default ScrollPage;