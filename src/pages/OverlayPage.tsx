import React, { useState } from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';
import Typography from '@mui/material/Typography/Typography';
import "../style/overlayPage.css";
import Slider from '@mui/material/Slider/Slider';
import Paper from '@mui/material/Paper';
import { TwitterPicker } from "@hello-pangea/color-picker";

interface OverlayPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const OverlayPage: React.FC<OverlayPageInterface> = ({ settings, editSetting, setPage }) => {

    const [xPos, setXPos] = useState(settings.overlayXPos);
    const [yPos, setYPos] = useState(settings.overlayYPos);
    const [fontSize, setFontSize] = useState(settings.fontSize);
    const [overlayDuration, setOverlayDuration] = useState(settings.overlayDuration);
    const [overlayBackgroundOpacity, setOverlayBackgroundOpacity] = useState(settings.overlayBackgroundOpacity);

    const [isColorpickerVisible, setIsColorpickerVisible] = useState(false);

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

    const handleUseOverlayToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("useOverlay", value);
    }

    const handleOverlaySizeChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("fontSize", value);
        setFontSize(value);
    }

    const handleFontSizeScroll = (e: React.WheelEvent) => {
        if (!settings.useMouseWheelVolume || !settings.useOverlay) return;

        e.preventDefault();

        let newValue: number = fontSize;

        if (e.deltaY < 0) {
            newValue = Math.min(fontSize + 5, 90);
        } else {
            newValue = Math.max(fontSize - 5, 10);
        }

        setFontSize(newValue);
        editSetting("fontSize", newValue);
    };

    const handleOverlayDurationChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("overlayDuration", value);
        setOverlayDuration(value);
    }

    const handleOverlayDurationScroll = (e: React.WheelEvent) => {
        if (!settings.useMouseWheelVolume || !settings.useOverlay) return;

        e.preventDefault();

        let newValue: number = overlayDuration;

        if (e.deltaY < 0) {
            newValue = Math.min(newValue + 500, 10000);
        } else {
            newValue = Math.max(newValue - 500, 0);
        }

        handleOverlayDurationChange(e, newValue);
    };

    const handleOverlayBackgroundToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("useOverlayBackground", value);
    }

    const handleOverlayBackgroundOpacityChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("overlayBackgroundOpacity", value);
        setOverlayBackgroundOpacity(value);
    };

    const handleOverlayBackgroundOpacityScroll = (e: React.WheelEvent) => {
        if (!settings.useMouseWheelVolume || !settings.useOverlay || !settings.useOverlayBackground) return;

        e.preventDefault();

        let newValue: number = overlayBackgroundOpacity;

        if (e.deltaY < 0) {
            newValue = Math.min(newValue + 5, 100);
        } else {
            newValue = Math.max(newValue - 5, 5);
        }

        handleOverlayBackgroundOpacityChange(e, newValue);
    };

    const handleOverlayColorChange = (color: any) => {
        editSetting("overlayColor", color.hex);
        console.log(color.hex);
    }

    const handleColorPickerClick = () => {
        setIsColorpickerVisible(!isColorpickerVisible);
    }

    const handlePositionChange = (e: any) => {
        editSetting("overlayPosition", e.currentTarget.value);

        const save = (x: number, y: number) => {
            setXPos(x);
            editSetting("overlayXPos", x);
            setYPos(y);
            editSetting("overlayYPos", y);
        }

        if (e.currentTarget.value === "tl") {
            save(5, 5);
        }
        else if (e.currentTarget.value === "tr") {
            save(95, 5);
        }
        else if (e.currentTarget.value === "bl") {
            save(5, 95);
        }
        else if (e.currentTarget.value === "br") {
            save(95, 95);
        }
    }

    const handleXChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("overlayXPos", value);
        setXPos(value);
    }

    const handleHorizontalScroll = (e: React.WheelEvent) => {
        if (!settings.useMouseWheelVolume || settings.overlayPosition != "custom" || !settings.useOverlay) return;

        e.preventDefault();

        let newValue: number = xPos;

        if (e.deltaY < 0) {
            newValue = Math.min(xPos + 5, 95);
        } else {
            newValue = Math.max(xPos - 5, 5);
        }

        setXPos(newValue);
        editSetting("overlayXPos", newValue);
    };

    const handleYChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("overlayYPos", value);
        setYPos(value);
    }

    const handleVerticalScroll = (e: React.WheelEvent) => {
        if (!settings.useMouseWheelVolume || settings.overlayPosition != "custom" || !settings.useOverlay) return;

        e.preventDefault();

        let newValue: number = yPos;

        if (e.deltaY < 0) {
            newValue = Math.min(yPos + 5, 95);
        } else {
            newValue = Math.max(yPos - 5, 5);
        }

        setYPos(newValue);
        editSetting("overlayYPos", newValue);
    };

    return (
        <div>
            <BackButton setPage={setPage} title={"Overlay Settings"} />

            <hr></hr>

            <div className="settingsContainer">
                <div id="useOverlayContainer">
                    <Tooltip title="Enable or disable the overlay" placement="top" disableInteractive>
                        <FormControlLabel
                            onChange={handleUseOverlayToggle}
                            control={
                                <Switch
                                    checked={settings.useOverlay}
                                />}
                            label="Overlay"
                        />
                    </Tooltip>
                </div>
                <div id="overlayFontSizeContainer">
                    <div id="overlayFontSizeDisplay" className="sliderDisplayContainer">
                        <Typography variant="body1">
                            Size
                        </Typography>
                        <Tooltip title="Current font size" placement="top" disableInteractive>
                            <div id="fontSizeDisplay" className="sliderDisplay">
                                <Typography variant="body2">
                                    {settings.fontSize}
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    <div onWheel={handleFontSizeScroll}>
                        <Tooltip title="Set the text size of the overlay" disableInteractive>
                            <Slider
                                min={10}
                                max={90}
                                step={5}
                                aria-label="Overlay Size"
                                value={fontSize}
                                valueLabelDisplay="off"
                                disabled={!settings.useMouseWheelVolume || !settings.useOverlay}
                                onChange={handleOverlaySizeChange}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div id="overlayDurationContainer">
                    <div id="overlayDurationDisplay" className="sliderDisplayContainer">
                        <Typography variant="body1">
                            Duration
                        </Typography>
                        <Tooltip title="Current duration in seconds" placement="top" disableInteractive>
                            <div id="overlayDurationValueDisplay" className="sliderDisplay">
                                <Typography variant="body2" sx={settings.overlayDuration === 0 ? { fontSize: '1.3rem', lineHeight: 1 } : {}}>
                                    {settings.overlayDuration === 0 ? "∞" : (settings.overlayDuration / 1000).toFixed(1)}
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    <div onWheel={handleOverlayDurationScroll}>
                        <Tooltip title="Set how long the overlay is visible in seconds. Set to 0 for infinite." disableInteractive>
                            <Slider
                                min={0}
                                max={10000}
                                step={500}
                                aria-label="Overlay Duration"
                                value={overlayDuration}
                                valueLabelDisplay="off"
                                disabled={!settings.useMouseWheelVolume || !settings.useOverlay}
                                onChange={handleOverlayDurationChange}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div id="overlayBackgroundContainer">
                    <div id="overlayBackgroundToggleContainer">
                        <Tooltip title="Enable or disable overlay background" placement="top" disableInteractive>
                            <FormControlLabel
                                onChange={handleOverlayBackgroundToggle}
                                control={
                                    <Switch
                                        checked={settings.useOverlayBackground}
                                    />}
                                label="Background"
                            />
                        </Tooltip>
                        <Tooltip title="Current background opacity" placement="top" disableInteractive>
                            <div id="overlayBackgroundDisplay">
                                <Typography variant="body2">
                                    {overlayBackgroundOpacity}%
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    <div onWheel={handleOverlayBackgroundOpacityScroll}>
                        <Tooltip title="Set how transparent the overlay is" disableInteractive>
                            <Slider
                                min={5}
                                max={100}
                                step={5}
                                aria-label="Overlay Background Opacity"
                                value={overlayBackgroundOpacity}
                                valueLabelDisplay="off"
                                disabled={!settings.useMouseWheelVolume || !settings.useOverlay}
                                onChange={handleOverlayBackgroundOpacityChange}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div id="overlayColorPickerContainer">
                    <div id="colorDisplay">
                        <Paper elevation={2} sx={
                            { bgcolor: settings.overlayColor, width: 40, height: 20, mr: 1 }
                        }
                            onClick={handleColorPickerClick}
                        />
                        <Typography variant="body1">
                            Color
                        </Typography>
                    </div>

                    {isColorpickerVisible && <TwitterPicker colors={colors} color={settings.overlayColor} onChange={handleOverlayColorChange} width="220px" />}
                </div>
                <div id="overlayPositionDropdownContainer">
                    <Tooltip title="Set overlay position">
                        <select id="overlayPositionSelector"
                            onChange={handlePositionChange}
                            defaultValue={settings.overlayPosition}
                            disabled={!settings.useMouseWheelVolume}>
                            <option value="mouse">Relative to Mouse</option>
                            <option value="tl">Top Left</option>
                            <option value="tr">Top Right</option>
                            <option value="bl">Bottom Left</option>
                            <option value="br">Bottom Right</option>
                            <option value="custom">Custom</option>
                        </select>
                    </Tooltip>
                </div>
                <div id="overlayXContainer">
                    <div id="overlayXPos" className="sliderDisplayContainer">
                        <Typography variant="body1">
                            Horizontal position
                        </Typography>
                        <Tooltip title="Current increment" placement="top" disableInteractive>
                            <div id="overlayXPosDisplay" className="sliderDisplay">
                                <Typography variant="body2">
                                    {settings.overlayXPos}
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    <div onWheel={handleHorizontalScroll}>
                        <Tooltip title="The horizontal position of the overlay" placement="bottom-start" disableInteractive>
                            <Slider
                                id="xSlider"
                                min={5}
                                max={95}
                                step={5}
                                aria-label="Horizontal position"
                                value={xPos}
                                valueLabelDisplay="off"
                                disabled={!settings.useMouseWheelVolume || settings.overlayPosition !== "custom" || !settings.useOverlay}
                                onChange={handleXChange}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div id="overlayYContainer">
                    <div id="overlayYPos" className="sliderDisplayContainer">
                        <Typography variant="body1">
                            Vertical position
                        </Typography>
                        <Tooltip title="Current increment" placement="top" disableInteractive>
                            <div id="overlayYPosDisplay" className="sliderDisplay">
                                <Typography variant="body2">
                                    {settings.overlayYPos}
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    <div onWheel={handleVerticalScroll}>
                        <Tooltip title="The vertical position of the overlay" placement="bottom-start" disableInteractive>
                            <Slider
                                id="ySlider"
                                min={5}
                                max={95}
                                step={5}
                                aria-label="Horizontal position"
                                value={yPos}
                                valueLabelDisplay="off"
                                disabled={!settings.useMouseWheelVolume || settings.overlayPosition !== "custom" || !settings.useOverlay}
                                onChange={handleYChange}
                            />
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OverlayPage;