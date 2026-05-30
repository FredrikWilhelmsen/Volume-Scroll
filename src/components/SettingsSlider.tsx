import React from 'react';
import Slider from '@mui/material/Slider/Slider';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import IconButton from '@mui/material/IconButton/IconButton';

interface SettingsSliderProps {
    min: number;
    max: number;
    step: number;
    value: number;
    disabled: boolean;
    onChange: (value: number) => void;
    tooltip: string;
    ariaLabel?: string;
    onWheelStep?: number;
    isOverridden?: boolean;
}

const SettingsSlider: React.FC<SettingsSliderProps> = ({
    min,
    max,
    step,
    value,
    disabled,
    onChange,
    tooltip,
    ariaLabel,
    onWheelStep,
    isOverridden = false
}) => {
    const handleWheel = (e: React.WheelEvent) => {
        if (disabled) return;
        e.preventDefault();
        
        const wheelStep = onWheelStep ?? step;
        let newValue: number;
        
        if (e.deltaY < 0) {
            newValue = Math.min(value + wheelStep, max);
        } else {
            newValue = Math.max(value - wheelStep, min);
        }
        
        onChange(newValue);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div onWheel={handleWheel} style={{ flexGrow: 1 }}>
                <Tooltip title={tooltip} disableInteractive>
                    <span>
                        <Slider
                            min={min}
                            max={max}
                            step={step}
                            aria-label={ariaLabel}
                            value={value}
                            valueLabelDisplay="off"
                            disabled={disabled}
                            onChange={(_, val) => onChange(val as number)}
                            color={isOverridden ? "warning" : "primary"}
                            sx={{
                                ...(isOverridden && {
                                    filter: 'drop-shadow(0 0 4px rgba(252, 185, 0, 0.5))',
                                })
                            }}
                        />
                    </span>
                </Tooltip>
            </div>
        </div>
    );
};

export default SettingsSlider;
