import { getVideo } from "./defaultHandler";

export function onScroll(e: WheelEvent): void {
    console.log("Volume Scroll: Scrolled!");
    const direction = e.deltaY / 100 * -1;
    console.log(direction > 0 ? "UP" : "DOWN");
}

export function onClick(e: Event): void {
    console.log("Volume Scroll: Clicked!");
}