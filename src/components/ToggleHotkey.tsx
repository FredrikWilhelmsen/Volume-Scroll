import React from "react";
import { Settings } from "../types";
import SettingsSwitch from "./SettingsSwitch";
import HotkeyButton from "./HotkeyButton";
import ResetButton from "./ResetButton";

interface ToggleHotkeyProps {
    label: string;
    switchKey: keyof Settings;
    hotkeyKey: keyof Settings;
    checked: boolean;
    hotkey: string;
    disabled?: boolean;
    hotkeyDisabled?: boolean;
    switchTooltip: string;
    hotkeyTooltip: string;
    allowedKeys: string[];
    allowMouse45: boolean;
    activeDomain?: string;
    editSetting: (key: keyof Settings, value: any, domain?: string) => void;
    isOverridden: (key: keyof Settings) => boolean;
    handleReset: (key: keyof Settings) => void;
    containerId?: string;
}

const ToggleHotkey: React.FC<ToggleHotkeyProps> = ({
    label,
    switchKey,
    hotkeyKey,
    checked,
    hotkey,
    disabled = false,
    hotkeyDisabled,
    switchTooltip,
    hotkeyTooltip,
    allowedKeys,
    allowMouse45,
    activeDomain,
    editSetting,
    isOverridden,
    handleReset,
    containerId,
}) => {
    const handleSwitchChange = (val: boolean) => {
        editSetting(switchKey, val, activeDomain);
    };

    const handleHotkeyChange = (val: string) => {
        editSetting(hotkeyKey, val, activeDomain);
    };

    const isHotkeyCurrentlyDisabled = hotkeyDisabled !== undefined ? hotkeyDisabled : (disabled || !checked);

    return (
        <div
            id={containerId}
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
                    label={label}
                    checked={checked}
                    onChange={handleSwitchChange}
                    disabled={disabled}
                    tooltip={switchTooltip}
                    isOverridden={isOverridden(switchKey)}
                />
                <ResetButton
                    isOverridden={isOverridden(switchKey)}
                    onReset={
                        activeDomain
                            ? () => handleReset(switchKey)
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
                        value={hotkey}
                        onSet={handleHotkeyChange}
                        disabled={isHotkeyCurrentlyDisabled}
                        tooltip={hotkeyTooltip}
                        allowedKeys={allowedKeys}
                        allowMouse45={allowMouse45}
                        isOverridden={isOverridden(hotkeyKey)}
                    />
                </div>
                <ResetButton
                    isOverridden={isOverridden(hotkeyKey)}
                    onReset={
                        activeDomain
                            ? () => handleReset(hotkeyKey)
                            : undefined
                    }
                />
            </div>
        </div>
    );
};

export default ToggleHotkey;
