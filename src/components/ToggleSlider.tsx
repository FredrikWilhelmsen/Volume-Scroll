import React from "react";
import { Settings } from "../types";
import SettingsSwitch from "./SettingsSwitch";
import SettingsValueDisplay from "./SettingsValueDisplay";
import SettingsSlider from "./SettingsSlider";
import ResetButton from "./ResetButton";

interface ToggleSliderProps {
    label: string;
    switchKey: keyof Settings;
    sliderKey: keyof Settings;
    checked: boolean;
    value: number;
    min: number;
    max: number;
    step: number;
    ariaLabel: string;
    disabled?: boolean;
    sliderDisabled?: boolean;
    switchTooltip: string;
    sliderTooltip: string;
    valueTooltip: string;
    activeDomain?: string;
    editSetting: (key: keyof Settings, value: any, domain?: string) => void;
    isOverridden: (key: keyof Settings) => boolean;
    handleReset: (key: keyof Settings) => void;
    onValueChange?: (value: number) => void;
    valueFormatter?: (val: number) => string | number;
    containerId?: string;
    toggleContainerId?: string;
    valueDisplayId?: string;
}

const ToggleSlider: React.FC<ToggleSliderProps> = ({
    label,
    switchKey,
    sliderKey,
    checked,
    value,
    min,
    max,
    step,
    ariaLabel,
    disabled = false,
    sliderDisabled,
    switchTooltip,
    sliderTooltip,
    valueTooltip,
    activeDomain,
    editSetting,
    isOverridden,
    handleReset,
    onValueChange,
    valueFormatter,
    containerId,
    toggleContainerId,
    valueDisplayId,
}) => {
    const handleSwitchChange = (val: boolean) => {
        editSetting(switchKey, val, activeDomain);
    };

    const handleSliderChange = (val: number) => {
        editSetting(sliderKey, val, activeDomain);
        if (onValueChange) {
            onValueChange(val);
        }
    };

    const formattedValue = valueFormatter ? valueFormatter(value) : value;
    const isSliderCurrentlyDisabled = sliderDisabled !== undefined ? sliderDisabled : (disabled || !checked);

    return (
        <div id={containerId}>
            <div id={toggleContainerId} style={{ display: "flex", alignItems: "center" }}>
                <SettingsSwitch
                    label={label}
                    checked={checked}
                    onChange={handleSwitchChange}
                    tooltip={switchTooltip}
                    isOverridden={isOverridden(switchKey)}
                    disabled={disabled}
                />
                <SettingsValueDisplay
                    id={valueDisplayId}
                    value={formattedValue}
                    tooltip={valueTooltip}
                    isOverridden={isOverridden(sliderKey)}
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
            <div style={{ display: "flex", alignItems: "center" }}>
                <SettingsSlider
                    min={min}
                    max={max}
                    step={step}
                    ariaLabel={ariaLabel}
                    value={value}
                    disabled={isSliderCurrentlyDisabled}
                    onChange={handleSliderChange}
                    tooltip={sliderTooltip}
                    isOverridden={isOverridden(sliderKey)}
                />
                <ResetButton
                    isOverridden={isOverridden(sliderKey)}
                    onReset={
                        activeDomain
                            ? () => handleReset(sliderKey)
                            : undefined
                    }
                />
            </div>
        </div>
    );
};

export default ToggleSlider;
