import React from 'react';

export const iconStyle: React.CSSProperties = {
    display: "inline-block",
    verticalAlign: "middle",
    filter: "drop-shadow(-1px -1px 0 #000) drop-shadow(1px -1px 0 #000) drop-shadow(-1px 1px 0 #000) drop-shadow(1px 1px 0 #000)",
};

export const UnmutedIcon = () => (
    <svg
        viewBox="0 -960 960 960"
        width="1.2em"
        height="1.2em"
        fill="currentColor"
        style={iconStyle}
    >
        <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z" />
    </svg>
);

export const MutedIcon = () => (
    <svg
        viewBox="0 -960 960 960"
        width="1.2em"
        height="1.2em"
        fill="currentColor"
        style={iconStyle}
    >
        <path d="m616-320-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104-104 104Zm-496-40v-240h160l200-200v640L280-360H120Zm280-246-86 86H200v80h114l86 86v-252ZM300-480Z" />
    </svg>
);

export const PauseIcon = () => (
    <svg
        viewBox="0 -960 960 960"
        width="1.2em"
        height="1.2em"
        fill="currentColor"
        style={iconStyle}
    >
        <path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z" />
    </svg>
);

export const PlayIcon = () => (
    <svg
        viewBox="0 -960 960 960"
        width="1.2em"
        height="1.2em"
        fill="currentColor"
        style={iconStyle}
    >
        <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
    </svg>
);
