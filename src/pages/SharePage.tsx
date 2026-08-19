import browser from "webextension-polyfill";
import React, { useState } from "react";
import { ExtensionData, ExportData, Pages } from "../types";
import BackButton from "../components/BackButton";
import SettingsSwitch from "../components/SettingsSwitch";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface SharePageInterface {
    extensionData: ExtensionData;
    setExtensionData: React.Dispatch<
        React.SetStateAction<ExtensionData | null>
    >;
    setPage: (targetPage: Pages) => void;
}

const SharePage: React.FC<SharePageInterface> = ({
    extensionData,
    setExtensionData,
    setPage,
}) => {
    const [includeSettings, setIncludeSettings] = useState(true);
    const [includeOverrides, setIncludeOverrides] = useState(true);
    const [includeCustomRules, setIncludeCustomRules] = useState(true);
    const [includeIgnoredElements, setIncludeIgnoredElements] = useState(true);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const handleExport = async () => {
        const exportData: ExportData = {
            version: browser.runtime.getManifest().version,
        };

        if (includeSettings) {
            exportData.globalSettings = extensionData.globalSettings;
        }
        if (includeOverrides) {
            exportData.domainOverrides = extensionData.domainOverrides;
        }
        if (includeCustomRules) {
            exportData.customRules = extensionData.customRules;
        }
        if (includeIgnoredElements) {
            exportData.ignoredElements = extensionData.ignoredElements;
        }

        try {
            const jsonString = JSON.stringify(exportData, null, 2);
            await navigator.clipboard.writeText(jsonString);
            setStatusMessage("Copied to clipboard!");
        } catch (err) {
            setStatusMessage("Failed to copy");
        }
    };

    const handleImport = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (!clipboardText) {
                setStatusMessage("Clipboard is empty");
                return;
            }

            let importedData: ExportData;
            try {
                importedData = JSON.parse(clipboardText);
            } catch (err) {
                setStatusMessage("Failed to parse clipboard data");
                return;
            }

            const currentVersion = browser.runtime.getManifest().version;
            if (
                importedData.version &&
                importedData.version !== currentVersion
            ) {
                const confirmed = window.confirm(
                    `Warning: The imported settings version (${importedData.version}) differs from your current extension version (${currentVersion}). Do you want to proceed?`,
                );
                if (!confirmed) {
                    return;
                }
            }

            let hasUpdated = false;
            const newExtensionData: ExtensionData = { ...extensionData };

            if (includeSettings && importedData.globalSettings) {
                newExtensionData.globalSettings = importedData.globalSettings;
                hasUpdated = true;
            }
            if (includeOverrides && importedData.domainOverrides) {
                newExtensionData.domainOverrides = importedData.domainOverrides;
                hasUpdated = true;
            }
            if (includeCustomRules && importedData.customRules) {
                newExtensionData.customRules = importedData.customRules;
                hasUpdated = true;
            }
            if (includeIgnoredElements && importedData.ignoredElements) {
                newExtensionData.ignoredElements = importedData.ignoredElements;
                hasUpdated = true;
            }

            if (!hasUpdated) {
                setStatusMessage("No matching data to import");
                return;
            }

            setExtensionData(newExtensionData);
            await browser.storage.sync.set({ extensionData: newExtensionData });
            setStatusMessage("Imported successfully!");
        } catch (err) {
            setStatusMessage("Failed to read clipboard");
        }
    };

    const isAnySelected =
        includeSettings ||
        includeOverrides ||
        includeCustomRules ||
        includeIgnoredElements;

    return (
        <div>
            <BackButton setPage={setPage} title="Share" />
            <hr />

            <div className="settingsContainer">
                <div id="domainListInputContainer">
                    <SettingsSwitch
                        label="Settings"
                        checked={includeSettings}
                        onChange={(val) => {
                            setIncludeSettings(val);
                            setStatusMessage(null);
                        }}
                        tooltip="Include global settings"
                    />
                    <SettingsSwitch
                        label="Overrides"
                        checked={includeOverrides}
                        onChange={(val) => {
                            setIncludeOverrides(val);
                            setStatusMessage(null);
                        }}
                        tooltip="Include domain overrides"
                    />
                    <SettingsSwitch
                        label="Custom rules"
                        checked={includeCustomRules}
                        onChange={(val) => {
                            setIncludeCustomRules(val);
                            setStatusMessage(null);
                        }}
                        tooltip="Include custom domain rules"
                    />
                    <SettingsSwitch
                        label="Element ignore"
                        checked={includeIgnoredElements}
                        onChange={(val) => {
                            setIncludeIgnoredElements(val);
                            setStatusMessage(null);
                        }}
                        tooltip="Include ignored elements"
                    />

                    <Button
                        variant="outlined"
                        onClick={handleExport}
                        disabled={!isAnySelected}
                    >
                        Export
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={handleImport}
                        disabled={!isAnySelected}
                        style={{ marginTop: "8px" }}
                    >
                        Import
                    </Button>

                    {statusMessage && (
                        <Typography
                            style={{
                                marginTop: "8px",
                                textAlign: "center",
                            }}
                        >
                            {statusMessage}
                        </Typography>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SharePage;
