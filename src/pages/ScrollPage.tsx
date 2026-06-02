import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import { Settings, Pages } from "../types";
import "../style/scrollPage.css";
import SettingsSlider from "../components/SettingsSlider";
import SettingsSwitch from "../components/SettingsSwitch";
import SettingsValueDisplay from "../components/SettingsValueDisplay";
import ResetButton from "../components/ResetButton";

interface ScrollPageInterface {
    settings: Settings;
    overrideSettings?: Partial<Settings>;
    activeDomain?: string;
    editSetting: (key: keyof Settings, value: any, domain?: string) => void;
    resetSetting?: (key: keyof Settings, domain: string) => void;
    setPage: (targetPage: Pages) => void;
}

const ScrollPage: React.FC<ScrollPageInterface> = ({
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

    const [increment, setincrement] = useState(getValue("volumeIncrement"));
    const [customPreciseScrollThreshold, setCustomPreciseScrollThreshold] =
        useState(getValue("customPreciseScrollThreshold"));

    // Keep local state in sync if settings/overrides change
    useEffect(() => {
        setincrement(getValue("volumeIncrement"));
        setCustomPreciseScrollThreshold(
            getValue("customPreciseScrollThreshold"),
        );
    }, [settings, overrideSettings]);

    const handleIncrementToggle = (value: boolean) => {
        editSetting("useMouseWheelVolume", value, activeDomain);
    };

    const handleIncrementChange = (value: number) => {
        editSetting("volumeIncrement", value, activeDomain);
        setincrement(value);
    };

    const handleRoundToNearestIncrementToggle = (value: boolean) => {
        editSetting("useRoundToNearestIncrement", value, activeDomain);
    };

    const handlePreciseScrollToggle = (value: boolean) => {
        editSetting("usePreciseScroll", value, activeDomain);
    };

    const handleCustomPreciseScrollThresholdToggle = (value: boolean) => {
        editSetting("useCustomPreciseScrollThreshold", value, activeDomain);
    };

    const handleCustomPreciseScrollThresholdChange = (value: number) => {
        setCustomPreciseScrollThreshold(value);
        editSetting("customPreciseScrollThreshold", value, activeDomain);
    };

    const handleFullscreenOnlyToggle = (value: boolean) => {
        editSetting("fullscreenOnly", value, activeDomain);
    };

    // Effective values
    const useMouseWheelVolume = getValue("useMouseWheelVolume");
    const useRoundToNearestIncrement = getValue("useRoundToNearestIncrement");
    const usePreciseScroll = getValue("usePreciseScroll");
    const useCustomPreciseScrollThreshold = getValue(
        "useCustomPreciseScrollThreshold",
    );
    const fullscreenOnly = getValue("fullscreenOnly");

    const hasCategoryOverride =
        !!activeDomain &&
        [
            "useMouseWheelVolume",
            "volumeIncrement",
            "useRoundToNearestIncrement",
            "usePreciseScroll",
            "useCustomPreciseScrollThreshold",
            "customPreciseScrollThreshold",
            "fullscreenOnly",
        ].some((key) => isOverridden(key as keyof Settings));

    return (
        <div>
            <BackButton
                setPage={setPage}
                title={activeDomain ? "Scroll (Override)" : "Scroll"}
                targetPage={activeDomain ? "domains" : "menu"}
                isOverride={hasCategoryOverride}
            />

            <hr></hr>

            <div className="settingsContainer">
                <div id="scrollIncrementContainer">
                    <div id="incrementToggleContainer">
                        <SettingsSwitch
                            label="Volume Scroll"
                            checked={useMouseWheelVolume}
                            onChange={handleIncrementToggle}
                            tooltip="Enable or disable Volume Scroll"
                            isOverridden={isOverridden("useMouseWheelVolume")}
                        />
                        <SettingsValueDisplay
                            id="incrementDisplay"
                            value={increment}
                            tooltip="Current increment"
                            isOverridden={isOverridden("volumeIncrement")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("useMouseWheelVolume")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("useMouseWheelVolume")
                                    : undefined
                            }
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <SettingsSlider
                            min={1}
                            max={20}
                            step={1}
                            ariaLabel="Scroll increment"
                            value={increment}
                            disabled={!useMouseWheelVolume}
                            onChange={handleIncrementChange}
                            tooltip="Set how much the volume will change per step when scrolling"
                            isOverridden={isOverridden("volumeIncrement")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("volumeIncrement")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("volumeIncrement")
                                    : undefined
                            }
                        />
                    </div>
                </div>
                <div
                    id="useRoundToNearestIncrementContainer"
                    style={{ display: "flex", alignItems: "center" }}
                >
                    <SettingsSwitch
                        label="Round to increment"
                        checked={useRoundToNearestIncrement}
                        onChange={handleRoundToNearestIncrementToggle}
                        disabled={!useMouseWheelVolume}
                        tooltip="Round volume to the nearest increment after scrolling"
                        isOverridden={isOverridden(
                            "useRoundToNearestIncrement",
                        )}
                    />
                    <ResetButton
                        isOverridden={isOverridden(
                            "useRoundToNearestIncrement",
                        )}
                        onReset={
                            activeDomain
                                ? () =>
                                      handleReset("useRoundToNearestIncrement")
                                : undefined
                        }
                    />
                </div>
                <div
                    id="preciseScrollContainer"
                    style={{ display: "flex", alignItems: "center" }}
                >
                    <SettingsSwitch
                        label="Precise scroll"
                        checked={usePreciseScroll}
                        onChange={handlePreciseScrollToggle}
                        disabled={!useMouseWheelVolume}
                        tooltip="Scroll increment changes to 1 when volume is at or below normal increment"
                        isOverridden={isOverridden("usePreciseScroll")}
                    />
                    <ResetButton
                        isOverridden={isOverridden("usePreciseScroll")}
                        onReset={
                            activeDomain
                                ? () => handleReset("usePreciseScroll")
                                : undefined
                        }
                    />
                </div>
                <div id="customPreciseScrollContainer">
                    <div id="customPreciseScrollThresholdToggleContainer">
                        <SettingsSwitch
                            label="Precision start"
                            checked={useCustomPreciseScrollThreshold}
                            onChange={handleCustomPreciseScrollThresholdToggle}
                            disabled={!usePreciseScroll}
                            tooltip="Precise scroll will start at this volume threshold"
                            isOverridden={isOverridden(
                                "useCustomPreciseScrollThreshold",
                            )}
                        />
                        <SettingsValueDisplay
                            id="customPreciseScrollThresholdDisplay"
                            value={customPreciseScrollThreshold}
                            tooltip="Current threshold"
                            isOverridden={isOverridden(
                                "customPreciseScrollThreshold",
                            )}
                        />
                        <ResetButton
                            isOverridden={isOverridden(
                                "useCustomPreciseScrollThreshold",
                            )}
                            onReset={
                                activeDomain
                                    ? () =>
                                          handleReset(
                                              "useCustomPreciseScrollThreshold",
                                          )
                                    : undefined
                            }
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <SettingsSlider
                            min={0}
                            max={100}
                            step={1}
                            ariaLabel="Custom precise scroll threshold"
                            value={customPreciseScrollThreshold}
                            disabled={
                                !useMouseWheelVolume ||
                                !usePreciseScroll ||
                                !useCustomPreciseScrollThreshold
                            }
                            onChange={handleCustomPreciseScrollThresholdChange}
                            tooltip="Set the threshold for precise scroll"
                            isOverridden={isOverridden(
                                "customPreciseScrollThreshold",
                            )}
                        />
                        <ResetButton
                            isOverridden={isOverridden(
                                "customPreciseScrollThreshold",
                            )}
                            onReset={
                                activeDomain
                                    ? () =>
                                          handleReset(
                                              "customPreciseScrollThreshold",
                                          )
                                    : undefined
                            }
                        />
                    </div>
                </div>
                <div
                    id="fullscreenOnlyContainer"
                    style={{ display: "flex", alignItems: "center" }}
                >
                    <SettingsSwitch
                        label="Fullscreen only"
                        checked={fullscreenOnly}
                        onChange={handleFullscreenOnlyToggle}
                        disabled={!useMouseWheelVolume}
                        tooltip="Volume scroll will only be enabled when video is in fullscreen mode"
                        isOverridden={isOverridden("fullscreenOnly")}
                    />
                    <ResetButton
                        isOverridden={isOverridden("fullscreenOnly")}
                        onReset={
                            activeDomain
                                ? () => handleReset("fullscreenOnly")
                                : undefined
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default ScrollPage;
