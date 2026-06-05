import React from "react";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import Switch from "@mui/material/Switch/Switch";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import IconButton from "@mui/material/IconButton/IconButton";

interface SettingsSwitchProps {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    tooltip: string;
    disabled?: boolean;
    placement?:
        | "top"
        | "bottom"
        | "left"
        | "right"
        | "top-start"
        | "top-end"
        | "bottom-start"
        | "bottom-end"
        | "left-start"
        | "left-end"
        | "right-start"
        | "right-end";
    isOverridden?: boolean;
}

const SettingsSwitch: React.FC<SettingsSwitchProps> = ({
    label,
    checked,
    onChange,
    tooltip,
    disabled = false,
    placement = "top",
    isOverridden = false,
}) => {
    return (
        <div style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Tooltip title={tooltip} placement={placement} disableInteractive>
                <span
                    style={{
                        color: isOverridden ? "#FCB900" : "inherit",
                        textShadow: isOverridden
                            ? "0 0 8px rgba(252, 185, 0, 0.4)"
                            : "none",
                    }}
                >
                    <FormControlLabel
                        onChange={(_, value) => onChange(value)}
                        control={
                            <Switch
                                checked={checked}
                                disabled={disabled}
                                color={isOverridden ? "warning" : "primary"}
                            />
                        }
                        label={label}
                    />
                </span>
            </Tooltip>
        </div>
    );
};

export default SettingsSwitch;
