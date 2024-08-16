import React from 'react';
import { Settings, Pages } from '../types';
import BackButton from '../components/BackButton';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';
import Button from '@mui/material/Button/Button';

interface HotkeyPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const HotkeyPage: React.FC<HotkeyPageInterface> = ({ settings, editSetting, setPage }) => {

    const handleModifierKeyToggle = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("useModifierKey", value);
    }

    const handleInvertModifierKeyToggle = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("invertModifierKey", value);
    }

    const handleMuteKeyToggle = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("useToggleMuteKey", value);
    }

    //TODO: Hotkey buttons

    return (
        <div>
            <BackButton setPage={setPage} title={"Hotkey Settings"}/>

            <hr></hr>

            <div className="settingsContainer">
                <div id="modifierKeyContainer">
                    <Tooltip title="Set a key that must be held down for Volume Scroll to work" placement="top" disableInteractive>
                        <FormControlLabel 
                            onChange={handleModifierKeyToggle}
                            control={
                            <Switch 
                                checked={settings.useModifierKey}
                                disabled={!settings.useMouseWheelVolume}
                            />} 
                            label="Modifier key"
                        />
                    </Tooltip>
                    <Tooltip title="Click to change hotkey" placement="top" disableInteractive>
                        <Button variant="outlined" disabled={!settings.useMouseWheelVolume || !settings.useModifierKey}>
                            {settings.modifierKey}
                        </Button>
                    </Tooltip>
                </div>
                <div id="invertedModifierKeyContainer">
                <Tooltip title="If enabled, holding the modifier key will stop Volume Scroll from working" placement="top" disableInteractive>
                    <FormControlLabel 
                        onChange={handleInvertModifierKeyToggle}
                        control={
                        <Switch 
                            checked={settings.invertModifierKey}
                            disabled={!settings.useMouseWheelVolume || !settings.useModifierKey}
                        />} 
                        label="Inverted"
                    />
                </Tooltip>
                </div>
                <div id="toggleMuteKeyContainer">
                    <Tooltip title="Set a key that must be held down for Volume Scroll to work" placement="top" disableInteractive>
                        <FormControlLabel 
                            onChange={handleMuteKeyToggle}
                            control={
                            <Switch 
                                checked={settings.useToggleMuteKey}
                                disabled={!settings.useMouseWheelVolume}
                            />} 
                            label="Toggle mute key"
                        />
                    </Tooltip>
                    <Tooltip title="Click to change hotkey" placement="top" disableInteractive>
                        <Button variant="outlined" disabled={!settings.useMouseWheelVolume || !settings.useToggleMuteKey}>
                            {settings.toggleMuteKey}
                        </Button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default HotkeyPage;