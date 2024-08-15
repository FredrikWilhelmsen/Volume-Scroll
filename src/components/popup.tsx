import React, { useState, useEffect } from 'react';
import * as ReactDOM from "react-dom";
import { Settings } from "../Settings";
import LoadingPage from './LoadingPage';
import MenuPage from './MenuPage';
import ScrollPage from './ScrollPage';
import HotkeyPage from './HotkeyPage';
import OverlayPage from './OverlayPage';
import VolumePage from './VolumePage';
import "../style/globalStyle.css";

type Page = "menu" | "scroll" | "hotkeys" | "overlay" | "volume";

//This is our counter component 
const SettingsPopup = () => {
    const [ settings, setSettings ] = useState<Settings | null>(null);
    const [ page, setPage ] = useState<Page>("menu");

    useEffect(() => {
        //Load saved settings when the component mounts
        browser.storage.local.get("settings").then((result) => {
            const savedSettings = result.settings as Settings;
            setSettings(savedSettings);
        });
    }, []);

    //Handler for updating settings
    const handleSettingChange = (key: keyof Settings, value: any) => {
        setSettings(prevSettings => {
            if (prevSettings === null) return prevSettings;

            const updatedSettings = {
                ...prevSettings,
                [key]: value
            };

            //Save updated settings to browser storage
            browser.storage.local.set({ settings: updatedSettings });

            return updatedSettings;
        });
    };

    if(settings === null) return <LoadingPage/>

    switch(page){
        case "menu":
            return <MenuPage settings={settings} setPage={setPage}/>;
        case "hotkeys":
            return <HotkeyPage />;
        case "scroll":
            return <ScrollPage />;
        case "overlay":
            return <OverlayPage />;
        case "volume":
            return <VolumePage />;
    }
}

ReactDOM.render(<SettingsPopup />, document.getElementById("root"));