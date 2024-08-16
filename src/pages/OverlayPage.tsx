import React, { useState } from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';
import Tooltip from '@mui/material/Tooltip/Tooltip';
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
    const [isColorpickerVisible, setIsColorpickerVisible] = useState(false);

    const colors : string[] = [
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

    //TODO: Scroll sliders

    const handleOverlaySizeChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("fontSize", value);
    }

    const handleColorChange = (color: any) => {
        editSetting("fontColor", color.hex);
        console.log(color.hex);
    }

    const handleColorPickerClick = () => {
        setIsColorpickerVisible(!isColorpickerVisible);
    }

    const handlePositionChange = (e: any) => {
        editSetting("overlayPosition", e.currentTarget.value);

        if(e.currentTarget.value === "tl"){
            setXPos(5);
            editSetting("overlayXPos", 5);
            setYPos(5);
            editSetting("overlayYPos", 5);
        }
        else if (e.currentTarget.value === "tr"){
            setXPos(95);
            editSetting("overlayXPos", 95);
            setYPos(5);
            editSetting("overlayYPos", 5);
        }
        else if (e.currentTarget.value === "bl"){
            setXPos(5);
            editSetting("overlayXPos", 5);
            setYPos(95);
            editSetting("overlayYPos", 95);
        }
        else if (e.currentTarget.value === "br"){
            setXPos(95);
            editSetting("overlayXPos", 95);
            setYPos(95);
            editSetting("overlayYPos", 95);
        }
    }

    const handleXChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("overlayXPos", value);
        setXPos(value);
    }

    const handleYChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("overlayYPos", value);
        setYPos(value);
    }

    return (
        <div>
            <BackButton setPage={setPage} title={"Overlay Settings"} />

            <hr></hr>

            <div className="settingsContainer">
                <div id="overlayFontSizeContainer">
                    <div id="overlayFontSizeDisplay" className="sliderDisplayContainer">
                        <Typography variant="body1">
                            Overlay size
                        </Typography>
                        <Tooltip title="Current increment" placement="top" disableInteractive>
                            <div id="fontSizeDisplay" className="sliderDisplay">
                                <Typography variant="body2">
                                    {settings.fontSize}
                                </Typography>
                            </div>
                        </Tooltip>
                    </div>
                    <Tooltip title="Set the text size of the overlay" disableInteractive>
                        <Slider
                            min={10}
                            max={100}
                            step={1}
                            aria-label="Overlay Size"
                            defaultValue={settings.fontSize}
                            valueLabelDisplay="off"
                            disabled={!settings.useMouseWheelVolume}
                            onChange={handleOverlaySizeChange}
                        />
                    </Tooltip>
                </div>
                <div id="overlayColorPickerContainer">
                    <div id="colorDisplay">
                        <Paper elevation={2} sx={
                            { bgcolor: settings.fontColor, width: 40, height: 20, mr: 1 }
                        }
                        onClick={handleColorPickerClick}
                        />
                        <Typography variant="body1">
                            Overlay color
                        </Typography>
                    </div>
                    
                    {isColorpickerVisible && <TwitterPicker colors={colors} color={settings.fontColor} onChange={handleColorChange} width="220px"/>}
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
                    <Tooltip title="The horizontal position of the overlay" placement="bottom-start" disableInteractive>
                        <Slider
                            id="xSlider"
                            min={5}
                            max={95}
                            step={1}
                            aria-label="Horizontal position"
                            value={xPos}
                            valueLabelDisplay="off"
                            disabled={!settings.useMouseWheelVolume || settings.overlayPosition != "custom"}
                            onChange={handleXChange}
                        />
                    </Tooltip>
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
                    <Tooltip title="The vertical position of the overlay" placement="bottom-start" disableInteractive>
                        <Slider
                            id="ySlider"
                            min={5}
                            max={95}
                            step={1}
                            aria-label="Horizontal position"
                            value={yPos}
                            valueLabelDisplay="off"
                            disabled={!settings.useMouseWheelVolume || settings.overlayPosition != "custom"}
                            onChange={handleYChange}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default OverlayPage;