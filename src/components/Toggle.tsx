import React from "react";
import { Settings } from "../types";
import SettingsSwitch from "./SettingsSwitch";
import ResetButton from "./ResetButton";

interface ToggleProps {
    label: string;
    settingKey: keyof Settings;
    checked: boolean;
    disabled?: boolean;
    tooltip: string;
    activeDomain?: string;
    editSetting: (key: keyof Settings, value: any, domain?: string) => void;
    isOverridden: (key: keyof Settings) => boolean;
    handleReset: (key: keyof Settings) => void;
    id?: string;
    containerStyle?: React.CSSProperties;
}

const Toggle: React.FC<ToggleProps> = ({
    label,
    settingKey,
    checked,
    disabled = false,
    tooltip,
    activeDomain,
    editSetting,
    isOverridden,
    handleReset,
    id,
    containerStyle,
}) => {
    const handleSwitchChange = (val: boolean) => {
        editSetting(settingKey, val, activeDomain);
    };

    return (
        <div
            id={id}
            style={{ display: "flex", alignItems: "center", ...containerStyle }}
        >
            <SettingsSwitch
                label={label}
                checked={checked}
                onChange={handleSwitchChange}
                disabled={disabled}
                tooltip={tooltip}
                isOverridden={isOverridden(settingKey)}
            />
            <ResetButton
                isOverridden={isOverridden(settingKey)}
                onReset={
                    activeDomain
                        ? () => handleReset(settingKey)
                        : undefined
                }
            />
        </div>
    );
};

export default Toggle;
