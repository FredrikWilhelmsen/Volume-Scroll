import React, { useState } from "react";
import { CustomOverlay, Pages } from "../types";
import BackButton from "../components/BackButton";
import { TextField, IconButton, Typography, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import "../style/domainPage.css";

interface CustomOverlayPageProps {
    customOverlays?: Record<string, CustomOverlay>;
    updateCustomOverlays?: (
        customOverlays: Record<string, CustomOverlay>,
    ) => void;
    setPage: (targetPage: Pages) => void;
}

const CustomOverlayPage: React.FC<CustomOverlayPageProps> = ({
    customOverlays = {},
    updateCustomOverlays,
    setPage,
}) => {
    const [overlayNameInput, setOverlayNameInput] = useState("");
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [imagesList, setImagesList] = useState<string[]>([]);
    const [framesList, setFramesList] = useState<number[]>([]);

    const overlayEntries = Object.entries(customOverlays || {});

    const handleDeleteCustomOverlay = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!customOverlays || !updateCustomOverlays) return;
        const updated = { ...customOverlays };
        delete updated[name];
        updateCustomOverlays(updated);
    };

    const handleSelectCustomOverlay = (name: string) => {
        setOverlayNameInput(name);
        const overlayData = customOverlays[name];
        setImagesList(overlayData?.images ? overlayData.images : []);
        setFramesList(overlayData?.frames ? overlayData.frames : []);
    };

    const handleSaveLink = () => {
        const url = imageUrlInput.trim();
        if (!url) return;
        setImagesList((prev) => [...prev, url]);
        setImageUrlInput("");
    };

    const handleDeleteImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setImagesList((prev) => prev.filter((_, i) => i !== index));
        setFramesList((prev) =>
            prev
                .filter((imgIdx) => imgIdx !== index)
                .map((imgIdx) => (imgIdx > index ? imgIdx - 1 : imgIdx)),
        );
    };

    const handleAddFrame = (imageIndex: number) => {
        setFramesList((prev) => [...prev, imageIndex]);
    };

    const handleDeleteFrame = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setFramesList((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveCustomOverlay = () => {
        const name = overlayNameInput.trim();
        if (!name || !updateCustomOverlays) return;
        const updated = {
            ...customOverlays,
            [name]: {
                images: imagesList,
                frames: framesList,
            },
        };
        updateCustomOverlays(updated);
    };

    return (
        <div>
            <BackButton
                setPage={setPage}
                title="Custom Overlay"
                targetPage="overlay"
            />
            <hr />
            <div className="settingsContainer">
                <div
                    id="domainListVisualContainer"
                    style={{ height: "100px", marginTop: "8px" }}
                >
                    {overlayEntries.length === 0 ? (
                        <Typography className="emptyDomainList">
                            No custom overlays
                        </Typography>
                    ) : (
                        overlayEntries.map(([name], idx) => (
                            <div
                                key={name || idx}
                                className="domainListItem"
                                onClick={() => handleSelectCustomOverlay(name)}
                            >
                                <div className="domainItemText">
                                    <Typography
                                        variant="body2"
                                        className="domainName"
                                    >
                                        {name}
                                    </Typography>
                                </div>
                                <IconButton
                                    onClick={(e) =>
                                        handleDeleteCustomOverlay(name, e)
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
                        title="Name of the custom overlay"
                        placement="top"
                        disableInteractive
                    >
                        <TextField
                            className="manualDomainInput"
                            label="Overlay name"
                            placeholder="e.g. My Custom Overlay"
                            variant="outlined"
                            size="small"
                            autoComplete="off"
                            value={overlayNameInput}
                            onChange={(e) =>
                                setOverlayNameInput(e.target.value)
                            }
                        />
                    </Tooltip>
                    <Tooltip
                        title="Image URL for the custom overlay"
                        placement="top"
                        disableInteractive
                    >
                        <TextField
                            className="manualDomainInput"
                            label="Image URL"
                            placeholder="e.g. https://example.com/overlay.png"
                            variant="outlined"
                            size="small"
                            autoComplete="off"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                        />
                    </Tooltip>
                    <Button
                        variant="outlined"
                        onClick={handleSaveLink}
                        disabled={!imageUrlInput.trim()}
                    >
                        Save Link
                    </Button>
                </div>

                <div
                    id="domainListVisualContainer"
                    style={{ height: "100px", marginTop: "8px" }}
                >
                    {imagesList.length === 0 ? (
                        <Typography className="emptyDomainList">
                            No saved image URLs
                        </Typography>
                    ) : (
                        imagesList.map((url, idx) => (
                            <div
                                key={idx}
                                className="domainListItem"
                                onClick={() => handleAddFrame(idx)}
                            >
                                <div className="domainItemText">
                                    <Typography
                                        variant="body2"
                                        className="domainName"
                                    >
                                        {url}
                                    </Typography>
                                </div>
                                <IconButton
                                    onClick={(e) => handleDeleteImage(idx, e)}
                                    size="small"
                                    sx={{ color: "white", flexShrink: 0 }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </div>
                        ))
                    )}
                </div>

                <div
                    id="domainListVisualContainer"
                    style={{ height: "100px", marginTop: "8px" }}
                >
                    {framesList.length === 0 ? (
                        <Typography className="emptyDomainList">
                            No frames added
                        </Typography>
                    ) : (
                        framesList.map((imageIdx, frameIdx) => (
                            <div key={frameIdx} className="domainListItem">
                                <div className="domainItemText">
                                    <Typography
                                        variant="body2"
                                        className="domainName"
                                    >
                                        {`Frame #${frameIdx + 1}: ${imagesList[imageIdx] || `Image #${imageIdx + 1}`}`}
                                    </Typography>
                                </div>
                                <IconButton
                                    onClick={(e) =>
                                        handleDeleteFrame(frameIdx, e)
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

                <Button
                    variant="outlined"
                    onClick={handleSaveCustomOverlay}
                    disabled={!overlayNameInput.trim()}
                    style={{ marginTop: "12px", width: "100%" }}
                >
                    Save Overlay
                </Button>
            </div>
        </div>
    );
};

export default CustomOverlayPage;
