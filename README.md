[link-chrome]: https://chromewebstore.google.com/detail/volume-scroll/gkmagiadkkhdilnaicdnngcjhmhaeaoh "Version published on Chrome Web Store"
[link-edge]: https://microsoftedge.microsoft.com/addons/detail/volume-scroll/mjmfahcdmfdlnhbmahfkelaeecdnopgn "Version published on Edge Add-ons"
[link-firefox]: https://https://addons.mozilla.org/en-US/firefox/addon/volume-scroll/ "Version published on Mozilla Add-ons"
[link-releases]: https://github.com/FredrikWilhelmsen/Volume-Scroll/releases/latest "Latest release"

# Volume-Scroll

[<img src="./Webstore-assets/Chrome.png" height="60">][link-chrome]
[<img src="./Webstore-assets/Firefox.png" height="60">][link-firefox]
[<img src="./Webstore-assets/Microsoft.png" height="60">][link-edge]
[<img src="./Webstore-assets/GitHub_Invertocat_White.png" height="60">][link-releases]

![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/gkmagiadkkhdilnaicdnngcjhmhaeaoh)
![GitHub Release](https://img.shields.io/github/v/release/FredrikWilhelmsen/Volume-Scroll)

A highly customizable browser extension for changing video volume by scrolling.

* **Scroll to change the volume** of any video.
    * Precise scroll feature for finer volume control at lower levels.
    * Custom modifier key to toggle the extension on or off while held down.
    * Optional rounding to the nearest increment.
    * Display the current volume on screen.
        * Can be displayed next to your mouse.
        * Choose from four different pre-set positions, or create your own position.
        * Customize the overlay's size, duration, color, and background opacity.
* **Optional hotkey** for muting or unmuting a video.
* **Optional hotkey** for pausing or playing a video.
* **Optional hotkey** to swap the scroll step value.
* **Optional fullscreen** only mode.
* **Disable or enable** for specific websites.
* **Set a default** volume level for a video, and optionally start them muted.
* **Boost audio** up to 500%.

*Take it to the next level, and scroll to change the settings in the extension!*

---

### The project was built using
*   **Operating System:** Windows 11.
*   **Node.js Version:** v21.2.0
*   **Yarn Version:** v4.4.0

### Installation
To install the necessary dependencies, navigate to the root directory and run:

- yarn install

### Build Script
To build the extension, run:

- yarn build

### Output
The final extension files will be generated in the `dist-firefox/` and `dist-chrome/` folders.
