import React from "react";
import { Settings, Pages } from "../types";
import BackButton from "../components/BackButton";
import "../style/hotkeyPage.css";
import ToggleHotkey from "../components/ToggleHotkey";
import Toggle from "../components/Toggle";

interface HotkeyPageInterface {
    settings: Settings;
    overrideSettings?: Partial<Settings>;
    activeDomain?: string;
    editSetting: (key: keyof Settings, value: any, domain?: string) => void;
    resetSetting?: (key: keyof Settings, domain: string) => void;
    setPage: (targetPage: Pages) => void;
}

const HotkeyPage: React.FC<HotkeyPageInterface> = ({
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

    const useMouseWheelVolume = getValue("useMouseWheelVolume");
    const useModifierKey = getValue("useModifierKey");
    const modifierKey = getValue("modifierKey");
    const invertModifierKey = getValue("invertModifierKey");
    const useToggleMuteKey = getValue("useToggleMuteKey");
    const toggleMuteKey = getValue("toggleMuteKey");
    const useTogglePauseKey = getValue("useTogglePauseKey");
    const togglePauseKey = getValue("togglePauseKey");

    const hasCategoryOverride =
        !!activeDomain &&
        [
            "useModifierKey",
            "modifierKey",
            "invertModifierKey",
            "useToggleMuteKey",
            "toggleMuteKey",
            "useTogglePauseKey",
            "togglePauseKey",
        ].some((key) => isOverridden(key as keyof Settings));

    return (
        <div>
            <BackButton
                setPage={setPage}
                title={activeDomain ? "Hotkey (Override)" : "Hotkey"}
                targetPage={activeDomain ? "domains" : "menu"}
                isOverride={hasCategoryOverride}
            />

            <hr></hr>

            <div className="settingsContainer">
                <ToggleHotkey
                    label="Modifier key"
                    switchKey="useModifierKey"
                    hotkeyKey="modifierKey"
                    checked={useModifierKey}
                    hotkey={modifierKey}
                    disabled={!useMouseWheelVolume}
                    switchTooltip="Set a key that must be held down for Volume Scroll to work"
                    hotkeyTooltip="Click to change modifier hotkey. Limited to mouse buttons and modifier keys (Alt, Ctrl, Shift)."
                    allowedKeys={["Shift", "Alt", "Control"]}
                    allowMouse45={true}
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    containerId="modifierKeyContainer"
                />
                <Toggle
                    label="Invert modifier key"
                    settingKey="invertModifierKey"
                    checked={invertModifierKey}
                    disabled={!useMouseWheelVolume || !useModifierKey}
                    tooltip="If enabled, holding the modifier key will stop Volume Scroll from working"
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    id="invertedModifierKeyContainer"
                />
                <ToggleHotkey
                    label="Mute toggle"
                    switchKey="useToggleMuteKey"
                    hotkeyKey="toggleMuteKey"
                    checked={useToggleMuteKey}
                    hotkey={toggleMuteKey}
                    disabled={!useMouseWheelVolume}
                    switchTooltip="Set a key that will mute or unmute the video when pressed"
                    hotkeyTooltip="Click to change mute hotkey. Limited to mouse buttons (excluding Mouse 4 & 5)."
                    allowedKeys={[]}
                    allowMouse45={false}
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    containerId="toggleMuteKeyContainer"
                />
                <ToggleHotkey
                    label="Pause toggle"
                    switchKey="useTogglePauseKey"
                    hotkeyKey="togglePauseKey"
                    checked={useTogglePauseKey}
                    hotkey={togglePauseKey}
                    disabled={!useMouseWheelVolume}
                    switchTooltip="Set a key that will pause or play the video when pressed"
                    hotkeyTooltip="Click to change pause hotkey. Limited to mouse buttons (excluding Mouse 4 & 5)."
                    allowedKeys={[]}
                    allowMouse45={false}
                    activeDomain={activeDomain}
                    editSetting={editSetting}
                    isOverridden={isOverridden}
                    handleReset={handleReset}
                    containerId="togglePauseKeyContainer"
                />
            </div>
        </div>
    );
};

export default HotkeyPage;
