import React, { useState } from "react";
import { Pages } from "../types";
import BackButton from "../components/BackButton";
import "../style/domainPage.css";

interface CustomOverlayPageProps {
    setPage: (targetPage: Pages) => void;
}

const CustomOverlayPage: React.FC<CustomOverlayPageProps> = ({ setPage }) => {
    return (
        <div>
            <BackButton
                setPage={setPage}
                title="Custom Overlay"
                targetPage="overlay"
            />
            <hr />
        </div>
    );
};

export default CustomOverlayPage;
