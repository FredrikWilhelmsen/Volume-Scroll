import browser from "webextension-polyfill";
import React, { useEffect, useState } from "react";
import { Settings, Pages, ExtensionData } from "../types";
import "../style/menuPage.css";
import Typography from "@mui/material/Typography/Typography";
import ButtonGroup from "@mui/material/ButtonGroup/ButtonGroup";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import SettingsSwitch from "../components/SettingsSwitch";
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
    const hasOverride = domainSetting !== undefined;
    const isEnabled = domainSetting?.enableDefault ?? settings.enableDefault;

    const labelText = hasOverride
        ? isEnabled
            ? "Enabled on this site"
            : "Disabled on this site"
        : isEnabled
          ? "Enabled by default"
          : "Disabled by default";

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

    const handleCopyLogs = async () => {
        console.log("Log button clicked");
        const tabs = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });
        const activeTab = tabs[0];
        console.log("Active tab:", activeTab);
        if (activeTab?.id) {
            try {
                console.log("Sending message");
                const response = await browser.tabs.sendMessage(activeTab.id, {
                    type: "GET_DEBUG_LOGS",
                });
                console.log("Response:", response);
                if (response) {
                    await navigator.clipboard.writeText(
                        JSON.stringify(response, null, 2),
                    );
                }
            } catch (e) {
                console.error("Failed to copy logs:", e);
            }
        }
    };

    return (
        <div className="menuContainer">
            <div id="blacklistContainer">
                <SettingsSwitch
                    label={labelText}
                    checked={isEnabled}
                    onChange={handleEnableToggle}
                    tooltip="Enable or disable Volume Scroll for this site"
                    placement="bottom"
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
