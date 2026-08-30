import React, { useState } from "react";
import { Pages } from "../types";
import "../style/domainPage.css";

interface CustomOverlayPageProps {
    setPage: (targetPage: Pages) => void;
}

const CustomOverlayPage: React.FC<CustomOverlayPageProps> = ({ setPage }) => {
    return <div></div>;
};

export default CustomOverlayPage;
