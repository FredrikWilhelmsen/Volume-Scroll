import React from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import Typography from '@mui/material/Typography/Typography';
import "../style/overlayPage.css";
import Slider from '@mui/material/Slider/Slider';

interface OverlayPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const OverlayPage: React.FC<OverlayPageInterface> = ({ settings, editSetting, setPage }) => {

    const handleOverlaySizeChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("fontSize", value);
    }

    const handleColorChange = (e: any) => {
        editSetting("fontColor", e.currentTarget.value);
    }

    const handleXChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("overlayXPos", value);
    }

    const handleYChange = (_e: Event | React.SyntheticEvent, value: any) => {
        editSetting("overlayYPos", value);
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
                            valueLabelDisplay="auto"
                            disabled={!settings.useMouseWheelVolume}
                            onChangeCommitted={handleOverlaySizeChange}
                        />
                    </Tooltip>
                </div>
                <div id="overlayColorPickerContainer">
                    <input type="color" defaultValue={settings.fontColor} onChange={handleColorChange}></input>
                </div>
                <div id="overlayPositionDropdownContainer">
                    <select id="overlayPositionSelector">
                        <option value="volvo">Volvo</option>
                        <option value="saab">Saab</option>
                        <option value="mercedes">Mercedes</option>
                        <option value="audi">Audi</option>
                    </select>
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
                    <Tooltip title="Set the horizontal position of the overlay, relative to the video" disableInteractive>
                        <Slider
                            min={5}
                            max={95}
                            step={1}
                            aria-label="Horizontal position"
                            defaultValue={settings.overlayXPos}
                            valueLabelDisplay="auto"
                            disabled={!settings.useMouseWheelVolume}
                            onChangeCommitted={handleXChange}
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
                    <Tooltip title="Set the vertical position of the overlay, relative to the video" disableInteractive>
                        <Slider
                            min={5}
                            max={95}
                            step={1}
                            aria-label="Horizontal position"
                            defaultValue={settings.overlayYPos}
                            valueLabelDisplay="auto"
                            disabled={!settings.useMouseWheelVolume}
                            onChangeCommitted={handleYChange}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default OverlayPage;