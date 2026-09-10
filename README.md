[link-chrome]: https://chromewebstore.google.com/detail/volume-scroll/gkmagiadkkhdilnaicdnngcjhmhaeaoh "Version published on Chrome Web Store"
[link-edge]: https://microsoftedge.microsoft.com/addons/detail/volume-scroll/mjmfahcdmfdlnhbmahfkelaeecdnopgn "Version published on Edge Add-ons"
[link-firefox]: https://addons.mozilla.org/en-US/firefox/addon/volume-scroll/ "Version published on Mozilla Add-ons"
[link-releases]: https://github.com/FredrikWilhelmsen/Volume-Scroll/releases/latest "Latest release"

# Volume-Scroll

[<img src="./readme-assets/Chrome.png" height="60">][link-chrome]
[<img src="./readme-assets/Firefox.png" height="60">][link-firefox]
[<img src="./readme-assets/Microsoft.png" height="60">][link-edge]
[<img src="./readme-assets/GitHub_Invertocat_White.png" height="60">][link-releases]

![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/gkmagiadkkhdilnaicdnngcjhmhaeaoh)
![GitHub Release](https://img.shields.io/github/v/release/FredrikWilhelmsen/Volume-Scroll)

Let your mouse wheel be the volume knob. Volume Scroll lets you adjust playback volume instantly. No more reaching for tiny on-screen sliders. Just hover over the player and scroll. It works everywhere: YouTube, Twitch, Netflix, Spotify, YT Music, and any other site with a video player.

### Core Features

- **Scroll to change volume** on any video with just your mouse wheel.
    - **Precise scroll** automatically kicks in at lower volumes for finer control.
    - **Invert scroll direction** if scrolling down for louder feels more natural.
    - **Round to the nearest increment** for clean, predictable volume steps.
    - **Modifier key**: hold a key (e.g. Shift) to toggle volume scroll on or off.
    - **Alternate step**: hold a different key to switch between two volume increment sizes.
- **Audio boost**: push volume up to 1000% with a custom boost color indicator.

### Visual Overlay

Choose how you see your volume change, with multiple overlay styles:

- **Number**: a clean numeric display.
- **Bar**: a volume bar along any edge of the screen.
- **Circle**: a radial indicator.
- **Retro**: a classic volume meter look.
- **Custom**: upload your own image frames that animate across volume steps.

Every overlay is fully customizable:

- **Position**: snap to a corner, place it anywhere with custom X/Y coordinates, or have it **follow your mouse**.
- Adjust **size, duration, color, background opacity**, and even apply a **dutch angle** tilt.
- Show or hide **mute/unmute and play/pause icons** on the overlay.

### Smart Behavior
- **Custom shortcuts**: assign hotkeys or mouse buttons to toggle mute/unmute and play/pause.
- **Fullscreen-only mode**: only activate when a video is fullscreen.
- **Playing-only mode**: only activate when a video is actively playing.
- **Iframe support**: works seamlessly inside embedded players.

### Per-Site Control

- **Enable or disable** the extension on specific websites.
- **Set a default volume** and optionally **start videos muted** per site.
- **Every setting** can be overridden on a per-site basis. Scroll behavior, overlay style, boost amount, all of it.

### Custom Rules & Extensibility

- **Create custom handlers** for sites that aren't supported out of the box, just provide a CSS selector for the video element.
- **Ignore specific elements** on a site to prevent scroll hijacking in menus, chat panels, and other UI.

### Import & Export

- **Share your settings**, or **import presets** from other users.

---

## Build Instructions

### Prerequisites

- **Node.js:** `v21.2.0` or higher
- **Yarn:** `v4.4.0` or higher

### Getting Started

First, install the project dependencies:

```bash
yarn install
```

### Building the extension

To build both versions of the extension, run:

```bash
yarn build
```

Alternatively, you can target specific browsers:

- **Firefox:** `yarn build:firefox`
- **Chromium:** `yarn build:chrome`

### Development

If you are actively developing and want the build to update automatically on save:

- **Firefox:** `yarn dev`
- **Chromium:** `yarn dev:chrome`

---

### Output

The bundled files will be generated in:

- `dist-firefox/`
- `dist-chrome/`
