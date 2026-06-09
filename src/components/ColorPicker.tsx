import React, { useState } from "react";
import Typography from "@mui/material/Typography/Typography";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import { TwitterPicker } from "@hello-pangea/color-picker";
import { Settings } from "../types";
import ResetButton from "./ResetButton";

interface ColorPickerProps {
    label: string;
    settingKey: keyof Settings;
    color: string;
    colors: string[];
    disabled?: boolean;
    tooltip: string;
    activeDomain?: string;
    editSetting: (key: keyof Settings, value: any, domain?: string) => void;
    isOverridden: (key: keyof Settings) => boolean;
    handleReset: (key: keyof Settings) => void;
    containerId?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
    label,
    settingKey,
    color,
    colors,
    disabled = false,
    tooltip,
    activeDomain,
    editSetting,
    isOverridden,
    handleReset,
    containerId,
}) => {
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const handleColorClick = () => {
        if (disabled) return;
        setIsPickerVisible(!isPickerVisible);
    };

    const handleColorChange = (newColor: any) => {
        if (disabled) return;
        editSetting(settingKey, newColor.hex, activeDomain);
    };

    const overridden = isOverridden(settingKey);

    return (
        <div id={containerId}>
            <div
                id="colorDisplay"
                style={{
                    opacity: disabled ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    marginTop: "12px",
                }}
            >
                <Tooltip title={tooltip} disableInteractive>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flexGrow: 1,
                        }}
                    >
                        <Paper
                            elevation={2}
                            sx={{
                                bgcolor: color,
                                width: 40,
                                height: 20,
                                mr: 1,
                                marginLeft: "4px",
                                cursor: disabled ? "default" : "pointer",
                                outline: overridden
                                    ? "2px solid #FCB900"
                                    : "2px solid #1976d2",
                                outlineOffset: "2px",
                            }}
                            onClick={handleColorClick}
                        />
                        <Typography
                            variant="body1"
                            sx={{
                                marginLeft: "8px",
                                flexGrow: 1,
                                color: overridden ? "#FCB900" : "inherit",
                                textShadow: overridden
                                    ? "0 0 8px rgba(252, 185, 0, 0.4)"
                                    : "none",
                            }}
                        >
                            {label}
                        </Typography>
                    </div>
                </Tooltip>
                <ResetButton
                    isOverridden={overridden}
                    onReset={
                        activeDomain ? () => handleReset(settingKey) : undefined
                    }
                />
            </div>
            {isPickerVisible && !disabled && (
                <TwitterPicker
                    colors={colors}
                    color={color}
                    onChange={handleColorChange}
                    width="220px"
                />
            )}
        </div>
    );
};

export default ColorPicker;
