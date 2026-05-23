import React, { useState } from "react";
import BackButton from "../components/BackButton";
import { Settings, Pages } from "../types";
import "../style/scrollPage.css";
import SettingsSlider from "../components/SettingsSlider";
import SettingsSwitch from "../components/SettingsSwitch";
import SettingsValueDisplay from "../components/SettingsValueDisplay";

interface ScrollPageInterface {
    settings: Settings;
    editSetting: (key: keyof Settings, value: any) => void;
    setPage: React.Dispatch<React.SetStateAction<Pages>>;
}

const ScrollPage: React.FC<ScrollPageInterface> = ({
    settings,
    editSetting,
    setPage,
}) => {
    const [increment, setincrement] = useState(settings.volumeIncrement);
    const [customPreciseScrollThreshold, setCustomPreciseScrollThreshold] =
        useState(settings.customPreciseScrollThreshold);

    const handleIncrementToggle = (value: boolean) => {
        editSetting("useMouseWheelVolume", value);
    };

    const handleIncrementChange = (value: number) => {
        editSetting("volumeIncrement", value);
        setincrement(value);
    };

    const handleRoundToNearestIncrementToggle = (value: boolean) => {
        editSetting("useRoundToNearestIncrement", value);
    };

    const handlePreciseScrollToggle = (value: boolean) => {
        editSetting("usePreciseScroll", value);
    };

    const handleCustomPreciseScrollThresholdToggle = (value: boolean) => {
        editSetting("useCustomPreciseScrollThreshold", value);
    };

    const handleCustomPreciseScrollThresholdChange = (value: number) => {
        setCustomPreciseScrollThreshold(value);
        editSetting("customPreciseScrollThreshold", value);
    };

    const handleFullscreenOnlyToggle = (value: boolean) => {
        editSetting("fullscreenOnly", value);
    };

    return (
        <div>
            <BackButton setPage={setPage} title={"Scroll"} />

            <hr></hr>

            <div className="settingsContainer">
                <div id="scrollIncrementContainer">
                    <div id="incrementToggleContainer">
                        <SettingsSwitch
                            label="Volume Scroll"
                            checked={settings.useMouseWheelVolume}
                            onChange={handleIncrementToggle}
                            tooltip="Enable or disable Volume Scroll"
                        />
                        <SettingsValueDisplay
                            id="incrementDisplay"
                            value={increment}
                            tooltip="Current increment"
                        />
                    </div>
                    <SettingsSlider
                        min={1}
                        max={20}
                        step={1}
                        ariaLabel="Scroll increment"
                        value={increment}
                        disabled={!settings.useMouseWheelVolume}
                        onChange={handleIncrementChange}
                        tooltip="Set how much the volume will change per step when scrolling"
                    />
                </div>
                <div id="useRoundToNearestIncrementContainer">
                    <SettingsSwitch
                        label="Round to increment"
                        checked={settings.useRoundToNearestIncrement}
                        onChange={handleRoundToNearestIncrementToggle}
                        disabled={!settings.useMouseWheelVolume}
                        tooltip="Round volume to the nearest increment after scrolling"
                    />
                </div>
                <div id="preciseScrollContainer">
                    <SettingsSwitch
                        label="Precise scroll"
                        checked={settings.usePreciseScroll}
                        onChange={handlePreciseScrollToggle}
                        disabled={!settings.useMouseWheelVolume}
                        tooltip="Scroll increment changes to 1 when volume is at or below normal increment"
                    />
                </div>
                <div id="customPreciseScrollContainer">
                    <div id="customPreciseScrollThresholdToggleContainer">
                        <SettingsSwitch
                            label="Precision start"
                            checked={settings.useCustomPreciseScrollThreshold}
                            onChange={handleCustomPreciseScrollThresholdToggle}
                            disabled={!settings.usePreciseScroll}
                            tooltip="Precise scroll will start at this volume threshold"
                        />
                        <SettingsValueDisplay
                            id="customPreciseScrollThresholdDisplay"
                            value={settings.customPreciseScrollThreshold}
                            tooltip="Current threshold"
                        />
                    </div>
                    <SettingsSlider
                        min={0}
                        max={100}
                        step={1}
                        ariaLabel="Custom precise scroll threshold"
                        value={customPreciseScrollThreshold}
                        disabled={
                            !settings.useMouseWheelVolume ||
                            !settings.usePreciseScroll ||
                            !settings.useCustomPreciseScrollThreshold
                        }
                        onChange={handleCustomPreciseScrollThresholdChange}
                        tooltip="Set the threshold for precise scroll"
                    />
                </div>
                <div id="fullscreenOnlyContainer">
                    <SettingsSwitch
                        label="Fullscreen only"
                        checked={settings.fullscreenOnly}
                        onChange={handleFullscreenOnlyToggle}
                        disabled={!settings.useMouseWheelVolume}
                        tooltip="Volume scroll will only be enabled when video is in fullscreen mode"
                    />
                </div>
            </div>
        </div>
    );
};

export default ScrollPage;
