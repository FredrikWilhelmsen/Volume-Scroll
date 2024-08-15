import React, { useState, useEffect } from "react";
import * as ReactDOM from "react-dom";
import { Settings, Pages } from "./types";
import LoadingPage from "./pages/LoadingPage";
import MenuPage from "./pages/MenuPage";
import ScrollPage from "./pages/ScrollPage";
import HotkeyPage from "./pages/HotkeyPage";
import OverlayPage from "./pages/OverlayPage";
import VolumePage from "./pages/VolumePage";
import "./style/globalStyle.css";

//This is our counter component 
const SettingsPopup = () => {
    const [ settings, setSettings ] = useState<Settings | null>(null);
    const [ page, setPage ] = useState<Pages>("menu");

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
            return <HotkeyPage settings={settings} setPage={setPage}/>;
        case "scroll":
            return <ScrollPage settings={settings} setPage={setPage}/>;
        case "overlay":
            return <OverlayPage settings={settings} setPage={setPage}/>;
        case "volume":
            return <VolumePage settings={settings} setPage={setPage}/>;
    }
}

ReactDOM.render(<SettingsPopup />, document.getElementById("root"));