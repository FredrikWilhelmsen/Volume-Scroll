import React, { useState } from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';
import { TextField, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsSwitch from '../components/SettingsSwitch';
import "../style/domainPage.css"

interface DomainPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const DomainPage: React.FC<DomainPageInterface> = ({ settings, editSetting, setPage }) => {
    const [domainListInput, setdomainListInput] = useState("");

    const handleEnableDefaultToggle = (value: boolean) => {
        editSetting("enableDefault", value);
    }

    const handleDomainListChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setdomainListInput(e.target.value);
    }

    const handleDomainListToggle = (_e: Event | React.SyntheticEvent, value: any) => {
        if (!domainListInput) return;

        const updatedDomainList = { ...settings.domainList };
        updatedDomainList[domainListInput.toLowerCase()] = value;
        editSetting("domainList", updatedDomainList);
    }

    const handleDomainListDelete = () => {
        if (!domainListInput) return;

        const updatedDomainList = { ...settings.domainList };
        delete updatedDomainList[domainListInput.toLowerCase()];
        editSetting("domainList", updatedDomainList);
    }

    return (
        <div>
            <BackButton setPage={setPage} title={"Domain Settings"} />

            <hr></hr>

            <div className="settingsContainer">
                <SettingsSwitch
                    label="Enable by default"
                    checked={settings.enableDefault}
                    onChange={handleEnableDefaultToggle}
                    tooltip="If volume scroll should be enabled or disabled by default on new sites"
                />
                <div id="domainListInputContainer">
                    <Tooltip title="Input a domain to toggle if it should be enabled or disabled" placement="top" disableInteractive>
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
                    <div className="domainListActions">
                        <Tooltip title="Disable or enable volume scroll for this site" placement="top" disableInteractive>
                            <FormControlLabel
                                onChange={handleDomainListToggle}
                                control={
                                    <Switch
                                        checked={settings.domainList?.[domainListInput.toLowerCase()] ?? settings.enableDefault}
                                        disabled={!domainListInput}
                                    />}
                                label={settings.domainList?.[domainListInput.toLowerCase()] === undefined ? "Default" : (settings.domainList[domainListInput.toLowerCase()] ? "Enabled" : "Disabled")}
                            />
                        </Tooltip>
                        <Tooltip title="Delete override" placement="top" disableInteractive>
                            <IconButton
                                onClick={(!domainListInput || settings.domainList?.[domainListInput.toLowerCase()] === undefined) ? undefined : handleDomainListDelete}
                                size="small"
                                sx={{
                                    color: (!domainListInput || settings.domainList?.[domainListInput.toLowerCase()] === undefined) ? "gray" : "white",
                                    cursor: (!domainListInput || settings.domainList?.[domainListInput.toLowerCase()] === undefined) ? "default" : "pointer"
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>

                <Tooltip title="Click a domain to change state. Trashcan deletes it entirely" placement="top" disableInteractive>
                    <Typography variant="body1" id="savedDomainsTitle">
                        Saved domains
                    </Typography>
                </Tooltip>
                <div id="domainListVisualContainer">
                    {Object.keys(settings.domainList).filter(d => d.trim() !== '').length === 0 ? (
                        <Typography className="emptyDomainList">No stored domains</Typography>
                    ) : (
                        Object.keys(settings.domainList).filter(d => d.trim() !== '').map((domain) => (
                            <div
                                key={domain}
                                className="domainListItem"
                                onClick={() => setdomainListInput(domain)}
                            >
                                <div className="domainItemText">
                                    <Typography variant="body2" className="domainName">
                                        {domain}
                                    </Typography>
                                    <Typography variant="caption" className="domainState" style={{ color: settings.domainList[domain] ? '#4caf50' : '#f44336' }}>
                                        {settings.domainList[domain] ? 'Enabled' : 'Disabled'}
                                    </Typography>
                                </div>
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedDomainList = { ...settings.domainList };
                                        delete updatedDomainList[domain];
                                        editSetting("domainList", updatedDomainList);
                                    }}
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
}

export default DomainPage;
