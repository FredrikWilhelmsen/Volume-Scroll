import React from 'react';
import Typography from '@mui/material/Typography/Typography';
import Tooltip from '@mui/material/Tooltip/Tooltip';

interface SettingsValueDisplayProps {
    value: string | number;
    tooltip: string;
    id?: string;
    className?: string;
    sx?: any;
    isOverridden?: boolean;
}

const SettingsValueDisplay: React.FC<SettingsValueDisplayProps> = ({
    value,
    tooltip,
    id,
    className,
    sx,
    isOverridden = false
}) => {
    return (
        <Tooltip title={tooltip} placement="top" disableInteractive>
            <div 
                id={id} 
                className={className}
                style={isOverridden ? {
                    boxShadow: '0 0 8px rgba(252, 185, 0, 0.4)',
                    outline: '1px solid #FCB900',
                    outlineOffset: '-1px'
                } : {}}
            >
                <Typography 
                    variant="body2" 
                    sx={{ ...sx }}
                >
                    {value}
                </Typography>
            </div>
        </Tooltip>
    );
};

export default SettingsValueDisplay;
