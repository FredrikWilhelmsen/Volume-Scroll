import React from 'react';
import BackButton from '../components/BackButton';
import { Settings, Pages } from "../types";
import Tooltip from '@mui/material/Tooltip/Tooltip';
import Slider from '@mui/material/Slider/Slider';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Switch from '@mui/material/Switch/Switch';

interface ScrollPageInterface {
    settings: Settings,
    editSetting: (key: keyof Settings, value: any) => void,
    setPage: React.Dispatch<React.SetStateAction<Pages>>
}

const ScrollPage: React.FC<ScrollPageInterface> = ({ settings, editSetting, setPage }) => {

    const handleIncrementToggle = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("useMouseWheelVolume", value);
    }

    const handleIncrementChange = (_e : Event | React.SyntheticEvent, value : any) => {
        editSetting("volumeIncrement", value);
    }

    return (
        <div>
            <BackButton setPage={setPage}/>

            <div className="settingsContainer">
                <div id="scrollIncrementContainer">
                    <Tooltip title="Toggle scroll increment">
                        <FormControlLabel onChange={handleIncrementToggle} control={<Switch checked={settings.useMouseWheelVolume} />} label="Scroll increment" />
                    </Tooltip>
                    <Tooltip title="Set how much the volume will change per tick when scrolling">
                        <Slider
                            min={1}
                            max={20}
                            step={1}
                            aria-label="Scroll increment"
                            defaultValue={settings.volumeIncrement}
                            valueLabelDisplay="auto"
                            disabled={!settings.useMouseWheelVolume}
                            onChangeCommitted={handleIncrementChange}
                        />
                    </Tooltip>
                </div>
                <div id="preciseScrollContainer">

                </div>
                <div id="fullscreenOnlyContainer">
                    
                </div>
            </div>
        </div>
    );
}

export default ScrollPage;