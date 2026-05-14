import React, { useEffect, useState, useRef } from 'react';
import Button from '@mui/material/Button/Button';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import { getMouseKey } from '../utils';

interface HotkeyButtonProps {
    value: string;
    onSet: (newValue: string) => void;
    disabled?: boolean;
    tooltip: string;
    allowedKeys?: string[];
    allowMouse45?: boolean;
}

const HotkeyButton: React.FC<HotkeyButtonProps> = ({
    value,
    onSet,
    disabled,
    tooltip,
    allowedKeys = [],
    allowMouse45 = true
}) => {
    const [isSetting, setIsSetting] = useState(false);
    const lastSetTime = useRef(0);

    useEffect(() => {
        if (!isSetting) return;

        const stopSetting = () => {
            setIsSetting(false);
            lastSetTime.current = Date.now();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();

            if (e.key === "Escape") {
                stopSetting();
                return;
            }

            if (allowedKeys.includes(e.key)) {
                onSet(e.key);
                stopSetting();
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const mouseKey = getMouseKey(e.button);
            if (!mouseKey) return;

            if (!allowMouse45 && (mouseKey === "Mouse 4" || mouseKey === "Mouse 5")) return;

            onSet(mouseKey);
            stopSetting();
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!allowMouse45) return;

            let detectedKey: string | undefined;
            if (e.buttons & 8) detectedKey = "Mouse 4";
            else if (e.buttons & 16) detectedKey = "Mouse 5";

            if (detectedKey) {
                onSet(detectedKey);
                stopSetting();
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Alt") e.preventDefault();
        };

        window.addEventListener("contextmenu", handleContextMenu, { capture: true });
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("auxclick", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("pointermove", handleMouseMove);

        return () => {
            window.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("auxclick", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("pointermove", handleMouseMove);
        };
    }, [isSetting, onSet, allowedKeys, allowMouse45]);

    const handleClick = () => {
        if (isSetting || Date.now() - lastSetTime.current < 100) return;
        setIsSetting(true);
    };

    return (
        <Tooltip title={tooltip} placement="top" disableInteractive>
            <Button
                onClick={handleClick}
                className="button"
                variant="outlined"
                sx={{ color: "white" }}
                disabled={disabled}
            >
                {isSetting ? "-----" : (value === " " ? "Space" : value)}
            </Button>
        </Tooltip>
    );
};

export default HotkeyButton;
