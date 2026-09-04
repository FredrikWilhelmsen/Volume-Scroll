import React, { useState } from "react";
import { CustomOverlay, CustomOverlayImage, Pages, Settings } from "../types";
import BackButton from "../components/BackButton";
import { TextField, IconButton, Typography, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import "../style/domainPage.css";

const emptyDragImage = new Image();
emptyDragImage.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

interface CustomOverlayPageProps {
    customOverlays?: Record<string, CustomOverlay>;
    updateCustomOverlays?: (
        customOverlays: Record<string, CustomOverlay>,
    ) => void;
    setPage: (targetPage: Pages) => void;
    settings?: Settings;
    overrideSettings?: Partial<Settings>;
    activeDomain?: string;
    editSetting?: (key: keyof Settings, value: any, domain?: string) => void;
}

const CustomOverlayPage: React.FC<CustomOverlayPageProps> = ({
    customOverlays = {},
    updateCustomOverlays,
    setPage,
    settings,
    overrideSettings,
    activeDomain,
    editSetting,
}) => {
    const [overlayNameInput, setOverlayNameInput] = useState("");
    const [imageNameInput, setImageNameInput] = useState("");
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [imagesList, setImagesList] = useState<CustomOverlayImage[]>([]);
    const [framesList, setFramesList] = useState<number[]>([]);
    const [draggedFrameIndex, setDraggedFrameIndex] = useState<number | null>(
        null,
    );

    const overlayEntries = Object.entries(customOverlays || {});

    const handleDeleteCustomOverlay = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!customOverlays || !updateCustomOverlays) return;
        const updated = { ...customOverlays };
        delete updated[name];
        updateCustomOverlays(updated);

        const currentCustomOverlay =
            overrideSettings?.customOverlay ?? settings?.customOverlay;
        if (currentCustomOverlay === name && editSetting) {
            const remainingKeys = Object.keys(updated);
            editSetting("customOverlay", remainingKeys[0] || "", activeDomain);
        }
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
        let name = imageNameInput.trim();
        if (!name) {
            name = `Image #${imagesList.length + 1}`;
        }
        setImagesList((prev) => [...prev, { name, url }]);
        setImageNameInput("");
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

    const handleDragStart = (index: number, e: React.DragEvent) => {
        setDraggedFrameIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
        e.dataTransfer.setDragImage(emptyDragImage, 0, 0);
    };

    const handleDragEnter = (targetIndex: number, e: React.DragEvent) => {
        e.preventDefault();
        if (draggedFrameIndex === null || draggedFrameIndex === targetIndex)
            return;
        setFramesList((prev) => {
            const updated = [...prev];
            const [removed] = updated.splice(draggedFrameIndex, 1);
            updated.splice(targetIndex, 0, removed);
            return updated;
        });
        setDraggedFrameIndex(targetIndex);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDraggedFrameIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedFrameIndex(null);
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

        const currentCustomOverlay =
            overrideSettings?.customOverlay ?? settings?.customOverlay;
        if (!currentCustomOverlay && editSetting) {
            editSetting("customOverlay", name, activeDomain);
        }
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
                        title="Name of the image (optional)"
                        placement="top"
                        disableInteractive
                    >
                        <TextField
                            className="manualDomainInput"
                            label="Image name"
                            placeholder="e.g. Volume 0"
                            variant="outlined"
                            size="small"
                            autoComplete="off"
                            value={imageNameInput}
                            onChange={(e) => setImageNameInput(e.target.value)}
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
                        Save Image
                    </Button>
                </div>

                <div
                    id="domainListVisualContainer"
                    style={{ height: "100px", marginTop: "8px" }}
                >
                    {imagesList.length === 0 ? (
                        <Typography className="emptyDomainList">
                            No saved images
                        </Typography>
                    ) : (
                        imagesList.map((img, idx) => (
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
                                        {img.name}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "rgba(255, 255, 255, 0.5)",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {img.url}
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
                    style={{ height: "200px", marginTop: "8px" }}
                >
                    {framesList.length === 0 ? (
                        <Typography className="emptyDomainList">
                            No frames added
                        </Typography>
                    ) : (
                        framesList.map((imageIdx, frameIdx) => (
                            <div
                                key={frameIdx}
                                className="domainListItem"
                                draggable
                                onDragStart={(e) =>
                                    handleDragStart(frameIdx, e)
                                }
                                onDragEnter={(e) =>
                                    handleDragEnter(frameIdx, e)
                                }
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onDragEnd={handleDragEnd}
                                style={{
                                    cursor: "default",
                                    opacity:
                                        draggedFrameIndex === frameIdx
                                            ? 0.85
                                            : 1,
                                    backgroundColor:
                                        draggedFrameIndex === frameIdx
                                            ? "rgba(25, 118, 210, 0.25)"
                                            : undefined,
                                }}
                            >
                                <DragHandleIcon
                                    fontSize="small"
                                    sx={{
                                        color: "rgba(255, 255, 255, 0.4)",
                                        marginRight: "6px",
                                        flexShrink: 0,
                                        cursor: "grab",
                                        "&:hover": {
                                            color: "rgba(255, 255, 255, 0.9)",
                                        },
                                        "&:active": {
                                            cursor: "grabbing",
                                        },
                                    }}
                                />
                                <div className="domainItemText">
                                    <Typography
                                        variant="body2"
                                        className="domainName"
                                    >
                                        {`#${frameIdx + 1}: ${imagesList[imageIdx]?.name || `Image #${imageIdx + 1}`}`}
                                    </Typography>
                                </div>
                                <IconButton
                                    onClick={(e) =>
                                        handleDeleteFrame(frameIdx, e)
                                    }
                                    onMouseDown={(e) => e.stopPropagation()}
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
