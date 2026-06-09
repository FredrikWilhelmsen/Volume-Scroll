import React, { useState, useEffect } from "react";
import { Settings, Pages } from "../types";
import BackButton from "../components/BackButton";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import Typography from "@mui/material/Typography/Typography";
import IconButton from "@mui/material/IconButton/IconButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import "../style/overlayPage.css";
import Paper from "@mui/material/Paper";
import { TwitterPicker } from "@hello-pangea/color-picker";
import SettingsSlider from "../components/SettingsSlider";
import SettingsSwitch from "../components/SettingsSwitch";
import SettingsValueDisplay from "../components/SettingsValueDisplay";
import ResetButton from "../components/ResetButton";

interface OverlayPageInterface {
    settings: Settings;
    overrideSettings?: Partial<Settings>;
    activeDomain?: string;
    editSetting: (key: keyof Settings, value: any, domain?: string) => void;
    resetSetting?: (key: keyof Settings, domain: string) => void;
    setPage: (targetPage: Pages) => void;
}

const OverlayPage: React.FC<OverlayPageInterface> = ({
    settings,
    overrideSettings,
    activeDomain,
    editSetting,
    resetSetting,
    setPage,
}) => {
    const getValue = <K extends keyof Settings>(key: K): Settings[K] => {
        return overrideSettings?.[key] ?? settings[key];
    };

    const isOverridden = (key: keyof Settings): boolean => {
        return overrideSettings?.[key] !== undefined;
    };

    const handleReset = (key: keyof Settings) => {
        if (resetSetting && activeDomain) {
            resetSetting(key, activeDomain);
        }
    };

    const [xPos, setXPos] = useState(getValue("overlayXPos"));
    const [yPos, setYPos] = useState(getValue("overlayYPos"));
    const [fontSize, setFontSize] = useState(getValue("fontSize"));
    const [overlayDuration, setOverlayDuration] = useState(
        getValue("overlayDuration"),
    );
    const [overlayBackgroundOpacity, setOverlayBackgroundOpacity] = useState(
        getValue("overlayBackgroundOpacity"),
    );

    const [isColorpickerVisible, setIsColorpickerVisible] = useState(false);

    useEffect(() => {
        setXPos(getValue("overlayXPos"));
        setYPos(getValue("overlayYPos"));
        setFontSize(getValue("fontSize"));
        setOverlayDuration(getValue("overlayDuration"));
        setOverlayBackgroundOpacity(getValue("overlayBackgroundOpacity"));
    }, [settings, overrideSettings]);

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
        editSetting("useOverlay", value, activeDomain);
    };

    const handleOverlaySizeChange = (value: number) => {
        editSetting("fontSize", value, activeDomain);
        setFontSize(value);
    };

    const handleOverlayDurationChange = (value: number) => {
        editSetting("overlayDuration", value, activeDomain);
        setOverlayDuration(value);
    };

    const handleOverlayBackgroundToggle = (value: boolean) => {
        editSetting("useOverlayBackground", value, activeDomain);
    };

    const handleOverlayBackgroundOpacityChange = (value: number) => {
        editSetting("overlayBackgroundOpacity", value, activeDomain);
        setOverlayBackgroundOpacity(value);
    };

    const handleUseDutchAngleToggle = (value: boolean) => {
        editSetting("useDutchAngle", value, activeDomain);
    };

    const handleOverlayColorChange = (color: any) => {
        if (!getValue("useMouseWheelVolume") || !getValue("useOverlay")) return;
        editSetting("overlayColor", color.hex, activeDomain);
    };

    const handleColorPickerClick = () => {
        if (!getValue("useMouseWheelVolume") || !getValue("useOverlay")) return;
        setIsColorpickerVisible(!isColorpickerVisible);
    };

    const handleOverlayStyleChange = (e: any) => {
        editSetting("overlayStyle", e.currentTarget.value, activeDomain);
    };

    const handlePositionChange = (e: any) => {
        editSetting("overlayPosition", e.currentTarget.value, activeDomain);

        const save = (x: number, y: number) => {
            setXPos(x);
            editSetting("overlayXPos", x, activeDomain);
            setYPos(y);
            editSetting("overlayYPos", y, activeDomain);
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
        editSetting("overlayXPos", value, activeDomain);
        setXPos(value);
    };

    const handleYChange = (value: number) => {
        editSetting("overlayYPos", value, activeDomain);
        setYPos(value);
    };

    const handleOverlayBarSideChange = (e: any) => {
        editSetting("overlayBarSide", e.currentTarget.value, activeDomain);
    };

    const useMouseWheelVolume = getValue("useMouseWheelVolume");
    const useOverlay = getValue("useOverlay");
    const overlayDurationValue = getValue("overlayDuration");
    const useOverlayBackground = getValue("useOverlayBackground");
    const overlayColor = getValue("overlayColor");
    const overlayPosition = getValue("overlayPosition");
    const useDutchAngle = getValue("useDutchAngle");
    const overlayStyle = getValue("overlayStyle");
    const overlayBarSide = getValue("overlayBarSide");

    const hasCategoryOverride =
        !!activeDomain &&
        [
            "useOverlay",
            "fontSize",
            "overlayDuration",
            "useOverlayBackground",
            "overlayBackgroundOpacity",
            "overlayColor",
            "overlayPosition",
            "overlayXPos",
            "overlayYPos",
            "useDutchAngle",
            "overlayStyle",
        ].some((key) => isOverridden(key as keyof Settings));

    return (
        <div>
            <BackButton
                setPage={setPage}
                title={activeDomain ? "Overlay (Override)" : "Overlay"}
                targetPage={activeDomain ? "domains" : "menu"}
                isOverride={hasCategoryOverride}
            />

            <hr></hr>

            <div className="settingsContainer">
                <div
                    id="useOverlayContainer"
                    style={{ display: "flex", alignItems: "center" }}
                >
                    <SettingsSwitch
                        label="Overlay"
                        checked={useOverlay}
                        onChange={handleUseOverlayToggle}
                        tooltip="Enable or disable the overlay"
                        isOverridden={isOverridden("useOverlay")}
                        disabled={!useMouseWheelVolume}
                    />
                    <ResetButton
                        isOverridden={isOverridden("useOverlay")}
                        onReset={
                            activeDomain
                                ? () => handleReset("useOverlay")
                                : undefined
                        }
                    />
                </div>
                <div id="overlayFontSizeContainer">
                    <div
                        id="overlayFontSizeDisplay"
                        className="sliderDisplayContainer"
                    >
                        <Typography variant="body1">Size</Typography>
                        <div
                            style={{
                                marginRight: activeDomain ? "42px" : "0px",
                            }}
                        >
                            <SettingsValueDisplay
                                id="fontSizeDisplay"
                                className="sliderDisplay"
                                value={fontSize}
                                tooltip="Current font size"
                                isOverridden={isOverridden("fontSize")}
                            />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <SettingsSlider
                            min={10}
                            max={90}
                            step={5}
                            ariaLabel="Overlay Size"
                            value={fontSize}
                            disabled={!useMouseWheelVolume || !useOverlay}
                            onChange={handleOverlaySizeChange}
                            tooltip="Set the text size of the overlay"
                            isOverridden={isOverridden("fontSize")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("fontSize")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("fontSize")
                                    : undefined
                            }
                        />
                    </div>
                </div>
                <div id="overlayDurationContainer">
                    <div
                        id="overlayDurationDisplay"
                        className="sliderDisplayContainer"
                    >
                        <Typography variant="body1">Duration</Typography>
                        <div
                            style={{
                                marginRight: activeDomain ? "42px" : "0px",
                            }}
                        >
                            <SettingsValueDisplay
                                id="overlayDurationValueDisplay"
                                className="sliderDisplay"
                                value={
                                    overlayDurationValue === 0
                                        ? "∞"
                                        : (overlayDurationValue / 1000).toFixed(
                                              1,
                                          )
                                }
                                tooltip="Current duration in seconds"
                                sx={
                                    overlayDurationValue === 0
                                        ? {
                                              fontSize: "1.3rem",
                                              lineHeight: 1,
                                          }
                                        : undefined
                                }
                                isOverridden={isOverridden("overlayDuration")}
                            />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <SettingsSlider
                            min={0}
                            max={10000}
                            step={500}
                            ariaLabel="Overlay Duration"
                            value={overlayDuration}
                            disabled={!useMouseWheelVolume || !useOverlay}
                            onChange={handleOverlayDurationChange}
                            tooltip="Set how long the overlay is visible in seconds. Set to 0 for infinite."
                            isOverridden={isOverridden("overlayDuration")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("overlayDuration")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("overlayDuration")
                                    : undefined
                            }
                        />
                    </div>
                </div>
                <div id="overlayBackgroundContainer">
                    <div
                        id="overlayBackgroundToggleContainer"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                flexGrow: 1,
                                justifyContent: "space-between",
                            }}
                        >
                            <SettingsSwitch
                                label="Background"
                                checked={useOverlayBackground}
                                onChange={handleOverlayBackgroundToggle}
                                tooltip="Enable or disable overlay background"
                                isOverridden={isOverridden(
                                    "useOverlayBackground",
                                )}
                            />
                            <SettingsValueDisplay
                                id="overlayBackgroundDisplay"
                                value={`${overlayBackgroundOpacity}%`}
                                tooltip="Current background opacity"
                                isOverridden={isOverridden(
                                    "overlayBackgroundOpacity",
                                )}
                            />
                        </div>
                        <ResetButton
                            isOverridden={isOverridden("useOverlayBackground")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("useOverlayBackground")
                                    : undefined
                            }
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <SettingsSlider
                            min={5}
                            max={100}
                            step={5}
                            ariaLabel="Overlay Background Opacity"
                            value={overlayBackgroundOpacity}
                            disabled={
                                !useMouseWheelVolume ||
                                !useOverlay ||
                                !useOverlayBackground
                            }
                            onChange={handleOverlayBackgroundOpacityChange}
                            tooltip="Set how transparent the overlay is"
                            isOverridden={isOverridden(
                                "overlayBackgroundOpacity",
                            )}
                        />
                        <ResetButton
                            isOverridden={isOverridden(
                                "overlayBackgroundOpacity",
                            )}
                            onReset={
                                activeDomain
                                    ? () =>
                                          handleReset(
                                              "overlayBackgroundOpacity",
                                          )
                                    : undefined
                            }
                        />
                    </div>
                </div>
                <div
                    id="useDutchAngleContainer"
                    style={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <SettingsSwitch
                        label="Dutch Angle"
                        checked={useDutchAngle}
                        onChange={handleUseDutchAngleToggle}
                        tooltip="Slightly tilt the overlay"
                        isOverridden={isOverridden("useDutchAngle")}
                        disabled={!useMouseWheelVolume || !useOverlay}
                    />
                    <ResetButton
                        isOverridden={isOverridden("useDutchAngle")}
                        onReset={
                            activeDomain
                                ? () => handleReset("useDutchAngle")
                                : undefined
                        }
                    />
                </div>
                <div id="overlayColorPickerContainer">
                    <div
                        id="colorDisplay"
                        style={{
                            opacity:
                                !useMouseWheelVolume || !useOverlay ? 0.5 : 1,
                            display: "flex",
                            alignItems: "center",
                            marginTop: "12px",
                        }}
                    >
                        <Paper
                            elevation={2}
                            sx={{
                                bgcolor: overlayColor,
                                width: 40,
                                height: 20,
                                mr: 1,
                                marginLeft: "4px",
                                cursor:
                                    !useMouseWheelVolume || !useOverlay
                                        ? "default"
                                        : "pointer",
                                outline: isOverridden("overlayColor")
                                    ? "2px solid #FCB900"
                                    : "2px solid #1976d2",
                                outlineOffset: "2px",
                            }}
                            onClick={handleColorPickerClick}
                        />
                        <Typography
                            variant="body1"
                            sx={{
                                flexGrow: 1,
                                color: isOverridden("overlayColor")
                                    ? "#FCB900"
                                    : "inherit",
                                textShadow: isOverridden("overlayColor")
                                    ? "0 0 8px rgba(252, 185, 0, 0.4)"
                                    : "none",
                            }}
                        >
                            Color
                        </Typography>
                        <ResetButton
                            isOverridden={isOverridden("overlayColor")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("overlayColor")
                                    : undefined
                            }
                        />
                    </div>
                    {isColorpickerVisible &&
                        !(!useMouseWheelVolume || !useOverlay) && (
                            <TwitterPicker
                                colors={colors}
                                color={overlayColor}
                                onChange={handleOverlayColorChange}
                                width="220px"
                            />
                        )}
                </div>
                <div
                    id="overlayStyleDropdownContainer"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "10px",
                        marginBottom: "10px",
                    }}
                >
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                        Style
                    </Typography>
                    <Tooltip title="Set overlay style">
                        <span style={{ marginRight: "8px" }}>
                            <select
                                id="overlayStyleSelector"
                                onChange={handleOverlayStyleChange}
                                value={overlayStyle}
                                disabled={!useMouseWheelVolume || !useOverlay}
                                style={{
                                    width: "150px",
                                    borderColor: isOverridden("overlayStyle")
                                        ? "#FCB900"
                                        : "inherit",
                                    boxShadow: isOverridden("overlayStyle")
                                        ? "0 0 8px rgba(252, 185, 0, 0.4)"
                                        : "none",
                                    color: "black",
                                }}
                            >
                                <option value="number">Number</option>
                                <option value="bar">Bar</option>
                                <option value="circle">Circle</option>
                                <option value="retro">Retro Bar</option>
                            </select>
                        </span>
                    </Tooltip>
                    <ResetButton
                        isOverridden={isOverridden("overlayStyle")}
                        onReset={
                            activeDomain
                                ? () => handleReset("overlayStyle")
                                : undefined
                        }
                    />
                </div>
                {(overlayStyle === "number" || overlayStyle === "circle") && (
                    <>
                        <div
                            id="overlayPositionDropdownContainer"
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <Tooltip title="Set overlay position">
                                <span
                                    style={{ flexGrow: 1, marginRight: "8px" }}
                                >
                                    <select
                                        id="overlayPositionSelector"
                                        onChange={handlePositionChange}
                                        value={overlayPosition}
                                        disabled={!useMouseWheelVolume}
                                        style={{
                                            width: "100%",
                                            borderColor: isOverridden(
                                                "overlayPosition",
                                            )
                                                ? "#FCB900"
                                                : "inherit",
                                            boxShadow: isOverridden(
                                                "overlayPosition",
                                            )
                                                ? "0 0 8px rgba(252, 185, 0, 0.4)"
                                                : "none",
                                            color: "black",
                                        }}
                                    >
                                        <option value="mouse">
                                            Relative to Mouse
                                        </option>
                                        <option value="tl">Top Left</option>
                                        <option value="tr">Top Right</option>
                                        <option value="bl">Bottom Left</option>
                                        <option value="br">Bottom Right</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </span>
                            </Tooltip>
                            <ResetButton
                                isOverridden={isOverridden("overlayPosition")}
                                onReset={
                                    activeDomain
                                        ? () => handleReset("overlayPosition")
                                        : undefined
                                }
                            />
                        </div>
                        <div id="overlayXContainer">
                            <div
                                id="overlayXPos"
                                className="sliderDisplayContainer"
                            >
                                <Typography variant="body1">
                                    Horizontal position
                                </Typography>
                                <div
                                    style={{
                                        marginRight: activeDomain
                                            ? "42px"
                                            : "0px",
                                    }}
                                >
                                    <SettingsValueDisplay
                                        id="overlayXPosDisplay"
                                        className="sliderDisplay"
                                        value={xPos}
                                        tooltip="Current horizontal position"
                                        isOverridden={isOverridden(
                                            "overlayXPos",
                                        )}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <SettingsSlider
                                    min={5}
                                    max={95}
                                    step={5}
                                    ariaLabel="Horizontal position"
                                    value={xPos}
                                    disabled={
                                        !useMouseWheelVolume ||
                                        overlayPosition !== "custom" ||
                                        !useOverlay
                                    }
                                    onChange={handleXChange}
                                    tooltip="The horizontal position of the overlay"
                                    isOverridden={isOverridden("overlayXPos")}
                                />
                                <ResetButton
                                    isOverridden={
                                        overlayPosition === "custom" &&
                                        isOverridden("overlayXPos")
                                    }
                                    onReset={
                                        activeDomain
                                            ? () => handleReset("overlayXPos")
                                            : undefined
                                    }
                                />
                            </div>
                        </div>
                        <div id="overlayYContainer">
                            <div
                                id="overlayYPos"
                                className="sliderDisplayContainer"
                            >
                                <Typography variant="body1">
                                    Vertical position
                                </Typography>
                                <div
                                    style={{
                                        marginRight: activeDomain
                                            ? "42px"
                                            : "0px",
                                    }}
                                >
                                    <SettingsValueDisplay
                                        id="overlayYPosDisplay"
                                        className="sliderDisplay"
                                        value={yPos}
                                        tooltip="Current vertical position"
                                        isOverridden={isOverridden(
                                            "overlayYPos",
                                        )}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <SettingsSlider
                                    min={5}
                                    max={95}
                                    step={5}
                                    ariaLabel="Vertical position"
                                    value={yPos}
                                    disabled={
                                        !useMouseWheelVolume ||
                                        overlayPosition !== "custom" ||
                                        !useOverlay
                                    }
                                    onChange={handleYChange}
                                    tooltip="The vertical position of the overlay"
                                    isOverridden={isOverridden("overlayYPos")}
                                />
                                <ResetButton
                                    isOverridden={
                                        overlayPosition === "custom" &&
                                        isOverridden("overlayYPos")
                                    }
                                    onReset={
                                        activeDomain
                                            ? () => handleReset("overlayYPos")
                                            : undefined
                                    }
                                />
                            </div>
                        </div>
                    </>
                )}
                {(overlayStyle === "bar" || overlayStyle === "retro") && (
                    <>
                        <div
                            id="overlayBarSideContainer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <Typography variant="body1" sx={{ flexGrow: 1 }}>
                                Side
                            </Typography>
                            <Tooltip title="Set bar side">
                                <span style={{ marginRight: "8px" }}>
                                    <select
                                        id="overlayBarSideSelector"
                                        onChange={handleOverlayBarSideChange}
                                        value={overlayBarSide}
                                        disabled={
                                            !useMouseWheelVolume || !useOverlay
                                        }
                                        style={{
                                            width: "150px",
                                            borderColor: isOverridden(
                                                "overlayBarSide",
                                            )
                                                ? "#FCB900"
                                                : "inherit",
                                            boxShadow: isOverridden(
                                                "overlayBarSide",
                                            )
                                                ? "0 0 8px rgba(252, 185, 0, 0.4)"
                                                : "none",
                                            color: "black",
                                        }}
                                    >
                                        <option value="left">Left</option>
                                        <option value="right">Right</option>
                                    </select>
                                </span>
                            </Tooltip>
                            <ResetButton
                                isOverridden={isOverridden("overlayBarSide")}
                                onReset={
                                    activeDomain
                                        ? () => handleReset("overlayBarSide")
                                        : undefined
                                }
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OverlayPage;
