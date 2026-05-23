import React, { useState } from "react";
import { Settings, Pages } from "../types";
import BackButton from "../components/BackButton";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import Typography from "@mui/material/Typography/Typography";
import "../style/overlayPage.css";
import Paper from "@mui/material/Paper";
import { TwitterPicker } from "@hello-pangea/color-picker";
import SettingsSlider from "../components/SettingsSlider";
import SettingsSwitch from "../components/SettingsSwitch";
import SettingsValueDisplay from "../components/SettingsValueDisplay";

interface OverlayPageInterface {
    settings: Settings;
    editSetting: (key: keyof Settings, value: any) => void;
    setPage: React.Dispatch<React.SetStateAction<Pages>>;
}

const OverlayPage: React.FC<OverlayPageInterface> = ({
    settings,
    editSetting,
    setPage,
}) => {
    const [xPos, setXPos] = useState(settings.overlayXPos);
    const [yPos, setYPos] = useState(settings.overlayYPos);
    const [fontSize, setFontSize] = useState(settings.fontSize);
    const [overlayDuration, setOverlayDuration] = useState(
        settings.overlayDuration,
    );
    const [overlayBackgroundOpacity, setOverlayBackgroundOpacity] = useState(
        settings.overlayBackgroundOpacity,
    );

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
        "#DABDAB",
    ];

    const handleUseOverlayToggle = (value: boolean) => {
        editSetting("useOverlay", value);
    };

    const handleOverlaySizeChange = (value: number) => {
        editSetting("fontSize", value);
        setFontSize(value);
    };

    const handleOverlayDurationChange = (value: number) => {
        editSetting("overlayDuration", value);
        setOverlayDuration(value);
    };

    const handleOverlayBackgroundToggle = (value: boolean) => {
        editSetting("useOverlayBackground", value);
    };

    const handleOverlayBackgroundOpacityChange = (value: number) => {
        editSetting("overlayBackgroundOpacity", value);
        setOverlayBackgroundOpacity(value);
    };

    const handleOverlayColorChange = (color: any) => {
        if (!settings.useMouseWheelVolume || !settings.useOverlay) return;
        editSetting("overlayColor", color.hex);
        console.log(color.hex);
    };

    const handleColorPickerClick = () => {
        if (!settings.useMouseWheelVolume || !settings.useOverlay) return;
        setIsColorpickerVisible(!isColorpickerVisible);
    };

    const handlePositionChange = (e: any) => {
        editSetting("overlayPosition", e.currentTarget.value);

        const save = (x: number, y: number) => {
            setXPos(x);
            editSetting("overlayXPos", x);
            setYPos(y);
            editSetting("overlayYPos", y);
        };

        if (e.currentTarget.value === "tl") {
            save(5, 5);
        } else if (e.currentTarget.value === "tr") {
            save(95, 5);
        } else if (e.currentTarget.value === "bl") {
            save(5, 95);
        } else if (e.currentTarget.value === "br") {
            save(95, 95);
        }
    };

    const handleXChange = (value: number) => {
        editSetting("overlayXPos", value);
        setXPos(value);
    };

    const handleYChange = (value: number) => {
        editSetting("overlayYPos", value);
        setYPos(value);
    };

    return (
        <div>
            <BackButton setPage={setPage} title={"Overlay"} />

            <hr></hr>

            <div className="settingsContainer">
                <div id="useOverlayContainer">
                    <SettingsSwitch
                        label="Overlay"
                        checked={settings.useOverlay}
                        onChange={handleUseOverlayToggle}
                        tooltip="Enable or disable the overlay"
                    />
                </div>
                <div id="overlayFontSizeContainer">
                    <div
                        id="overlayFontSizeDisplay"
                        className="sliderDisplayContainer"
                    >
                        <Typography variant="body1">Size</Typography>
                        <SettingsValueDisplay
                            id="fontSizeDisplay"
                            className="sliderDisplay"
                            value={settings.fontSize}
                            tooltip="Current font size"
                        />
                    </div>
                    <SettingsSlider
                        min={10}
                        max={90}
                        step={5}
                        ariaLabel="Overlay Size"
                        value={fontSize}
                        disabled={
                            !settings.useMouseWheelVolume ||
                            !settings.useOverlay
                        }
                        onChange={handleOverlaySizeChange}
                        tooltip="Set the text size of the overlay"
                    />
                </div>
                <div id="overlayDurationContainer">
                    <div
                        id="overlayDurationDisplay"
                        className="sliderDisplayContainer"
                    >
                        <Typography variant="body1">Duration</Typography>
                        <SettingsValueDisplay
                            id="overlayDurationValueDisplay"
                            className="sliderDisplay"
                            value={
                                settings.overlayDuration === 0
                                    ? "∞"
                                    : (settings.overlayDuration / 1000).toFixed(
                                          1,
                                      )
                            }
                            tooltip="Current duration in seconds"
                            sx={
                                settings.overlayDuration === 0
                                    ? { fontSize: "1.3rem", lineHeight: 1 }
                                    : {}
                            }
                        />
                    </div>
                    <SettingsSlider
                        min={0}
                        max={10000}
                        step={500}
                        ariaLabel="Overlay Duration"
                        value={overlayDuration}
                        disabled={
                            !settings.useMouseWheelVolume ||
                            !settings.useOverlay
                        }
                        onChange={handleOverlayDurationChange}
                        tooltip="Set how long the overlay is visible in seconds. Set to 0 for infinite."
                    />
                </div>
                <div id="overlayBackgroundContainer">
                    <div id="overlayBackgroundToggleContainer">
                        <SettingsSwitch
                            label="Background"
                            checked={settings.useOverlayBackground}
                            onChange={handleOverlayBackgroundToggle}
                            tooltip="Enable or disable overlay background"
                        />
                        <SettingsValueDisplay
                            id="overlayBackgroundDisplay"
                            value={`${overlayBackgroundOpacity}%`}
                            tooltip="Current background opacity"
                        />
                    </div>
                    <SettingsSlider
                        min={5}
                        max={100}
                        step={5}
                        ariaLabel="Overlay Background Opacity"
                        value={overlayBackgroundOpacity}
                        disabled={
                            !settings.useMouseWheelVolume ||
                            !settings.useOverlay ||
                            !settings.useOverlayBackground
                        }
                        onChange={handleOverlayBackgroundOpacityChange}
                        tooltip="Set how transparent the overlay is"
                    />
                </div>
                <div id="overlayColorPickerContainer">
                    <div
                        id="colorDisplay"
                        style={{
                            opacity:
                                !settings.useMouseWheelVolume ||
                                !settings.useOverlay
                                    ? 0.5
                                    : 1,
                        }}
                    >
                        <Paper
                            elevation={2}
                            sx={{
                                bgcolor: settings.overlayColor,
                                width: 40,
                                height: 20,
                                mr: 1,
                                cursor:
                                    !settings.useMouseWheelVolume ||
                                    !settings.useOverlay
                                        ? "default"
                                        : "pointer",
                            }}
                            onClick={handleColorPickerClick}
                        />
                        <Typography variant="body1">Color</Typography>
                    </div>
                    {isColorpickerVisible &&
                        !(
                            !settings.useMouseWheelVolume ||
                            !settings.useOverlay
                        ) && (
                            <TwitterPicker
                                colors={colors}
                                color={settings.overlayColor}
                                onChange={handleOverlayColorChange}
                                width="220px"
                            />
                        )}
                </div>
                <div id="overlayPositionDropdownContainer">
                    <Tooltip title="Set overlay position">
                        <span>
                            <select
                                id="overlayPositionSelector"
                                onChange={handlePositionChange}
                                defaultValue={settings.overlayPosition}
                                disabled={!settings.useMouseWheelVolume}
                            >
                                <option value="mouse">Relative to Mouse</option>
                                <option value="tl">Top Left</option>
                                <option value="tr">Top Right</option>
                                <option value="bl">Bottom Left</option>
                                <option value="br">Bottom Right</option>
                                <option value="custom">Custom</option>
                            </select>
                        </span>
                    </Tooltip>
                </div>
                <div id="overlayXContainer">
                    <div id="overlayXPos" className="sliderDisplayContainer">
                        <Typography variant="body1">
                            Horizontal position
                        </Typography>
                        <SettingsValueDisplay
                            id="overlayXPosDisplay"
                            className="sliderDisplay"
                            value={settings.overlayXPos}
                            tooltip="Current increment"
                        />
                    </div>
                    <SettingsSlider
                        min={5}
                        max={95}
                        step={5}
                        ariaLabel="Horizontal position"
                        value={xPos}
                        disabled={
                            !settings.useMouseWheelVolume ||
                            settings.overlayPosition !== "custom" ||
                            !settings.useOverlay
                        }
                        onChange={handleXChange}
                        tooltip="The horizontal position of the overlay"
                    />
                </div>
                <div id="overlayYContainer">
                    <div id="overlayYPos" className="sliderDisplayContainer">
                        <Typography variant="body1">
                            Vertical position
                        </Typography>
                        <SettingsValueDisplay
                            id="overlayYPosDisplay"
                            className="sliderDisplay"
                            value={settings.overlayYPos}
                            tooltip="Current increment"
                        />
                    </div>
                    <SettingsSlider
                        min={5}
                        max={95}
                        step={5}
                        ariaLabel="Vertical position"
                        value={yPos}
                        disabled={
                            !settings.useMouseWheelVolume ||
                            settings.overlayPosition !== "custom" ||
                            !settings.useOverlay
                        }
                        onChange={handleYChange}
                        tooltip="The vertical position of the overlay"
                    />
                </div>
            </div>
        </div>
    );
};

export default OverlayPage;
