import React, { useState, useEffect } from "react";
import * as ReactDOM from "react-dom";
import { Settings, defaultSettings, Pages } from "./types";
import LoadingPage from "./pages/LoadingPage";
import MenuPage from "./pages/MenuPage";
import ScrollPage from "./pages/ScrollPage";
import HotkeyPage from "./pages/HotkeyPage";
import OverlayPage from "./pages/OverlayPage";
import VolumePage from "./pages/VolumePage";
import "./style/globalStyle.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


//This is our counter component 
const SettingsPopup = () => {
    const [ settings, setSettings ] = useState<Settings | null>(null);
    const [ page, setPage ] = useState<Pages>("menu");

    const handleLog = () => {
        console.log(settings);
    }

    useEffect(() => {
        //Load saved settings when the component mounts
        browser.storage.local.get({settings: defaultSettings}).then((result) => {
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

    if(settings === null) return <LoadingPage/>;

    return (
        <div className="centerWrapper" onClick={handleLog}>
            <div className="container">
                {page === "menu" && <MenuPage settings={settings} setPage={setPage}/>}
                {page === "scroll" && <ScrollPage settings={settings} editSetting={handleSettingChange} setPage={setPage}/>}
                {page === "hotkeys" && <HotkeyPage settings={settings} setPage={setPage}/>}
                {page === "overlay" && <OverlayPage settings={settings} setPage={setPage}/>}
                {page === "volume" && <VolumePage settings={settings} setPage={setPage}/>}
            </div>
        </div>
    )
}

ReactDOM.render(<SettingsPopup />, document.getElementById("root"));