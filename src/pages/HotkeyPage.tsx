import React from "react";
import { Settings, Pages } from "../types";
import BackButton from "../components/BackButton";
import "../style/hotkeyPage.css";
import SettingsSwitch from "../components/SettingsSwitch";
import HotkeyButton from "../components/HotkeyButton";
import ResetButton from "../components/ResetButton";

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

    const handleModifierKeyToggle = (value: boolean) => {
        editSetting("useModifierKey", value, activeDomain);
    };

    const handleModifierKeyChange = (value: string) => {
        editSetting("modifierKey", value, activeDomain);
    };

    const handleInvertModifierKeyToggle = (value: boolean) => {
        editSetting("invertModifierKey", value, activeDomain);
    };

    const handleToggleMuteKeyToggle = (value: boolean) => {
        editSetting("useToggleMuteKey", value, activeDomain);
    };

    const handleToggleMuteKeyChange = (value: string) => {
        editSetting("toggleMuteKey", value, activeDomain);
    };

    const handleTogglePauseKeyToggle = (value: boolean) => {
        editSetting("useTogglePauseKey", value, activeDomain);
    };

    const handleTogglePauseKeyChange = (value: string) => {
        editSetting("togglePauseKey", value, activeDomain);
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
                <div
                    id="modifierKeyContainer"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <SettingsSwitch
                            label="Modifier key"
                            checked={useModifierKey}
                            onChange={handleModifierKeyToggle}
                            disabled={!useMouseWheelVolume}
                            tooltip="Set a key that must be held down for Volume Scroll to work"
                            isOverridden={isOverridden("useModifierKey")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("useModifierKey")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("useModifierKey")
                                    : undefined
                            }
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <div style={{ flexGrow: 1 }}>
                            <HotkeyButton
                                value={modifierKey}
                                onSet={handleModifierKeyChange}
                                disabled={
                                    !useMouseWheelVolume || !useModifierKey
                                }
                                tooltip="Click to change modifier hotkey. Limited to mouse buttons and modifier keys (Alt, Ctrl, Shift)."
                                allowedKeys={["Shift", "Alt", "Control"]}
                                allowMouse45={true}
                                isOverridden={isOverridden("modifierKey")}
                            />
                        </div>
                        <ResetButton
                            isOverridden={isOverridden("modifierKey")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("modifierKey")
                                    : undefined
                            }
                        />
                    </div>
                </div>
                <div
                    id="invertedModifierKeyContainer"
                    style={{ display: "flex", alignItems: "center" }}
                >
                    <SettingsSwitch
                        label="Invert modifier key"
                        checked={invertModifierKey}
                        onChange={handleInvertModifierKeyToggle}
                        disabled={!useMouseWheelVolume || !useModifierKey}
                        tooltip="If enabled, holding the modifier key will stop Volume Scroll from working"
                        isOverridden={isOverridden("invertModifierKey")}
                    />
                    <ResetButton
                        isOverridden={isOverridden("invertModifierKey")}
                        onReset={
                            activeDomain
                                ? () => handleReset("invertModifierKey")
                                : undefined
                        }
                    />
                </div>
                <div
                    id="toggleMuteKeyContainer"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <SettingsSwitch
                            label="Mute toggle"
                            checked={useToggleMuteKey}
                            onChange={handleToggleMuteKeyToggle}
                            disabled={!useMouseWheelVolume}
                            tooltip="Set a key that will mute or unmute the video when pressed"
                            isOverridden={isOverridden("useToggleMuteKey")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("useToggleMuteKey")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("useToggleMuteKey")
                                    : undefined
                            }
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <div style={{ flexGrow: 1 }}>
                            <HotkeyButton
                                value={toggleMuteKey}
                                onSet={handleToggleMuteKeyChange}
                                disabled={
                                    !useMouseWheelVolume || !useToggleMuteKey
                                }
                                tooltip="Click to change mute hotkey. Limited to mouse buttons (excluding Mouse 4 & 5)."
                                allowedKeys={[]}
                                allowMouse45={false}
                                isOverridden={isOverridden("toggleMuteKey")}
                            />
                        </div>
                        <ResetButton
                            isOverridden={isOverridden("toggleMuteKey")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("toggleMuteKey")
                                    : undefined
                            }
                        />
                    </div>
                </div>
                <div
                    id="togglePauseKeyContainer"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <SettingsSwitch
                            label="Pause toggle"
                            checked={useTogglePauseKey}
                            onChange={handleTogglePauseKeyToggle}
                            disabled={!useMouseWheelVolume}
                            tooltip="Set a key that will pause or play the video when pressed"
                            isOverridden={isOverridden("useTogglePauseKey")}
                        />
                        <ResetButton
                            isOverridden={isOverridden("useTogglePauseKey")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("useTogglePauseKey")
                                    : undefined
                            }
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <div style={{ flexGrow: 1 }}>
                            <HotkeyButton
                                value={togglePauseKey}
                                onSet={handleTogglePauseKeyChange}
                                disabled={
                                    !useMouseWheelVolume || !useTogglePauseKey
                                }
                                tooltip="Click to change pause hotkey. Limited to mouse buttons (excluding Mouse 4 & 5)."
                                allowedKeys={[]}
                                allowMouse45={false}
                                isOverridden={isOverridden("togglePauseKey")}
                            />
                        </div>
                        <ResetButton
                            isOverridden={isOverridden("togglePauseKey")}
                            onReset={
                                activeDomain
                                    ? () => handleReset("togglePauseKey")
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotkeyPage;
