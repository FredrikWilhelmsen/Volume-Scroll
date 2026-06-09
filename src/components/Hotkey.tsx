import React from "react";
import { Settings } from "../types";
import HotkeyButton from "./HotkeyButton";
import ResetButton from "./ResetButton";

interface HotkeyProps {
    settingKey: keyof Settings;
    value: string;
    disabled?: boolean;
    tooltip: string;
    allowedKeys: string[];
    allowMouse45: boolean;
    activeDomain?: string;
    editSetting: (key: keyof Settings, value: any, domain?: string) => void;
    isOverridden: (key: keyof Settings) => boolean;
    handleReset: (key: keyof Settings) => void;
    containerStyle?: React.CSSProperties;
}

const Hotkey: React.FC<HotkeyProps> = ({
    settingKey,
    value,
    disabled = false,
    tooltip,
    allowedKeys,
    allowMouse45,
    activeDomain,
    editSetting,
    isOverridden,
    handleReset,
    containerStyle,
}) => {
    const handleHotkeyChange = (val: string) => {
        editSetting(settingKey, val, activeDomain);
    };

    const overridden = isOverridden(settingKey);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                ...containerStyle,
            }}
        >
            <div style={{ flexGrow: 1 }}>
                <HotkeyButton
                    value={value}
                    onSet={handleHotkeyChange}
                    disabled={disabled}
                    tooltip={tooltip}
                    allowedKeys={allowedKeys}
                    allowMouse45={allowMouse45}
                    isOverridden={overridden}
                />
            </div>
            <ResetButton
                isOverridden={overridden}
                onReset={
                    activeDomain
                        ? () => handleReset(settingKey)
                        : undefined
                }
            />
        </div>
    );
};

export default Hotkey;
