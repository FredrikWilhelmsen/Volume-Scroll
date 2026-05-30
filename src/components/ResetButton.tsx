import React from "react";
import IconButton from "@mui/material/IconButton/IconButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Tooltip from "@mui/material/Tooltip/Tooltip";

interface ResetButtonProps {
    isOverridden: boolean;
    onReset?: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({ isOverridden, onReset }) => {
    if (!onReset) return null;

    return (
        <Tooltip
            title={isOverridden ? "Reset to global default" : "Global default active"}
            disableInteractive
        >
            <span>
                <IconButton
                    size="small"
                    onClick={isOverridden ? onReset : undefined}
                    disabled={!isOverridden}
                    sx={{
                        color: isOverridden ? "#FCB900" : "#555",
                        ml: 1,
                        cursor: isOverridden ? "pointer" : "default",
                        "&.Mui-disabled": {
                            color: "#555 !important",
                        },
                    }}
                >
                    <RestartAltIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>
    );
};

export default ResetButton;
