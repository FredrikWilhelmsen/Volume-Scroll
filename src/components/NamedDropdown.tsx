import React, { useState } from "react";
import Typography from "@mui/material/Typography/Typography";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Settings } from "../types";
import ResetButton from "./ResetButton";

interface DropdownItem {
    value: string;
    label: string;
}

interface NamedDropdownProps {
    label: string;
    settingKey: keyof Settings;
    value: string;
    options: DropdownItem[];
    disabled?: boolean;
    tooltip: string;
    activeDomain?: string;
    editSetting: (key: keyof Settings, value: any, domain?: string) => void;
    isOverridden: (key: keyof Settings) => boolean;
    handleReset: (key: keyof Settings) => void;
    containerId?: string;
    selectId?: string;
    width?: string;
}

const NamedDropdown: React.FC<NamedDropdownProps> = ({
    label,
    settingKey,
    value,
    options,
    disabled = false,
    tooltip,
    activeDomain,
    editSetting,
    isOverridden,
    handleReset,
    containerId,
    selectId,
    width = "100%",
}) => {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [selectOpen, setSelectOpen] = useState(false);

    const handleChange = (e: SelectChangeEvent<string>) => {
        editSetting(settingKey, e.target.value, activeDomain);
    };

    const overridden = isOverridden(settingKey);
    const accentColor = overridden ? "#FCB900" : "#1976d2";

    const dropdownSx = {
        height: "32px",
        fontSize: "0.9rem",
        color: "white",
        "& .MuiSelect-icon": {
            color: "white",
        },
        "&:before": {
            borderColor: accentColor,
        },
        "&:hover:not(.Mui-disabled):before": {
            borderColor: `${accentColor} !important`,
        },
        "&:after": {
            borderColor: accentColor,
        },
        boxShadow: "none",
    };

    const menuPropsSettings = {
        disableScrollLock: true,
        anchorOrigin: {
            vertical: "bottom" as const,
            horizontal: "left" as const,
        },
        transformOrigin: {
            vertical: "top" as const,
            horizontal: "left" as const,
        },
        PaperProps: {
            sx: {
                bgcolor: "white",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                marginTop: "4px",
                "& .MuiMenuItem-root": {
                    fontSize: "0.85rem",
                    padding: "6px 16px",
                    color: "black",
                    "&:hover": {
                        bgcolor: "rgba(25, 118, 210, 0.12) !important",
                    },
                    "&.Mui-selected": {
                        bgcolor: "rgba(25, 118, 210, 0.2) !important",
                        color: "#1976d2",
                        fontWeight: 500,
                        "&:hover": {
                            bgcolor: "rgba(25, 118, 210, 0.28) !important",
                        },
                    },
                },
            },
        },
    };

    return (
        <div
            id={containerId}
            style={{
                marginTop: "10px",
                marginBottom: "10px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                }}
            >
                <Tooltip
                    title={tooltip}
                    open={tooltipOpen && !selectOpen}
                    onOpen={() => setTooltipOpen(true)}
                    onClose={() => setTooltipOpen(false)}
                >
                    <div style={{ flexGrow: 1 }}>
                        <Typography variant="body1">{label}</Typography>
                        <FormControl
                            variant="standard"
                            size="small"
                            style={{ width }}
                        >
                            <Select
                                id={selectId}
                                value={value}
                                onChange={handleChange}
                                disabled={disabled}
                                onOpen={() => setSelectOpen(true)}
                                onClose={() => setSelectOpen(false)}
                                sx={dropdownSx}
                                MenuProps={menuPropsSettings}
                            >
                                {options.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </Tooltip>
                <ResetButton
                    isOverridden={overridden}
                    onReset={
                        activeDomain ? () => handleReset(settingKey) : undefined
                    }
                />
            </div>
        </div>
    );
};

export default NamedDropdown;
