import React, { useState, useEffect } from "react";
import { Settings, Pages, colors } from "../types";
import BackButton from "../components/BackButton";
import "../style/miscPage.css";
import ToggleSlider from "../components/ToggleSlider";
import Toggle from "../components/Toggle";
import ColorPicker from "../components/ColorPicker";
import Hotkey from "../components/Hotkey";
import NamedDropdown from "../components/NamedDropdown";

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

    useEffect(() => {
        setDefaultVolume(getValue("defaultVolume"));
        setVolumeBoostAmount(getValue("volumeBoostAmount"));
        setAlternateVolumeIncrement(getValue("alternateVolumeIncrement"));
    }, [settings, overrideSettings]);

    const useDefaultVolume = getValue("useDefaultVolume");
    const startMuted = getValue("startMuted");
    const doBoostVolume = getValue("doBoostVolume");
    const boostedColor = getValue("boostedColor");
    const customOverlayBoostBehavior = getValue("customOverlayBoostBehavior");
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
            "customOverlayBoostBehavior",
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
                    <ToggleSlider
                        label="Default volume"
                        switchKey="useDefaultVolume"
                        sliderKey="defaultVolume"
                        checked={useDefaultVolume}
                        value={defaultVolume}
                        min={0}
                        max={100}
                        step={5}
                        ariaLabel="Default volume"
                        switchTooltip="Enable or disable default volume"
                        sliderTooltip="Set what volume videos should start at"
                        valueTooltip="Current default volume"
                        activeDomain={activeDomain}
                        editSetting={editSetting}
                        isOverridden={isOverridden}
                        handleReset={handleReset}
                        onValueChange={setDefaultVolume}
                        toggleContainerId="defaultVolumeToggleContainer"
                        valueDisplayId="defaultVolumeDisplay"
                    />
                    <Toggle
                        label="Start muted"
                        settingKey="startMuted"
                        checked={startMuted}
                        disabled={!useDefaultVolume}
                        tooltip="Makes default volume start new videos muted"
                        activeDomain={activeDomain}
                        editSetting={editSetting}
                        isOverridden={isOverridden}
                        handleReset={handleReset}
                        containerStyle={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    />
                </div>
                <ToggleSlider
                    label="Boost volume"
                    switchKey="doBoostVolume"
                    sliderKey="volumeBoostAmount"
                    checked={doBoostVolume}
                    value={volumeBoostAmount}
                    min={100}
                    max={500}
                    step={5}
                    ariaLabel="Volume boost"
                    switchTooltip="Increase volume limit past 100% - Experimental, disable if you experience issues"
                    sliderTooltip="Current volume limit"
                    valueTooltip="Current volume limit"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    onValueChange={setVolumeBoostAmount}
                    containerId="boostVolumeContainer"
                    toggleContainerId="boostVolumeToggleContainer"
                    valueDisplayId="boostVolumeDisplay"
                />
                <ColorPicker
                    label="Boosted color"
                    settingKey="boostedColor"
                    color={boostedColor}
                    colors={colors}
                    disabled={
                        !getValue("useMouseWheelVolume") || !doBoostVolume
                    }
                    tooltip="Set the color of the overlay when volume is boosted"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    containerId="boostColorPickerContainer"
                />
                <NamedDropdown
                    label="Custom overlay boost"
                    settingKey="customOverlayBoostBehavior"
                    value={customOverlayBoostBehavior}
                    options={[
                        { value: "stretch", label: "Stretch" },
                        { value: "loop", label: "Loop" },
                    ]}
                    tooltip="Set behavior for custom overlays when boosted"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    containerId="customOverlayBoostBehaviorDropdownContainer"
                    selectId="customOverlayBoostBehaviorSelector"
                />
                <div id="alternateIncrementContainer">
                    <ToggleSlider
                        label="Alt. Step"
                        switchKey="useAlternateVolumeIncrement"
                        sliderKey="alternateVolumeIncrement"
                        checked={useAlternateVolumeIncrement}
                        value={alternateVolumeIncrement}
                        min={1}
                        max={50}
                        step={1}
                        ariaLabel="Alternate volume increment"
                        switchTooltip="Enable or disable alternate increment hotkey"
                        sliderTooltip="How much the volume will change per step using the alternate increment hotkey"
                        valueTooltip="Current alternate increment"
                        activeDomain={activeDomain}
                        editSetting={editSetting}
                        isOverridden={isOverridden}
                        handleReset={handleReset}
                        onValueChange={setAlternateVolumeIncrement}
                        toggleContainerId="alternateIncrementToggleContainer"
                        valueDisplayId="alternateIncrementDisplay"
                    />
                    <Hotkey
                        settingKey="alternateVolumeIncrementHotkey"
                        value={alternateVolumeIncrementHotkey}
                        disabled={
                            !getValue("useMouseWheelVolume") ||
                            !useAlternateVolumeIncrement
                        }
                        tooltip="Click to change alternate step hotkey. Limited to mouse buttons and modifier keys (Alt, Ctrl, Shift)."
                        allowedKeys={["Shift", "Alt", "Control"]}
                        allowMouse45={true}
                        activeDomain={activeDomain}
                        editSetting={editSetting}
                        isOverridden={isOverridden}
                        handleReset={handleReset}
                        containerStyle={{ marginTop: "12px" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MiscPage;
