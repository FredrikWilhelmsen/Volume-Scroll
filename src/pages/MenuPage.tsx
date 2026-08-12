import browser from "webextension-polyfill";
import React, { useEffect, useState } from "react";
import { Settings, Pages, ExtensionData } from "../types";
import "../style/menuPage.css";
import Typography from "@mui/material/Typography/Typography";
import ButtonGroup from "@mui/material/ButtonGroup/ButtonGroup";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import SettingsSwitch from "../components/SettingsSwitch";
import ResetButton from "../components/ResetButton";
import MenuButton from "../components/MenuButton";
import MouseIcon from "@mui/icons-material/Mouse";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import LayersIcon from "@mui/icons-material/Layers";
import PublicIcon from "@mui/icons-material/Public";
import TuneIcon from "@mui/icons-material/Tune";

interface MenuPageInterface {
    settings: Settings;
    extensionData: ExtensionData;
    setExtensionData: React.Dispatch<
        React.SetStateAction<ExtensionData | null>
    >;
    editSetting: (key: keyof Settings, value: any) => void;
    setPage: (targetPage: Pages) => void;
}

const userAgent = navigator.userAgent.toLowerCase();
const isFirefox = userAgent.includes("firefox");
const isEdge = userAgent.includes("edg/");

const reviewLink = isFirefox
    ? "https://addons.mozilla.org/en-GB/firefox/addon/volume-scroll/reviews/2585522/"
    : isEdge
      ? "https://microsoftedge.microsoft.com/addons/detail/volume-scroll/mjmfahcdmfdlnhbmahfkelaeecdnopgn"
      : "https://chromewebstore.google.com/detail/volume-scroll/gkmagiadkkhdilnaicdnngcjhmhaeaoh/reviews";

const MenuPage: React.FC<MenuPageInterface> = ({
    settings,
    extensionData,
    setExtensionData,
    editSetting,
    setPage,
}) => {
    const [hostname, setHostname] = useState<string>("");

    useEffect(() => {
        const getActiveTabHostname = async () => {
            const tabs = await browser.tabs.query({
                active: true,
                currentWindow: true,
            });
            const activeTab = tabs[0];
            if (activeTab?.url) {
                const url = new URL(activeTab.url);
                setHostname(url.hostname);
            }
        };

        getActiveTabHostname();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "l") {
                event.preventDefault();
                editSetting("doDebugLog", !settings.doDebugLog);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [settings.doDebugLog, editSetting]);

    const domainSetting =
        extensionData.domainOverrides?.[hostname.toLowerCase()];
    const isEnableDefaultOverridden =
        domainSetting?.enableDefault !== undefined;
    const isEnabled = domainSetting?.enableDefault ?? settings.enableDefault;

    const labelText = isEnableDefaultOverridden
        ? isEnabled
            ? "Enabled on site"
            : "Disabled on site"
        : isEnabled
          ? "Enabled: default"
          : "Disabled: default";

    const handleEnableToggle = (value: boolean) => {
        const lowerHost = hostname.toLowerCase();
        const existing = extensionData.domainOverrides[lowerHost] || {};

        setExtensionData((prev) => {
            if (!prev) return prev;
            const newOverrides = { ...prev.domainOverrides };
            newOverrides[lowerHost] = { ...existing, enableDefault: value };
            const newData = { ...prev, domainOverrides: newOverrides };
            browser.storage.sync.set({ extensionData: newData });
            return newData;
        });
    };

    const handleUndoOverride = () => {
        const lowerHost = hostname.toLowerCase();
        setExtensionData((prev) => {
            if (!prev) return prev;
            const newOverrides = { ...prev.domainOverrides };
            const existing = { ...newOverrides[lowerHost] };

            delete existing.enableDefault;

            if (Object.keys(existing).length === 0) {
                delete newOverrides[lowerHost];
            } else {
                newOverrides[lowerHost] = existing;
            }

            const newData = { ...prev, domainOverrides: newOverrides };
            browser.storage.sync.set({ extensionData: newData });
            return newData;
        });
    };

    const fetchDebugLogs = async (): Promise<string> => {
        const tabs = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });
        const activeTab = tabs[0];
        if (activeTab?.id) {
            try {
                const response = await browser.tabs.sendMessage(activeTab.id, {
                    type: "GET_DEBUG_LOGS",
                });
                if (response) {
                    return JSON.stringify(response, null, 2);
                }
            } catch (e) {
                console.error("Failed to fetch debug logs:", e);
            }
        }
        return "";
    };

    const handleCopyLogs = async () => {
        const logs = await fetchDebugLogs();
        if (logs) {
            await navigator.clipboard.writeText(logs);
        }
    };

    const handleReportIssue = async (
        e: React.MouseEvent<HTMLAnchorElement>,
    ) => {
        e.preventDefault();
        const platform = isFirefox
            ? "Firefox"
            : isEdge
              ? "Edge"
              : userAgent.includes("brave") || (navigator as any).brave
                ? "Brave"
                : userAgent.includes("chrome")
                  ? "Google Chrome"
                  : "Unknown Browser";

        const lowerHost = hostname.toLowerCase();
        const siteOverride = extensionData.domainOverrides?.[lowerHost] || {};
        const activeSettings = { ...settings, ...siteOverride };

        const settingsData = JSON.stringify(activeSettings, null, 2);

        const subject = encodeURIComponent(`Issue on ${platform}`);
        const body = encodeURIComponent(
            `Please describe the issue below:\n\n\n--- Active Settings ---\n${settingsData}`,
        );

        const mailtoUrl = `mailto:Volumescroll@gmail.com?subject=${subject}&body=${body}`;
        await browser.tabs.create({ url: mailtoUrl });
    };

    return (
        <div className="menuContainer">
            <div
                id="blacklistContainer"
                style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
                <SettingsSwitch
                    label={labelText}
                    checked={isEnabled}
                    onChange={handleEnableToggle}
                    tooltip="Enable or disable Volume Scroll for this site"
                    placement="bottom"
                    isOverridden={isEnableDefaultOverridden}
                />
                <ResetButton
                    isOverridden={isEnableDefaultOverridden}
                    onReset={handleUndoOverride}
                />
            </div>

            <ButtonGroup
                id="buttons"
                orientation="vertical"
                aria-label="Vertical button group"
                variant="text"
            >
                <MenuButton
                    title="Scroll"
                    subtitle="Step size & behavior"
                    icon={<MouseIcon />}
                    onClick={() => setPage("scroll")}
                />
                <MenuButton
                    title="Hotkey"
                    subtitle="Modifier & toggles"
                    icon={<KeyboardIcon />}
                    onClick={() => setPage("hotkeys")}
                />
                <MenuButton
                    title="Overlay"
                    subtitle="Position & styling"
                    icon={<LayersIcon />}
                    onClick={() => setPage("overlay")}
                />
                <MenuButton
                    title="Domain"
                    subtitle="Site-specific rules"
                    icon={<PublicIcon />}
                    onClick={() => setPage("domains")}
                />
                <MenuButton
                    title="Misc"
                    subtitle="Advanced"
                    icon={<TuneIcon />}
                    onClick={() => setPage("misc")}
                />
            </ButtonGroup>

            <footer>
                <Typography variant="body2" sx={{ fontSize: "11px" }}>
                    Want to show support? <br />
                    Consider leaving a{" "}
                    <a href={reviewLink} target="_blank" rel="noreferrer">
                        review
                    </a>
                    <br />
                    or buy me a{" "}
                    <a
                        href="https://ko-fi.com/fredrikwilhelmsen"
                        target="_blank"
                        rel="noreferrer"
                    >
                        coffee
                    </a>
                    <br />
                    <a href="#" onClick={handleReportIssue}>
                        Report an issue
                    </a>
                </Typography>
            </footer>
            <Tooltip
                title="Debug logging enabled"
                placement="top-start"
                disableInteractive
            >
                <div>
                    {settings.doDebugLog && (
                        <div id="debugIcon" onClick={handleCopyLogs}></div>
                    )}
                </div>
            </Tooltip>
            <Tooltip
                title={`Volume Scroll version ${browser.runtime.getManifest().version}${extensionData.lastVersionRead !== browser.runtime.getManifest().version ? " - Click to read update notes!" : ""}`}
                placement="top-start"
                disableInteractive
            >
                <div
                    onClick={() => {
                        setExtensionData((prev) => {
                            if (!prev) return prev;
                            const newData = {
                                ...prev,
                                lastVersionRead:
                                    browser.runtime.getManifest().version,
                            };
                            browser.storage.sync.set({
                                extensionData: newData,
                            });
                            return newData;
                        });
                        setPage("updatePage");
                    }}
                    style={{
                        cursor: "pointer",
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        margin: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    <Typography
                        id="versionNumber"
                        variant="body2"
                    >{`v${browser.runtime.getManifest().version}`}</Typography>
                    {extensionData.lastVersionRead !==
                    browser.runtime.getManifest().version ? (
                        <div id="changelogIcon"></div>
                    ) : null}
                </div>
            </Tooltip>
        </div>
    );
};

export default MenuPage;
