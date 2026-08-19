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

import React, { useState } from "react";
import { ExtensionData, Pages } from "../types";
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
        const exportData: Partial<ExtensionData> = {};

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

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    marginTop: "12px",
                }}
            >
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
                    variant="contained"
                    onClick={handleExport}
                    disabled={!isAnySelected}
                    style={{ marginTop: "16px", textTransform: "none" }}
                >
                    Export
                </Button>

                {statusMessage && (
                    <Typography
                        variant="caption"
                        style={{
                            color: "#4ade80",
                            marginTop: "8px",
                            textAlign: "center",
                        }}
                    >
                        {statusMessage}
                    </Typography>
                )}
            </div>
        </div>
    );
};

export default SharePage;
