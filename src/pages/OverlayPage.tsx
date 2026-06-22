import React, { useState, useEffect } from "react";
import { Settings, Pages, colors } from "../types";
import BackButton from "../components/BackButton";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import "../style/overlayPage.css";
import ResetButton from "../components/ResetButton";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Toggle from "../components/Toggle";
import Slider from "../components/Slider";
import ToggleSlider from "../components/ToggleSlider";
import ColorPicker from "../components/ColorPicker";
import NamedDropdown from "../components/NamedDropdown";

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

    // States to control Tooltip visibility manually depending on Select state
    const [positionTooltipOpen, setPositionTooltipOpen] = useState(false);
    const [positionSelectOpen, setPositionSelectOpen] = useState(false);

    useEffect(() => {
        setXPos(getValue("overlayXPos"));
        setYPos(getValue("overlayYPos"));
        setFontSize(getValue("fontSize"));
        setOverlayDuration(getValue("overlayDuration"));
        setOverlayBackgroundOpacity(getValue("overlayBackgroundOpacity"));
    }, [settings, overrideSettings]);

    const handlePositionChange = (e: SelectChangeEvent<string>) => {
        const val = e.target.value;
        editSetting("overlayPosition", val, activeDomain);

        const save = (x: number, y: number) => {
            setXPos(x);
            editSetting("overlayXPos", x, activeDomain);
            setYPos(y);
            editSetting("overlayYPos", y, activeDomain);
        };

        if (val === "tl") {
            save(5, 5);
        } else if (val === "tr") {
            save(95, 5);
        } else if (val === "bl") {
            save(5, 95);
        } else if (val === "br") {
            save(95, 95);
        }
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
    const showNumericValue = getValue("showNumericValue");

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
            "overlayBarSide",
            "showNumericValue",
        ].some((key) => isOverridden(key as keyof Settings));

    const getDropdownSx = (overrideKey: keyof Settings) => {
        const hasOverride = isOverridden(overrideKey);
        const accentColor = hasOverride ? "#FCB900" : "#1976d2";

        return {
            height: "32px",
            fontSize: "0.9rem",
            color: "white",
            "& .MuiSelect-icon": {
                color: "white",
            },
            "&:before": {
                borderColor: accentColor,
            },
            "&:hover:not(.Mui-disabled):before": {
                borderColor: `${accentColor} !important`,
            },
            "&:after": {
                borderColor: accentColor,
            },
            boxShadow: "none",
        };
    };

    const menuPropsSettings = {
        disableScrollLock: true,
        anchorOrigin: {
            vertical: "bottom" as const,
            horizontal: "left" as const,
        },
        transformOrigin: {
            vertical: "top" as const,
            horizontal: "left" as const,
        },
        PaperProps: {
            sx: {
                bgcolor: "white",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                marginTop: "4px",
                "& .MuiMenuItem-root": {
                    fontSize: "0.85rem",
                    padding: "6px 16px",
                    color: "black",
                    "&:hover": {
                        bgcolor: "rgba(25, 118, 210, 0.12) !important",
                    },
                    "&.Mui-selected": {
                        bgcolor: "rgba(25, 118, 210, 0.2) !important",
                        color: "#1976d2",
                        fontWeight: 500,
                        "&:hover": {
                            bgcolor: "rgba(25, 118, 210, 0.28) !important",
                        },
                    },
                },
            },
        },
    };

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
                <Toggle
                    label="Overlay"
                    settingKey="useOverlay"
                    checked={useOverlay}
                    disabled={!useMouseWheelVolume}
                    tooltip="Enable or disable the overlay"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    id="useOverlayContainer"
                />
                <Slider
                    label="Size"
                    settingKey="fontSize"
                    value={fontSize}
                    min={10}
                    max={90}
                    step={5}
                    ariaLabel="Overlay Size"
                    disabled={!useMouseWheelVolume || !useOverlay}
                    tooltip="Set the text size of the overlay"
                    valueTooltip="Current font size"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    onValueChange={setFontSize}
                    id="overlayFontSizeContainer"
                    displayContainerId="overlayFontSizeDisplay"
                    valueDisplayId="fontSizeDisplay"
                />
                <Slider
                    label="Duration"
                    settingKey="overlayDuration"
                    value={overlayDuration}
                    min={0}
                    max={10000}
                    step={500}
                    ariaLabel="Overlay Duration"
                    disabled={!useMouseWheelVolume || !useOverlay}
                    tooltip="Set how long the overlay is visible in seconds. Set to 0 for infinite."
                    valueTooltip="Current duration in seconds"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    onValueChange={setOverlayDuration}
                    valueFormatter={(val) =>
                        val === 0 ? "∞" : (val / 1000).toFixed(1)
                    }
                    valueSx={
                        overlayDurationValue === 0
                            ? {
                                  fontSize: "1.3rem",
                                  lineHeight: 1,
                              }
                            : undefined
                    }
                    id="overlayDurationContainer"
                    displayContainerId="overlayDurationDisplay"
                    valueDisplayId="overlayDurationValueDisplay"
                />
                <ToggleSlider
                    label="Background"
                    switchKey="useOverlayBackground"
                    sliderKey="overlayBackgroundOpacity"
                    checked={useOverlayBackground}
                    value={overlayBackgroundOpacity}
                    min={5}
                    max={100}
                    step={5}
                    ariaLabel="Overlay Background Opacity"
                    disabled={!useMouseWheelVolume || !useOverlay}
                    sliderDisabled={
                        !useMouseWheelVolume ||
                        !useOverlay ||
                        !useOverlayBackground
                    }
                    switchTooltip="Enable or disable overlay background"
                    sliderTooltip="Set how transparent the overlay is"
                    valueTooltip="Current background opacity"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    onValueChange={setOverlayBackgroundOpacity}
                    valueFormatter={(v) => `${v}%`}
                    containerId="overlayBackgroundContainer"
                    toggleContainerId="overlayBackgroundToggleContainer"
                    valueDisplayId="overlayBackgroundDisplay"
                />
                <Toggle
                    label="Dutch Angle"
                    settingKey="useDutchAngle"
                    checked={useDutchAngle}
                    disabled={!useMouseWheelVolume || !useOverlay}
                    tooltip="Slightly tilt the overlay"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    id="useDutchAngleContainer"
                />
                <ColorPicker
                    label="Color"
                    settingKey="overlayColor"
                    color={overlayColor}
                    colors={colors}
                    disabled={!useMouseWheelVolume || !useOverlay}
                    tooltip="Set the color of the overlay"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    containerId="overlayColorPickerContainer"
                />
                <NamedDropdown
                    label="Style"
                    settingKey="overlayStyle"
                    value={overlayStyle}
                    options={[
                        { value: "number", label: "Number" },
                        { value: "bar", label: "Bar" },
                        { value: "retro", label: "Retro Bar" },
                        { value: "circle", label: "Circle" },
                    ]}
                    disabled={!useMouseWheelVolume || !useOverlay}
                    tooltip="Set overlay style"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    containerId="overlayStyleDropdownContainer"
                    selectId="overlayStyleSelector"
                />

                {(overlayStyle === "number" || overlayStyle === "circle") && (
                    <>
                        {/* Position Dropdown Container */}
                        <div
                            id="overlayPositionDropdownContainer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <Tooltip
                                title="Set overlay position"
                                open={
                                    positionTooltipOpen && !positionSelectOpen
                                }
                                onOpen={() => setPositionTooltipOpen(true)}
                                onClose={() => setPositionTooltipOpen(false)}
                            >
                                <span
                                    style={{ flexGrow: 1, marginRight: "8px" }}
                                >
                                    <FormControl
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                    >
                                        <Select
                                            id="overlayPositionSelector"
                                            value={overlayPosition}
                                            onChange={handlePositionChange}
                                            disabled={
                                                !useMouseWheelVolume ||
                                                !useOverlay
                                            }
                                            onOpen={() =>
                                                setPositionSelectOpen(true)
                                            }
                                            onClose={() =>
                                                setPositionSelectOpen(false)
                                            }
                                            sx={getDropdownSx(
                                                "overlayPosition",
                                            )}
                                            MenuProps={menuPropsSettings}
                                        >
                                            <MenuItem value="mouse">
                                                Relative to Mouse
                                            </MenuItem>
                                            <MenuItem value="tl">
                                                Top Left
                                            </MenuItem>
                                            <MenuItem value="tr">
                                                Top Right
                                            </MenuItem>
                                            <MenuItem value="bl">
                                                Bottom Left
                                            </MenuItem>
                                            <MenuItem value="br">
                                                Bottom Right
                                            </MenuItem>
                                            <MenuItem value="custom">
                                                Custom
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
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
                        <Slider
                            label="Horizontal position"
                            settingKey="overlayXPos"
                            value={xPos}
                            min={5}
                            max={95}
                            step={5}
                            ariaLabel="Horizontal position"
                            disabled={
                                !useMouseWheelVolume ||
                                overlayPosition !== "custom" ||
                                !useOverlay
                            }
                            tooltip="The horizontal position of the overlay"
                            valueTooltip="Current horizontal position"
                            activeDomain={activeDomain}
                            editSetting={editSetting}
                            isOverridden={(key) =>
                                overlayPosition === "custom" &&
                                isOverridden(key)
                            }
                            handleReset={handleReset}
                            onValueChange={setXPos}
                            id="overlayXContainer"
                            displayContainerId="overlayXPos"
                            valueDisplayId="overlayXPosDisplay"
                        />
                        <Slider
                            label="Vertical position"
                            settingKey="overlayYPos"
                            value={yPos}
                            min={5}
                            max={95}
                            step={5}
                            ariaLabel="Vertical position"
                            disabled={
                                !useMouseWheelVolume ||
                                overlayPosition !== "custom" ||
                                !useOverlay
                            }
                            tooltip="The vertical position of the overlay"
                            valueTooltip="Current vertical position"
                            activeDomain={activeDomain}
                            editSetting={editSetting}
                            isOverridden={(key) =>
                                overlayPosition === "custom" &&
                                isOverridden(key)
                            }
                            handleReset={handleReset}
                            onValueChange={setYPos}
                            id="overlayYContainer"
                            displayContainerId="overlayYPos"
                            valueDisplayId="overlayYPosDisplay"
                        />
                    </>
                )}
                {(overlayStyle === "bar" || overlayStyle === "retro") && (
                    <>
                        <NamedDropdown
                            label="Side"
                            settingKey="overlayBarSide"
                            value={overlayBarSide}
                            options={[
                                { value: "left", label: "Left" },
                                { value: "right", label: "Right" },
                                { value: "top", label: "Top" },
                                { value: "bottom", label: "Bottom" },
                            ]}
                            disabled={!useMouseWheelVolume || !useOverlay}
                            tooltip="Set bar side"
                            activeDomain={activeDomain}
                            editSetting={editSetting}
                            isOverridden={isOverridden}
                            handleReset={handleReset}
                            containerId="overlayBarSideContainer"
                            selectId="overlayBarSideSelector"
                        />
                    </>
                )}
                {overlayStyle !== "number" && (
                    <Toggle
                        label="Show numeric value"
                        settingKey="showNumericValue"
                        checked={showNumericValue}
                        disabled={!useMouseWheelVolume || !useOverlay}
                        tooltip="Show the numeric value of the volume"
                        activeDomain={activeDomain}
                        editSetting={editSetting}
                        isOverridden={isOverridden}
                        handleReset={handleReset}
                        id="showNumericValueContainer"
                    />
                )}
            </div>
        </div>
    );
};

export default OverlayPage;
