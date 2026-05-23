import browser from "webextension-polyfill";
import React, { useState, useEffect } from "react";
import { Settings, Pages } from "../types";
import BackButton from "../components/BackButton";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import Switch from "@mui/material/Switch/Switch";
import { TextField, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import SettingsSwitch from "../components/SettingsSwitch";
import "../style/domainPage.css";

interface DomainPageInterface {
    settings: Settings;
    editSetting: (key: keyof Settings, value: any) => void;
    setPage: React.Dispatch<React.SetStateAction<Pages>>;
}

const DomainPage: React.FC<DomainPageInterface> = ({
    settings,
    editSetting,
    setPage,
}) => {
    const [domainListInput, setdomainListInput] = useState("");

    useEffect(() => {
        const getActiveTabHostname = async () => {
            const tabs = await browser.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];
            if (activeTab?.url) {
                const url = new URL(activeTab.url);
                setdomainListInput(url.hostname);
            }
        };

        getActiveTabHostname();
    }, []);

    const handleEnableDefaultToggle = (value: boolean) => {
        editSetting("enableDefault", value);
    };

    const handleDomainListChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setdomainListInput(e.target.value);
    };

    const handleDomainListToggle = (
        _e: Event | React.SyntheticEvent,
        value: any,
    ) => {
        if (!domainListInput) return;

        const updatedDomainList = { ...settings.domainList };
        const lowerInput = domainListInput.toLowerCase();
        updatedDomainList[lowerInput] = {
            ...(updatedDomainList[lowerInput] || {}),
            enabled: value,
        };
        editSetting("domainList", updatedDomainList);
    };

    const handleStartMutedDomainListToggle = (
        _e: Event | React.SyntheticEvent,
        value: any,
    ) => {
        if (!domainListInput) return;

        const updatedDomainList = { ...settings.domainList };
        const lowerInput = domainListInput.toLowerCase();
        updatedDomainList[lowerInput] = {
            ...(updatedDomainList[lowerInput] || {}),
            muted: value,
        };
        editSetting("domainList", updatedDomainList);
    };

    const handleResetToggle = (key: "enabled" | "muted") => {
        if (!domainListInput) return;

        const updatedDomainList = { ...settings.domainList };
        const lowerInput = domainListInput.toLowerCase();
        const currentSetting = updatedDomainList[lowerInput];

        if (!currentSetting) return;

        const newSetting = { ...currentSetting };
        delete newSetting[key];

        if (
            newSetting.enabled === undefined &&
            newSetting.muted === undefined
        ) {
            delete updatedDomainList[lowerInput];
        } else {
            updatedDomainList[lowerInput] = newSetting;
        }

        editSetting("domainList", updatedDomainList);
    };

    const allDomains = Object.keys(settings.domainList || {}).filter(
        (d) => d.trim() !== "",
    );

    const lowerInput = domainListInput.toLowerCase();
    const isScrollResetDisabled =
        !domainListInput ||
        settings.domainList?.[lowerInput]?.enabled === undefined;
    const isMuteResetDisabled =
        !domainListInput ||
        settings.domainList?.[lowerInput]?.muted === undefined ||
        !settings.useDefaultVolume;

    return (
        <div>
            <BackButton setPage={setPage} title={"Domain"} />

            <hr></hr>

            <div className="settingsContainer">
                <SettingsSwitch
                    label="Enable by default"
                    checked={settings.enableDefault}
                    onChange={handleEnableDefaultToggle}
                    tooltip="If volume scroll should be enabled or disabled by default on new sites"
                />
                <div id="domainListInputContainer">
                    <Tooltip
                        title="Input a domain to toggle if it should be enabled or disabled"
                        placement="top"
                        disableInteractive
                    >
                        <TextField
                            className="manualDomainInput"
                            label="Site override"
                            placeholder="e.g. www.youtube.com"
                            variant="outlined"
                            size="small"
                            autoComplete="off"
                            value={domainListInput}
                            onChange={handleDomainListChange}
                        />
                    </Tooltip>
                    <div
                        className="domainListActions"
                        style={{
                            flexDirection: "column",
                            alignItems: "stretch",
                            gap: "8px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Tooltip
                                title="Disable or enable volume scroll for this site"
                                placement="top"
                                disableInteractive
                            >
                                <FormControlLabel
                                    onChange={handleDomainListToggle}
                                    control={
                                        <Switch
                                            checked={
                                                settings.domainList?.[
                                                    domainListInput.toLowerCase()
                                                ]?.enabled ??
                                                settings.enableDefault
                                            }
                                            disabled={!domainListInput}
                                        />
                                    }
                                    label={
                                        settings.domainList?.[
                                            domainListInput.toLowerCase()
                                        ]?.enabled === undefined
                                            ? "Scroll: Default"
                                            : settings.domainList[
                                                    domainListInput.toLowerCase()
                                                ]?.enabled
                                              ? "Scroll: Enabled"
                                              : "Scroll: Disabled"
                                    }
                                />
                            </Tooltip>
                            <Tooltip
                                title="Reset scroll override"
                                placement="top"
                                disableInteractive
                            >
                                <span style={{ display: "inline-flex" }}>
                                    <IconButton
                                        onClick={() =>
                                            handleResetToggle("enabled")
                                        }
                                        size="small"
                                        sx={{
                                            cursor: isScrollResetDisabled
                                                ? "default"
                                                : "pointer",
                                        }}
                                        disabled={isScrollResetDisabled}
                                    >
                                        <DeleteIcon
                                            fontSize="small"
                                            htmlColor={
                                                isScrollResetDisabled
                                                    ? "gray"
                                                    : "white"
                                            }
                                        />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Tooltip
                                title="Mute by default for this site"
                                placement="top"
                                disableInteractive
                            >
                                <FormControlLabel
                                    onChange={handleStartMutedDomainListToggle}
                                    control={
                                        <Switch
                                            checked={
                                                settings.domainList?.[
                                                    domainListInput.toLowerCase()
                                                ]?.muted ?? settings.startMuted
                                            }
                                            disabled={
                                                !domainListInput ||
                                                !settings.useDefaultVolume
                                            }
                                        />
                                    }
                                    label={
                                        settings.domainList?.[
                                            domainListInput.toLowerCase()
                                        ]?.muted === undefined
                                            ? "Mute: Default"
                                            : settings.domainList[
                                                    domainListInput.toLowerCase()
                                                ]?.muted
                                              ? "Mute: Enabled"
                                              : "Mute: Disabled"
                                    }
                                />
                            </Tooltip>
                            <Tooltip
                                title="Reset mute override"
                                placement="top"
                                disableInteractive
                            >
                                <span style={{ display: "inline-flex" }}>
                                    <IconButton
                                        onClick={() =>
                                            handleResetToggle("muted")
                                        }
                                        size="small"
                                        sx={{
                                            cursor: isMuteResetDisabled
                                                ? "default"
                                                : "pointer",
                                        }}
                                        disabled={isMuteResetDisabled}
                                    >
                                        <DeleteIcon
                                            fontSize="small"
                                            htmlColor={
                                                isMuteResetDisabled
                                                    ? "gray"
                                                    : "white"
                                            }
                                        />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <Tooltip
                    title="Click a domain to change state. Trashcan deletes it entirely"
                    placement="top"
                    disableInteractive
                >
                    <Typography variant="body1" id="savedDomainsTitle">
                        Saved domains
                    </Typography>
                </Tooltip>
                <div id="domainListVisualContainer">
                    {allDomains.length === 0 ? (
                        <Typography className="emptyDomainList">
                            No stored domains
                        </Typography>
                    ) : (
                        allDomains.map((domain) => {
                            const domainSetting =
                                settings.domainList?.[domain] || {};
                            const isEnabled =
                                domainSetting.enabled ?? settings.enableDefault;
                            const isMuted =
                                domainSetting.muted ?? settings.startMuted;

                            return (
                                <Tooltip
                                    key={domain}
                                    title={domain}
                                    placement="top"
                                    disableInteractive
                                    enterDelay={500}
                                >
                                    <div
                                        className="domainListItem"
                                        onClick={() =>
                                            setdomainListInput(domain)
                                        }
                                    >
                                        <div className="domainItemText">
                                            <Typography
                                                variant="body2"
                                                className="domainName"
                                            >
                                                {domain}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                className="domainState"
                                                style={{
                                                    color:
                                                        domainSetting.enabled ===
                                                        undefined
                                                            ? settings.enableDefault
                                                                ? "#4caf50"
                                                                : "#f44336"
                                                            : domainSetting.enabled
                                                              ? "#4caf50"
                                                              : "#f44336",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                {domainSetting.enabled ===
                                                undefined
                                                    ? settings.enableDefault
                                                        ? "Default (Enabled)"
                                                        : "Default (Disabled)"
                                                    : domainSetting.enabled
                                                      ? "Enabled"
                                                      : "Disabled"}
                                                {isMuted ? (
                                                    <VolumeOffIcon
                                                        sx={{ fontSize: 16 }}
                                                    />
                                                ) : (
                                                    <VolumeUpIcon
                                                        sx={{ fontSize: 16 }}
                                                    />
                                                )}
                                            </Typography>
                                        </div>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const updatedDomainList = {
                                                    ...settings.domainList,
                                                };
                                                delete updatedDomainList[
                                                    domain
                                                ];
                                                editSetting(
                                                    "domainList",
                                                    updatedDomainList,
                                                );
                                            }}
                                            size="small"
                                            sx={{
                                                color: "white",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </div>
                                </Tooltip>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default DomainPage;
