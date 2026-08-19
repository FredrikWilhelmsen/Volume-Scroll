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

                    {statusMessage && (
                        <Typography
                            variant="caption"
                            style={{
                                color: "white",
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
