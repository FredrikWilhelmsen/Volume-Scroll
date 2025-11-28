import * as controller from "./volumeScrollController";

window.addEventListener("wheel", controller.onScroll, { passive: false });
window.addEventListener("mousedown", controller.onMouseDown);
window.addEventListener("mouseup", controller.onMouseUp);
window.addEventListener("keydown", controller.onKeyDown);
window.addEventListener("keyup", controller.onKeyUp);