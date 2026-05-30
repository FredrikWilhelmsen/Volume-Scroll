import browser from "webextension-polyfill";
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Settings, defaultSettings, Pages } from "./types";
import LoadingPage from "./pages/LoadingPage";
import MenuPage from "./pages/MenuPage";
import ScrollPage from "./pages/ScrollPage";
import HotkeyPage from "./pages/HotkeyPage";
import OverlayPage from "./pages/OverlayPage";
import MiscPage from "./pages/MiscPage";
import DomainPage from "./pages/DomainPage";
import UpdatePage from "./pages/UpdatePage";
import "./style/globalStyle.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { ExtensionData } from "./types";

const SettingsPopup = () => {
    const [extensionData, setExtensionData] = useState<ExtensionData | null>(null);
    const [activeDomain, setActiveDomain] = useState<string | null>(null);
    const [page, setPage] = useState<Pages>("menu");

    useEffect(() => {
        //Load saved settings when the component mounts
        browser.storage.sync
            .get("extensionData")
            .then((result) => {
                const data: ExtensionData = (result.extensionData as ExtensionData) || { globalSettings: defaultSettings, domainOverrides: {}, lastVersionRead: "0.0.0" };
                setExtensionData(data);
            });
    }, []);

    useEffect(() => {
        // Make the popup wider on override pages to accommodate undo buttons
        if (activeDomain && page !== "domains") {
            document.body.style.width = "315px";
        } else {
            document.body.style.width = "275px";
        }
    }, [activeDomain, page]);

    //Handler for updating settings
    const handleSettingChange = (key: keyof Settings, value: any, overrideDomain?: string) => {
        setExtensionData((prevData) => {
            if (prevData === null) return prevData;

            let updatedData = { ...prevData };

            if (overrideDomain) {
                const existingOverrides = prevData.domainOverrides[overrideDomain] || {};
                updatedData.domainOverrides = {
                    ...prevData.domainOverrides,
                    [overrideDomain]: {
                        ...existingOverrides,
                        [key]: value
                    }
                };
            } else {
                updatedData.globalSettings = {
                    ...prevData.globalSettings,
                    [key]: value
                };
            }

            browser.storage.sync.set({ extensionData: updatedData });

            return updatedData;
        });
    };

    const handleSettingReset = (key: keyof Settings, overrideDomain: string) => {
        setExtensionData((prevData) => {
            if (prevData === null) return prevData;

            let updatedData = { ...prevData };
            const existingOverrides = prevData.domainOverrides[overrideDomain] || {};
            
            const newOverrides = { ...existingOverrides };
            delete newOverrides[key];

            if (Object.keys(newOverrides).length === 0) {
                const newDomainOverrides = { ...prevData.domainOverrides };
                delete newDomainOverrides[overrideDomain];
                updatedData.domainOverrides = newDomainOverrides;
            } else {
                updatedData.domainOverrides = {
                    ...prevData.domainOverrides,
                    [overrideDomain]: newOverrides
                };
            }

            browser.storage.sync.set({ extensionData: updatedData });
            return updatedData;
        });
    };

    if (extensionData === null) return <LoadingPage />;

    const currentGlobalSettings = extensionData.globalSettings;
    const currentOverrideSettings = activeDomain ? extensionData.domainOverrides[activeDomain] : undefined;

    return (
        <div className="centerWrapper">
            <div className="container">
                {page === "menu" && (
                    <MenuPage
                        settings={currentGlobalSettings}
                        extensionData={extensionData}
                        setExtensionData={setExtensionData}
                        editSetting={handleSettingChange}
                        setPage={setPage}
                    />
                )}
                {page === "scroll" && (
                    <ScrollPage
                        settings={currentGlobalSettings}
                        overrideSettings={currentOverrideSettings}
                        activeDomain={activeDomain || undefined}
                        editSetting={handleSettingChange}
                        resetSetting={handleSettingReset}
                        setPage={setPage}
                    />
                )}
                {page === "hotkeys" && (
                    <HotkeyPage
                        settings={currentGlobalSettings}
                        overrideSettings={currentOverrideSettings}
                        activeDomain={activeDomain || undefined}
                        editSetting={handleSettingChange}
                        resetSetting={handleSettingReset}
                        setPage={setPage}
                    />
                )}
                {page === "overlay" && (
                    <OverlayPage
                        settings={currentGlobalSettings}
                        overrideSettings={currentOverrideSettings}
                        activeDomain={activeDomain || undefined}
                        editSetting={handleSettingChange}
                        resetSetting={handleSettingReset}
                        setPage={setPage}
                    />
                )}
                {page === "misc" && (
                    <MiscPage
                        settings={currentGlobalSettings}
                        overrideSettings={currentOverrideSettings}
                        activeDomain={activeDomain || undefined}
                        editSetting={handleSettingChange}
                        resetSetting={handleSettingReset}
                        setPage={setPage}
                    />
                )}
                {page === "domains" && (
                    <DomainPage
                        settings={currentGlobalSettings}
                        extensionData={extensionData}
                        setExtensionData={setExtensionData}
                        editSetting={handleSettingChange}
                        setPage={setPage}
                        setActiveDomain={setActiveDomain}
                        activeDomain={activeDomain}
                    />
                )}
                {page === "updatePage" && (
                    <UpdatePage settings={currentGlobalSettings} setPage={setPage} />
                )}
            </div>
        </div>
    );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<SettingsPopup />);
