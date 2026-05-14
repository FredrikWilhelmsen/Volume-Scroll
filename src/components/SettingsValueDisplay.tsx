import React from 'react';
import Typography from '@mui/material/Typography/Typography';
import Tooltip from '@mui/material/Tooltip/Tooltip';

interface SettingsValueDisplayProps {
    value: string | number;
    tooltip: string;
    id?: string;
    className?: string;
    sx?: any;
}

const SettingsValueDisplay: React.FC<SettingsValueDisplayProps> = ({
    value,
    tooltip,
    id,
    className,
    sx
}) => {
    return (
        <Tooltip title={tooltip} placement="top" disableInteractive>
            <div id={id} className={className}>
                <Typography variant="body2" sx={sx}>
                    {value}
                </Typography>
            </div>
        </Tooltip>
    );
};

export default SettingsValueDisplay;
