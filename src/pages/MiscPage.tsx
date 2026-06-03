import React, { useState, useEffect } from "react";
import { Settings, Pages } from "../types";
import BackButton from "../components/BackButton";
import Typography from "@mui/material/Typography/Typography";
import IconButton from "@mui/material/IconButton/IconButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import "../style/miscPage.css";
import Paper from "@mui/material/Paper";
import { TwitterPicker } from "@hello-pangea/color-picker";
import SettingsSlider from "../components/SettingsSlider";
import HotkeyButton from "../components/HotkeyButton";
import SettingsSwitch from "../components/SettingsSwitch";
import SettingsValueDisplay from "../components/SettingsValueDisplay";
import ResetButton from "../components/ResetButton";

interface MiscPageInterface {
    settings: Settings;
    overrideSettings?: Partial<Settings>;
    activeDomain?: string;
    editSetting: (key: keyof Settings, value: any, domain?: string) => void;
    resetSetting?: (key: keyof Settings, domain: string) => void;
    setPage: (targetPage: Pages) => void;
}

const MiscPage: React.FC<MiscPageInterface> = ({
    settings,
    overrideSettings,
    activeDomain,
    editSetting,
    resetSetting,
    setPage,
}) => {
    // Helper functions for overrides
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

    const [defaultVolume, setDefaultVolume] = useState(
        getValue("defaultVolume"),
    );
    const [volumeBoostAmount, setVolumeBoostAmount] = useState(
        getValue("volumeBoostAmount"),
    );
    const [alternateVolumeIncrement, setAlternateVolumeIncrement] = useState(
        getValue("alternateVolumeIncrement"),
    );
    const [isBoostColorPickerVisible, setIsBoostColorPickerVisible] =
        useState(false);

    useEffect(() => {
        setDefaultVolume(getValue("defaultVolume"));
        setVolumeBoostAmount(getValue("volumeBoostAmount"));
        setAlternateVolumeIncrement(getValue("alternateVolumeIncrement"));
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

    const handleUseDefaultVolumeToggle = (value: boolean) => {
        editSetting("useDefaultVolume", value, activeDomain);
    };

    const handleDefaultVolumeChange = (value: number) => {
        setDefaultVolume(value);
        editSetting("defaultVolume", value, activeDomain);
    };

    const handleStartMutedToggle = (value: boolean) => {
        editSetting("startMuted", value, activeDomain);
    };

    const handleBoostVolumeToggle = (value: boolean) => {
        editSetting("doBoostVolume", value, activeDomain);
    };

    const handleBoostVolumeChange = (value: number) => {
        setVolumeBoostAmount(value);
        editSetting("volumeBoostAmount", value, activeDomain);
    };

    const handleBoostColorChange = (color: any) => {
        if (!getValue("useMouseWheelVolume") || !getValue("doBoostVolume"))
            return;
        editSetting("boostedColor", color.hex, activeDomain);
    };

    const handleBoostColorPickerClick = () => {
        if (!getValue("useMouseWheelVolume") || !getValue("doBoostVolume"))
            return;
        setIsBoostColorPickerVisible(!isBoostColorPickerVisible);
    };

    const handleAlternateIncrementToggle = (value: boolean) => {
        editSetting("useAlternateVolumeIncrement", value, activeDomain);
    };

    const handleAlternateIncrementChange = (value: number) => {
        editSetting("alternateVolumeIncrement", value, activeDomain);
        setAlternateVolumeIncrement(value);
    };

    const handleAlternateIncrementHotkeySet = (value: string) => {
        editSetting("alternateVolumeIncrementHotkey", value, activeDomain);
    };

    const useDefaultVolume = getValue("useDefaultVolume");
    const startMuted = getValue("startMuted");
    const doBoostVolume = getValue("doBoostVolume");
    const boostedColor = getValue("boostedColor");
    const useAlternateVolumeIncrement = getValue("useAlternateVolumeIncrement");
    const alternateVolumeIncrementHotkey = getValue(
        "alternateVolumeIncrementHotkey",
    );

    const hasCategoryOverride =
        !!activeDomain &&
        [
            "useDefaultVolume",
            "defaultVolume",
            "startMuted",
            "doBoostVolume",
            "volumeBoostAmount",
            "boostedColor",
            "useAlternateVolumeIncrement",
            "alternateVolumeIncrement",
            "alternateVolumeIncrementHotkey",
        ].some((key) => isOverridden(key as keyof Settings));

    return (
        <div>
            <BackButton
                setPage={setPage}
                title={activeDomain ? "Misc (Override)" : "Misc"}
                targetPage={activeDomain ? "domains" : "menu"}
                isOverride={hasCategoryOverride}
            />

            <hr></hr>

            <div className="settingsContainer">
                <div id="defaultVolumeContainer">
                    <div id="defaultVolumeToggleContainer">
                        <SettingsSwitch
                            label="Default volume"
                            checked={useDefaultVolume}
                            onChange={handleUseDefaultVolumeToggle}
                            tooltip="Enable or disable default volume"
                            isOverridden={isOverridden("useDefaultVolume")}
                        />
                        <SettingsValueDisplay
                            id="defaultVolumeDisplay"
                            value={defaultVolume}
                            tooltip="Current default volume"
                            isOverridden={isOverridden("defaultVolume")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("useDefaultVolume")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("useDefaultVolume")
                                    : undefined
                            }
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <SettingsSlider
                            min={0}
                            max={100}
                            step={5}
                            ariaLabel="Default volume"
                            value={defaultVolume}
                            disabled={!useDefaultVolume}
                            onChange={handleDefaultVolumeChange}
                            tooltip="Set what volume videos should start at"
                            isOverridden={isOverridden("defaultVolume")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("defaultVolume")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("defaultVolume")
                                    : undefined
                            }
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <SettingsSwitch
                            label="Start muted"
                            checked={startMuted}
                            onChange={handleStartMutedToggle}
                            disabled={!useDefaultVolume}
                            tooltip="Makes default volume start new videos muted"
                            isOverridden={isOverridden("startMuted")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("startMuted")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("startMuted")
                                    : undefined
                            }
                        />
                    </div>
                </div>
                <div id="boostVolumeContainer">
                    <div id="boostVolumeToggleContainer">
                        <SettingsSwitch
                            label="Boost volume"
                            checked={doBoostVolume}
                            onChange={handleBoostVolumeToggle}
                            tooltip="Increase volume limit past 100% - Experimental, disable if you experience issues"
                            isOverridden={isOverridden("doBoostVolume")}
                        />
                        <SettingsValueDisplay
                            id="boostVolumeDisplay"
                            value={volumeBoostAmount}
                            tooltip="Current volume limit"
                            isOverridden={isOverridden("volumeBoostAmount")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("doBoostVolume")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("doBoostVolume")
                                    : undefined
                            }
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <SettingsSlider
                            min={100}
                            max={500}
                            step={5}
                            ariaLabel="Volume boost"
                            value={volumeBoostAmount}
                            disabled={!doBoostVolume}
                            onChange={handleBoostVolumeChange}
                            tooltip="Current volume limit"
                            isOverridden={isOverridden("volumeBoostAmount")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("volumeBoostAmount")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("volumeBoostAmount")
                                    : undefined
                            }
                        />
                    </div>
                </div>
                <div id="boostColorPickerContainer">
                    <div
                        id="colorDisplay"
                        style={{
                            opacity:
                                !getValue("useMouseWheelVolume") ||
                                !doBoostVolume
                                    ? 0.5
                                    : 1,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <Paper
                            elevation={2}
                            sx={{
                                bgcolor: boostedColor,
                                width: 40,
                                height: 20,
                                mr: 1,
                                cursor:
                                    !getValue("useMouseWheelVolume") ||
                                    !doBoostVolume
                                        ? "default"
                                        : "pointer",
                                ...(isOverridden("boostedColor") && {
                                    outline: "2px solid #FCB900",
                                    outlineOffset: "2px",
                                }),
                            }}
                            onClick={handleBoostColorPickerClick}
                        />
                        <Typography
                            variant="body1"
                            sx={{
                                flexGrow: 1,
                                color: isOverridden("boostedColor")
                                    ? "#FCB900"
                                    : "inherit",
                                textShadow: isOverridden("boostedColor")
                                    ? "0 0 8px rgba(252, 185, 0, 0.4)"
                                    : "none",
                            }}
                        >
                            Boosted color
                        </Typography>
                        <ResetButton
                            isOverridden={isOverridden("boostedColor")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("boostedColor")
                                    : undefined
                            }
                        />
                    </div>

                    {isBoostColorPickerVisible &&
                        !(
                            !getValue("useMouseWheelVolume") || !doBoostVolume
                        ) && (
                            <TwitterPicker
                                colors={colors}
                                color={boostedColor}
                                onChange={handleBoostColorChange}
                                width="220px"
                            />
                        )}
                </div>
                <div id="alternateIncrementContainer">
                    <div id="alternateIncrementToggleContainer">
                        <SettingsSwitch
                            label="Alt. Step"
                            checked={useAlternateVolumeIncrement}
                            onChange={handleAlternateIncrementToggle}
                            tooltip="Enable or disable alternate increment hotkey"
                            isOverridden={isOverridden(
                                "useAlternateVolumeIncrement",
                            )}
                        />
                        <SettingsValueDisplay
                            id="alternateIncrementDisplay"
                            value={alternateVolumeIncrement}
                            tooltip="Current alternate increment"
                            isOverridden={isOverridden(
                                "alternateVolumeIncrement",
                            )}
                        />
                        <ResetButton
                            isOverridden={isOverridden(
                                "useAlternateVolumeIncrement",
                            )}
                            onReset={
                                activeDomain
                                    ? () =>
                                          handleReset(
                                              "useAlternateVolumeIncrement",
                                          )
                                    : undefined
                            }
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <SettingsSlider
                            min={1}
                            max={50}
                            step={1}
                            ariaLabel="Alternate volume increment"
                            value={alternateVolumeIncrement}
                            disabled={!useAlternateVolumeIncrement}
                            onChange={handleAlternateIncrementChange}
                            tooltip="How much the volume will change per step using the alternate increment hotkey"
                            isOverridden={isOverridden(
                                "alternateVolumeIncrement",
                            )}
                        />
                        <ResetButton
                            isOverridden={isOverridden(
                                "alternateVolumeIncrement",
                            )}
                            onReset={
                                activeDomain
                                    ? () =>
                                          handleReset(
                                              "alternateVolumeIncrement",
                                          )
                                    : undefined
                            }
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            marginTop: "12px",
                        }}
                    >
                        <div style={{ flexGrow: 1 }}>
                            <HotkeyButton
                                value={alternateVolumeIncrementHotkey}
                                onSet={handleAlternateIncrementHotkeySet}
                                disabled={
                                    !getValue("useMouseWheelVolume") ||
                                    !useAlternateVolumeIncrement
                                }
                                tooltip="Click to change alternate step hotkey. Limited to mouse buttons and modifier keys (Alt, Ctrl, Shift)."
                                allowedKeys={["Shift", "Alt", "Control"]}
                                allowMouse45={true}
                                isOverridden={isOverridden(
                                    "alternateVolumeIncrementHotkey",
                                )}
                            />
                        </div>
                        <ResetButton
                            isOverridden={isOverridden(
                                "alternateVolumeIncrementHotkey",
                            )}
                            onReset={
                                activeDomain
                                    ? () =>
                                          handleReset(
                                              "alternateVolumeIncrementHotkey",
                                          )
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiscPage;
