import browser from "webextension-polyfill";
import React, { useState, useEffect } from "react";
import { Settings, Pages, ExtensionData } from "../types";
import BackButton from "../components/BackButton";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import { TextField, IconButton, Typography, ButtonGroup } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsSwitch from "../components/SettingsSwitch";
import MenuButton from "../components/MenuButton";
import MouseIcon from "@mui/icons-material/Mouse";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import LayersIcon from "@mui/icons-material/Layers";
import TuneIcon from "@mui/icons-material/Tune";
import RuleIcon from "@mui/icons-material/Rule";
import "../style/domainPage.css";

interface DomainPageInterface {
    settings: Settings;
    extensionData: ExtensionData;
    setExtensionData: React.Dispatch<
        React.SetStateAction<ExtensionData | null>
    >;
    editSetting: (
        key: keyof Settings,
        value: any,
        overrideDomain?: string,
    ) => void;
    setPage: (targetPage: Pages) => void;
    setActiveDomain: React.Dispatch<React.SetStateAction<string | null>>;
    activeDomain?: string | null;
}

const DomainPage: React.FC<DomainPageInterface> = ({
    settings,
    extensionData,
    setExtensionData,
    editSetting,
    setPage,
    setActiveDomain,
    activeDomain,
}) => {
    const [domainListInput, setdomainListInput] = useState(activeDomain || "");

    useEffect(() => {
        if (activeDomain) return;

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
    }, [activeDomain]);

    const handleEnableDefaultToggle = (value: boolean) => {
        editSetting("enableDefault", value);
    };

    const handleDomainListChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setdomainListInput(e.target.value);
    };

    const allDomains = Object.keys(extensionData.domainOverrides || {}).filter(
        (d) => d.trim() !== "",
    );

    const navigateToOverridePage = (targetPage: Pages) => {
        if (!domainListInput) return;
        setActiveDomain(domainListInput.toLowerCase());
        setPage(targetPage);
    };

    return (
        <div>
            <BackButton setPage={setPage} title={"Domain overrides"} />

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
                        title="Input a domain to set specific volume scroll overrides"
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

                    {domainListInput && (
                        <ButtonGroup
                            id="buttons"
                            orientation="vertical"
                            aria-label="Vertical button group"
                            variant="text"
                            style={{ width: "100%", marginTop: "12px" }}
                        >
                            <MenuButton
                                title="Scroll"
                                subtitle="Step size & behavior"
                                icon={<MouseIcon />}
                                onClick={() => navigateToOverridePage("scroll")}
                            />
                            <MenuButton
                                title="Hotkey"
                                subtitle="Modifier & toggles"
                                icon={<KeyboardIcon />}
                                onClick={() =>
                                    navigateToOverridePage("hotkeys")
                                }
                            />
                            <MenuButton
                                title="Overlay"
                                subtitle="Position & styling"
                                icon={<LayersIcon />}
                                onClick={() =>
                                    navigateToOverridePage("overlay")
                                }
                            />
                            <MenuButton
                                title="Misc"
                                subtitle="Advanced settings"
                                icon={<TuneIcon />}
                                onClick={() => navigateToOverridePage("misc")}
                            />
                            <MenuButton
                                title="Custom Rules"
                                subtitle="Custom handlers"
                                icon={<RuleIcon />}
                                onClick={() =>
                                    navigateToOverridePage("customRules")
                                }
                            />
                        </ButtonGroup>
                    )}
                </div>

                <Tooltip
                    title="Click a domain to edit its overrides. Trashcan deletes it entirely"
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
                                extensionData.domainOverrides?.[domain] || {};

                            const overrideCount =
                                Object.keys(domainSetting).length;

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
                                                    color: "rgba(255, 255, 255, 0.6)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                {overrideCount === 1
                                                    ? "1 override"
                                                    : `${overrideCount} overrides`}
                                            </Typography>
                                        </div>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const updatedData = {
                                                    ...extensionData,
                                                };
                                                const updatedDomainList = {
                                                    ...updatedData.domainOverrides,
                                                };
                                                delete updatedDomainList[
                                                    domain
                                                ];
                                                updatedData.domainOverrides =
                                                    updatedDomainList;

                                                setExtensionData(updatedData);
                                                browser.storage.sync.set({
                                                    extensionData: updatedData,
                                                });
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
