import browser from "webextension-polyfill";
import React, { useState } from "react";
import {
    ExtensionData,
    ExportData,
    Pages,
    defaultExtensionData,
} from "../types";
import BackButton from "../components/BackButton";
import SettingsSwitch from "../components/SettingsSwitch";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";

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
    const [includeCustomOverlays, setIncludeCustomOverlays] = useState(true);
    const [includeCustomRules, setIncludeCustomRules] = useState(true);
    const [includeIgnoredElements, setIncludeIgnoredElements] = useState(true);
    const [exportImportText, setExportImportText] = useState("");
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [pendingImportData, setPendingImportData] =
        useState<ExportData | null>(null);

    const handleResetToDefault = async () => {
        setPendingImportData(null);
        const newExtensionData: ExtensionData = {
            ...defaultExtensionData,
        };

        setExtensionData(newExtensionData);
        await browser.storage.sync.set({ extensionData: newExtensionData });
        setStatusMessage("Reset to default successfully!");
    };

    const handleExport = async () => {
        setPendingImportData(null);
        const exportData: ExportData = {
            version: browser.runtime.getManifest().version,
        };

        if (includeSettings) {
            exportData.globalSettings = extensionData.globalSettings;
        }
        if (includeOverrides) {
            exportData.domainOverrides = extensionData.domainOverrides;
        }
        if (includeCustomOverlays) {
            exportData.customOverlays = extensionData.customOverlays;
        }
        if (includeCustomRules) {
            exportData.customRules = extensionData.customRules;
        }
        if (includeIgnoredElements) {
            exportData.ignoredElements = extensionData.ignoredElements;
        }

        try {
            const jsonString = JSON.stringify(exportData, null, 2);
            setExportImportText(jsonString);
            await navigator.clipboard.writeText(jsonString);
            setStatusMessage("Copied to clipboard!");
        } catch (err) {
            setStatusMessage("Failed to copy");
        }
    };

    const applyImport = async (importedData: ExportData) => {
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
        if (includeCustomOverlays && importedData.customOverlays) {
            newExtensionData.customOverlays = importedData.customOverlays;
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
            setPendingImportData(null);
            return;
        }

        setExtensionData(newExtensionData);
        await browser.storage.sync.set({ extensionData: newExtensionData });
        setPendingImportData(null);
        setStatusMessage("Imported successfully!");
    };

    const handleImport = async () => {
        setPendingImportData(null);
        const rawText = exportImportText.trim();
        if (!rawText) {
            setStatusMessage("Input text is empty");
            return;
        }

        let importedData: ExportData;
        try {
            importedData = JSON.parse(rawText);
        } catch (err) {
            setStatusMessage("Failed to parse settings JSON");
            return;
        }

        const currentVersion = browser.runtime.getManifest().version;
        if (importedData.version && importedData.version !== currentVersion) {
            setPendingImportData(importedData);
            setStatusMessage(
                `Version mismatch: Exported from v${importedData.version}, current is v${currentVersion}.`,
            );
            return;
        }

        await applyImport(importedData);
    };

    const isAnySelected =
        includeSettings ||
        includeOverrides ||
        includeCustomOverlays ||
        includeCustomRules ||
        includeIgnoredElements;

    return (
        <div>
            <BackButton setPage={setPage} title="Share" />
            <hr />

            <div className="settingsContainer">
                <div id="domainListInputContainer">
                    <Tooltip title="Reset all settings and data back to default">
                        <span style={{ display: "flex", width: "100%" }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                onClick={handleResetToDefault}
                            >
                                Reset to Default
                            </Button>
                        </span>
                    </Tooltip>
                    <SettingsSwitch
                        label="Settings"
                        checked={includeSettings}
                        onChange={(val) => {
                            setIncludeSettings(val);
                            setStatusMessage(null);
                            setPendingImportData(null);
                        }}
                        tooltip="Include global settings"
                    />
                    <SettingsSwitch
                        label="Overrides"
                        checked={includeOverrides}
                        onChange={(val) => {
                            setIncludeOverrides(val);
                            setStatusMessage(null);
                            setPendingImportData(null);
                        }}
                        tooltip="Include domain overrides"
                    />
                    <SettingsSwitch
                        label="Custom overlays"
                        checked={includeCustomOverlays}
                        onChange={(val) => {
                            setIncludeCustomOverlays(val);
                            setStatusMessage(null);
                            setPendingImportData(null);
                        }}
                        tooltip="Include custom overlays"
                    />
                    <SettingsSwitch
                        label="Custom rules"
                        checked={includeCustomRules}
                        onChange={(val) => {
                            setIncludeCustomRules(val);
                            setStatusMessage(null);
                            setPendingImportData(null);
                        }}
                        tooltip="Include custom domain rules"
                    />
                    <SettingsSwitch
                        label="Ignored elements"
                        checked={includeIgnoredElements}
                        onChange={(val) => {
                            setIncludeIgnoredElements(val);
                            setStatusMessage(null);
                            setPendingImportData(null);
                        }}
                        tooltip="Include ignored elements"
                    />

                    <Tooltip title="Export selected settings to clipboard and text field">
                        <span style={{ display: "flex", width: "100%" }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleExport}
                                disabled={!isAnySelected}
                            >
                                Export
                            </Button>
                        </span>
                    </Tooltip>

                    <Tooltip
                        title="Paste or edit JSON data here"
                        placement="top"
                        disableInteractive
                    >
                        <TextField
                            className="manualDomainInput"
                            label="Export / Import Data"
                            placeholder="Paste JSON here..."
                            variant="outlined"
                            size="small"
                            multiline
                            minRows={3}
                            maxRows={6}
                            autoComplete="off"
                            inputProps={{
                                spellCheck: false,
                                style: {
                                    fontSize: "0.8rem",
                                },
                            }}
                            value={exportImportText}
                            onChange={(e) => {
                                setExportImportText(e.target.value);
                                setPendingImportData(null);
                                setStatusMessage(null);
                            }}
                        />
                    </Tooltip>

                    <Tooltip title="Import selected settings from text field">
                        <span
                            style={{
                                display: "flex",
                                width: "100%",
                            }}
                        >
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleImport}
                                disabled={
                                    !isAnySelected || !exportImportText.trim()
                                }
                            >
                                Import
                            </Button>
                        </span>
                    </Tooltip>

                    {pendingImportData && (
                        <Tooltip title="Confirm importing settings despite version mismatch">
                            <span
                                style={{
                                    display: "flex",
                                    width: "100%",
                                    marginTop: "8px",
                                }}
                            >
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="warning"
                                    onClick={() =>
                                        applyImport(pendingImportData)
                                    }
                                    disabled={!isAnySelected}
                                >
                                    Confirm Import
                                </Button>
                            </span>
                        </Tooltip>
                    )}

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
