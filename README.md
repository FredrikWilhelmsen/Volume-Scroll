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

A highly customizable browser extension for changing video volume by scrolling.

- **Scroll to change the volume** of any video.
    - Precise scroll feature for finer volume control at lower levels.
    - Custom modifier key to toggle the extension on or off while held down.
    - Optional rounding to the nearest increment.
    - Display the current volume on screen.
        - Can be displayed next to your mouse.
        - Choose from four different pre-set positions, or create your own position.
        - Customize the overlay's size, duration, color, and background opacity.
- **Optional hotkey** for muting or unmuting a video.
- **Optional hotkey** for pausing or playing a video.
- **Optional hotkey** to swap the scroll step value.
- **Optional fullscreen** only mode.
- **Disable or enable** for specific websites.
- **Set a default** volume level for a video, and optionally start them muted.
- **Extremely customizable**, change every setting on a per site basis.
- **Boost audio** up to 500%.
- Also works with YT Music and Spotify!

_Take it to the next level, and scroll to change the settings in the extension!_

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
