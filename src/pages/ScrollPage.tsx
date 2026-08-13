import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import { Settings, Pages } from "../types";
import "../style/scrollPage.css";
import ToggleSlider from "../components/ToggleSlider";
import Toggle from "../components/Toggle";

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

    // Effective values
    const useMouseWheelVolume = getValue("useMouseWheelVolume");
    const invertScrollDirection = getValue("invertScrollDirection");
    const useRoundToNearestIncrement = getValue("useRoundToNearestIncrement");
    const usePreciseScroll = getValue("usePreciseScroll");
    const useCustomPreciseScrollThreshold = getValue(
        "useCustomPreciseScrollThreshold",
    );
    const fullscreenOnly = getValue("fullscreenOnly");
    const playingOnly = getValue("playingOnly");

    const hasCategoryOverride =
        !!activeDomain &&
        [
            "useMouseWheelVolume",
            "invertScrollDirection",
            "volumeIncrement",
            "useRoundToNearestIncrement",
            "usePreciseScroll",
            "useCustomPreciseScrollThreshold",
            "customPreciseScrollThreshold",
            "fullscreenOnly",
            "playingOnly",
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
                <ToggleSlider
                    label="Volume Scroll"
                    switchKey="useMouseWheelVolume"
                    sliderKey="volumeIncrement"
                    checked={useMouseWheelVolume}
                    value={increment}
                    min={1}
                    max={20}
                    step={1}
                    ariaLabel="Scroll increment"
                    switchTooltip="Enable or disable Volume Scroll"
                    sliderTooltip="Set how much the volume will change per step when scrolling"
                    valueTooltip="Current increment"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    onValueChange={setincrement}
                    containerId="scrollIncrementContainer"
                    toggleContainerId="incrementToggleContainer"
                    valueDisplayId="incrementDisplay"
                />
                <Toggle
                    label="Invert scroll direction"
                    settingKey="invertScrollDirection"
                    checked={invertScrollDirection}
                    disabled={!useMouseWheelVolume}
                    tooltip="Invert the scroll direction for volume control"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    id="invertScrollDirectionContainer"
                />
                <Toggle
                    label="Round to increment"
                    settingKey="useRoundToNearestIncrement"
                    checked={useRoundToNearestIncrement}
                    disabled={!useMouseWheelVolume}
                    tooltip="Round volume to the nearest increment after scrolling"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    id="useRoundToNearestIncrementContainer"
                />
                <Toggle
                    label="Precise scroll"
                    settingKey="usePreciseScroll"
                    checked={usePreciseScroll}
                    disabled={!useMouseWheelVolume}
                    tooltip="Scroll increment changes to 1 when volume is at or below normal increment"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    id="preciseScrollContainer"
                />
                <ToggleSlider
                    label="Precision start"
                    switchKey="useCustomPreciseScrollThreshold"
                    sliderKey="customPreciseScrollThreshold"
                    checked={useCustomPreciseScrollThreshold}
                    value={customPreciseScrollThreshold}
                    min={0}
                    max={100}
                    step={1}
                    ariaLabel="Custom precise scroll threshold"
                    disabled={!useMouseWheelVolume || !usePreciseScroll}
                    sliderDisabled={
                        !useMouseWheelVolume ||
                        !usePreciseScroll ||
                        !useCustomPreciseScrollThreshold
                    }
                    switchTooltip="Precise scroll will start at this volume threshold"
                    sliderTooltip="Set the threshold for precise scroll"
                    valueTooltip="Current threshold"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    onValueChange={setCustomPreciseScrollThreshold}
                    containerId="customPreciseScrollContainer"
                    toggleContainerId="customPreciseScrollThresholdToggleContainer"
                    valueDisplayId="customPreciseScrollThresholdDisplay"
                />
                <Toggle
                    label="Fullscreen only"
                    settingKey="fullscreenOnly"
                    checked={fullscreenOnly}
                    disabled={!useMouseWheelVolume}
                    tooltip="Volume scroll will only be enabled when video is in fullscreen mode"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    id="fullscreenOnlyContainer"
                />
                <Toggle
                    label="Playing only"
                    settingKey="playingOnly"
                    checked={playingOnly}
                    disabled={!useMouseWheelVolume}
                    tooltip="Volume scroll will only be enabled when the hovered video is playing"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    id="playingOnlyContainer"
                />
            </div>
        </div>
    );
};

export default ScrollPage;
