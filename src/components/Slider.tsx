import React from "react";
import Typography from "@mui/material/Typography/Typography";
import { Settings } from "../types";
import SettingsValueDisplay from "./SettingsValueDisplay";
import SettingsSlider from "./SettingsSlider";
import ResetButton from "./ResetButton";

interface SliderProps {
    label: string;
    settingKey: keyof Settings;
    value: number;
    min: number;
    max: number;
    step: number;
    ariaLabel: string;
    disabled?: boolean;
    tooltip: string;
    valueTooltip: string;
    activeDomain?: string;
    editSetting: (key: keyof Settings, value: any, domain?: string) => void;
    isOverridden: (key: keyof Settings) => boolean;
    handleReset: (key: keyof Settings) => void;
    onValueChange?: (value: number) => void;
    valueFormatter?: (val: number) => string | number;
    id?: string;
    displayContainerId?: string;
    valueDisplayId?: string;
    valueSx?: any;
}

const Slider: React.FC<SliderProps> = ({
    label,
    settingKey,
    value,
    min,
    max,
    step,
    ariaLabel,
    disabled = false,
    tooltip,
    valueTooltip,
    activeDomain,
    editSetting,
    isOverridden,
    handleReset,
    onValueChange,
    valueFormatter,
    id,
    displayContainerId,
    valueDisplayId,
    valueSx,
}) => {
    const handleSliderChange = (val: number) => {
        editSetting(settingKey, val, activeDomain);
        if (onValueChange) {
            onValueChange(val);
        }
    };

    const formattedValue = valueFormatter ? valueFormatter(value) : value;

    return (
        <div id={id}>
            <div
                id={displayContainerId}
                className="sliderDisplayContainer"
            >
                <Typography variant="body1">{label}</Typography>
                <div
                    style={{
                        marginRight: activeDomain ? "42px" : "0px",
                    }}
                >
                    <SettingsValueDisplay
                        id={valueDisplayId}
                        className="sliderDisplay"
                        value={formattedValue}
                        tooltip={valueTooltip}
                        isOverridden={isOverridden(settingKey)}
                        sx={valueSx}
                    />
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
                <SettingsSlider
                    min={min}
                    max={max}
                    step={step}
                    ariaLabel={ariaLabel}
                    value={value}
                    disabled={disabled}
                    onChange={handleSliderChange}
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
        </div>
    );
};

export default Slider;
