import React from "react";
import { Settings, Pages } from "../types";
import BackButton from "../components/BackButton";
import "../style/hotkeyPage.css";
import SettingsSwitch from "../components/SettingsSwitch";
import HotkeyButton from "../components/HotkeyButton";

interface HotkeyPageInterface {
    settings: Settings;
    editSetting: (key: keyof Settings, value: any) => void;
    setPage: React.Dispatch<React.SetStateAction<Pages>>;
}

const HotkeyPage: React.FC<HotkeyPageInterface> = ({
    settings,
    editSetting,
    setPage,
}) => {
    const handleModifierKeyToggle = (value: boolean) => {
        editSetting("useModifierKey", value);
    };

    const handleModifierKeySet = (value: string) => {
        editSetting("modifierKey", value);
    };

    const handleInvertModifierKeyToggle = (value: boolean) => {
        editSetting("invertModifierKey", value);
    };

    const handleMuteKeyToggle = (value: boolean) => {
        editSetting("useToggleMuteKey", value);
    };

    const handleMuteKeySet = (value: string) => {
        editSetting("toggleMuteKey", value);
    };

    const handlePauseKeyToggle = (value: boolean) => {
        editSetting("useTogglePauseKey", value);
    };

    const handlePauseKeySet = (value: string) => {
        editSetting("togglePauseKey", value);
    };

    return (
        <div>
            <BackButton setPage={setPage} title={"Hotkey"} />

            <hr></hr>

            <div className="settingsContainer">
                <div id="modifierKeyContainer">
                    <SettingsSwitch
                        label="Modifier key"
                        checked={settings.useModifierKey}
                        onChange={handleModifierKeyToggle}
                        disabled={!settings.useMouseWheelVolume}
                        tooltip="Set a key that must be held down for Volume Scroll to work"
                    />
                    <HotkeyButton
                        value={settings.modifierKey}
                        onSet={handleModifierKeySet}
                        disabled={
                            !settings.useMouseWheelVolume ||
                            !settings.useModifierKey
                        }
                        tooltip="Click to change modifier hotkey. Limited to mouse buttons and modifier keys (Alt, Ctrl, Shift)."
                        allowedKeys={["Shift", "Alt", "Control"]}
                        allowMouse45={true}
                    />
                </div>
                <div id="invertedModifierKeyContainer">
                    <SettingsSwitch
                        label="Inverted"
                        checked={settings.invertModifierKey}
                        onChange={handleInvertModifierKeyToggle}
                        disabled={
                            !settings.useMouseWheelVolume ||
                            !settings.useModifierKey
                        }
                        tooltip="If enabled, holding the modifier key will stop Volume Scroll from working"
                    />
                </div>
                <div id="toggleMuteKeyContainer">
                    <SettingsSwitch
                        label="Toggle mute key"
                        checked={settings.useToggleMuteKey}
                        onChange={handleMuteKeyToggle}
                        disabled={!settings.useMouseWheelVolume}
                        tooltip="Set a key that will mute or unmute the video when pressed"
                    />
                    <HotkeyButton
                        value={settings.toggleMuteKey}
                        onSet={handleMuteKeySet}
                        disabled={
                            !settings.useMouseWheelVolume ||
                            !settings.useToggleMuteKey
                        }
                        tooltip="Click to change mute hotkey. Limited to mouse buttons (excluding Mouse 4 & 5)."
                        allowedKeys={[]}
                        allowMouse45={false}
                    />
                </div>
                <div id="togglePauseKeyContainer">
                    <SettingsSwitch
                        label="Toggle pause key"
                        checked={settings.useTogglePauseKey}
                        onChange={handlePauseKeyToggle}
                        disabled={!settings.useMouseWheelVolume}
                        tooltip="Set a key that will pause or play the video when pressed"
                    />
                    <HotkeyButton
                        value={settings.togglePauseKey}
                        onSet={handlePauseKeySet}
                        disabled={
                            !settings.useMouseWheelVolume ||
                            !settings.useTogglePauseKey
                        }
                        tooltip="Click to change pause hotkey. Limited to mouse buttons (excluding Mouse 4 & 5)."
                        allowedKeys={[]}
                        allowMouse45={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default HotkeyPage;
