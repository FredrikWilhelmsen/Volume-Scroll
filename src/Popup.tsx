/*
 * Volume Scroll - Scrollable volume for any video on the internet
 * Copyright (C) 2026  Fredrik Wilhelmsen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
import CustomRulesPage from "./pages/CustomRulesPage";
import SharePage from "./pages/SharePage";
import "./style/globalStyle.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { ExtensionData, defaultExtensionData } from "./types";

const SettingsPopup = () => {
    const [extensionData, setExtensionData] = useState<ExtensionData | null>(
        null,
    );
    const [activeDomain, setActiveDomain] = useState<string | null>(null);
    const [page, setPage] = useState<Pages>("menu");

    useEffect(() => {
        //Load saved settings when the component mounts
        browser.storage.sync.get("extensionData").then((result) => {
            const data: ExtensionData =
                (result.extensionData as ExtensionData) || defaultExtensionData;
            if (!data.customRules) data.customRules = {};
            if (!data.ignoredElements)
                data.ignoredElements = data.ignoredElements || {};
            setExtensionData(data);
        });
    }, []);

    useEffect(() => {
        let width = "275px";
        if (page === "updatePage") {
            width = "500px"; // Expand for update notes
        } else if (
            activeDomain &&
            page !== "domains" &&
            page !== "customRules"
        ) {
            width = "315px"; // Slightly wider for overrides
        }

        document.documentElement.style.width = width;
        document.body.style.width = width;
    }, [activeDomain, page]);

    const navigateTo = (targetPage: Pages): void => {
        if (targetPage === "menu") {
            setActiveDomain(null);
        }
        setPage(targetPage);
    };

    // Handler for updating settings
    const handleSettingChange = (
        key: keyof Settings,
        value: any,
        overrideDomain?: string,
    ) => {
        setExtensionData((prevData) => {
            if (prevData === null) return prevData;

            let updatedData = { ...prevData };

            if (overrideDomain) {
                const existingOverrides =
                    prevData.domainOverrides[overrideDomain] || {};
                updatedData.domainOverrides = {
                    ...prevData.domainOverrides,
                    [overrideDomain]: {
                        ...existingOverrides,
                        [key]: value,
                    },
                };
            } else {
                updatedData.globalSettings = {
                    ...prevData.globalSettings,
                    [key]: value,
                };
            }

            browser.storage.sync.set({ extensionData: updatedData });

            return updatedData;
        });
    };

    const handleSettingReset = (
        key: keyof Settings,
        overrideDomain: string,
    ) => {
        setExtensionData((prevData) => {
            if (prevData === null) return prevData;

            let updatedData = { ...prevData };
            const existingOverrides =
                prevData.domainOverrides[overrideDomain] || {};

            const newOverrides = { ...existingOverrides };
            delete newOverrides[key];

            if (Object.keys(newOverrides).length === 0) {
                const newDomainOverrides = { ...prevData.domainOverrides };
                delete newDomainOverrides[overrideDomain];
                updatedData.domainOverrides = newDomainOverrides;
            } else {
                updatedData.domainOverrides = {
                    ...prevData.domainOverrides,
                    [overrideDomain]: newOverrides,
                };
            }

            browser.storage.sync.set({ extensionData: updatedData });
            return updatedData;
        });
    };

    const handleCustomRulesChange = (
        domain: string,
        rules: import("./types").CustomRule[],
    ) => {
        setExtensionData((prevData) => {
            if (prevData === null) return prevData;
            const updatedData = {
                ...prevData,
                customRules: {
                    ...prevData.customRules,
                    [domain]: rules,
                },
            };
            browser.storage.sync.set({ extensionData: updatedData });
            return updatedData;
        });
    };

    const handleIgnoredElementsChange = (
        domain: string,
        ignoredElements: string[],
    ) => {
        setExtensionData((prevData) => {
            if (prevData === null) return prevData;
            const updatedData = {
                ...prevData,
                ignoredElements: {
                    ...prevData.ignoredElements,
                    [domain]: ignoredElements,
                },
            };
            browser.storage.sync.set({ extensionData: updatedData });
            return updatedData;
        });
    };

    if (extensionData === null) return <LoadingPage />;

    const currentGlobalSettings = extensionData.globalSettings;
    const currentOverrideSettings = activeDomain
        ? extensionData.domainOverrides[activeDomain]
        : undefined;

    return (
        <div className="centerWrapper">
            <div className="container">
                {page === "menu" && (
                    <MenuPage
                        settings={currentGlobalSettings}
                        extensionData={extensionData}
                        setExtensionData={setExtensionData}
                        editSetting={handleSettingChange}
                        setPage={navigateTo}
                    />
                )}
                {page === "scroll" && (
                    <ScrollPage
                        settings={currentGlobalSettings}
                        overrideSettings={currentOverrideSettings}
                        activeDomain={activeDomain || undefined}
                        editSetting={handleSettingChange}
                        resetSetting={handleSettingReset}
                        setPage={navigateTo}
                    />
                )}
                {page === "hotkeys" && (
                    <HotkeyPage
                        settings={currentGlobalSettings}
                        overrideSettings={currentOverrideSettings}
                        activeDomain={activeDomain || undefined}
                        editSetting={handleSettingChange}
                        resetSetting={handleSettingReset}
                        setPage={navigateTo}
                    />
                )}
                {page === "overlay" && (
                    <OverlayPage
                        settings={currentGlobalSettings}
                        overrideSettings={currentOverrideSettings}
                        activeDomain={activeDomain || undefined}
                        editSetting={handleSettingChange}
                        resetSetting={handleSettingReset}
                        setPage={navigateTo}
                    />
                )}
                {page === "misc" && (
                    <MiscPage
                        settings={currentGlobalSettings}
                        overrideSettings={currentOverrideSettings}
                        activeDomain={activeDomain || undefined}
                        editSetting={handleSettingChange}
                        resetSetting={handleSettingReset}
                        setPage={navigateTo}
                    />
                )}
                {page === "domains" && (
                    <DomainPage
                        settings={currentGlobalSettings}
                        extensionData={extensionData}
                        setExtensionData={setExtensionData}
                        editSetting={handleSettingChange}
                        setPage={navigateTo}
                        setActiveDomain={setActiveDomain}
                        activeDomain={activeDomain}
                    />
                )}
                {page === "updatePage" && (
                    <UpdatePage
                        settings={currentGlobalSettings}
                        setPage={navigateTo}
                    />
                )}
                {page === "customRules" && (
                    <CustomRulesPage
                        customRules={extensionData.customRules}
                        ignoredElements={extensionData.ignoredElements}
                        updateCustomRules={handleCustomRulesChange}
                        updateIgnoredElements={handleIgnoredElementsChange}
                        activeDomain={activeDomain}
                        setPage={navigateTo}
                    />
                )}
                {page === "share" && (
                    <SharePage
                        extensionData={extensionData}
                        setExtensionData={setExtensionData}
                        setPage={navigateTo}
                    />
                )}
            </div>
        </div>
    );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<SettingsPopup />);
