import React from 'react';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { Pages } from "../types";

interface BackButtonInterface {
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const BackButton: React.FC<BackButtonInterface> = ({ setPage }) => {
    const clickHandler = () => {
        setPage("menu");
    }

    return (
        <div id="backWrapper" onClick={clickHandler}>
            <ClearOutlinedIcon />
        </div>
    );
}

export default BackButton;