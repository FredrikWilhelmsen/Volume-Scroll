import React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';
import Tooltip from '@mui/material/Tooltip/Tooltip';

interface SettingsSwitchProps {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    tooltip: string;
    disabled?: boolean;
    placement?: "top" | "bottom" | "left" | "right" | "top-start" | "top-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end" | "right-start" | "right-end";
}

const SettingsSwitch: React.FC<SettingsSwitchProps> = ({
    label,
    checked,
    onChange,
    tooltip,
    disabled = false,
    placement = "top"
}) => {
    return (
        <Tooltip title={tooltip} placement={placement} disableInteractive>
            <FormControlLabel
                onChange={(_, value) => onChange(value)}
                control={<Switch checked={checked} disabled={disabled} />}
                label={label}
            />
        </Tooltip>
    );
};

export default SettingsSwitch;
