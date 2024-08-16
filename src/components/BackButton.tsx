import React from 'react';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { Pages } from "../types";
import "../style/backButton.css"
import Typography from '@mui/material/Typography/Typography';

interface BackButtonInterface {
    setPage: React.Dispatch<React.SetStateAction<Pages>>,
    title: string
}

const BackButton: React.FC<BackButtonInterface> = ({ setPage, title }) => {
    const clickHandler = () => {
        setPage("menu");
    }

    return (
        <div id="backWrapper" onClick={clickHandler}>
            <Typography variant="h6">
                {title}
            </Typography>

            <ClearOutlinedIcon id="backButton"/>
        </div>
    );
}

export default BackButton;