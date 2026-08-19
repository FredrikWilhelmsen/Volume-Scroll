import React, { useState } from "react";
import BackButton from "../components/BackButton";
import { CustomRule, Pages } from "../types";
import { TextField, IconButton, Typography, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import "../style/domainPage.css";

interface CustomRulesPageProps {
    customRules?: Record<string, CustomRule[]>;
    ignoredElements?: Record<string, string[]>;
    updateCustomRules: (domain: string, rules: CustomRule[]) => void;
    updateIgnoredElements: (domain: string, ignoredElements: string[]) => void;
    activeDomain?: string | null;
    setPage: (targetPage: Pages) => void;
}

const CustomRulesPage: React.FC<CustomRulesPageProps> = ({
    customRules = {},
    ignoredElements = {},
    updateCustomRules,
    updateIgnoredElements,
    activeDomain,
    setPage,
}) => {
    const domain = activeDomain || "";
    const currentRules = domain ? customRules[domain] || [] : [];
    const currentIgnoredElements = domain ? ignoredElements[domain] || [] : [];

    const [ruleNameInput, setRuleNameInput] = useState("");
    const [videoQueryInput, setVideoQueryInput] = useState("");
    const [scrollInteractibleQueryInput, setScrollInteractibleQueryInput] =
        useState("");
    const [playerQueryInput, setPlayerQueryInput] = useState("");
    const [ignoredElementInput, setIgnoredElementInput] = useState("");

    const handleSelectCustomRule = (rule: CustomRule) => {
        setRuleNameInput(rule.name || "");
        setVideoQueryInput(rule.videoQuerySelector || "");
        setScrollInteractibleQueryInput(
            (rule.scrollInteractibleQuerySelector || []).join(", "),
        );
        setPlayerQueryInput(rule.displayQuerySelector || "");
    };

    const handleAddCustomRule = () => {
        if (!domain || !videoQueryInput.trim() || !playerQueryInput.trim())
            return;
        const scrollInteractible = scrollInteractibleQueryInput
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        let ruleName = ruleNameInput.trim();
        if (!ruleName) {
            let index = currentRules.length + 1;
            while (currentRules.some((r) => r.name === `Rule #${index}`)) {
                index++;
            }
            ruleName = `Rule #${index}`;
        }

        const newRule: CustomRule = {
            name: ruleName,
            videoQuerySelector: videoQueryInput.trim(),
            displayQuerySelector: playerQueryInput.trim(),
            scrollInteractibleQuerySelector: scrollInteractible,
        };

        const isExisting = currentRules.some(
            (r) => r.name.toLowerCase() === ruleName.toLowerCase(),
        );

        const updated = isExisting
            ? currentRules.map((r) =>
                  r.name.toLowerCase() === ruleName.toLowerCase() ? newRule : r,
              )
            : [...currentRules, newRule];

        updateCustomRules(domain, updated);
        setRuleNameInput("");
        setVideoQueryInput("");
        setScrollInteractibleQueryInput("");
        setPlayerQueryInput("");
    };

    const handleDeleteCustomRule = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!domain) return;
        const updated = currentRules.filter((_, i) => i !== index);
        updateCustomRules(domain, updated);
    };

    const handleAddIgnoredElement = () => {
        if (!domain || !ignoredElementInput.trim()) return;
        const newElement = ignoredElementInput.trim();
        if (currentIgnoredElements.includes(newElement)) return;
        const updated = [...currentIgnoredElements, newElement];
        updateIgnoredElements(domain, updated);
        setIgnoredElementInput("");
    };

    const handleDeleteIgnoredElement = (index: number) => {
        if (!domain) return;
        const updated = currentIgnoredElements.filter((_, i) => i !== index);
        updateIgnoredElements(domain, updated);
    };

    return (
        <div>
            <BackButton
                setPage={setPage}
                title="Custom Rules"
                targetPage="domains"
            />
            <hr />
            <div className="settingsContainer">
                <div id="domainListInputContainer">
                    <br></br>
                    <Tooltip
                        title="Name for the custom rule"
                        placement="top"
                        disableInteractive
                    >
                        <TextField
                            className="manualDomainInput"
                            label="Rule name"
                            placeholder="e.g. My Custom Rule"
                            variant="outlined"
                            size="small"
                            autoComplete="off"
                            value={ruleNameInput}
                            onChange={(e) => setRuleNameInput(e.target.value)}
                        />
                    </Tooltip>
                    <Tooltip
                        title="The css selector for the video"
                        placement="top"
                        disableInteractive
                    >
                        <TextField
                            className="manualDomainInput"
                            label="Video query selector"
                            placeholder="e.g. video.html5-main"
                            variant="outlined"
                            size="small"
                            autoComplete="off"
                            value={videoQueryInput}
                            onChange={(e) => setVideoQueryInput(e.target.value)}
                        />
                    </Tooltip>
                    <Tooltip
                        title="Comma-separated CSS selectors for elements that trigger volume scrolling"
                        placement="top"
                        disableInteractive
                    >
                        <TextField
                            className="manualDomainInput"
                            label="Interactible query selectors"
                            placeholder="e.g. .player-controls, .video-overlay"
                            variant="outlined"
                            size="small"
                            multiline
                            minRows={2}
                            maxRows={4}
                            autoComplete="off"
                            value={scrollInteractibleQueryInput}
                            onChange={(e) =>
                                setScrollInteractibleQueryInput(e.target.value)
                            }
                        />
                    </Tooltip>
                    <Tooltip
                        title="The css selector for the display element"
                        placement="top"
                        disableInteractive
                    >
                        <TextField
                            className="manualDomainInput"
                            label="Display query selector"
                            placeholder="e.g. #movie_player"
                            variant="outlined"
                            size="small"
                            autoComplete="off"
                            value={playerQueryInput}
                            onChange={(e) =>
                                setPlayerQueryInput(e.target.value)
                            }
                        />
                    </Tooltip>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddCustomRule}
                        disabled={
                            !videoQueryInput.trim() || !playerQueryInput.trim()
                        }
                        style={{ marginTop: "4px" }}
                    >
                        Save Rule
                    </Button>
                </div>

                <div
                    id="domainListVisualContainer"
                    style={{ height: "100px", marginTop: "8px" }}
                >
                    {currentRules.length === 0 ? (
                        <Typography className="emptyDomainList">
                            No custom rules for {domain}
                        </Typography>
                    ) : (
                        currentRules.map((rule, idx) => (
                            <div
                                key={idx}
                                className="domainListItem"
                                onClick={() => handleSelectCustomRule(rule)}
                            >
                                <div className="domainItemText">
                                    <Typography
                                        variant="body2"
                                        className="domainName"
                                    >
                                        {rule.name || `Rule #${idx + 1}`}
                                    </Typography>
                                </div>
                                <IconButton
                                    onClick={(e) =>
                                        handleDeleteCustomRule(idx, e)
                                    }
                                    size="small"
                                    sx={{ color: "white", flexShrink: 0 }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </div>
                        ))
                    )}
                </div>

                <div id="domainListInputContainer">
                    <Tooltip
                        title="Input query selector for elements to ignore on scroll"
                        placement="top"
                        disableInteractive
                    >
                        <TextField
                            className="manualDomainInput"
                            label="Ignored element selector"
                            placeholder="e.g. .ytp-chrome-bottom"
                            variant="outlined"
                            size="small"
                            autoComplete="off"
                            value={ignoredElementInput}
                            onChange={(e) =>
                                setIgnoredElementInput(e.target.value)
                            }
                        />
                    </Tooltip>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddIgnoredElement}
                        disabled={!ignoredElementInput.trim()}
                        style={{ marginTop: "4px" }}
                    >
                        Add Element
                    </Button>
                </div>

                <div
                    id="domainListVisualContainer"
                    style={{ height: "100px", marginTop: "8px" }}
                >
                    {currentIgnoredElements.length === 0 ? (
                        <Typography className="emptyDomainList">
                            No ignored elements for {domain}
                        </Typography>
                    ) : (
                        currentIgnoredElements.map((selector, idx) => (
                            <div key={idx} className="domainListItem">
                                <div className="domainItemText">
                                    <Typography
                                        variant="body2"
                                        className="domainName"
                                    >
                                        {selector}
                                    </Typography>
                                </div>
                                <IconButton
                                    onClick={() =>
                                        handleDeleteIgnoredElement(idx)
                                    }
                                    size="small"
                                    sx={{ color: "white", flexShrink: 0 }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomRulesPage;
