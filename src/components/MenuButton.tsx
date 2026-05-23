import React from "react";
import Button from "@mui/material/Button/Button";
import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface MenuButtonProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({
    title,
    subtitle,
    icon,
    onClick,
}) => {
    return (
        <Button
            onClick={onClick}
            sx={{
                color: "white",
                px: 2,
                justifyContent: "space-between",
            }}
            endIcon={<ChevronRightIcon sx={{ color: "gray" }} />}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {icon}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                    }}
                >
                    <Typography
                        sx={{ textTransform: "none", lineHeight: 1.2 }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: "gray", textTransform: "none" }}
                    >
                        {subtitle}
                    </Typography>
                </Box>
            </Box>
        </Button>
    );
};

export default MenuButton;
